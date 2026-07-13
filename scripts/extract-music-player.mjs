// 从 MusicPlayer.astro 抽取 is:inline 脚本，转成共享打包模块
// 输出: src/scripts/musicPlayer.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const astroPath = path.join(root, 'src/components/features/MusicPlayer.astro');
const outPath = path.join(root, 'src/scripts/musicPlayer.ts');

const src = fs.readFileSync(astroPath, 'utf-8');

// 抓取 is:inline 脚本块（define:vars 形式）
const re = /<script\s+define:vars=\{\{[^}]*\}\}\s+is:inline>([\s\S]*?)<\/script>/;
const m = src.match(re);
if (!m) {
  console.error('未找到 is:inline 脚本块');
  process.exit(1);
}
let body = m[1];

// 1) 头部 (function () {  -> export function initMusicPlayer(widget, cfg) {
body = body.replace(/\(\s*function\s*\(\s*\)\s*\{/, 'export function initMusicPlayer(widget, cfg) {');

// 2) 删除 var cfg = JSON.parse(viewConfigStr);
body = body.replace(/\n\s*var\s+cfg\s*=\s*JSON\.parse\(viewConfigStr\);\n/, '\n');

// 3) var widget = document.getElementById(widgetId);  ->  从 data 属性取 widgetId
body = body.replace(
  /\n\s*var\s+widget\s*=\s*document\.getElementById\(widgetId\);\n/,
  "\n    var widgetId = (widget && widget.getAttribute('data-widget-id')) || '';\n"
);

// 4) 结尾 })();  ->  }
body = body.replace(/\}\)\(\);\s*$/, '}\n');

// 写入模块
const header = `// AUTO-GENERATED from MusicPlayer.astro is:inline script (perf optimization B)
// 由 scripts/extract-music-player.mjs 生成。请勿手动编辑，改 MusicPlayer.astro 后重跑脚本。
// 该模块被打包一次，所有 MusicPlayer 实例共享。
`;
fs.writeFileSync(outPath, header + body, 'utf-8');
console.log('已生成', outPath, '(' + body.length + ' bytes)');
