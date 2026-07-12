/**
 * 外部朋友圈数据获取脚本
 * 从 GitHub Gist 加载朋友圈数据并动态插入页面
 *
 * 增强版：支持 心情(mood) / 点赞(localStorage) / 逐条评论("只看这条"懒加载 Giscus) /
 * 毛玻璃聚焦展开
 */

const cacheKey = "__externalMomentsCache";
const MARKER = "data-ext-inserted";
const LIKED_KEY = "liked_moments";

// ========== 配置获取函数 ==========

function getConfig() {
	const configScript = document.getElementById("moments-config");
	if (!configScript) {
		console.warn("[外部说说] 未找到配置脚本 #moments-config");
		return null;
	}

	const gistId = configScript.getAttribute("data-gist") || "";
	const fileName = configScript.getAttribute("data-file") || "";
	const defaultAuthor = configScript.getAttribute("data-author") || "";
	const defaultAvatar = configScript.getAttribute("data-avatar") || "";

	if (!gistId || !fileName) {
		console.warn("[外部说说] 配置不完整，跳过加载");
		return null;
	}

	return { gistId, fileName, defaultAuthor, defaultAvatar };
}

function getGiscusCfg() {
	const el = document.getElementById("moments-giscus-config");
	if (!el || !el.textContent) return null;
	try {
		return JSON.parse(el.textContent);
	} catch {
		return null;
	}
}

// ========== 工具函数 ==========

function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);
	if (minutes < 1) return "刚刚";
	if (minutes < 60) return minutes + "分钟前";
	if (hours < 24) return hours + "小时前";
	if (days < 30) return days + "天前";
	return (
		date.getFullYear() +
		"-" +
		String(date.getMonth() + 1).padStart(2, "0") +
		"-" +
		String(date.getDate()).padStart(2, "0")
	);
}

