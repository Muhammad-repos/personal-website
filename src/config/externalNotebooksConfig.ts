// 外部笔记数据源配置（基于 GitHub Gist，完全免费）
// 每个笔记本有独立的 Gist 仓库，避免单个 Gist 空间不足
// 与说说后端共用同一套认证机制

export const externalNotebooksConfig = {
	// 是否启用外部笔记数据源
	enable: true,

	// 每个笔记本对应的 Gist ID
	// 在 https://gist.github.com 创建 Secret Gist，文件名 notebooks-entries.json，内容 []
	// 创建后把 Gist ID 填在对应笔记本名后面
	notebookGists: {
		每日总结: "54886633f4bf4301aed431800b06cf7c",
		日记本: "0c04acb58eadaeec64b3aaca474263f9",
		日常随笔: "93f30795d3a07599989bd09fba615a9f",
		喜马拉雅: "877090de48ca14af9510edabefb37115",
		我和宝宝的日常: "246d00e6fa8509d1430bac1d2fd34b52",
		记录100件事: "add90d8650e13c82832869cc81bbcdba",
	} as Record<string, string>,

	// 笔记模板（Admin 页面快速选择）
	// {name} 会被替换为今天的日期，如 2026-06-11
	templates: [
		{
			id: "daily",
			icon: "📅",
			name: "每日总结",
			title: "{name} 每日总结",
			content: "✅️今天做了：  \n🤔今日感悟：  \n⏰明天计划：",
		},
		{
			id: "diary",
			icon: "📖",
			name: "日记",
			title: "{name}",
			content: "## 天气\n\n## 今天发生了什么\n\n## 心情\n\n## 想说的话\n\n",
		},
		{
			id: "reading",
			icon: "📚",
			name: "读书笔记",
			title: "",
			content:
				"## 📖 书籍信息\n\n- 书名：\n- 作者：\n- 阅读进度：\n\n## 核心观点\n\n## 精彩摘录\n\n> \n\n## 我的思考\n\n",
		},
		{
			id: "idea",
			icon: "💡",
			name: "灵感",
			title: "💡 {name} 灵感",
			content: "## 灵感来源\n\n## 具体想法\n\n## 下一步行动\n\n- [ ] \n",
		},
		{
			id: "todo",
			icon: "✅",
			name: "待办",
			title: "📋 {name} 待办",
			content:
				"## 重要且紧急\n\n- [ ] \n\n## 重要不紧急\n\n- [ ] \n\n## 紧急不重要\n\n- [ ] \n\n## 其他\n\n- [ ] \n",
		},
		{
			id: "free",
			icon: "📝",
			name: "空白",
			title: "",
			content: "",
		},
	] as Array<{
		id: string;
		icon: string;
		name: string;
		title: string;
		content: string;
	}>,

	// 后台登录密码的 SHA-256 哈希（与说说后台共用同一密码）
	adminPasswordHash:
		"234206dd685435082bf9a74701b9928c0c5542566279350661f9487443995bfc",

	// GitHub Token（优先从环境变量 GITHUB_TOKEN 读取）
	githubToken: process.env.GITHUB_TOKEN || "",
};
