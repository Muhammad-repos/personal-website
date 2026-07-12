<script lang="ts">
/**
 * CursorEffect.svelte — 高级光标效果 v4（视觉重做 · Apple-like 极简）
 * ----------------------------------------------------------
 * 设计理念：
 *   - 克制、轻盈、几乎透明——像空气中的微尘，不抢内容的风头
 *   - 白/灰为主色调 + 极淡的冷蓝辉光（仅在 glow 中隐约出现）
 *   - 轨迹是连续渐变消散的"运动模糊尾迹"，不是一粒粒圆点
 *   - 落点是一个 4px 的精確白点，带极细黑边保证任何背景可见
 *
 * 三档开关（设置面板独立控制）：
 *   自定义光环 / 路径拖尾 / 点击涟漪
 */

import { onMount } from "svelte";

// ===== 设置状态 =====
let enabled = false;
let trailOn = false;
let rippleOn = false;

// ===== DOM 引用 =====
let rootEl: HTMLDivElement | null = null;
let ringEl: HTMLDivElement | null = null;
let dotEl: HTMLDivElement | null = null;
let canvasEl: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let rippleLayer: HTMLDivElement | null = null;

// ===== 坐标（纯变量，零响应式开销）=====
let mouseX = -9999;
let mouseY = -9999;
let ringX = -9999;
let ringY = -9999;
let hasMoved = false;

// ===== 运行状态 =====
let rafId = 0;
let loopRunning = false;
let dpr = 1;
let reducedMotion = false;
let usingTouch = false;
let mode: "default" | "hover" | "text" | "hidden" = "hidden";

// ===== 拖尾轨迹（连续点列，绘制时用 lineTo 连成渐变线段）=====
interface TrailPt { x: number; y: number; t: number; }
const trail: TrailPt[] = [];
const TRAIL_MAX = 50;        // 采样点数
const TRAIL_LIFE = 380;      // ms 存活时间