function escapeHtml(text: string): string {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

function renderMarkdown(text: string): string {
	return escapeHtml(text)
		.replace(/\n/g, "<br>")
		.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
		.replace(/\*(.*?)\*/g, "<em>$1</em>")
		.replace(
			/(https?:\/\/[^\s<]+)/g,
			'<a href="$1" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:underline;">$1</a>',
		);
}

function getGridCols(count: number): number {
	if (count === 1) return 1;
	if (count === 2 || count === 4) return 2;
	return 3;
}

function parseImages(raw: unknown): string[] {
	if (!raw) return [];
	if (Array.isArray(raw)) return raw.filter(Boolean) as string[];
	if (typeof raw === "string" && raw.trim()) {
		return raw
			.split(/[,;]/)
			.map((s) => s.trim())
			.filter(Boolean);
	}
	return [];
}

// ========== 点赞持久化 ==========

function getLiked(): string[] {
	try {
		const raw = localStorage.getItem(LIKED_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

function setLiked(arr: string[]) {
	try {
		localStorage.setItem(LIKED_KEY, JSON.stringify(arr));
	} catch {
		/* ignore */
	}
}

// ========== DOM 创建函数 ==========

function createCard(m: {
	author?: string;
	avatar?: string;
	published: string;
	content?: string;
	images?: unknown;
	tags?: string[];
	location?: string;
	pinned?: boolean;
	mood?: string;
	likes?: number;
	id?: string;
}): HTMLElement {
	const config = getConfig();
	const defaultAuthor = config?.defaultAuthor || "";
	const defaultAvatar = config?.defaultAvatar || "";

	const id = m.id || "";
	const author = m.author || defaultAuthor;
	const avatar = m.avatar || defaultAvatar;
	const date = new Date(m.published);
	const timeStr = formatTimeAgo(date);
	const content = renderMarkdown(m.content || "");
	const images = parseImages(m.images);
	const tags = m.tags || [];
	const location = m.location || "";
	const mood = m.mood || "";
	const baseLikes = typeof m.likes === "number" ? m.likes : 0;

	const item = document.createElement("div");
	item.className = "wx-feed-item";
	item.setAttribute("data-published", date.toISOString());
	item.setAttribute(MARKER, "1");

	const card = document.createElement("div");
	card.className = "moment-card";
	card.setAttribute("data-id", id);

	// ===== 头部 =====
	const header = document.createElement("div");
	header.className = "card-header";

	const avatarDiv = document.createElement("div");
	avatarDiv.className = "card-avatar";
	const avatarImg = document.createElement("img");
	avatarImg.src = avatar;
	avatarImg.alt = author;
	avatarImg.className = "avatar-img";
	avatarImg.loading = "lazy";
	avatarImg.referrerPolicy = "no-referrer";
	avatarDiv.appendChild(avatarImg);

	const userInfo = document.createElement("div");
	userInfo.className = "card-user-info";

	const userRow = document.createElement("div");
	userRow.className = "user-row";
	const userName = document.createElement("span");
	userName.className = "user-name";
	userName.textContent = author;
	userRow.appendChild(userName);

	if (m.pinned) {
		const badge = document.createElement("span");
		badge.className = "pinned-badge";
		badge.innerHTML =
			'<svg t="1781845121920" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1661" width="14" height="14"><path d="M829.31 607.6L548.07 234.1c-12.93-19.17-41.01-19.61-54.82-0.89L197.3 606.71c-16.05 22.28-0.45 53.49 27.19 53.49h139.06v173.38c0 26.3 21.39 48.14 48.14 48.14H612.7c26.29 0 48.13-21.39 48.13-48.14V660.2h140.4c27.19 0 43.24-30.31 28.08-52.6z" p-id="1662" fill="var(--primary)"></path><path d="M226.72 218.06h570.5c20.95 0 37.89-16.94 37.89-37.88s-16.94-37.88-37.89-37.88h-570.5c-20.95 0-37.88 16.94-37.88 37.88s16.94 37.88 37.88 37.88z" p-id="1663" fill="var(--primary)"></path></svg>';
		const badgeText = document.createElement("span");
		badgeText.textContent = "置顶";
		badge.appendChild(badgeText);
		userRow.appendChild(badge);
	}

	if (mood) {
		const moodBadge = document.createElement("span");
		moodBadge.className = "mood-badge";
		moodBadge.textContent = mood;
		userRow.appendChild(moodBadge);
	}

	userInfo.appendChild(userRow);

	const metaRow = document.createElement("div");
	metaRow.className = "meta-row";
	const time = document.createElement("time");
	time.textContent = timeStr;
	metaRow.appendChild(time);

	if (location) {
		const dot = document.createElement("span");
		dot.className = "meta-dot";
		dot.textContent = "·";
		metaRow.appendChild(dot);
		const loc = document.createElement("span");
		loc.className = "location";
		loc.innerHTML =
			'<svg class="location-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
		const locText = document.createTextNode(location);
		loc.appendChild(locText);
		metaRow.appendChild(loc);
	}

	userInfo.appendChild(metaRow);
	header.appendChild(avatarDiv);
	header.appendChild(userInfo);
	card.appendChild(header);

	// ===== 内容 =====
	const contentDiv = document.createElement("div");
	contentDiv.className = "card-content";
	const markdownDiv = document.createElement("div");
	markdownDiv.className = "moment-markdown dark:text-neutral-100";
	markdownDiv.innerHTML = content;
	contentDiv.appendChild(markdownDiv);
	card.appendChild(contentDiv);

	// ===== 图片 =====
	if (images.length > 0) {
		const grid = document.createElement("div");
		grid.className = "card-images image-cols-" + getGridCols(images.length);
		images.forEach((src) => {
			const imgWrap = document.createElement("div");
			imgWrap.className = "image-item";
		const img = document.createElement("img");
		img.src = src;
		img.loading = "lazy";
		img.alt = "";
		img.className = "image-img";
		img.referrerPolicy = "no-referrer";
		img.setAttribute("data-fancybox", "ext-moment");
		imgWrap.appendChild(img);
			grid.appendChild(imgWrap);
		});
		card.appendChild(grid);
	}

	// ===== 标签 =====
	if (tags.length > 0) {
		const tagDiv = document.createElement("div");
		tagDiv.className = "card-tags";
		tags.forEach((t) => {
			const a = document.createElement("a");
			a.href = "/archive/?tag=" + encodeURIComponent(t.trim());
			a.className = "tag-item";
			a.textContent = "#" + t.trim();
			a.style.textDecoration = "none";
			tagDiv.appendChild(a);
		});
		card.appendChild(tagDiv);
	}

	// ===== 操作栏（点赞 + 评论） =====
	const foot = document.createElement("div");
	foot.className = "card-foot";

	const likeBtn = document.createElement("button");
	likeBtn.type = "button";
	likeBtn.className = "like-btn";
	likeBtn.setAttribute("aria-label", "点赞");
	const liked = getLiked().includes(id);
	const shown = baseLikes + (liked ? 1 : 0);
	likeBtn.innerHTML =
		'<svg class="like-icon" viewBox="0 0 24 24" width="16" height="16" fill="' +
		(liked ? "currentColor" : "none") +
		'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>' +
		'<span class="like-count">' +
		shown +
		"</span>";
	foot.appendChild(likeBtn);

	const cmtBtn = document.createElement("button");
	cmtBtn.type = "button";
	cmtBtn.className = "cmt-btn";
	cmtBtn.setAttribute("aria-label", "评论");
	cmtBtn.innerHTML = "💬 <span>评论</span>";
	foot.appendChild(cmtBtn);

	card.appendChild(foot);

	// ===== 评论容器（"只看这条"懒加载） =====
	const comments = document.createElement("div");
	comments.className = "moment-comments";
	comments.innerHTML =
		'<div class="comments-head">评论</div><div class="giscus-mount" data-moment-id="' +
		escapeHtml(id) +
		'"></div>';
	comments.style.display = "none";
	card.appendChild(comments);

	item.appendChild(card);
	return item;
}

function createPinnedPreview(m: {
	content?: string;
	images?: unknown;
	published?: string;
}): HTMLElement {
	const body = (m.content || "").trim();
	const images = parseImages(m.images);
	const preview = document.createElement("div");
	preview.className = "wx-pinned-preview";
	preview.setAttribute("data-published", m.published || "");

	if (images.length > 0) {
		const grid = document.createElement("div");
		const count = Math.min(images.length, 9);
		grid.className = "wx-pimgs wx-pimgs-" + count;
		images.forEach((src) => {
		const img = document.createElement("img");
		img.src = src;
		img.className = "wx-pinned-img";
		img.alt = "";
		img.loading = "lazy";
		img.referrerPolicy = "no-referrer";
		grid.appendChild(img);
		});
		preview.appendChild(grid);
	} else {
		const p = document.createElement("p");
		p.className = "wx-ptxt";
		let text = body.slice(0, 60);
		if (body.length > 60) text += "...";
		p.textContent = text;
		preview.appendChild(p);
	}
	return preview;
}

// ========== 数据插入函数 ==========

interface ExternalMoment {
	id: string;
	content: string;
	published: string;
	images?: string[];
	tags?: string[];
	location?: string;
	pinned?: boolean;
	author?: string;
	avatar?: string;
	mood?: string;
	likes?: number;
}

function insertExternalMoments(extMoments: ExternalMoment[]): void {
	const feed = document.getElementById("moments-feed");
	if (!feed || !extMoments || extMoments.length === 0) return;

	extMoments.sort(
		(a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
	);

	const pinned: ExternalMoment[] = [];
	const normal: ExternalMoment[] = [];
	extMoments.forEach((m) => {
		if (m.pinned) {
			pinned.push(m);
		} else {
			normal.push(m);
		}
	});

	// 插入置顶说说预览
	if (pinned.length > 0) {
		const pinnedBlock = document.getElementById("pinned-block");
		const pinnedItems = document.getElementById("pinned-items");
		if (pinnedBlock && pinnedItems) {
			pinnedBlock.style.display = "";
			pinned.forEach((m) => {
				const el = createPinnedPreview(m);
				el.setAttribute(MARKER, "1");
				pinnedItems.appendChild(el);
			});
		}
	}

	// 移除空状态
	const emptyEl = document.getElementById("moments-empty");
	if (emptyEl) emptyEl.remove();

	// 获取本地说说时间列表
	const localItems = feed.querySelectorAll(".wx-feed-item[data-published]");
	const localTimes: { el: Element; time: number }[] = [];
	localItems.forEach((el) => {
		localTimes.push({
			el: el,
			time: new Date(el.getAttribute("data-published") || "").getTime(),
		});
	});

	// 按时间顺序插入外部说说
	normal.forEach((m) => {
		const card = createCard(m);
		const extTime = new Date(m.published).getTime();
		let inserted = false;
		for (let i = 0; i < localTimes.length; i++) {
			if (localTimes[i].time < extTime) {
				feed.insertBefore(card, localTimes[i].el);
				inserted = true;
				break;
			}
		}
		if (!inserted) {
			feed.appendChild(card);
		}
	});

	// 触发事件通知 Fancybox 重新绑定
	document.dispatchEvent(new Event("moments:loaded"));
}

function hasExternalMoments(): boolean {
	const feed = document.getElementById("moments-feed");
	if (!feed) return false;
	return (
		feed.hasAttribute(MARKER) || feed.querySelector("[" + MARKER + "]") !== null
	);
}

// ========== 置顶说说页面处理 ==========

function insertPinnedExternal(extMoments: ExternalMoment[]): void {
	const feed = document.getElementById("pinned-feed");
	if (!feed || !extMoments || extMoments.length === 0) return;

	const pinned = extMoments.filter((m) => m.pinned);
	if (pinned.length === 0) return;

	// 移除空状态
	const emptyEl = feed.querySelector(".empty-state");
	if (emptyEl) emptyEl.remove();

	pinned.sort(
		(a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
	);
	pinned.forEach((m) => {
		const el = createCard(m);
		el.setAttribute(MARKER, "1");
		feed.appendChild(el);
	});
	feed.setAttribute(MARKER, "1");

	// 更新计数
	const countEl = document.querySelector(".pinned-count");
	if (countEl) {
		const existing = Number.parseInt(countEl.textContent || "0") || 0;
		countEl.textContent = existing + pinned.length + " 条";
	}

	// 触发事件
	document.dispatchEvent(new Event("moments:loaded"));
}

function hasExternalPinned(): boolean {
	const feed = document.getElementById("pinned-feed");
	if (!feed) return false;
	return (
		feed.hasAttribute(MARKER) || feed.querySelector("[" + MARKER + "]") !== null
	);
}

// ========== 数据获取函数 ==========

interface MomentsCache {
	data: ExternalMoment[];
	time: number;
}

function fetchMoments(): void {
	const feed = document.getElementById("moments-feed");
	if (!feed) return;
	if (hasExternalMoments()) return;

	const config = getConfig();
	if (!config) return;

	// 使用缓存（5分钟有效期）
	const cache = (window as unknown as Record<string, MomentsCache>)[cacheKey];
	if (cache && cache.time > Date.now() - 300000) {
		insertExternalMoments(cache.data);
		feed.setAttribute(MARKER, "1");
		return;
	}

	// 获取 GitHub Token（可选）
	const token = localStorage.getItem("gh_moments_token") || "";
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
	};
	if (token) headers["Authorization"] = "Bearer " + token;

	fetch("https://api.github.com/gists/" + config.gistId, { headers })
		.then((r) => {
			if (!r.ok) throw new Error("HTTP " + r.status);
			return r.json();
		})
		.then((gist) => {
			const file = gist.files[config.fileName];
			if (!file) return;
			const moments = JSON.parse(file.content || "[]") as ExternalMoment[];
			if (!moments.length) return;
			(window as unknown as Record<string, MomentsCache>)[cacheKey] = {
				data: moments,
				time: Date.now(),
			};
			insertExternalMoments(moments);
			feed.setAttribute(MARKER, "1");
		})
		.catch((e) => {
			console.warn("[外部说说] 加载失败:", e.message);
		});
}

function fetchPinned(): void {
	const feed = document.getElementById("pinned-feed");
	if (!feed) return;
	if (hasExternalPinned()) return;

	const config = getConfig();
	if (!config) return;

	// 使用缓存
	const cache = (window as unknown as Record<string, MomentsCache>)[cacheKey];
	if (cache && cache.time > Date.now() - 300000) {
		insertPinnedExternal(cache.data);
		return;
	}

	const token = localStorage.getItem("gh_moments_token") || "";
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
	};
	if (token) headers["Authorization"] = "Bearer " + token;

	fetch("https://api.github.com/gists/" + config.gistId, { headers })
		.then((r) => {
			if (!r.ok) throw new Error("HTTP " + r.status);
			return r.json();
		})
		.then((gist) => {
			const file = gist.files[config.fileName];
			if (!file) return;
			const moments = JSON.parse(file.content || "[]") as ExternalMoment[];
			if (!moments.length) return;
			(window as unknown as Record<string, MomentsCache>)[cacheKey] = {
				data: moments,
				time: Date.now(),
			};
			insertPinnedExternal(moments);
		})
		.catch((e) => {
			console.warn("[外部置顶说说] 加载失败:", e.message);
		});
}

// ========== 交互：点赞 / 聚焦展开 / 逐条评论 ==========

function getFeed(): HTMLElement | null {
	return document.getElementById("moments-feed");
}
function getOverlay(): HTMLElement | null {
	return document.getElementById("moments-overlay");
}

function applyLikedState(card: HTMLElement) {
	const id = card.getAttribute("data-id") || "";
	if (!id) return;
	const liked = getLiked().includes(id);
	const base = Number.parseInt(card.getAttribute("data-likes") || "0", 10) || 0;
	const shown = base + (liked ? 1 : 0);
	card.querySelectorAll<HTMLElement>(".like-btn").forEach((b) => {
		b.classList.toggle("liked", liked);
		const icon = b.querySelector("svg");
		if (icon) icon.setAttribute("fill", liked ? "currentColor" : "none");
		const c = b.querySelector(".like-count");
		if (c) c.textContent = String(shown);
	});
}

function toggleLike(btn: HTMLElement) {
	const card = btn.closest<HTMLElement>(".moment-card");
	if (!card) return;
	const id = card.getAttribute("data-id") || "";
	if (!id) return;
	const base = Number.parseInt(card.getAttribute("data-likes") || "0", 10) || 0;
	let liked = getLiked();
	const isLiked = liked.includes(id);
	if (isLiked) {
		liked = liked.filter((x) => x !== id);
	} else {
		liked.push(id);
	}
	setLiked(liked);
	const nowLiked = !isLiked;
	const shown = base + (nowLiked ? 1 : 0);
	card.querySelectorAll<HTMLElement>(".like-btn").forEach((b) => {
		b.classList.toggle("liked", nowLiked);
		const icon = b.querySelector("svg");
		if (icon) icon.setAttribute("fill", nowLiked ? "currentColor" : "none");
		const c = b.querySelector(".like-count");
		if (c) c.textContent = String(shown);
	});
}

function setFocus(card: HTMLElement) {
	const feed = getFeed();
	const overlay = getOverlay();
	if (!feed) {
		console.warn("[说说聚焦] 找不到 #moments-feed");
		return;
	}
	// 先收起其它
	feed.querySelectorAll<HTMLElement>(".moment-card.is-focused").forEach((c) => {
		if (c !== card) collapseCard(c);
	});
	feed.classList.add("feed-focusing");
	card.classList.add("is-focused");
	if (overlay) {
		overlay.classList.add("show");
		overlay.hidden = false;
	}
	card.scrollIntoView({ behavior: "smooth", block: "center" });
	// 展开评论区
	const comments = card.querySelector<HTMLElement>(".moment-comments");
	if (comments) {
		comments.style.display = "block";
		// 懒加载 Giscus
		const mount = card.querySelector<HTMLElement>(".giscus-mount");
		if (mount) loadGiscus(mount);
	}
	console.log("[说说聚焦] 已聚焦卡片:", card.getAttribute("data-id"));
}

function collapseCard(card: HTMLElement) {
	card.classList.remove("is-focused");
	removeGiscus(card);
	const comments = card.querySelector<HTMLElement>(".moment-comments");
	if (comments) comments.style.display = "none";
}

function collapseAll() {
	const feed = getFeed();
	const overlay = getOverlay();
	if (!feed) return;
	feed
		.querySelectorAll<HTMLElement>(".moment-card.is-focused")
		.forEach((c) => collapseCard(c));
	feed.classList.remove("feed-focusing");
	if (overlay) {
		overlay.classList.remove("show");
		overlay.hidden = true;
	}
}

let giscusScriptInjected = false;
function loadGiscus(mount: HTMLElement) {
	if (!mount || mount.dataset.loaded === "1") return;
	const cfg = getGiscusCfg();
	if (!cfg || !cfg.repoId) {
		console.warn("[说说评论] Giscus 配置缺失，跳过加载");
		// 仍展开评论区，显示提示
		const comments = mount.closest<HTMLElement>(".moment-comments");
		if (comments) {
			const hint = document.createElement("div");
			hint.className = "giscus-hint";
			hint.textContent = "评论系统配置中…";
			mount.appendChild(hint);
		}
		mount.dataset.loaded = "1";
		return;
	}
	const id = mount.getAttribute("data-moment-id") || "";
	const term = "moment-" + id;
	const theme = document.documentElement.classList.contains("dark")
		? "dark"
		: "light";

	// 使用动态 script 标签方式加载 Giscus（比 ESM 方式更稳定）
	const w = document.createElement("div");
	w.id = "giscus-" + term;
	w.style.cssText = "position:relative;";
	mount.appendChild(w);
	mount.dataset.loaded = "1";

	const s = document.createElement("script");
	s.src = "https://giscus.app/client.js";
	s.async = true;
	s.crossOrigin = "anonymous";
	s.setAttribute("data-repo", cfg.repo);
	s.setAttribute("data-repo-id", cfg.repoId);
	s.setAttribute("data-category", cfg.category || "General");
	s.setAttribute("data-category-id", cfg.categoryId);
	s.setAttribute("data-mapping", "specific");
	s.setAttribute("data-term", term);
	s.setAttribute("data-strict", cfg.strict || "0");
	s.setAttribute("data-reactions-enabled", cfg.reactionsEnabled || "1");
	s.setAttribute("data-emit-metadata", cfg.emitMetadata || "0");
	s.setAttribute("data-input-position", cfg.inputPosition || "bottom");
	s.setAttribute("data-theme", theme);
	s.setAttribute("data-lang", cfg.lang || "zh-CN");
	s.setAttribute("data-loading", cfg.loading || "lazy");
	// 出错时降级
	s.onerror = () => {
		console.warn("[说说评论] Giscus 加载失败，term=", term);
		w.innerHTML =
			'<div style="padding:1rem;text-align:center;color:var(--content-meta);font-size:0.85rem;">评论加载失败，请稍后重试</div>';
	};
	w.appendChild(s);

	giscusScriptInjected = true;
}

function removeGiscus(card: HTMLElement) {
	const mount = card.querySelector<HTMLElement>(".giscus-mount");
	if (!mount) return;
	// 清空挂载容器（移除 Giscus 创建的所有内容 + script）
	mount.innerHTML = "";
	mount.dataset.loaded = "0";
}

let themeObs: MutationObserver | null = null;
function ensureThemeSync() {
	if (themeObs) return;
	themeObs = new MutationObserver(() => {
		const t = document.documentElement.classList.contains("dark")
			? "dark"
			: "light";
		document
			.querySelectorAll("giscus-widget")
			.forEach((g) => g.setAttribute("theme", t));
	});
	themeObs.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
}

let globalBound = false;
function ensureGlobal() {
	if (globalBound) return;
	globalBound = true;

	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
		const likeBtn = target.closest(".like-btn");
		if (likeBtn) {
			e.stopPropagation();
			toggleLike(likeBtn as HTMLElement);
			return;
		}
		const cmtBtn = target.closest(".cmt-btn");
		if (cmtBtn) {
			e.stopPropagation();
			const card = cmtBtn.closest<HTMLElement>(".moment-card");
			if (card) {
				if (card.classList.contains("is-focused")) collapseAll();
				else setFocus(card);
			}
			return;
		}
		const ov = target.closest("#moments-overlay");
		if (ov) {
			collapseAll();
			return;
		}
		// 点击卡片本身（非按钮）聚焦，仅对外部 Gist 说说（带 data-id）生效
		const card = target.closest<HTMLElement>(".moment-card");
		if (card && card.getAttribute("data-id") && !target.closest("a") && !target.closest("img")) {
			if (card.classList.contains("is-focused")) collapseAll();
			else setFocus(card);
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") collapseAll();
	});

	// 图片加载失败降级
	document.addEventListener(
		"error",
		(e) => {
			const t = e.target as HTMLElement;
			if (t && (t.tagName === "IMG" || t.tagName === "PICTURE")) {
				const holder = t.closest(".image-item, .wx-pinned-img");
				if (holder) (holder as HTMLElement).classList.add("img-broken");
			}
		},
		true,
	);
}

function bootMomentsInteractions() {
	ensureGlobal();
	ensureThemeSync();
	// 应用已点赞状态
	const feed = getFeed();
	if (feed) {
		feed
			.querySelectorAll<HTMLElement>(".moment-card[data-id]")
			.forEach((c) => applyLikedState(c));
	}
}

// ========== 初始化 ==========

function initMoments() {
	if (document.getElementById("moments-feed")) {
		fetchMoments();
	}
	if (document.getElementById("pinned-feed")) {
		fetchPinned();
	}
	bootMomentsInteractions();
}

// 首次页面加载
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initMoments);
} else {
	initMoments();
}

// Swup 页面切换后重新加载（监听两种事件名称）
document.addEventListener("swup:content:replace", () => {
	setTimeout(() => {
		if (document.getElementById("moments-feed") && !hasExternalMoments()) {
			fetchMoments();
		}
		if (document.getElementById("pinned-feed") && !hasExternalPinned()) {
			fetchPinned();
		}
		bootMomentsInteractions();
	}, 50);
});

document.addEventListener("swup:contentReplaced", () => {
	setTimeout(() => {
		if (document.getElementById("moments-feed") && !hasExternalMoments()) {
			fetchMoments();
		}
		if (document.getElementById("pinned-feed") && !hasExternalPinned()) {
			fetchPinned();
		}
		bootMomentsInteractions();
	}, 50);
});
