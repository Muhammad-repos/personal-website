import type { CoverImageConfig } from "../types/coverImageConfig";

/**
 * 文章封面图配置
 *
 * enableInPost - 是否在文章详情页显示封面图
 *
 * 封面图来源说明（2026-07-11 v2）：
 * - 原默认源（t.alcy.cc / dmoe.cc / uapis acg）均为二次元/动漫图，已整体弃用。
 * - 现使用本地图库 public/covers/，按 {前缀}-{序号}.jpg 命名。
 *   来源：uapis.cn（landscape/bing-daily/pc_wallpaper）、pic.ltywl.top（fj风景/mn人物）、
 *         Wikimedia Commons 精选（tech/scifi）。
 *   前缀：landscape / wallpaper / portrait / tech / scifi
 *
 * - 自动分配由 src/utils/cover-assign.ts 在构建期完成：
 *     全局随机轮询，不依赖文章 category/tags；
 *     文章 frontmatter 不写 image（或写 "api"）即自动分配，写具体路径则覆盖。
 *
 * // 文章 Frontmatter 示例：
 * ---
 * title: 文章标题
 * image: "api"   # 或省略 image 字段，都会走自动分配
 * ---
 */
export const coverImageConfig: CoverImageConfig = {
	// 是否在文章详情页显示封面图
	enableInPost: true,

	randomCoverImage: {
		// 随机封面图功能开关
		enable: true,
		// 注意：此 apis 列表已弃用。自动分配实际由 cover-assign.ts 读取 public/covers/ 完成，
		// 这里仅保留若干真实路径作占位/兼容，请勿依赖它做分配。
		apis: [
			"/covers/landscape-01.jpg",
			"/covers/wallpaper-01.jpg",
			"/covers/portrait-01.jpg",
			"/covers/tech-01.jpg",
			"/covers/scifi-01.jpg",
		],
		// 回退图片路径（public 目录下的真实本地图）。
		// 仅当某篇分配的封面加载失败时作为兜底；指向必然存在的图，避免 404 破图。
		fallback: "/covers/landscape-01.jpg",
		// 是否显示加载动画
		showLoading: true,
	},
};
