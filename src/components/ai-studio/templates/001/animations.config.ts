import type { AnimationSettings } from "../../types";

export const DEFAULT_BATAK_ANIMATIONS: AnimationSettings = {
	enableSway: true,
	swayIntensity: "normal",
	enableEntranceExit: true,
	transitionDurationMs: 450,
};

export const BATAK_ANIMATION_CLASSES = {
	entrance: {
		slideInRight: "animate-slide-in-right",
		slideInLeft: "animate-slide-in-left",
		imageLeft: "animate-image-from-left",
		imageRight: "animate-image-from-right",
		staggerUp: "animate-stagger-up",
		staggerLeft: "animate-stagger-left",
	},
	sway: {
		normal: "animate-sway-normal",
		subtle: "animate-sway-subtle",
	},
} as const;
