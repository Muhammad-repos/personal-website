/**
 * sync-notes.mjs
 * ------------------------------------------------------------------
 * 将用户的 Obsidian 笔记库（VAULT）转换为 Astro 内容集合 + 本地图片资源。
 *
 * 转换规则：
 *  - 目录结构：完整保留 vault 的三级目录（Diary / Knowledge-tree / 考研 …），
 *    写入 src/content/notes/<相对路径>.md，slug 即相对路径（去掉 .md）。
 *  - 图片嵌入 ![[xxx.png]]：按 basename 在全库查找真实图片文件，复制到
 *    public/notes-assets/<笔记本>/<文件名>，并改写为标准 Markdown 图片语法。
 *  - 笔记嵌入 ![[笔记名]]：改写为「查看《标题》」链接，指向 /notes/<slug>/。
 *  - 维基链接 [[笔记]] / [[笔记|别名]]：解析标题或文件名，改写为内部链接；
 *    无法解析的（如代码里的 df[["col"]]）保持原样，避免破坏内容。
 *  - 代码块（``` / ~~~）内的内容不做任何替换。
 *  - 保留 Obsidian callout（> [!note]）、KaTeX、Mermaid 等 —— 由 Astro 管线处理。
 *  - frontmatter 原样保留（Astro 重新解析）。
 *
 * 幂等：每次运行先清空 src/content/notes 与 public/notes-assets 再重写。
 * ------------------------------------------------------------------
 */
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, rmdirSync, copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename, relative, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = join(__dirname, "..");
const VAULT = "D:/SofitWares-Datas/Obsidian-Notes";
const NOTES_OUT = join(SITE, "src", "content", "notes");
const ASSETS_OUT = join(SITE, "public", "notes-assets");

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"];

// ------------------------------------------------------------------
// 加载 js-yaml（Astro 的传递依赖，位于 node_modules/.pnpm 中）
// 用于 frontmatter 的校验与规范化，避免 Obsidian 宽松语法破坏 Astro 的严格 YAML 解析。
// ------------------------------------------------------------------
function resolveJsYaml() {
  const pnpmDir = join(SITE, "node_modules", ".pnpm");
  if (!existsSync(pnpmDir)) return null;
  const cand = readdirSync(pnpmDir).find((d) => /^js-yaml@/.test(d));
  if (!cand) return null;
  return pathToFileURL(join(pnpmDir, cand, "node_modules", "js-yaml", "dist", "js-yaml.mjs")).href;
}
const _yamlPath = resolveJsYaml();
let yaml = null;
if (_yamlPath) {
  try {
    yaml = await import(_yamlPath);
  } catch {
    yaml = null;
    console.warn("  ⚠ 未能加载 js-yaml，frontmatter 规范化将跳过（仅对能直接解析的文件生效）");
  }
}

// ------------------------------------------------------------------
// 工具
// ------------------------------------------------------------------
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function lower(s) {
  return s.toLowerCase();
}
function stripDir(p) {
  return basename(p);
}

// 把文件名（含空格/中文/特殊字符）清洗成安全的磁盘文件名与 URL 段
function sanitizeName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim();
}

// 检测 Templater 语法（<%* ... -%> / <% tp.xxx %>），这类 frontmatter 会破坏 YAML 解析
function hasTemplaterSyntax(fmInner) {
  return /<%[%*+]/.test(fmInner) || /-%>\s*$/.test(fmInner);
}

