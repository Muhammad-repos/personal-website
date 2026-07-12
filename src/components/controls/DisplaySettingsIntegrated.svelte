<script lang="ts">
import {
	WALLPAPER_BANNER,
	WALLPAPER_FULLSCREEN,
	WALLPAPER_NONE,
	WALLPAPER_OVERLAY,
} from "@constants/constants";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import {
	applyPostCoverImageEnabledToDocument,
	getDefaultBannerCarouselEnabled,
	getDefaultBannerTitleEnabled,
	getDefaultFullscreenCarouselEnabled,
	getDefaultGradientEnabled,
	getDefaultHue,
	getDefaultOverlayBlur,
	getDefaultOverlayCardOpacity,
	getDefaultOverlayOpacity,
	getDefaultPostCoverImageEnabled,
	getDefaultSakuraEnabled,
	getDefaultWavesEnabled,
	getHue,
	getStoredBannerCarouselEnabled,
	getStoredBannerTitleEnabled,
	getStoredFullscreenCarouselEnabled,
	getStoredGradientEnabled,
	getStoredOverlayBlur,
	getStoredOverlayCardOpacity,
	getStoredOverlayOpacity,
	getStoredPostCoverImageEnabled,
	getStoredSakuraEnabled,
	getStoredWallpaperMode,
	getStoredWavesEnabled,
	setBannerCarouselEnabled,
	setBannerTitleEnabled,
	setFullscreenCarouselEnabled,
	setGradientEnabled,
	setHue,
	setOverlayBlur,
	setOverlayCardOpacity,
	setOverlayOpacity,
	setPostCoverImageEnabled,
	setSakuraEnabled,
	setWallpaperMode,
	setWavesEnabled,
} from "@utils/setting-utils";
import { onMount } from "svelte";
import Icon from "@/components/common/Icon.svelte";
import { backgroundWallpaper, sakuraConfig, siteConfig } from "@/config";
import type { WALLPAPER_MODE } from "@/types/config";

type OverlaySliderItem = {
	key: "opacity" | "blur" | "cardOpacity";
	enabled: boolean;
	label: string;
	displayValue: string;
	ariaLabel: string;
	min: number;
	max: number;
	step: number;
	value: number;
	onValueChange: (value: number) => void;
};

let hue = $state(getHue());
const defaultHue = getDefaultHue();
let wallpaperMode: WALLPAPER_MODE = $state(backgroundWallpaper.mode);
const defaultWallpaperMode = backgroundWallpaper.mode;
let currentLayout: "list" | "grid" = $state("list");
const defaultLayout = siteConfig.postListLayout.defaultMode;
const mobileDefaultLayout =
	siteConfig.postListLayout.mobileDefaultMode || defaultLayout;
let mounted = $state(false);
let isSmallScreen = $state(
	typeof window !== "undefined" ? window.innerWidth < 1200 : false,
);
let isMobileWidth = $state(
	typeof window !== "undefined" ? window.innerWidth < 780 : false,
);
let isSwitching = $state(false);
let wavesEnabled = $state(true);
const defaultWavesEnabled = getDefaultWavesEnabled();
let gradientEnabled = $state(true);
const defaultGradientEnabled = getDefaultGradientEnabled();
let bannerTitleEnabled = $state(true);
const defaultBannerTitleEnabled = getDefaultBannerTitleEnabled();
let bannerCarouselEnabled = $state(true);
const defaultBannerCarouselEnabled = getDefaultBannerCarouselEnabled();
let fullscreenCarouselEnabled = $state(true);
const defaultFullscreenCarouselEnabled = getDefaultFullscreenCarouselEnabled();
let sakuraEnabled = $state(true);
const defaultSakuraEnabled = getDefaultSakuraEnabled();
let overlayOpacity = $state(getDefaultOverlayOpacity());
const defaultOverlayOpacity = getDefaultOverlayOpacity();
let overlayBlur = $state(getDefaultOverlayBlur());
const defaultOverlayBlur = getDefaultOverlayBlur();
let overlayCardOpacity = $state(getDefaultOverlayCardOpacity());
const defaultOverlayCardOpacity = getDefaultOverlayCardOpacity();
let postCoverImageEnabled = $state(true);
const defaultPostCoverImageEnabled = getDefaultPostCoverImageEnabled();

// ===== 玻璃效果设置（自包含，不依赖 setting-utils）=====
// 注意：这些变量直接对应滑块 raw 值，不是 CSS 的 0~1 小数
let glassOpacityPercent = $state(32);   // 滑块范围 15~80，表示百分比（默认 32% = 很透的玻璃）
const defaultGlassOpacityPercent = 32;
let auroraIntensity = $state(1.2);      // 滑块范围 0~2.5，倍数（默认 1.2x = 轻微加强）
const defaultAuroraIntensity = 1.2;
let glassBlur = $state(18);            // 滑块范围 0~30，px
const defaultGlassBlur = 18;
// 玻璃设置始终显示
const isGlassSwitchable = true;

// ===== 光标特效设置（自包含，localStorage 持久化）=====
let cursorEffectEnabled = $state(false);
const defaultCursorEffectEnabled = false;
let cursorTrailEnabled = $state(false);
const defaultCursorTrailEnabled = false;
let cursorClickRipple = $state(false);
const defaultCursorClickRipple = false;
// 光标设置始终显示（在 Glass 区域下方）
const isCursorSwitchable = true;

const isWallpaperSwitchable = backgroundWallpaper.switchable ?? true;
const allowLayoutSwitch = siteConfig.postListLayout.allowSwitch;
let effectiveDefaultLayout = $derived(
	isMobileWidth ? mobileDefaultLayout : defaultLayout,
);
const showThemeColor = !siteConfig.themeColor.fixed;
// 是否允许用户切换水波纹动画（只看 switchable 配置）
const isWavesSwitchable =
	backgroundWallpaper.common?.waves?.switchable ?? false;
// 是否允许用户切换渐变过渡（只看 switchable 配置）
const isGradientSwitchable =
	backgroundWallpaper.common?.gradient?.switchable ?? false;
