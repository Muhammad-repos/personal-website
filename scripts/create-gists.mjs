/**
 * 在 Muhammad-repos 账号下创建 说说 + 6 个笔记本 的 GitHub Gist
 * 用法：GH_TOKEN=ghp_xxx node scripts/create-gists.mjs
 * 注意：token 仅通过环境变量传入，不会被写入任何文件。
 */
import { writeFileSync } from "node:fs";

const token = process.env.GH_TOKEN;
if (!token) {
	console.error("缺少 GH_TOKEN 环境变量（请通过 GH_TOKEN=xxx 传入）");
	process.exit(1);
}

const API = "https://api.github.com";
const headers = {
	Authorization: `Bearer ${token}`,
	Accept: "application/vnd.github+json",
	"Content-Type": "application/json",
};

async function createGist(description, filename, content) {
	const res = await fetch(`${API}/gists`, {
		method: "POST",
		headers,
		body: JSON.stringify({
			description,
			public: false,
			files: { [filename]: { content } },
		}),
	});
	if (!res.ok) {
		const t = await res.text();
		throw new Error(`创建失败 HTTP ${res.status}: ${t}`);
	}
	const data = await res.json();
	return { id: data.id, url: data.html_url };
}

// 笔记本名必须与 src/config/externalNotebooksConfig.ts 的 notebookGists 键一致
const notebooks = [
	"每日总结",
	"日记本",
	"日常随笔",
	"喜马拉雅",
	"我和宝宝的日常",
	"记录100件事",
];

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

try {
	out.moments = await createGist(
		"personal-website 说说",
		"moments.json",
		JSON.stringify(sampleMoment, null, 2),
	);
	console.log("✅ 说说 Gist:", out.moments.id, out.moments.url);

	for (const nb of notebooks) {
		const g = await createGist(
			`personal-website 笔记本: ${nb}`,
			"notebooks-entries.json",
			"[]",
		);
		out.notebooks[nb] = g;
		console.log(`✅ 笔记本「${nb}」Gist:`, g.id);
	}

	writeFileSync("scripts/.gist-ids.json", JSON.stringify(out, null, 2));
	console.log("\n=== 请把下面这些 ID 更新到配置 ===");
	console.log("externalMomentsConfig.gistId =", out.moments.id);
	for (const [k, v] of Object.entries(out.notebooks)) {
		console.log(`externalNotebooksConfig.notebookGists["${k}"] =`, v.id);
	}
	console.log("\n（scripts/.gist-ids.json 不含 token，可保留或删除）");
} catch (e) {
	console.error("❌", e.message);
	process.exit(1);
}
