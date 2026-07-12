/** 临时脚本：试拉候选"唯美图片"源样图，供肉眼评估 */
import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

const OUT = path.join(process.cwd(), "scripts", "_sample");
fs.mkdirSync(OUT, { recursive: true });

function curlBuf(url, maxTime = 25) {
	try {
		return execFileSync("curl", ["-sL", "--max-time", String(maxTime),
			"-A", "Mozilla/5.0", url], { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 });
	} catch (e) { return null; }
}

const jobs = [
	["meinv", "https://tuapi.eees.cc/api.php?category=meinv&type=302", 4],
	["fengjing", "https://tuapi.eees.cc/api.php?category=fengjing&type=302", 3],
	["bing", "https://bing.ioliu.cn/v1/rand?w=1920&h=1080", 2],
	["dujin", "https://api.dujin.org/pic/fengjing", 2],
];

for (const [name, url, n] of jobs) {
	for (let i = 1; i <= n; i++) {
		const buf = curlBuf(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now() + Math.random());
		const size = buf ? buf.length : 0;
		if (buf && size > 10000) {
			const fp = path.join(OUT, `${name}-${i}.jpg`);
			fs.writeFileSync(fp, buf);
			console.log(`OK  ${name}-${i}  ${(size / 1024).toFixed(0)}KB`);
		} else {
			console.log(`FAIL ${name}-${i}  size=${size}`);
		}
	}
}
console.log("done ->", OUT);