// 检查是否启用横幅标题配置
const isBannerTitleEnabled =
	backgroundWallpaper.common?.homeText?.enable ?? false;
// 是否允许用户切换横幅标题
const isBannerTitleSwitchable =
	isBannerTitleEnabled &&
	(backgroundWallpaper.common?.homeText?.switchable ?? false);
// 是否允许用户切换横幅轮播
const isBannerCarouselSwitchable =
	backgroundWallpaper.common?.carousel?.switchable ?? false;
// 是否允许用户切换全屏轮播
const isFullscreenCarouselSwitchable =
	backgroundWallpaper.fullscreen?.carousel?.switchable ?? false;
// 是否允许用户切换樱花特效
const isSakuraSwitchable = sakuraConfig?.switchable ?? false;
// 是否允许用户切换文章封面图
const isPostCoverImageSwitchable =
	siteConfig.postListLayout.allowCoverSwitch ?? true;
// 是否有任何横幅设置可显示（后续添加新设置时在此处添加条件）
const hasBannerSettings =
	isWavesSwitchable ||
	isGradientSwitchable ||
	isBannerTitleSwitchable ||
	isBannerCarouselSwitchable ||
	isFullscreenCarouselSwitchable;
const overlaySwitchableConfig =
	backgroundWallpaper.overlay?.switchable ?? false;
const isOverlaySettingsSwitchable =
	typeof overlaySwitchableConfig === "boolean" ? overlaySwitchableConfig : true;
const isOverlayOpacitySwitchable =
	typeof overlaySwitchableConfig === "boolean"
		? overlaySwitchableConfig
		: (overlaySwitchableConfig.opacity ?? false);
const isOverlayBlurSwitchable =
	typeof overlaySwitchableConfig === "boolean"
		? overlaySwitchableConfig
		: (overlaySwitchableConfig.blur ?? false);
const isOverlayCardOpacitySwitchable =
	typeof overlaySwitchableConfig === "boolean"
		? overlaySwitchableConfig
		: (overlaySwitchableConfig.cardOpacity ?? false);
const hasOverlaySettings =
	isOverlaySettingsSwitchable &&
	(isOverlayOpacitySwitchable ||
		isOverlayBlurSwitchable ||
		isOverlayCardOpacitySwitchable);
let overlaySettingsIsDefault = $derived(
	(!isOverlayOpacitySwitchable || overlayOpacity === defaultOverlayOpacity) &&
		(!isOverlayBlurSwitchable || overlayBlur === defaultOverlayBlur) &&
		(!isOverlayCardOpacitySwitchable ||
			overlayCardOpacity === defaultOverlayCardOpacity),
);
// 横幅设置是否全部为默认值（用于控制恢复默认按钮的显隐）
let bannerSettingsIsDefault = $derived(
	(!isBannerTitleSwitchable ||
		bannerTitleEnabled === defaultBannerTitleEnabled) &&
		(!isWavesSwitchable || wavesEnabled === defaultWavesEnabled) &&
		(!isGradientSwitchable || gradientEnabled === defaultGradientEnabled) &&
		(!isBannerCarouselSwitchable ||
			bannerCarouselEnabled === defaultBannerCarouselEnabled) &&
		(!isFullscreenCarouselSwitchable ||
			fullscreenCarouselEnabled === defaultFullscreenCarouselEnabled),
);
const hasAnyContent =
	showThemeColor ||
	isWallpaperSwitchable ||
	allowLayoutSwitch ||
	isPostCoverImageSwitchable ||
	hasBannerSettings ||
	hasOverlaySettings ||
	isSakuraSwitchable ||
	isGlassSwitchable ||
	isCursorSwitchable;

let overlaySliderItems = $derived<OverlaySliderItem[]>([
	{
		key: "opacity",
		enabled: isOverlayOpacitySwitchable,
		label: i18n(I18nKey.overlayOpacity),
		displayValue: `${Math.round(overlayOpacity * 100)}%`,
		ariaLabel: i18n(I18nKey.overlayOpacity),
		min: 20,
		max: 100,
		step: 1,
		value: Math.round(overlayOpacity * 100),
		onValueChange: (value) => {
			overlayOpacity = value / 100;
		},
	},
	{
		key: "blur",
		enabled: isOverlayBlurSwitchable,
		label: i18n(I18nKey.overlayBlur),
		displayValue: `${overlayBlur.toFixed(1)}px`,
		ariaLabel: i18n(I18nKey.overlayBlur),
		min: 0,
		max: 20,
		step: 0.5,
		value: overlayBlur,
		onValueChange: (value) => {
			overlayBlur = value;
		},
	},
	{
		key: "cardOpacity",
		enabled: isOverlayCardOpacitySwitchable,
		label: i18n(I18nKey.overlayCardOpacity),
		displayValue: `${Math.round(overlayCardOpacity * 100)}%`,
		ariaLabel: i18n(I18nKey.overlayCardOpacity),
		min: 20,
		max: 100,
		step: 1,
		value: Math.round(overlayCardOpacity * 100),
		onValueChange: (value) => {
			overlayCardOpacity = value / 100;
		},
	},
]);

function resetHue() {
	hue = getDefaultHue();
	requestAnimationFrame(refreshAllRangeProgress);
}

function resetWallpaperMode() {
	wallpaperMode = defaultWallpaperMode;
	setWallpaperMode(defaultWallpaperMode);
}

function resetLayout() {
	currentLayout = effectiveDefaultLayout;
	localStorage.removeItem("postListLayout");

	// 触发自定义事件，通知页面布局已改变
	const event = new CustomEvent("layoutChange", {
		detail: { layout: effectiveDefaultLayout },
	});
	window.dispatchEvent(event);
}

function resetWavesEnabled() {
	wavesEnabled = defaultWavesEnabled;
	setWavesEnabled(defaultWavesEnabled);
}

function resetGradientEnabled() {
	gradientEnabled = defaultGradientEnabled;
	setGradientEnabled(defaultGradientEnabled);
}

