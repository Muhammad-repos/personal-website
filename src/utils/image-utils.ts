import { coverImageConfig } from "../config/coverImageConfig";
import { siteConfig } from "../config/siteConfig";
import type { ImageFormat } from "../types/config";
import { getAssignedCover } from "./cover-assign";

const { randomCoverImage } = coverImageConfig;

/**
 * 根据seed生成确定性hash值
 */
function getSeedHash(seed?: string): number {
	return seed
		? Math.abs(
				seed.split("").reduce((acc, char) => {
					return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
				}, 0),
			)
		: 0;
}

/**
 * 为API URL添加seed参数，确保每篇文章获取不同图片
 */
function appendSeedParam(apiUrl: string, hash: number): string {
	if (hash === 0) return apiUrl;
	const separator = apiUrl.includes("?") ? "&" : "?";
	return `${apiUrl}${separator}v=${hash}`;
}

/**
 * 处理文章封面图
 *
 * 规则：
 *   - 显式 URL / 本地路径（且不是 "api" / "hidden"）  → 原样返回（用户自定义封面）
 *   - "api" / 未指定(undefined) / ""                  → 查全局分配表，返回本地封面路径
 *   - "hidden" / false                                → 返回 ""（不显示封面）
 *
 * @param image - 文章 frontmatter 中的 image 字段值
 * @param seed  - 文章 id（作为分配表查询键，保证确定性）
 */
export function processCoverImageSync(
	image: string | boolean | undefined | null,
	seed?: string,
): string {
	// 显式隐藏封面
	if (image === "hidden" || image === false) {
		return "";
	}

	// 显式自定义封面（非 api 的任意字符串，视为 URL/路径）
	if (typeof image === "string" && image !== "" && image !== "api") {
		return image;
	}

	// "api" / undefined / "" / null  → 使用全局分配到的本地封面
	const assigned = seed ? getAssignedCover(seed) : undefined;
	if (assigned) return assigned;

	// 分配表尚未就绪或无可用图：不显示封面（避免 404 破图）
	return "";
}

/**
 * 获取封面图客户端重试 URL 列表。
 * 本地封面（/covers/...）无需重试，返回空数组；
 * 仅当分配/配置结果为远程 http(s) 地址时才返回用于重试的列表。
 * @param image - 文章 frontmatter 中的 image 字段值
 * @param seed  - 文章 id
 */
export function getApiUrlList(
	image: string | boolean | undefined | null,
	seed?: string,
): string[] {
	// 显式自定义封面（远程地址）
	if (typeof image === "string" && image !== "" && image !== "api" && /^https?:\/\//.test(image)) {
		return [image];
	}

	if (image === "api" || image === undefined || image === "" || image === null) {
		const assigned = seed ? getAssignedCover(seed) : undefined;
		if (assigned && /^https?:\/\//.test(assigned)) {
			return [assigned];
		}
	}
	return [];
}

/**
 * 获取图片优化格式配置
 */
export function getImageFormats(): ImageFormat[] {
	const formatConfig = siteConfig.imageOptimization?.formats ?? "both";
	switch (formatConfig) {
		case "avif":
			return ["avif"];
		case "webp":
			return ["webp"];
		default:
			return ["avif", "webp"];
	}
}

/**
 * 获取图片优化质量配置
 */
export function getImageQuality(): number {
	return siteConfig.imageOptimization?.quality ?? 80;
}

/**
 * 获取图片回退格式
 */
export function getFallbackFormat(): "avif" | "webp" {
	const formatConfig = siteConfig.imageOptimization?.formats ?? "both";
	return formatConfig === "avif" ? "avif" : "webp";
}

/**
 * 检查是否需要为图片添加 referrerpolicy="no-referrer" 以解决防盗链 403 问题
 */
export function shouldAddNoReferrer(urlStr: string): boolean {
	if (!urlStr.startsWith("http")) return false;
	const domains = siteConfig.imageOptimization?.noReferrerDomains || [];
	if (domains.length === 0) return false;
	try {
		const hostname = new URL(urlStr).hostname;
		return domains.some((pattern) => {
			const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
			return new RegExp(`^${regexPattern}$`).test(hostname);
		});
	} catch {
		return false;
	}
}
