// 删除上一批私密 Gist，再以「公开」重建（访客可读、仅持 token 者可写）
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const token = process.env.GITHUB_TOKEN;
if (!token) {
	console.error("缺少 GITHUB_TOKEN 环境变量");
	process.exit(1);
}
const API = "https://api.github.com";
const headers = {
	Authorization: `Bearer ${token}`,
	Accept: "application/vnd.github+json",
	"Content-Type": "application/json",
	"X-GitHub-Api-Version": "2022-11-28",
};

// 1) 删除旧的私密 Gist
if (existsSync("scripts/.gist-ids.json")) {
	const old = JSON.parse(readFileSync("scripts/.gist-ids.json", "utf8"));
	const ids = [old.moments?.id, ...Object.values(old.notebooks || {}).map((n) => n.id)].filter(Boolean);
	for (const id of ids) {
		const r = await fetch(`${API}/gists/${id}`, { method: "DELETE", headers });
		console.log(`🗑  删除旧 Gist ${id} ->`, r.status);
	}
}

// 2) 以公开重建
async function createGist(description, filename, content) {
	const res = await fetch(`${API}/gists`, {
		method: "POST",
		headers,
		body: JSON.stringify({ description, public: true, files: { [filename]: { content } } }),
	});
	if (!res.ok) throw new Error(`创建失败 HTTP ${res.status}: ${await res.text()}`);
	const d = await res.json();
	return { id: d.id, url: d.html_url };
}

const notebooks = ["每日总结", "日记本", "日常随笔", "喜马拉雅", "我和宝宝的日常", "记录100件事"];
const sampleMoment = [
	{
		id: "ext-seed-1",
		content:
			"这是第一条说说～它通过 GitHub Gist 实时加载，你在手机或电脑浏览器里打开 /admin/moments/ 就能随时增删改。",
		published: new Date().toISOString(),
		images: [],
		tags: ["日常"],
		location: "",
		pinned: false,
		mood: "😊 开心",
		likes: 0,
		author: "Hyde",
	},
];

const out = { moments: null, notebooks: {} };
out.moments = await createGist("personal-website 说说", "moments.json", JSON.stringify(sampleMoment, null, 2));
console.log("✅ 说说 Gist(公开):", out.moments.id);
for (const nb of notebooks) {
	const g = await createGist(`personal-website 笔记本: ${nb}`, "notebooks-entries.json", "[]");
	out.notebooks[nb] = g;
	console.log(`✅ 笔记本「${nb}」Gist(公开):`, g.id);
}

writeFileSync("scripts/.gist-ids.json", JSON.stringify(out, null, 2));
console.log("\n=== 更新配置用 ===");
console.log("externalMomentsConfig.gistId =", out.moments.id);
for (const [k, v] of Object.entries(out.notebooks)) {
	console.log(`externalNotebooksConfig.notebookGists["${k}"] =`, v.id);
}
