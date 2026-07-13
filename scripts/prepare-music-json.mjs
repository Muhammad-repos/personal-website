// 构建前置步骤：把 src/data/music.json（整份歌单，~250KB）复制到
// public/assets/music/playlist.json，使其作为独立静态资源由 GlobalAudio 运行时 fetch，
// 而不是内联进每个页面的 HTML（原先内联导致每个页面 HTML 膨胀 ~190KB）。
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "src/data/music.json");
const destDir = resolve(root, "public/assets/music");
const dest = resolve(destDir, "playlist.json");

if (!existsSync(src)) {
	console.warn("[prepare-music-json] 源文件不存在，跳过:", src);
	process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`[prepare-music-json] 已复制歌单 -> ${dest}`);
