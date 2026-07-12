/**
 * fetch-covers.mjs v2 — 多源封面图抓取（零依赖，curl 联网，可断点续传）
 *
 * 图源（按质量排序）：
 *   1. uapis.cn      — landscape(风景), bing-daily(必应精选), pc_wallpaper(电脑壁纸)
 *   2. pic.ltywl.top — fj/pc.php(风景), mn/pc.php(唯美人物)
 *   3. Wikimedia Commons — 仅保留 tech / scifi（科技与科幻，其他分类已用上面两个源替代）
 *
 * 输出：public/covers/{prefix}-{NN}.jpg
 *   前缀：landscape / wallpaper / portrait / tech / scifi
 *
 * 运行：node scripts/fetch-covers.mjs
 *
 * 特性：
 *   - 多源并行拉取，每源独立配额
 *   - 断点续传：跳过已存在的 {prefix}-NN.jpg
 *   - 全局 MD5 去重（跨源不重复）
 *   - 单源失败仅告警，不阻塞其他源
 *   - 最小文件体积过滤（过小视为失败）
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const COVERS_DIR = path.join(ROOT, "public", "covers");

// ── 源定义 ──────────────────────────────────────────────
// 每个 source：name(用于日志) / prefix(文件名前缀) / target(目标张数)
// / fetcher(实际拉取函数，接收 wanted 数量，返回 Buffer[])

const MIN_FILE_SIZE = 10_000; // 10KB 以下视为无效图
const MAX_CONCURRENT = 5;     // 并发下载数

// ── uapis.cn 源 ──
function UAPI_RANDOM_URL(category) {
	return `https://uapis.cn/api/v1/random/image?category=${category}&t=${Date.now()}`;
}

async function fetchUapiRandom(url) {
	const buf = curlBuf(url, 20);
	if (!buf || buf.length < MIN_FILE_SIZE) return null;
	return buf;
}

// ── pic.ltywl.top 源 ──
async function fetchPicLtywl(url) {
	const buf = curlBuf(url, 20);
	if (!buf || buf.length < MIN_FILE_SIZE) return null;
	return buf;
}

// ── Wikimedia 源（保留给 tech/scifi）──
function wikiSearchUrl(query, offset) {
	let u =
		"https://commons.wikimedia.org/w/api.php?action=query" +
		"&generator=search&gsrsearch=" +
		encodeURIComponent(query + " filetype:bitmap") +
		"&gsrnamespace=6&gsrlimit=50&prop=imageinfo&iiprop=url|mime&iiurlwidth=1280&format=json";
	if (offset != null) u += "&gsroffset=" + encodeURIComponent(offset);
	return u;
}

function* wikiCandidates(queries, wantedPerQuery = 30) {
	const seen = new Set();
	for (const q of queries) {
		let offset = null;
		for (let guard = 0; guard < 12; guard++) {
			const raw = curlText(wikiSearchUrl(q, offset), 15);
			if (!raw) break;
			let data;
			try { data = JSON.parse(raw); } catch { break; }
			const pages = data?.query?.pages || {};
			for (const pid of Object.keys(pages)) {
				const p = pages[pid];
				const ii = p?.imageinfo?.[0];
				if (!ii || ii.mime !== "image/jpeg" || !ii.thumburl) continue;
				if (seen.has(ii.thumburl)) continue;
				seen.add(ii.thumburl);
				yield ii.thumburl;
				if (seen.size >= wantedPerQuery) break;
			}
			offset = data?.continue?.gsroffset ?? null;
			if (offset == null) break;
		}
	}
}

// ── 通用工具 ──
function curlText(url, maxTime = 20) {
	try {
		return execFileSync(
			"curl", ["-sL", "--max-time", String(maxTime),
				"-A", "CoverFetcher/2.0", url],
			{ encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
		).toString();
	} catch { return ""; }
}

function curlBuf(url, maxTime = 30) {
	try {
		return execFileSync(
			"curl", ["-sL", "--max-time", String(maxTime),
				"-A", "CoverFetcher/2.0", url],
			{ encoding: "buffer", maxBuffer: 64 * 1024 * 1024 },
		);
	} catch { return null; }
}

function existingMaxIndex(prefix) {
	let max = 0;
	if (fs.existsSync(COVERS_DIR)) {
		for (const f of fs.readdirSync(COVERS_DIR)) {
			const m = f.match(new RegExp(`^${prefix}-(\\d+)\\.jpg$`));
			if (m) max = Math.max(max, parseInt(m[1], 10));
		}
	}
	return max;
}

/** 从一组异步生成器中取 unique buf（按 md5 去重），存盘返回新增数量 */
async function collectSource(prefix, target, asyncGenFns, seenHashes) {
	const have = existingMaxIndex(prefix);
	const need = Math.max(0, target - have);
	console.log(`\n  [${prefix}] 已有 ${have}, 目标 ${target}, 还需拉 ${need}`);
	if (need <= 0) { console.log(`    已达标 ✓`); return 0; }

	let idx = have;
	let added = 0;
	const genQueue = asyncGenFns.flat(); // 展平所有生成器函数

	for (let i = 0; i < genQueue.length && added < need; i++) {
		const batch = [];
		for (let j = i; j < genQueue.length && batch.length < MAX_CONCURRENT && added + batch.length < need; j++) {
			batch.push(genQueue[j]());
		}
		i += batch.length - 1;

		const results = await Promise.allSettled(batch);
		for (const r of results) {
			if (added >= need) break;
			if (r.status !== "rejected" && r.value) {
				const buf = r.value;
				const h = crypto.createHash("md5").update(buf).digest("hex");
				if (seenHashes.has(h)) continue;
				seenHashes.add(h);
				idx++;
				const fname = `${prefix}-${String(idx).padStart(2, "0")}.jpg`;
				fs.writeFileSync(path.join(COVERS_DIR, fname), buf);
				added++;
			}
		}
	}

	console.log(`    [${prefix}] 新增 ${added} 张，现共 ${idx}`);
	return added;
}