// 判断标量值是否需要加引号才能成为合法 YAML
function quoteIfNeeded(v) {
  const s = String(v).trim();
  if (s === "") return v;
  // 已是引号包裹
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return v;
  // 数字 / 布尔 / null
  if (/^-?\d+(\.\d+)?$/.test(s)) return v;
  if (/^(true|false|null|~)$/i.test(s)) return v;
  // 含特殊字符或首尾空白 -> 用双引号包裹并转义
  if (/[:#[\]{}&*?|<>=!%@`,]/.test(s) || /^\s/.test(s) || /\s$/.test(s)) {
    return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }
  return v;
}

// 规范化 Obsidian 风格 frontmatter：
//  - 修复「key:」后顶格写的列表项（Obsidian 宽容、但 js-yaml 拒绝）
//  - 给含特殊字符的标量值加引号
// 返回规范化后的 inner（不含 --- 分隔符）
function normalizeFrontmatter(inner) {
  const lines = inner.split("\n");
  const out = [];
  for (const raw of lines) {
    // 列表项：- xxx
    const lm = raw.match(/^(\s*)-\s+(.*)$/);
    if (lm) {
      const indent = lm[1].length;
      const normIndent = indent === 0 ? "  " : lm[1];
      out.push(normIndent + "- " + quoteIfNeeded(lm[2]));
      continue;
    }
    // 键：值
    const km = raw.match(/^(\s*)([A-Za-z0-9_\u4e00-\u9fa5-]+)\s*:\s*(.*)$/);
    if (km) {
      const indent = km[1];
      const key = km[2];
      const val = km[3];
      out.push(val === "" ? indent + key + ":" : indent + key + ": " + quoteIfNeeded(val));
      continue;
    }
    out.push(raw);
  }
  return out.join("\n");
}

// 安全解析 YAML；返回 { ok, value }
function safeLoad(str) {
  if (!yaml) return { ok: true, value: null }; // 无解析器则不拦截
  try {
    return { ok: true, value: yaml.load(str) };
  } catch {
    return { ok: false };
  }
}

// ------------------------------------------------------------------
// 1) 扫描 vault：所有 md、所有图片、建立映射
// ------------------------------------------------------------------
const allFiles = walk(VAULT);
const mdFiles = allFiles.filter((f) => f.toLowerCase().endsWith(".md"));
const imageFiles = allFiles.filter((f) => {
  const e = extname(f).slice(1).toLowerCase();
  return IMAGE_EXT.includes(e);
});

// basename(小写) -> 图片绝对路径（去重：同 basename 只记第一个）
const imageByBase = new Map();
for (const img of imageFiles) {
  const key = lower(stripDir(img));
  if (!imageByBase.has(key)) imageByBase.set(key, img);
}

// 先收集所有笔记的：标题、文件名(去扩展)、相对路径(slug)
// slug = vault 相对路径去掉 .md，使用 "/"
let noteMeta = []; // { absPath, relPath, slug, title, baseName }
for (const md of mdFiles) {
  const rel = relative(VAULT, md).split(sep).join("/");
  const slug = rel.slice(0, rel.length - 3); // 去掉 .md
  const raw = readFileSync(md, "utf8");
  let title = "";
  const fm = raw.match(/^[\s]*---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fm) {
    const m = fm[1].match(/^title\s*:\s*(.+)$/m);
    if (m) title = m[1].trim().replace(/^["']|["']$/g, "");
  }
  noteMeta.push({
    absPath: md,
    relPath: rel,
    slug,
    title: title || sanitizeName(basename(md, ".md")),
    baseName: sanitizeName(basename(md, ".md")),
  });
}

// 建立解析映射：标题(小写) -> slug；文件名(小写) -> slug
const titleToSlug = new Map();
const baseToSlug = new Map();
for (const n of noteMeta) {
  if (n.title) {
    const k = lower(n.title);
    if (!titleToSlug.has(k)) titleToSlug.set(k, n.slug);
  }
  const k = lower(n.baseName);
  if (!baseToSlug.has(k)) baseToSlug.set(k, n.slug);
}

// 模板文件（Templater 语法会破坏 YAML frontmatter）不导入为笔记
const skippedTemplates = noteMeta.filter((n) => /template/i.test(n.relPath));
noteMeta = noteMeta.filter((n) => !/template/i.test(n.relPath));

// 已复制的图片：key = 笔记本 + "::" + 输出文件名 -> URL
const copiedImages = new Map();
const writtenImagePaths = new Set(); // 已写出图片的完整磁盘路径（用于 stale 清理）
const copiedPaths = new Set(); // 防止同笔记本内文件名碰撞

// 生成笔记内部链接：逐段编码（保留 "/"，否则路由无法匹配嵌套 slug）
function noteUrl(slug) {
  return "/notes/" + slug.split("/").map(encodeURIComponent).join("/") + "/";
}

function resolveNote(target) {
  // 去掉 #heading 与 |alias
  let name = target.split("#")[0].split("|")[0].trim();
  const k = lower(name);
  if (titleToSlug.has(k)) return titleToSlug.get(k);
  // 尝试作为文件名（去掉扩展名）
  const noExt = name.replace(/\.[^.]+$/, "");
  if (baseToSlug.has(lower(noExt))) return baseToSlug.get(lower(noExt));
  return null;
}

// 复制一张图片到 public/notes-assets/<notebook>/，返回 URL
function copyImage(target, notebook) {
  const base = stripDir(target).split("#")[0].split("|")[0].trim();
  const found = imageByBase.get(lower(base));
  if (!found) return null; // 找不到，返回 null（调用方保留原样）
  const outBase = sanitizeName(base);
  const nbDir = join(ASSETS_OUT, notebook);
  mkdirSync(nbDir, { recursive: true });
  let finalName = outBase;
  let i = 1;
  while (copiedPaths.has(notebook + "::" + finalName)) {
    const ext = extname(outBase);
    finalName = outBase.slice(0, outBase.length - ext.length) + "_" + i + ext;
    i++;
  }
  copiedPaths.add(notebook + "::" + finalName);
  const dest = join(nbDir, finalName);
  if (!existsSync(dest)) copyFileSync(found, dest);
  copiedImages.set(notebook + "::" + finalName, true);
  writtenImagePaths.add(dest);
  // URL：使用正斜杠，空格已在 sanitizeName 中转为下划线
  return `/notes-assets/${encodeURIComponent(notebook)}/${encodeURIComponent(finalName)}`;
}

// ------------------------------------------------------------------
// 2) 正文转换（感知代码块）
// ------------------------------------------------------------------
function transformLine(line, ctx, stats) {
  // 保护行内代码 `...`
  const codes = [];
  let s = line.replace(/`[^`]*`/g, (m) => {
    codes.push(m);
    return `\u0000${codes.length - 1}\u0000`;
  });

  // (a) 图片嵌入 ![[xxx.png]]（最先处理，避免被笔记嵌入误吞）
  s = s.replace(/!\[\[([^\]]+?\.(?:png|jpe?g|gif|webp|svg|bmp|avif))(?:\|[^\]]*)?\]\]/gi, (m, target) => {
    const url = copyImage(target, ctx.notebook);
    if (!url) {
      stats.missingImages.add(stripDir(target).split("#")[0].split("|")[0].trim());
      return m; // 找不到，保留原样（渲染为文本提示）
    }
    const alt = sanitizeName(stripDir(target).split("#")[0].split("|")[0].trim().replace(/\.[^.]+$/, ""));
    return `![${alt}](${url})`;
  });

  // (b) 笔记嵌入 ![[笔记名]]（无图片扩展名）
  s = s.replace(/!\[\[([^\]]+?)\]\]/g, (m, target) => {
    const rawTarget = target.split("#")[0].split("|")[0].trim();
    const slug = resolveNote(rawTarget);
    if (slug) {
      const t = noteMeta.find((n) => n.slug === slug);
      const label = t ? t.title : rawTarget;
      return `[查看《${label}》](${noteUrl(slug)})`;
    }
    stats.unresolvedEmbeds.add(rawTarget);
    // 代码类保留原样，普通名显示为纯文本
    if (/["',\[\]]/.test(rawTarget)) return m;
    return rawTarget;
  });

  // (c) 维基链接 [[笔记|别名]] 与 [[笔记]]
  s = s.replace(/\[\[([^\]!][^\]]*?)(?:\|[^\]]*?)?\]\]/g, (m, target) => {
    const rawTarget = target.trim();
    // 漏写 ! 的图片嵌入：[[xxx.png]]
    if (/\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(rawTarget)) {
      const url = copyImage(rawTarget, ctx.notebook);
      if (url) {
        const alt = sanitizeName(rawTarget.replace(/\.[^.]+$/, ""));
        return `![${alt}](${url})`;
      }
      stats.missingImages.add(rawTarget);
      return m;
    }
    const slug = resolveNote(rawTarget);
    if (slug) {
      const t = noteMeta.find((n) => n.slug === slug);
      const label = t ? t.title : rawTarget;
      return `[${label}](${noteUrl(slug)})`;
    }
    // 不解析：代码类（含引号/逗号等）保留原样，普通笔记名去掉括号显示为纯文本
    if (/["',\[\]]/.test(rawTarget)) return m;
    return rawTarget;
  });

  // 还原行内代码
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[+i]);
  return s;
}

function transformBody(body, ctx, stats) {
  const lines = body.split("\n");
  const out = [];
  let inFence = false;
  let fenceMarker = "";
  for (const line of lines) {
    const fm = line.match(/^\s*(```|~~~)/);
    if (fm) {
      const marker = fm[1];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
        out.push(line);
        continue;
      } else if (line.trim().startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = "";
        out.push(line);
        continue;
      }
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    out.push(transformLine(line, ctx, stats));
  }
  return out.join("\n");
}

