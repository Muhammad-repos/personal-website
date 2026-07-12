/**
 * cover-assign.ts v2 — 构建期封面图全局随机分配
 *
 * 目标：
 *   - 用本地图库 public/covers/{前缀}-{序号}.jpg 给文章自动分配封面
 *   - 全站每篇文章拿到的封面**确定且各不相同**（无重复）
 *   - 纯随机轮询，不按文章 category/tags 匹配（用户偏好：简单随机即可）
 *
 * 图库来源（由 scripts/fetch-covers.mjs 拉取后下载自托管于 public/covers/）：
 *   landscape — 高质量风景（uapis.cn + pic.ltywl.top 下载）
 *   wallpaper  — 多样壁纸/必应精选（uapis.cn 下载）
 *   portrait   — 唯美人物（pic.ltywl.top mn 下载）
 *   tech       — 科技/城市（Wikimedia 精选）
 *   scifi      — 科幻艺术（Wikimedia 精选）
 * 注意：全部为本地文件，不依赖外部图床；部署到 Cloudflare 走 CDN。
 */
import * as fs from "node:fs";
import * as path from "node:path";

/** 所有合法的封面图文件名前缀（与 fetch-covers.mjs 的输出对应） */
export const COVER_PREFIXES = ["landscape", "portrait", "tech", "scifi"] as const;

let pool: string[] | null = null;      // 全局图片池（全部 /covers/*.jpg 路径，稳定排序）
let assignment: Map<string, string> | null = null;
let ensured = false;

/**
 * 从 public/covers 读取所有 jpg 到单一池中。
 * 排序规则：先按前缀字母序，再按同前缀内序号升序 → 保证跨构建结果一致。
 */
function loadPool(): string[] {
	const result: string[] = [];
	const dir = path.join(process.cwd(), "public", "covers");
	if (!fs.existsSync(dir)) return result;

	// 只认 {prefix}-{NN}.jpg 格式
	const validPrefixes = new Set(COVER_PREFIXES as readonly string[]);
	const files = fs.readdirSync(dir)
		.filter(f => {
			const m = f.match(/^([a-z]+)-(\d+)\.jpg$/);
			return m && validPrefixes.has(m[1]);
		})
		.sort((a, b) => {
			// 先比前缀字母序
			const pa = a.match(/^([a-z]+)-/)![1];
			const pb = b.match(/^([a-z]+)-/)![1];
			if (pa !== pb) return pa < pb ? -1 : 1;
			// 同前缀再比序号数字
			const na = parseInt(a.match(/-(\d+)\.jpg$/)![1], 10);
			const nb = parseInt(b.match(/-(\d+)\.jpg$/)![1], 10);
			return na - nb;
		});

	for (const f of files) {
		result.push("/covers/" + f);
	}
	return result;
}

interface PostLike {
	id: string;
	data: {
		image?: string | boolean | null;
	};
}

/**
 * 构建分配表——纯轮询分配，不依赖标签。
 *
 * 规则：
 *   - 仅对 image 为 undefined / "" / "api" 的文章自动分配
 *   - 显式指定了 image 的文章跳过（保留原值）
 *   - 按发布日期降序排列后依次从池中取图（取模循环），保证全局唯一且构建间一致
 */
export function buildCoverAssignment(posts: PostLike[]): Map<string, string> {
	if (!pool) pool = loadPool();
	if (pool.length === 0) return new Map();

	// 稳定排序
	const sorted = [...posts].sort((a, b) => {
		const da = new Date(((a.data as any).pubDate || (a.data as any).date || 0)).getTime() || 0;
		const db = new Date(((b.data as any).pubDate || (b.data as any).date || 0)).getTime() || 0;
		return db - da;
	});

	const result = new Map<string, string>();
	let idx = 0;

	for (const post of sorted) {
		const img = post.data?.image;
		const needsAuto = img === undefined || img === "" || img === "api";
		if (!needsAuto) continue;

		result.set(post.id, pool[idx % pool.length]);
		idx++;
	}

	assignment = result;
	return result;
}

/** 查表：返回某文章分配到的封面路径 */
export function getAssignedCover(id: string): string | undefined {
	return assignment?.get(id);
}

/** 当前池中的总图片数（供调试用） */
export function getPoolSize(): number {
	return pool?.length ?? 0;
}

/**
 * 懒加载：若尚未构建分配表，则基于全部 posts 文章构建一次（结果缓存复用）。
 * 在 PostCard、详情页等渲染封面处调用，保证在渲染前已就绪。
 *
 * ⚠️ getCollection 来自虚拟模块 astro:content，只能在 Astro 渲染期解析，
 *    必须动态 import，切勿放到模块顶层！
 */
export async function ensureCoverAssignment(): Promise<void> {
	if (ensured && assignment) return;
	const { getCollection } = await import("astro:content");
	const posts = (await getCollection("posts")) as unknown as PostLike[];
	buildCoverAssignment(posts);
	ensured = true;
}

/** 供测试/脚本重置 */
export function resetCoverAssignment(): void {
	pool = null;
	assignment = null;
	ensured = false;
}