// ════════════════════════════════════════════════════════
// 主流程
// ════════════════════════════════════════════════════════
async function main() {
	fs.mkdirSync(COVERS_DIR, { recursive: true });

	// 清掉旧 bing 残留
	for (const f of fs.readdirSync(COVERS_DIR)) {
		if (/^bing-\d+\.jpg$/.test(f)) {
			fs.rmSync(path.join(COVERS_DIR, f));
		}
	}

	const seenHashes = new Set();
	// 预扫描已有文件的 hash
	if (fs.existsSync(COVERS_DIR)) {
		for (const f of fs.readdirSync(COVERS_DIR)) {
			if (!/\.jpe?g$/i.test(f)) continue;
			try {
				const fp = path.join(COVERS_DIR, f);
				const buf = fs.readFileSync(fp);
				seenHashes.add(crypto.createHash("md5").update(buf).digest("hex"));
			} catch {}
		}
	}
	console.log(`已有去重池: ${seenHashes.size} 张`);

	let totalAdded = 0;

	// ── Source 1: uapis.cn landscape（高质量风景）──
	console.log("\n━━ 源1: uapis.cn landscape ━━");
	totalAdded += await collectSource("landscape", 20,
		Array.from({ length: 25 }, () =>
			() => fetchUapiRandom(UAPI_RANDOM_URL("landscape"))
		),
		seenHashes,
	);

	// ── Source 2: uapis.cn pc_wallpaper（多样壁纸风格）──
	console.log("\n━━ 源2: uapis.cn pc_wallpaper ━━");
	totalAdded += await collectSource("wallpaper", 10,
		Array.from({ length: 14 }, () =>
			() => fetchUapiRandom(UAPI_RANDOM_URL("pc_wallpaper"))
		),
		seenHashes,
	);

	// ── Source 3: uapis.cn bing-daily（必应每日精选）──
	// 注意：bing-daily 同一天返回相同图，所以只拉 1 次作为补充
	console.log("\n━━ 源3: uapis.cn bing-daily ━━");
	totalAdded += await collectSource("wallpaper", 12,
		[() => fetchUapiRandom("https://uapis.cn/api/v1/image/bing-daily?t=" + Date.now())],
		seenHashes,
	);

	// ── Source 4: pic.ltywl.top fj/pc.php（国内风景）──
	console.log("\n━━ 源4: pic.ltywl.top 风景(fj) ━━");
	totalAdded += await collectSource("landscape", 28,
		Array.from({ length: 12 }, () =>
			() => fetchPicLtywl("https://pic.ltywl.top/fj/pc.php?t=" + Date.now() + Math.random())
		),
		seenHashes,
	);

	// ── Source 5: pic.ltywl.top mn/pc.php（唯美人物）──
	console.log("\n━━ 源5: pic.ltywl.top 人物(mn) ━━");
	totalAdded += await collectSource("portrait", 12,
		Array.from({ length: 16 }, () =>
			() => fetchPicLtywl("https://pic.ltywl.top/mn/pc.php?t=" + Date.now() + Math.random())
		),
		seenHashes,
	);

	// ── Source 6: Wikimedia tech（科技/城市）──
	console.log("\n━━ 源6: Wikimedia tech ━━");
	const techUrls = [...wikiCandidates([
		"futuristic city night",
		"modern architecture technology",
		"data center server room",
		"microchip circuit board",
		"space station astronaut",
	], 20)];
	totalAdded += await collectSource("tech", 10,
		techUrls.slice(0, 15).map(url => async () => {
			const buf = await downloadWithRetry(url);
			return buf || null;
		}),
		seenHashes,
	);

	// ── Source 7: Wikimedia scifi（科幻艺术）──
	console.log("\n━━ 源7: Wikimedia scifi ━━");
	const scifiUrls = [...wikiCandidates([
		"nebula space telescope",
		"cyberpunk city art",
		"sci-fi concept art",
		"planet rings space art",
		"futuristic vehicle concept",
	], 20)];
	totalAdded += await collectSource("scifi", 10,
		scifiUrls.slice(0, 15).map(url => async () => {
			const buf = await downloadWithRetry(url);
			return buf || null;
		}),
		seenHashes,
	);

	// ── 最终统计 ──
	const summary = {};
	let totalSize = 0;
	for (const f of fs.readdirSync(COVERS_DIR)) {
		const m = f.match(/^([a-z]+)-\d+\.jpg$/);
		if (m) {
			summary[m[1]] = (summary[m[1]] || 0) + 1;
			try { totalSize += fs.statSync(path.join(COVERS_DIR, f)).size; } catch {}
		}
	}
	console.log("\n╔══════════════════════════════════════╗");
	console.log("║        图库最终统计                  ║");
	console.log("╠══════════════════════════════════════╣");
	for (const [k, v] of Object.entries(summary).sort()) {
		console.log(`║  ${k.padEnd(14)} ${String(v).padStart(4)} 张           ║`);
	}
	console.log("╠══════════════════════════════════════╣");
	const totalFiles = Object.values(summary).reduce((a, b) => a + b, 0);
	console.log(`║  ${"总计".padEnd(14)} ${String(totalFiles).padStart(4)} 张  ${(totalSize / 1024 / 1024).toFixed(1)} MB  ║`);
	console.log(`║  本次新增 ${totalAdded} 张                     ║`);
	console.log("╚══════════════════════════════════════╝");
}

async function downloadWithRetry(url, maxTry = 3) {
	let lastErr;
	for (let i = 0; i < maxTry; i++) {
		try {
			const buf = curlBuf(url, 25);
			if (!buf || buf.length < MIN_FILE_SIZE) throw new Error(`too small: ${(buf||{}).length||0}`);
			return buf;
		} catch (e) {
			lastErr = e;
			if (i < maxTry - 1) await new Promise(r => setTimeout(r, 500 * (i + 1)));
		}
	}
	throw lastErr;
}

main().catch(e => {
	console.error("Fetcher failed:", e);
	process.exit(1);
});
