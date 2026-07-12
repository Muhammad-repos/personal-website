// 只读验证 token：认证身份 + 测试 gist 写权限（测完立刻删）
const token = process.env.GITHUB_TOKEN;
if (!token) {
	console.error("缺少 GITHUB_TOKEN 环境变量");
	process.exit(1);
}

const headers = {
	Authorization: `Bearer ${token}`,
	Accept: "application/vnd.github+json",
	"Content-Type": "application/json",
	"X-GitHub-Api-Version": "2022-11-28",
};

// 1) 认证身份
const me = await fetch("https://api.github.com/user", { headers });
console.log("GET /user ->", me.status);
if (!me.ok) {
	console.log("  认证失败：", await me.text());
	process.exit(1);
}
const meData = await me.json();
console.log("  登录账号:", meData.login, "| id:", meData.id, "| 私有库:", meData.total_private_repos);

// 2) 测试 gist 写权限（建一个再删，不留垃圾）
const create = await fetch("https://api.github.com/gists", {
	method: "POST",
	headers,
	body: JSON.stringify({ public: false, files: { "_perm_test.txt": { content: "permission probe - delete me" } } }),
});
console.log("POST /gists ->", create.status);
if (!create.ok) {
	console.log("  gist 写权限不足：", await create.text());
	process.exit(1);
}
const g = await create.json();
console.log("  测试 Gist 创建成功，id =", g.id);

const del = await fetch("https://api.github.com/gists/" + g.id, { method: "DELETE", headers });
console.log("DELETE /gists/:id ->", del.status, del.ok ? "(已清理)" : "(清理失败，请手动删)");

console.log("\n结论：token 可用，gist 写权限足够 ✓");