function resetBannerSettings() {
	if (
		isBannerTitleSwitchable &&
		bannerTitleEnabled !== defaultBannerTitleEnabled
	) {
		bannerTitleEnabled = defaultBannerTitleEnabled;
		setBannerTitleEnabled(defaultBannerTitleEnabled);
	}
	if (isWavesSwitchable && wavesEnabled !== defaultWavesEnabled) {
		wavesEnabled = defaultWavesEnabled;
		setWavesEnabled(defaultWavesEnabled);
	}
	if (isGradientSwitchable && gradientEnabled !== defaultGradientEnabled) {
		gradientEnabled = defaultGradientEnabled;
		setGradientEnabled(defaultGradientEnabled);
	}
	if (
		isBannerCarouselSwitchable &&
		bannerCarouselEnabled !== defaultBannerCarouselEnabled
	) {
		bannerCarouselEnabled = defaultBannerCarouselEnabled;
		setBannerCarouselEnabled(defaultBannerCarouselEnabled);
	}
	if (
		isFullscreenCarouselSwitchable &&
		fullscreenCarouselEnabled !== defaultFullscreenCarouselEnabled
	) {
		fullscreenCarouselEnabled = defaultFullscreenCarouselEnabled;
		setFullscreenCarouselEnabled(defaultFullscreenCarouselEnabled);
	}
}

function resetOverlaySettings() {
	if (isOverlayOpacitySwitchable && overlayOpacity !== defaultOverlayOpacity) {
		overlayOpacity = defaultOverlayOpacity;
		setOverlayOpacity(defaultOverlayOpacity);
	}
	if (isOverlayBlurSwitchable && overlayBlur !== defaultOverlayBlur) {
		overlayBlur = defaultOverlayBlur;
		setOverlayBlur(defaultOverlayBlur);
	}
	if (
		isOverlayCardOpacitySwitchable &&
		overlayCardOpacity !== defaultOverlayCardOpacity
	) {
		overlayCardOpacity = defaultOverlayCardOpacity;
		setOverlayCardOpacity(defaultOverlayCardOpacity);
	}

	requestAnimationFrame(refreshAllRangeProgress);
}

// ===== 玻璃效果：将设置应用到 CSS 自定义属性 + 持久化到 localStorage =====
function applyGlassSettings() {
	const root = document.documentElement;
	// glassOpacityPercent 是整数值 (15~80)，CSS 需要 0.15~0.80 的小数
	root.style.setProperty("--glass-opacity", String(glassOpacityPercent / 100));

	// 极光浓度：直接控制 rgba 的 alpha 通道（不再用 opacity，解决 >1 无效的问题）
	// 映射：0→0(消失), 1.0→0.52(默认), 2.0→0.78, 2.5→0.91（CSS alpha 自然上限 1.0）
	const auroraAlpha = Math.min(auroraIntensity * 0.45, 1);
	const auroraAlpha2 = Math.min(auroraIntensity * 0.40, 1);
	const auroraAlphaDark = Math.min(auroraIntensity * 0.35, 1);
	const auroraAlpha2Dark = Math.min(auroraIntensity * 0.30, 1);

	root.style.setProperty("--aurora-alpha", String(auroraAlpha));
	root.style.setProperty("--aurora-alpha-2", String(auroraAlpha2));
	root.style.setProperty("--aurora-alpha-dark", String(auroraAlphaDark));
	root.style.setProperty("--aurora-alpha-2-dark", String(auroraAlpha2Dark));
	// 兼容：保留 --aurora-intensity 供其他可能的引用
	root.style.setProperty("--aurora-intensity", String(auroraIntensity));

	root.style.setProperty("--glass-blur", `${glassBlur}px`);

	localStorage.setItem("glass-opacity", String(glassOpacityPercent));
	localStorage.setItem("aurora-intensity", String(auroraIntensity));
	localStorage.setItem("glass-blur", String(glassBlur));

	requestAnimationFrame(refreshAllRangeProgress);
}

// ===== 光标特效：应用设置到 localStorage + body 类 + 通知 CursorEffect 组件 =====
function applyCursorSettings() {
	localStorage.setItem("cursor-effect-enabled", String(cursorEffectEnabled));
	localStorage.setItem("cursor-trail-enabled", String(cursorTrailEnabled));
	localStorage.setItem("cursor-click-ripple", String(cursorClickRipple));

	// 通知 CursorEffect 组件重新读取设置
	window.dispatchEvent(new CustomEvent("cursor-settings-changed"));
}

function toggleCursorEffectEnabled() {
	cursorEffectEnabled = !cursorEffectEnabled;
	// 关闭主开关时自动关闭子效果
	if (!cursorEffectEnabled) {
		cursorTrailEnabled = false;
		cursorClickRipple = false;
	}
	applyCursorSettings();
}

function toggleCursorTrailEnabled() {
	cursorTrailEnabled = !cursorTrailEnabled;
	if (cursorTrailEnabled && !cursorEffectEnabled) {
		cursorEffectEnabled = true;
	}
	applyCursorSettings();
}

function toggleCursorClickRipple() {
	cursorClickRipple = !cursorClickRipple;
	if (cursorClickRipple && !cursorEffectEnabled) {
		cursorEffectEnabled = true;
	}
	applyCursorSettings();
}

function toggleWavesEnabled() {
	wavesEnabled = !wavesEnabled;
	setWavesEnabled(wavesEnabled);
}

function toggleGradientEnabled() {
	gradientEnabled = !gradientEnabled;
	setGradientEnabled(gradientEnabled);
}

function toggleBannerTitleEnabled() {
	bannerTitleEnabled = !bannerTitleEnabled;
	setBannerTitleEnabled(bannerTitleEnabled);
}

function toggleBannerCarouselEnabled() {
	bannerCarouselEnabled = !bannerCarouselEnabled;
	setBannerCarouselEnabled(bannerCarouselEnabled);
}

function toggleFullscreenCarouselEnabled() {
	fullscreenCarouselEnabled = !fullscreenCarouselEnabled;
	setFullscreenCarouselEnabled(fullscreenCarouselEnabled);
}

