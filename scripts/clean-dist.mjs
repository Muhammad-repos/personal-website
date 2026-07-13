// 构建后置清理：删除 dist 中由 public/ 原样拷贝、但首页/站点从不引用的死重字体
// public/assets/fonts/Chikushi-A-maru.woff2（~9.7MB）。
// 真正使用的子集由 scripts/subset-fonts.ts 产出到 _astro/fonts/，本文件不删除子集。
import { rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dead = resolve(root, "dist/assets/fonts/Chikushi-A-maru.woff2");

if (existsSync(dead)) {
	rmSync(dead);
	console.log("[clean-dist] 已删除死重字体:", dead);
} else {
	console.log("[clean-dist] 无死重字体可删除");
}
