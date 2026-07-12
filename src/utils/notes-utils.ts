import { getCollection, type CollectionEntry } from "astro:content";

export type NotesTreeNode =
	| { type: "folder"; name: string; path: string; children: NotesTreeNode[] }
	| { type: "note"; name: string; slug: string };

/** 取笔记标题：优先 frontmatter.title，否则用文件名 */
export function noteTitle(entry: CollectionEntry<"notes">): string {
	const t = (entry.data as Record<string, unknown>).title;
	if (typeof t === "string" && t.trim()) return t.trim();
	const segs = entry.id.split("/");
	return segs[segs.length - 1] || entry.id;
}

/** 从 notes 集合构建嵌套目录树 */
export async function getNotesTree(): Promise<NotesTreeNode[]> {
	const entries = await getCollection("notes");
	const root: NotesTreeNode[] = [];
	// 同一目录路径 -> folder 节点（去重，避免重复插入）
	const folderMap = new Map<string, Extract<NotesTreeNode, { type: "folder" }>>();

	for (const entry of entries) {
		const segs = entry.id.split("/");
		const slug = entry.id;
		let level = root;
		let pathAcc = "";
		// 逐层创建/复用文件夹节点
		for (let i = 0; i < segs.length - 1; i++) {
			const seg = segs[i];
			pathAcc = pathAcc ? pathAcc + "/" + seg : seg;
			let folder = folderMap.get(pathAcc);
			if (!folder) {
				folder = { type: "folder", name: seg, path: pathAcc, children: [] };
				folderMap.set(pathAcc, folder);
				level.push(folder);
			}
			level = folder.children;
		}
		// 叶子：笔记
		level.push({ type: "note", name: noteTitle(entry), slug });
	}

	sortTree(root);
	return root;
}

function sortTree(nodes: NotesTreeNode[]) {
	// 文件夹在前，再按名称（中文）排序
	nodes.sort((a, b) => {
		if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
		return a.name.localeCompare(b.name, "zh");
	});
	for (const n of nodes) {
		if (n.type === "folder") sortTree(n.children);
	}
}

/**
 * 把笔记 frontmatter 的 date 字段转成可显示的字符串。
 * - Date 对象：格式化为 YYYY-MM-DD
 * - 字符串（如 "2026-06-22-星期一"）：原样返回
 * - 缺失/非法：返回 null
 */
export function noteDateStr(data: Record<string, unknown>): string | null {
	const raw = data.date;
	if (!raw) return null;
	if (raw instanceof Date) {
		if (Number.isNaN(raw.getTime())) return null;
		return raw.toISOString().slice(0, 10);
	}
	if (typeof raw === "string") return raw;
	return null;
}

/** 用于首页排序的时间戳；无法解析时归 0（排到最后） */
export function noteSortValue(data: Record<string, unknown>): number {
	const raw = data.date;
	let d: Date | null = null;
	if (raw instanceof Date) d = raw;
	else if (typeof raw === "string") {
		const m = raw.match(/^\d{4}-\d{2}-\d{2}/);
		if (m) d = new Date(m[0]);
	}
	return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
}

/** 从 markdown 正文提取纯文本摘要（去掉 Obsidian/Markdown 标记） */
export function extractExcerpt(body: string | undefined, maxLen = 120): string {
	if (!body) return "";
	const text = body
		.replace(/^---[\s\S]*?---\s*/, "") // 兜底去 frontmatter
		.replace(/!\[\[[^\]]*\]\]/g, "") // Obsidian 嵌入
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "") // markdown 图片
		.replace(/\[\[[^\]]*\]\]/g, "") // wikilink
		.replace(/[#>*_`~]/g, " ") // 常见 markdown 符号
		.replace(/\s+/g, " ")
		.trim();
	if (!text) return "";
	return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

/** 取笔记摘要（优先 description，否则从正文提取） */
export function noteExcerpt(entry: CollectionEntry<"notes">): string {
	const data = entry.data as Record<string, unknown>;
	if (typeof data.description === "string" && data.description.trim()) {
		return data.description.trim();
	}
	return extractExcerpt(entry.body, 120);
}

/** 笔记 URL（逐段编码，保留 /） */
export function noteUrl(id: string): string {
	return "/notes/" + id.split("/").map(encodeURIComponent).join("/") + "/";
}
