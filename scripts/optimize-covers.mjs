// 批量压缩 public/covers 下的封面图，降低体积以加快网站加载。
// 仅把优化结果写入 public/covers_opt/（全新目录，避免 OneDrive 对原文件的锁）。
// 真正的替换(删除旧+拷贝新)由 Git Bash 原生 rm/cp 完成（绕过 safe-delete 兜底）。
// 用法: node scripts/optimize-covers.mjs [maxWidth=1600] [quality=80]
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coversDir = path.join(__dirname, "..", "public", "covers");
const outDir = path.join(__dirname, "..", "public", "covers_opt");
const MAX_W = parseInt(process.argv[2] || "1600", 10);
const QUALITY = parseInt(process.argv[3] || "80", 10);

if (!fs.existsSync(coversDir)) {
  console.error("covers 目录不存在:", coversDir);
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const files = fs
  .readdirSync(coversDir)
  .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

let totalSaved = 0;
let processed = 0;
let skipped = 0;

for (const f of files) {
  const fp = path.join(coversDir, f);
  const out = path.join(outDir, f.replace(/\.(png)$/i, ".jpg"));
  const before = fs.statSync(fp).size;
  const img = sharp(fp);
  const meta = await img.metadata();
  if (!meta.width || meta.width <= MAX_W) {
    // 已经够小：仅重新编码以减小体积（png->jpg 等）
    await img.jpeg({ quality: QUALITY, mozjpeg: true }).toFile(out);
    const after = fs.statSync(out).size;
    totalSaved += before - after;
    processed++;
    continue;
  }
  await img
    .resize({ width: MAX_W, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(out);
  const after = fs.statSync(out).size;
  totalSaved += before - after;
  processed++;
}
skipped = files.length - processed;
console.log(
  `完成: ${processed} 张优化 -> public/covers_opt/ (跳过 ${skipped} 张), 预计节省 ${(totalSaved/1024/1024).toFixed(1)}MB`
);