// ===== Canvas 尺寸 =====
function resizeCanvas() {
	if (!canvasEl) return;
	ctx = canvasEl.getContext("2d");
	dpr = Math.min(window.devicePixelRatio || 1, 2);
	canvasEl.width = Math.floor(window.innerWidth * dpr);
	canvasEl.height = Math.floor(window.innerHeight * dpr);
	canvasEl.style.width = window.innerWidth + "px";
	canvasEl.style.height = window.innerHeight + "px";
	if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ===== 立即放置到当前坐标 =====
function placeInstant() {
	const rx = hasMoved ? ringX : window.innerWidth / 2;
	const my = hasMoved ? mouseY : window.innerHeight / 2;
	if (ringEl) ringEl.style.transform = `translate3d(${rx}px, ${my}px, 0) translate(-50%, -50%)`;
	if (dotEl) dotEl.style.transform = `translate3d(${my === mouseY && hasMoved ? mouseX : window.innerWidth / 2}px, ${my}px, 0) translate(-50%, -50%)`;
}

// ===== 可见性同步 =====
function updateVisibility() {
	// 光环层：enabled + 非触摸 + 非 text 模式才显示
	const showRing = enabled && !usingTouch && mode !== "text" && mode !== "hidden";
	if (rootEl) rootEl.style.opacity = showRing ? "1" : "0";

	// canvas 层：enabled + 非触摸就显示（trail/ripple 自行决定是否绘制）
	const showCanvas = enabled && !usingTouch;
	if (canvasEl) canvasEl.style.opacity = showCanvas ? "1" : "0";
	if (rippleLayer) rippleLayer.style.opacity = showCanvas ? "1" : "0";
}

// ===== 读取设置并同步 =====
function sync() {
	enabled = localStorage.getItem("cursor-effect-enabled") === "true";
	trailOn = localStorage.getItem("cursor-trail-enabled") === "true";
	rippleOn = localStorage.getItem("cursor-click-ripple") === "true";
	if (reducedMotion) { trailOn = false; rippleOn = false; }

	// 隐藏系统光标（与光环显隐同源）
	document.documentElement.classList.toggle("cursor-hidden", enabled && !usingTouch);

	// 开启瞬间：若未移动过，定位到视口中心
	if (enabled && !hasMoved) {
		const cx = window.innerWidth / 2;
		const cy = window.innerHeight / 2;
		mouseX = cx; mouseY = cy;
		ringX = cx; ringY = cy;
	}
	mode = hasMoved ? mode : "default";
	placeInstant();
	updateVisibility();

	if (enabled && !loopRunning) startLoop();
	else if (!enabled && loopRunning) stopLoop();
}

function startLoop() {
	if (loopRunning) return;
	loopRunning = true;
	rafId = requestAnimationFrame(loop);
}

function stopLoop() {
	loopRunning = false;
	if (rafId) cancelAnimationFrame(rafId);
	trail.length = 0;
	if (ctx && canvasEl) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
}

// ===== 主渲染循环 =====
function loop(now: number) {
	if (!loopRunning) return;

	// 外环缓动跟随（比鼠标稍慢，产生弹性跟随感）
	ringX += (mouseX - ringX) * 0.22;
	ringY += (mouseY - ringY) * 0.22;

	if (ringEl) ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
	if (dotEl) dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

	// ---- Canvas 绘制（拖尾 + 涟漪）----
	if (ctx && canvasEl && canvasEl.style.opacity !== "0") {
		ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

		// --- 拖尾：连续渐变线段（非离散点）---
		if (trailOn && trail.length >= 2) {
			// 按年龄排序（旧→新）
			const sorted = [...trail].sort((a, b) => a.t - b.t);

			ctx.lineCap = "round";
			ctx.lineJoin = "round";

			for (let i = 1; i < sorted.length; i++) {
				const p0 = sorted[i - 1];
				const p1 = sorted[i];
				const age1 = now - p1.t;
				if (age1 > TRAIL_LIFE) continue;

				// 此段的透明度：越新越明显
				const k = 1 - age1 / TRAIL_LIFE;
				// 平滑缓动曲线（ease-out），让头部清晰尾部柔和快速消散
				const easeK = k * k * (3 - 2 * k);

				// 线宽从 0.2 渐变到 3px（头部最粗尾部最细）
				const lw = Math.max(0.3, 3.2 * easeK);

				ctx.beginPath();
				ctx.moveTo(p0.x, p0.y);
				ctx.lineTo(p1.x, p1.y);
				// 颜色：冰蓝灰，最大 alpha 0.40（比之前更明显）
				ctx.strokeStyle = `rgba(175, 200, 235, ${0.40 * easeK})`;
				ctx.lineWidth = lw;
				ctx.stroke();
			}
		}

		// 点击涟漪已改为 DOM + CSS 动画渲染（见 spawnRipple），无需在 canvas 绘制
	}

	rafId = requestAnimationFrame(loop);
}

// ===== 交互模式切换 =====
function setMode(m: "default" | "hover" | "text" | "hidden") {
	if (mode === m) return;
	mode = m;
	if (!ringEl || !dotEl) return;
	// CSS class 切换驱动样式变化
	ringEl.classList.toggle("is-hover", m === "hover");
	dotEl.classList.toggle("is-hidden", m === "hover");
	ringEl.classList.toggle("is-text", m === "text");
	updateVisibility();
}

// ===== 事件处理 =====
function onMove(e: MouseEvent) {
	// 触摸后恢复鼠标操作
	if (usingTouch) {
		usingTouch = false;
		document.documentElement.classList.toggle("cursor-hidden", enabled);
		updateVisibility();
	}

	mouseX = e.clientX;
	mouseY = e.clientY;

	if (!hasMoved) {
		hasMoved = true;
		ringX = mouseX;
		ringY = mouseY;
		setMode("default");
		placeInstant();
	}

	// 采样拖尾（每隔一小段距离记录一个点，避免堆积太多）
	if (enabled && trailOn) {
		const last = trail[trail.length - 1];
		const dx = last ? e.clientX - last.x : 999;
		const dy = last ? e.clientY - last.y : 999;
		if (dx * dx + dy * dy > 36) { // 至少间隔 6px 才采样
			trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
			if (trail.length > TRAIL_MAX) trail.shift();
		}
	}
}

function onOver(e: MouseEvent) {
	const t = e.target as HTMLElement | null;
	if (!t) { setMode(hasMoved ? "default" : "hidden"); return; }
	if (t.closest('input, textarea, [contenteditable="true"], [role="textbox"], select')) setMode("text");
	else if (t.closest('a, button, [role="button"], [tabindex], label, .cursor-pointer, [onclick], summary, details')) setMode("hover");
	else setMode("default");
}

function onDown() { if (ringEl) ringEl.classList.add("is-press"); }
function onUp() { if (ringEl) ringEl.classList.remove("is-press"); }

function spawnRipple(x: number, y: number) {
	if (!rippleLayer) return;
	const el = document.createElement("div");
	el.className = "cursor-ripple";
	el.style.left = x + "px";
	el.style.top = y + "px";
	rippleLayer.appendChild(el);
	const kill = () => { if (el.parentNode) el.remove(); };
	el.addEventListener("animationend", kill);
	// 安全兜底：极端情况下 animationend 未触发，定时强制移除，避免残留
	setTimeout(kill, 1400);
}

function onClick(e: MouseEvent) {
	if (!enabled || !rippleOn || usingTouch) return;
	spawnRipple(e.clientX, e.clientY);
}

function onTouchStart() {
	if (!usingTouch) {
		usingTouch = true;
		document.documentElement.classList.remove("cursor-hidden");
		updateVisibility();
	}
}

// ===== 挂载 =====
onMount(() => {
	reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	resizeCanvas();

	sync();

	// 所有事件始终绑定
	window.addEventListener("mousemove", onMove, { passive: true });
	window.addEventListener("mouseover", onOver, { passive: true });
	window.addEventListener("mousedown", onDown, { passive: true });
	window.addEventListener("mouseup", onUp, { passive: true });
	window.addEventListener("click", onClick, { passive: true });
	window.addEventListener("touchstart", onTouchStart, { passive: true });
	window.addEventListener("resize", resizeCanvas);

	// 设置同步
	window.addEventListener("cursor-settings-changed", sync);
	window.addEventListener("storage", (ev) => {
		if (ev.key?.startsWith("cursor-")) sync();
	});

	return () => {
		stopLoop();
		window.removeEventListener("mousemove", onMove);
		window.removeEventListener("mouseover", onOver);
		window.removeEventListener("mousedown", onDown);
		window.removeEventListener("mouseup", onUp);
		window.removeEventListener("click", onClick);
		window.removeEventListener("touchstart", onTouchStart);
		window.removeEventListener("resize", resizeCanvas);
		window.removeEventListener("cursor-settings-changed", sync);
	};
});
</script>

<!-- 光标光环层：常驻 DOM，opacity 控制显隐 -->
<div class="cursor-root" bind:this={rootEl} style="opacity:0">
	<div class="cursor-ring" bind:this={ringEl}></div>
	<div class="cursor-dot" bind:this={dotEl}></div>
</div>

<!-- 点击涟漪层：DOM 元素 + CSS 动画，稳定可见 -->
<div class="cursor-ripple-layer" bind:this={rippleLayer} style="opacity:0"></div>

<!-- 轨迹画布 -->
<canvas class="cursor-canvas" bind:this={canvasEl} style="opacity:0"></canvas>

<style lang="stylus">
/* ================================================================
 * 光标样式 v5 — 清晰 · 有质感 · 不浮夸
 *
 * 设计参考：Apple / Linear / Vercel 等现代产品级自定义光标
 *   - 环：清晰可见的圆环，1.5px 半透白边 + 柔和扩散光晕
 *   - 点：6px 白色落点指示器，带细深色描边保证任何背景可见
 *   - 色：冷灰白色系为主，辉光用极低饱和冰蓝
 *   - 拖尾：canvas 绘制的连续渐变消散线段
 * ================================================================ */

.cursor-root
	position fixed
	inset 0
	pointer-events none
	z-index 2147483646
	transition opacity .25s ease

/* ---- 外环 ---- */
.cursor-ring
	position absolute
	top 0
	left 0
	width 40px
	height 40px
	border-radius 50%
	/* 1.5px 半透白边 —— 清晰可见但不粗笨 */
	border 1.5px solid rgba(255, 255, 255, 0.72)
	background rgba(255, 255, 255, 0.03)
	/* 三层 shadow：
	   ① 内侧极细深色描边 → 增强对比度让环在亮背景上也看得清
	   ② 外层柔和冰蓝辉光 → "浮在页面上"的光感
	   ③ 内层微弱白色高光 → 玻璃质感 */
	box-shadow 0 0 0 0.5px rgba(50, 60, 90, 0.20),
	           0 0 18px 2px rgba(160, 185, 220, 0.10),
	           inset 0 0 8px rgba(255, 255, 255, 0.06)
	transform translate3d(-9999px, -9999px, 0) translate(-50%, -50%)
	transition width .28s cubic-bezier(.23, 1, .32, 1),
	            height .28s cubic-bezier(.23, 1, .32, 1),
	            border-color .28s ease,
	            background .28s ease,
	            box-shadow .28s ease,
	            opacity .2s ease
	will-change transform, width, height
	opacity 1

/* hover 可点击元素：环放大 + 边框更实 + 辉光稍强 */
.cursor-ring.is-hover
	width 56px
	height 56px
	border-color rgba(255, 255, 255, 0.85)
	background rgba(255, 255, 255, 0.05)
	box-shadow 0 0 0 0.5px rgba(50, 60, 90, 0.25),
	           0 0 24px 3px rgba(160, 185, 220, 0.14),
	           inset 0 0 10px rgba(255, 255, 255, 0.08)

/* 文本输入区：缩小变淡 */
.cursor-ring.is-text
	width 26px
	height 26px
	border-color rgba(255, 255, 255, 0.38)
	background transparent
	box-shadow 0 0 0 0.5px rgba(50, 60, 90, 0.10)
	opacity 0.55

/* 按下收缩 */
.cursor-ring.is-press
	width 30px
	height 30px
	border-color rgba(255, 255, 255, 0.92)
	background rgba(255, 255, 255, 0.08)

/* ---- 中心落点：精确位置指示器 ---- */
.cursor-dot
	position absolute
	top 0
	left 0
	width 6px
	height 6px
	border-radius 50%
	/* 纯白核心 —— 在任何背景下都是清晰的"点" */
	background #ffffff
	/* ① 深色细描边保证亮背景可见 ② 柔和外发光增加辨识度 */
	box-shadow 0 0 0 1px rgba(30, 40, 60, 0.50),
	           0 0 6px 1px rgba(180, 200, 230, 0.30)
	transform translate3d(-9999px, -9999px, 0) translate(-50%, -50%)
	will-change transform, opacity, width, height
	transition opacity .2s ease, width .22s ease, height .22s ease
	opacity 1

/* hover 时隐藏中心点（放大后的环本身已足够指示位置）*/
.cursor-dot.is-hidden
	opacity 0
	width 0
	height 0

/* ---- 画布层（轨迹）---- */
.cursor-canvas
	position fixed
	inset 0
	pointer-events none
	z-index 2147483645
	transition opacity .25s ease

/* ---- 点击涟漪层（DOM + CSS 动画，独立于 canvas，稳定可见）---- */
.cursor-ripple-layer
	position fixed
	inset 0
	pointer-events none
	z-index 2147483645
	transition opacity .25s ease

/* 注意：.cursor-ripple 及 @keyframes cursor-ripple-anim 已移至
   src/styles/glass.css（全局作用域）。原因：该 div 在运行时由
   document.createElement 创建，没有 Svelte scoped 哈希属性，
   写在组件 <style> 内会被编译器 tree-shake 丢弃，导致运行时元素零样式不可见。 */
</style>