function toggleSakuraEnabled() {
	sakuraEnabled = !sakuraEnabled;
	setSakuraEnabled(sakuraEnabled);
}

function togglePostCoverImageEnabled() {
	postCoverImageEnabled = !postCoverImageEnabled;
	setPostCoverImageEnabled(postCoverImageEnabled);
}

function switchWallpaperMode(newMode: WALLPAPER_MODE) {
	wallpaperMode = newMode;
	setWallpaperMode(newMode);
	window.scrollTo({ top: 0 });

	if (newMode === WALLPAPER_OVERLAY) {
		requestAnimationFrame(refreshAllRangeProgress);
	}
}

function checkScreenSize() {
	isSmallScreen = window.innerWidth < 1200;
	isMobileWidth = window.innerWidth < 780;
	// 低于380px强制网格模式
	if (window.innerWidth < 380 && currentLayout === "list") {
		currentLayout = "grid";
		const event = new CustomEvent("layoutChange", {
			detail: { layout: "grid" },
		});
		window.dispatchEvent(event);
	}
}

function updateRangeProgress(input: HTMLInputElement) {
	const min = Number(input.min || 0);
	const max = Number(input.max || 100);
	const value = Number(input.value || 0);
	const progress = ((value - min) * 100) / (max - min || 1);
	input.style.setProperty(
		"--range-progress",
		`${Math.min(100, Math.max(0, progress))}%`,
	);
}

function refreshAllRangeProgress() {
	const panel = document.getElementById("display-setting");
	if (!panel) return;

	const rangeInputs = Array.from(
		panel.querySelectorAll('input[type="range"]'),
	) as HTMLInputElement[];

	rangeInputs.forEach((input) => {
		updateRangeProgress(input);
	});
}

function switchLayout() {
	if (!mounted || isSwitching) return;

	isSwitching = true;
	currentLayout = currentLayout === "list" ? "grid" : "list";
	localStorage.setItem("postListLayout", currentLayout);

	// 触发自定义事件，通知页面布局已改变
	const event = new CustomEvent("layoutChange", {
		detail: { layout: currentLayout },
	});
	window.dispatchEvent(event);

	// 动画完成后重置状态
	setTimeout(() => {
		isSwitching = false;
	}, 500);
}

onMount(() => {
	mounted = true;
	checkScreenSize();

	// 从localStorage读取保存的壁纸模式
	wallpaperMode = getStoredWallpaperMode();

	// 从localStorage读取水波纹动画状态
	wavesEnabled = getStoredWavesEnabled();

	// 从localStorage读取渐变过渡状态
	gradientEnabled = getStoredGradientEnabled();

	// 从localStorage读取横幅标题状态
	bannerTitleEnabled = getStoredBannerTitleEnabled();

	// 从localStorage读取横幅轮播状态
	bannerCarouselEnabled = getStoredBannerCarouselEnabled();

	// 从localStorage读取全屏轮播状态
	fullscreenCarouselEnabled = getStoredFullscreenCarouselEnabled();

	// 从localStorage读取樱花特效状态
	sakuraEnabled = getStoredSakuraEnabled();

	// 从localStorage读取文章封面图状态
	postCoverImageEnabled = getStoredPostCoverImageEnabled();
	// 将状态应用到文档
	applyPostCoverImageEnabledToDocument(postCoverImageEnabled);

	// 从localStorage读取全屏透明设置状态
	overlayOpacity = getStoredOverlayOpacity();
	overlayBlur = getStoredOverlayBlur();
	overlayCardOpacity = getStoredOverlayCardOpacity();

	// 初始化玻璃效果设置（自包含，读写 localStorage + CSS 自定义属性）
	const savedGlassOpacity = localStorage.getItem("glass-opacity");
	if (savedGlassOpacity !== null) {
		let parsed = parseFloat(savedGlassOpacity);
		// 保护：旧 bug 存的是 0~80 原始值，新格式也是 15~80 百分比，统一 clamp
		if (!isNaN(parsed)) {
			glassOpacityPercent = Math.max(15, Math.min(80, parsed));
		}
		document.documentElement.style.setProperty("--glass-opacity", String(glassOpacityPercent / 100));
	}
	const savedAuroraIntensity = localStorage.getItem("aurora-intensity");
	if (savedAuroraIntensity !== null) {
		let parsed = parseFloat(savedAuroraIntensity);
		if (!isNaN(parsed)) {
			auroraIntensity = Math.max(0, Math.min(2.5, parsed));
		}
		// 初始化时也计算 alpha 通道变量（与 applyGlassSettings 保持一致）
		const initAuroraAlpha = Math.min(auroraIntensity * 0.45, 1);
		const initAuroraAlpha2 = Math.min(auroraIntensity * 0.40, 1);
		document.documentElement.style.setProperty("--aurora-alpha", String(initAuroraAlpha));
		document.documentElement.style.setProperty("--aurora-alpha-2", String(initAuroraAlpha2));
		document.documentElement.style.setProperty("--aurora-alpha-dark", String(Math.min(auroraIntensity * 0.35, 1)));
		document.documentElement.style.setProperty("--aurora-alpha-2-dark", String(Math.min(auroraIntensity * 0.30, 1)));
		document.documentElement.style.setProperty("--aurora-intensity", String(auroraIntensity));
	}
	const savedGlassBlur = localStorage.getItem("glass-blur");
	if (savedGlassBlur !== null) {
		let parsed = parseFloat(savedGlassBlur);
		if (!isNaN(parsed)) {
			glassBlur = Math.max(0, Math.min(30, parsed));
		}
		document.documentElement.style.setProperty("--glass-blur", `${glassBlur}px`);
	}

	// 初始化光标特效设置（自包含，读写 localStorage + body 类）
	cursorEffectEnabled = localStorage.getItem("cursor-effect-enabled") === "true";
	cursorTrailEnabled = localStorage.getItem("cursor-trail-enabled") === "true";
	cursorClickRipple = localStorage.getItem("cursor-click-ripple") === "true";
	// 从localStorage读取用户偏好布局
	const savedLayout = localStorage.getItem("postListLayout");
	if (savedLayout && (savedLayout === "list" || savedLayout === "grid")) {
		currentLayout = savedLayout;
	} else {
		currentLayout =
			window.innerWidth < 780 ? mobileDefaultLayout : defaultLayout;
	}

	// 监听窗口大小变化
	window.addEventListener("resize", checkScreenSize);

	return () => {
		window.removeEventListener("resize", checkScreenSize);
	};
});