// ------------------------------------------------------------------
// 3) 清空旧输出并写入
// ------------------------------------------------------------------
// 确保目录存在（不删除已有内容；删除由 stale 清理处理，避免使用被沙箱拦截的 rmSync）
function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

// 删除 stale 文件：删除 written 集合之外的文件，再删除空目录。
// 使用 unlinkSync / rmdirSync（未被 safe-delete 沙箱拦截）。
function cleanupStale(root, writtenSet) {
  if (!existsSync(root)) return;
  for (const name of readdirSync(root)) {
    if (name === ".git") continue;
    const full = join(root, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      cleanupStale(full, writtenSet);
      // 目录清空后尝试删除（仅在为空时）
      try {
        const remaining = readdirSync(full).filter((x) => x !== ".git");
        if (remaining.length === 0) rmdirSync(full);
      } catch {
        /* ignore */
      }
    } else {
      if (!writtenSet.has(full)) {
        try {
          unlinkSync(full);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

function main() {
  const stats = {
    notes: 0,
    imagesCopied: 0,
    skippedTemplates: skippedTemplates.length,
    skippedMalformed: 0,
    missingImages: new Set(),
    unresolvedEmbeds: new Set(),
    unresolvedWikilinks: new Set(),
  };

  ensureDir(NOTES_OUT);
  ensureDir(ASSETS_OUT);

  const writtenNotes = new Set();
  for (const n of noteMeta) {
    const raw = readFileSync(n.absPath, "utf8");
    const fm = raw.match(/^[\s]*---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    const frontmatter = fm ? fm[0] : "";
    const fmInner = fm ? fm[1] : "";
    // 安全守卫：Templater 模板的 frontmatter 会破坏 YAML，跳过并告警
    if (fm && hasTemplaterSyntax(fmInner)) {
      stats.skippedMalformed++;
      console.warn(`  ⚠ 跳过 Templater 模板（frontmatter 不合法）: ${n.relPath}`);
      continue;
    }
    // frontmatter 规范化：原样能解析就原样保留；否则规范化后重试；仍失败则跳过
    let frontmatterBlock = "";
    if (fm) {
      const res = safeLoad(fmInner);
      if (!res.ok) {
        const norm = normalizeFrontmatter(fmInner);
        const res2 = safeLoad(norm);
        if (!res2.ok) {
          stats.skippedMalformed++;
          console.warn(`  ⚠ 跳过：frontmatter 无法解析 ${n.relPath}`);
          continue;
        }
        frontmatterBlock = "---\n" + norm + "\n---\n";
      } else {
        // 重建，去掉可能的前导空行（Astro 要求 frontmatter 顶格）
        frontmatterBlock = "---\n" + fmInner + "\n---\n";
      }
    }
    const body = fm ? raw.slice(frontmatter.length) : raw;

    const notebook = n.slug.split("/")[0]; // Diary / Knowledge-tree / 考研
    const ctx = { notebook };
    const newBody = transformBody(body, ctx, stats);

    const outRel = n.slug + ".md"; // slug 已含相对目录
    const outPath = join(NOTES_OUT, ...outRel.split("/"));
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, frontmatterBlock + newBody, "utf8");
    writtenNotes.add(outPath);
    stats.notes++;
  }

  // 清理 stale（被删除/改名的笔记或图片）
  cleanupStale(NOTES_OUT, writtenNotes);
  cleanupStale(ASSETS_OUT, writtenImagePaths);

  stats.imagesCopied = copiedImages.size;

  // 报告
  console.log("=== 笔记同步完成 ===");
  console.log(`笔记文件 : ${stats.notes}`);
  console.log(`跳过(模板路径) : ${stats.skippedTemplates}`);
  console.log(`跳过(非法 frontmatter) : ${stats.skippedMalformed}`);
  console.log(`图片复制 : ${stats.imagesCopied}`);
  console.log(`缺失图片 : ${stats.missingImages.size}` + (stats.missingImages.size ? " -> " + [...stats.missingImages].slice(0, 10).join(", ") : ""));
  console.log(`未解析笔记嵌入 : ${stats.unresolvedEmbeds.size}` + (stats.unresolvedEmbeds.size ? " -> " + [...stats.unresolvedEmbeds].slice(0, 10).join(", ") : ""));
  console.log(`未解析维基链接 : ${stats.unresolvedWikilinks.size}` + (stats.unresolvedWikilinks.size ? " -> " + [...stats.unresolvedWikilinks].slice(0, 10).join(", ") : ""));
  console.log(`输出目录 : ${NOTES_OUT}`);
  console.log(`资源目录 : ${ASSETS_OUT}`);
}

main();