// 监听布局变化事件
onMount(() => {
	const handleCustomEvent = (event: Event) => {
		const customEvent = event as CustomEvent<{ layout: "list" | "grid" }>;
		currentLayout = customEvent.detail.layout;
	};

	window.addEventListener("layoutChange", handleCustomEvent);

	return () => {
		window.removeEventListener("layoutChange", handleCustomEvent);
	};
});

onMount(() => {
	const panel = document.getElementById("display-setting");
	if (!panel) return;

	const handleRangeInput = (event: Event) => {
		const target = event.target;
		if (target instanceof HTMLInputElement && target.type === "range") {
			updateRangeProgress(target);
		}
	};

	refreshAllRangeProgress();
	panel.addEventListener("input", handleRangeInput);

	return () => {
		panel.removeEventListener("input", handleRangeInput);
	};
});

onMount(() => {
	const handleWallpaperModeChange = (event: Event) => {
		const customEvent = event as CustomEvent<{ mode: WALLPAPER_MODE }>;
		wallpaperMode = customEvent.detail.mode;
	};

	window.addEventListener("wallpaperModeChange", handleWallpaperModeChange);

	return () => {
		window.removeEventListener(
			"wallpaperModeChange",
			handleWallpaperModeChange,
		);
	};
});

$effect(() => {
	if (hue || hue === 0) {
		setHue(hue);
	}
});

$effect(() => {
	if (wallpaperMode === WALLPAPER_OVERLAY) {
		if (isOverlayOpacitySwitchable) {
			setOverlayOpacity(overlayOpacity);
		}
		if (isOverlayBlurSwitchable) {
			setOverlayBlur(overlayBlur);
		}
		if (isOverlayCardOpacitySwitchable) {
			setOverlayCardOpacity(overlayCardOpacity);
		}
	}
});
</script>

{#if hasAnyContent}
<div id="display-setting" class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-2 max-h-[85vh] overflow-y-auto">
    <!-- Theme Color Section -->
    {#if showThemeColor}
    <div class="mt-2 mb-2">
        <div class="flex flex-row gap-2 mb-2 items-center justify-between">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
            >
                {i18n(I18nKey.themeColor)}
                <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90"
                        class:opacity-0={hue === defaultHue} class:pointer-events-none={hue === defaultHue} onclick={resetHue}>
                    <div class="text-(--btn-content)">
                        <Icon icon="fa7-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                    </div>
                </button>
            </div>
            <div class="flex gap-1">
                <div id="hueValue" class="transition bg-(--btn-regular-bg) w-10 h-7 rounded-md flex justify-center
                font-bold text-sm items-center text-(--btn-content)">
                    {hue}
                </div>
            </div>
        </div>
        <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none">
            <input aria-label={i18n(I18nKey.themeColor)} type="range" min="0" max="360" bind:value={hue}
                   class="slider" id="colorSlider" step="5" style="width: 100%">
        </div>
    </div>
    {/if}

    <!-- Wallpaper Mode Section -->
    {#if isWallpaperSwitchable}
        <div class="mt-2 mb-2">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
            >
                {i18n(I18nKey.wallpaperMode)}
                <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90"
                        class:opacity-0={wallpaperMode === defaultWallpaperMode} class:pointer-events-none={wallpaperMode === defaultWallpaperMode} onclick={resetWallpaperMode}>
                    <div class="text-(--btn-content)">
                        <Icon icon="fa7-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                    </div>
                </button>
            </div>
            <div class="flex gap-2">
                <button
                    class="flex-1 btn-regular rounded-md py-2 px-3 flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden"
                    class:opacity-60={wallpaperMode !== WALLPAPER_BANNER}
                    class:bg-(--btn-regular-bg-hover)={wallpaperMode === WALLPAPER_BANNER}
                    onclick={() => switchWallpaperMode(WALLPAPER_BANNER)}
                >
                    <Icon icon="material-symbols:image-outline" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-xs font-medium">{i18n(I18nKey.wallpaperBannerMode)}</span>
                </button>
                <button
                    class="flex-1 btn-regular rounded-md py-2 px-3 flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden"
                    class:opacity-60={wallpaperMode !== WALLPAPER_FULLSCREEN}
                    class:bg-(--btn-regular-bg-hover)={wallpaperMode === WALLPAPER_FULLSCREEN}
                    onclick={() => switchWallpaperMode(WALLPAPER_FULLSCREEN)}
                >
                    <Icon icon="material-symbols:wallpaper" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-xs font-medium">{i18n(I18nKey.wallpaperFullscreenMode)}</span>
                </button>
            </div>
            <div class="flex gap-2 mt-2">
                <button
                    class="flex-1 btn-regular rounded-md py-2 px-3 flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden"
                    class:opacity-60={wallpaperMode !== WALLPAPER_OVERLAY}
                    class:bg-(--btn-regular-bg-hover)={wallpaperMode === WALLPAPER_OVERLAY}
                    onclick={() => switchWallpaperMode(WALLPAPER_OVERLAY)}
                >
                    <Icon icon="material-symbols:full-coverage-outline-rounded" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-xs font-medium">{i18n(I18nKey.wallpaperOverlayMode)}</span>
                </button>
                <button
                    class="flex-1 btn-regular rounded-md py-2 px-3 flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden"
                    class:opacity-60={wallpaperMode !== WALLPAPER_NONE}
                    class:bg-(--btn-regular-bg-hover)={wallpaperMode === WALLPAPER_NONE}
                    onclick={() => switchWallpaperMode(WALLPAPER_NONE)}
                >
                    <Icon icon="material-symbols:hide-image-outline" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-xs font-medium">{i18n(I18nKey.wallpaperNoneMode)}</span>
                </button>
            </div>
        </div>
    {/if}

    <!-- Overlay Settings Section -->
    {#if wallpaperMode === WALLPAPER_OVERLAY && hasOverlaySettings}
        <div class="mt-2 mb-2">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
            >
                {i18n(I18nKey.overlaySettings)}
                <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md active:scale-90"
                        class:opacity-0={overlaySettingsIsDefault} class:pointer-events-none={overlaySettingsIsDefault} onclick={resetOverlaySettings}>
                    <div class="text-(--btn-content)">
                        <Icon icon="fa7-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                    </div>
                </button>
            </div>
            <div class="space-y-2">
                {#each overlaySliderItems as item (item.key)}
                    {#if item.enabled}
                        <div class="rounded-md bg-(--btn-regular-bg) p-2">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium text-(--btn-content) opacity-80">{item.label}</span>
                                <span class="text-xs text-(--btn-content)">{item.displayValue}</span>
                            </div>
                            <input
                                aria-label={item.ariaLabel}
                                type="range"
                                min={item.min}
                                max={item.max}
                                step={item.step}
                                value={item.value}
                                oninput={(e) => item.onValueChange(Number((e.currentTarget as HTMLInputElement).value))}
                                class="slider w-full overlay-slider"
                            />
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}

    <!-- Banner Settings Section -->
    {#if (wallpaperMode === WALLPAPER_BANNER || wallpaperMode === WALLPAPER_FULLSCREEN) && hasBannerSettings}
        <div class="mt-2 mb-2">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
            >
                {i18n(I18nKey.wallpaperSettings)}
                <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90"
                        class:opacity-0={bannerSettingsIsDefault} class:pointer-events-none={bannerSettingsIsDefault} onclick={resetBannerSettings}>
                    <div class="text-(--btn-content)">
                        <Icon icon="fa7-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                    </div>
                </button>
            </div>
            <div class="space-y-1">
                <!-- Banner Title Switch -->
                {#if isBannerTitleSwitchable}
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={bannerTitleEnabled}
                    onclick={toggleBannerTitleEnabled}
                >
                    <Icon icon="material-symbols:titlecase-rounded" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">{i18n(I18nKey.wallpaperTitle)}</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={bannerTitleEnabled}
                         class:bg-(--btn-regular-bg-active)={!bannerTitleEnabled}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!bannerTitleEnabled}
                             class:left-5={bannerTitleEnabled}></div>
                    </div>
                </button>
                {/if}
                <!-- Banner Carousel Switch -->
                {#if isBannerCarouselSwitchable && wallpaperMode === WALLPAPER_BANNER}
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={bannerCarouselEnabled}
                    onclick={toggleBannerCarouselEnabled}
                >
                    <Icon icon="material-symbols:view-carousel-outline" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">{i18n(I18nKey.wallpaperCarousel)}</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={bannerCarouselEnabled}
                         class:bg-(--btn-regular-bg-active)={!bannerCarouselEnabled}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!bannerCarouselEnabled}
                             class:left-5={bannerCarouselEnabled}></div>
                    </div>
                </button>
                {/if}
                <!-- Fullscreen Carousel Switch -->
                {#if isFullscreenCarouselSwitchable && wallpaperMode === WALLPAPER_FULLSCREEN}
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={fullscreenCarouselEnabled}
                    onclick={toggleFullscreenCarouselEnabled}
                >
                    <Icon icon="material-symbols:view-carousel-outline" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">{i18n(I18nKey.wallpaperCarousel)}</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={fullscreenCarouselEnabled}
                         class:bg-(--btn-regular-bg-active)={!fullscreenCarouselEnabled}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!fullscreenCarouselEnabled}
                             class:left-5={fullscreenCarouselEnabled}></div>
                    </div>
                </button>
                {/if}
                <!-- Waves Animation Switch -->
                {#if isWavesSwitchable}
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={wavesEnabled}
                    onclick={toggleWavesEnabled}
                >
                    <Icon icon="material-symbols:airwave-rounded" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">{i18n(I18nKey.wavesAnimation)}</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={wavesEnabled}
                         class:bg-(--btn-regular-bg-active)={!wavesEnabled}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!wavesEnabled}
                             class:left-5={wavesEnabled}></div>
                    </div>
                </button>
                {/if}
                <!-- Gradient Transition Switch -->
                {#if isGradientSwitchable}
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={gradientEnabled}
                    onclick={toggleGradientEnabled}
                >
                    <Icon icon="material-symbols:gradient" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">{i18n(I18nKey.gradientTransition)}</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={gradientEnabled}
                         class:bg-(--btn-regular-bg-active)={!gradientEnabled}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!gradientEnabled}
                             class:left-5={gradientEnabled}></div>
                    </div>
                </button>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Effects Settings Section -->
    {#if isSakuraSwitchable}
        <div class="mt-2 mb-2">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
            >
                {i18n(I18nKey.effectsSettings)}
                <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90"
                        class:opacity-0={sakuraEnabled === defaultSakuraEnabled} class:pointer-events-none={sakuraEnabled === defaultSakuraEnabled} onclick={() => { sakuraEnabled = defaultSakuraEnabled; setSakuraEnabled(defaultSakuraEnabled); }}>
                    <div class="text-(--btn-content)">
                        <Icon icon="fa7-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                    </div>
                </button>
            </div>
            <div class="space-y-1">
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={sakuraEnabled}
                    onclick={toggleSakuraEnabled}
                >
                    <Icon icon="mdi:flower-poppy" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">{i18n(I18nKey.sakuraEffect)}</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={sakuraEnabled}
                         class:bg-(--btn-regular-bg-active)={!sakuraEnabled}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!sakuraEnabled}
                             class:left-5={sakuraEnabled}></div>
                    </div>
                </button>
            </div>
        </div>
    {/if}

    <!-- Layout Switch Section -->
    {#if allowLayoutSwitch}
        <div class="mt-2 mb-2">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
            >
                {i18n(I18nKey.postListLayout)}
                <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90"
                        class:opacity-0={currentLayout === effectiveDefaultLayout} class:pointer-events-none={currentLayout === effectiveDefaultLayout} onclick={resetLayout}>
                    <div class="text-(--btn-content)">
                        <Icon icon="fa7-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                    </div>
                </button>
            </div>
            <div class="flex gap-2">
                <button
                    aria-label={i18n(I18nKey.postListLayoutList)}
                    class="flex-1 btn-regular rounded-md py-2 px-3 flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden"
                    class:opacity-60={currentLayout !== 'list'}
                    class:bg-(--btn-regular-bg-hover)={currentLayout === 'list'}
                    disabled={isSwitching}
                    onclick={switchLayout}
                    title={i18n(I18nKey.postListLayoutList)}
                >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                    </svg>
                    <span class="text-xs font-medium">{i18n(I18nKey.postListLayoutList)}</span>
                </button>
                <button
                    aria-label={i18n(I18nKey.postListLayoutGrid)}
                    class="flex-1 btn-regular rounded-md py-2 px-3 flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden"
                    class:opacity-60={currentLayout !== 'grid'}
                    class:bg-(--btn-regular-bg-hover)={currentLayout === 'grid'}
                    disabled={isSwitching}
                    onclick={switchLayout}
                    title={i18n(I18nKey.postListLayoutGrid)}
                >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                    </svg>
                    <span class="text-xs font-medium">{i18n(I18nKey.postListLayoutGrid)}</span>
                </button>
            </div>
        </div>
    {/if}

    <!-- Post Cover Image Switch Section -->
    {#if isPostCoverImageSwitchable}
        <div class="mt-2 mb-2">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
            >
                {i18n(I18nKey.postCoverImage)}
                <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90"
                        class:opacity-0={postCoverImageEnabled === defaultPostCoverImageEnabled} class:pointer-events-none={postCoverImageEnabled === defaultPostCoverImageEnabled} onclick={() => { postCoverImageEnabled = defaultPostCoverImageEnabled; setPostCoverImageEnabled(defaultPostCoverImageEnabled); }}>
                    <div class="text-(--btn-content)">
                        <Icon icon="fa7-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                    </div>
                </button>
            </div>
            <div class="space-y-1">
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={postCoverImageEnabled}
                    onclick={togglePostCoverImageEnabled}
                >
                    <Icon icon="material-symbols:image" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">{i18n(I18nKey.postCoverImage)}</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={postCoverImageEnabled}
                         class:bg-(--btn-regular-bg-active)={!postCoverImageEnabled}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!postCoverImageEnabled}
                             class:left-5={postCoverImageEnabled}></div>
                    </div>
                </button>
            </div>
        </div>
    {/if}

    <!-- Glass Effect Settings Section -->
    {#if isGlassSwitchable}
        <div class="mt-2 mb-2">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
            >
                Glass 玻璃效果
                <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90"
                        class:opacity-0={glassOpacityPercent === defaultGlassOpacityPercent && auroraIntensity === defaultAuroraIntensity && glassBlur === defaultGlassBlur}
                        class:pointer-events-none={glassOpacityPercent === defaultGlassOpacityPercent && auroraIntensity === defaultAuroraIntensity && glassBlur === defaultGlassBlur}
                        onclick={() => { glassOpacityPercent = defaultGlassOpacityPercent; auroraIntensity = defaultAuroraIntensity; glassBlur = defaultGlassBlur; applyGlassSettings(); }}>
                    <div class="text-(--btn-content)">
                        <Icon icon="fa7-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                    </div>
                </button>
            </div>

            <!-- 卡片透明度 -->
            <div class="mb-2">
                <div class="flex justify-between items-center mb-1 ml-3">
                    <span class="text-sm text-(--deep-text)">卡片透明度</span>
                    <span id="glassOpacityValue" class="text-xs text-(--content-meta) bg-(--btn-regular-bg) px-2 py-0.5 rounded">{glassOpacityPercent}%</span>
                </div>
                <div class="w-full h-6 px-1 rounded select-none" style="background: oklch(0.88 0.01 250)">
                    <input aria-label="卡片透明度" type="range" min="15" max="80" step="1"
                           bind:value={glassOpacityPercent}
                           class="slider overlay-slider"
                           oninput={() => applyGlassSettings()}
                           style="width: 100%; background-image: linear-gradient(90deg, oklch(0.45 0.02 250) 0 var(--range-progress, 50%), oklch(0.90 0.008 250 / 0.35) var(--range-progress, 50%) 100%); height: 0.85rem">
                </div>
            </div>

            <!-- 极光浓度 -->
            <div class="mb-2">
                <div class="flex justify-between items-center mb-1 ml-3">
                    <span class="text-sm text-(--deep-text)">极光浓度</span>
                    <span id="auroraValue" class="text-xs text-(--content-meta) bg-(--btn-regular-bg) px-2 py-0.5 rounded">{auroraIntensity.toFixed(1)}x</span>
                </div>
                <div class="w-full h-6 px-1 rounded select-none" style="background: oklch(0.88 0.01 250)">
                    <input aria-label="极光浓度" type="range" min="0" max="2.5" step="0.05"
                           bind:value={auroraIntensity}
                           class="slider overlay-slider"
                           oninput={() => applyGlassSettings()}
                           style="width: 100%; background-image: linear-gradient(90deg, oklch(0.45 0.02 250) 0 var(--range-progress, 50%), oklch(0.90 0.008 250 / 0.35) var(--range-progress, 50%) 100%); height: 0.85rem">
                </div>
            </div>

            <!-- 模糊强度 -->
            <div class="mb-1">
                <div class="flex justify-between items-center mb-1 ml-3">
                    <span class="text-sm text-(--deep-text)">模糊强度</span>
                    <span id="blurValue" class="text-xs text-(--content-meta) bg-(--btn-regular-bg) px-2 py-0.5 rounded">{glassBlur}px</span>
                </div>
                <div class="w-full h-6 px-1 rounded select-none" style="background: oklch(0.88 0.01 250)">
                    <input aria-label="模糊强度" type="range" min="0" max="30" step="1"
                           bind:value={glassBlur}
                           class="slider overlay-slider"
                           oninput={() => applyGlassSettings()}
                           style="width: 100%; background-image: linear-gradient(90deg, oklch(0.45 0.02 250) 0 var(--range-progress, 50%), oklch(0.90 0.008 250 / 0.35) var(--range-progress, 50%) 100%); height: 0.85rem">
                </div>
            </div>
        </div>
    {/if}

    <!-- Cursor Effect Settings Section -->
    {#if isCursorSwitchable}
        <div class="mt-2 mb-3">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-(--primary)
                before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2"
            >
                光标特效
                <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md active:scale-90"
                        class:opacity-0={cursorEffectEnabled === defaultCursorEffectEnabled && cursorTrailEnabled === defaultCursorTrailEnabled && cursorClickRipple === defaultCursorClickRipple}
                        class:pointer-events-none={cursorEffectEnabled === defaultCursorEffectEnabled && cursorTrailEnabled === defaultCursorTrailEnabled && cursorClickRipple === defaultCursorClickRipple}
                        onclick={() => { cursorEffectEnabled = defaultCursorEffectEnabled; cursorTrailEnabled = defaultCursorTrailEnabled; cursorClickRipple = defaultCursorClickRipple; applyCursorSettings(); }}>
                    <div class="text-(--btn-content)">
                        <Icon icon="fa7-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                    </div>
                </button>
            </div>
            <div class="space-y-1">
                <!-- 自定义光标 -->
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={cursorEffectEnabled}
                    onclick={toggleCursorEffectEnabled}
                >
                    <Icon icon="material-symbols:cursor-default-click-outline-rounded" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">自定义光标</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={cursorEffectEnabled}
                         class:bg-(--btn-regular-bg-active)={!cursorEffectEnabled}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!cursorEffectEnabled}
                             class:left-5={cursorEffectEnabled}></div>
                    </div>
                </button>
                <!-- 路径拖尾 -->
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={cursorTrailEnabled}
                    class:opacity-50={!cursorEffectEnabled}
                    onclick={toggleCursorTrailEnabled}
                >
                    <Icon icon="material-symbols:gesture-outline-rounded" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">路径拖尾</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={cursorTrailEnabled}
                         class:bg-(--btn-regular-bg-active)={!cursorTrailEnabled}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!cursorTrailEnabled}
                             class:left-5={cursorTrailEnabled}></div>
                    </div>
                </button>
                <!-- 点击涟漪 -->
                <button
                    class="w-full btn-regular rounded-md py-2 px-3 flex items-center gap-3 text-left active:scale-95 transition-all relative overflow-hidden"
                    class:bg-(--btn-regular-bg-hover)={cursorClickRipple}
                    class:opacity-50={!cursorEffectEnabled}
                    onclick={toggleCursorClickRipple}
                >
                    <Icon icon="material-symbols:circle-outline-rounded" class="text-[1.25rem] shrink-0"></Icon>
                    <span class="text-sm flex-1">点击涟漪</span>
                    <div class="w-10 h-5 rounded-full transition-all duration-200 relative"
                         class:bg-(--primary)={cursorClickRipple}
                         class:bg-(--btn-regular-bg-active)={!cursorClickRipple}>
                        <div class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                             class:left-0.5={!cursorClickRipple}
                             class:left-5={cursorClickRipple}></div>
                    </div>
                </button>
            </div>
        </div>
    {/if}
</div>
{/if}


<style lang="stylus">
    #display-setting
        input[type="range"]
            -webkit-appearance none
            height 1.5rem
            border-radius 999px
            /* Apple-like: 柔和中性灰白，不再使用 var(--primary) 彩色 */
            background-image unquote("linear-gradient(90deg, oklch(0.55 0.03 250) 0 var(--range-progress, 50%), oklch(0.88 0.02 250 / 0.45) var(--range-progress, 50%) 100%)")
            transition background-image 0.15s ease-in-out

        input[type="range"].overlay-slider
            height 0.85rem
            /* Glass 滑块：更淡雅的中性色 */
            background-image unquote("linear-gradient(90deg, oklch(0.60 0.025 250) 0 var(--range-progress, 50%), oklch(0.90 0.015 250 / 0.4) var(--range-progress, 50%) 100%)")

            /* Input Thumb */
            &::-webkit-slider-thumb
                -webkit-appearance none
                height 0
                width 0
                border 0
                border-radius 0
                background transparent
                box-shadow none

            &::-moz-range-thumb
                height 0
                width 0
                border 0
                border-radius 0
                background transparent
                box-shadow none

            &::-ms-thumb
                -webkit-appearance none
                height 0
                width 0
                border 0
                border-radius 0
                background transparent
                box-shadow none

        #colorSlider
            background-image var(--color-selection-bar)
            transition background-image 0.15s ease-in-out

            &::-webkit-slider-thumb
                -webkit-appearance none
                height 1rem
                width 0.5rem
                border-radius 0.125rem
                background rgba(255, 255, 255, 0.7)
                box-shadow none

                &:hover
                    background rgba(255, 255, 255, 0.8)

                &:active
                    background rgba(255, 255, 255, 0.6)

            &::-moz-range-thumb
                -webkit-appearance none
                height 1rem
                width 0.5rem
                border-radius 0.125rem
                border-width 0
                background rgba(255, 255, 255, 0.7)
                box-shadow none

                &:hover
                    background rgba(255, 255, 255, 0.8)

                &:active
                    background rgba(255, 255, 255, 0.6)

            &::-ms-thumb
                -webkit-appearance none
                height 1rem
                width 0.5rem
                border-radius 0.125rem
                background rgba(255, 255, 255, 0.7)
                box-shadow none

                &:hover
                    background rgba(255, 255, 255, 0.8)

                &:active
                    background rgba(255, 255, 255, 0.6)

</style>
