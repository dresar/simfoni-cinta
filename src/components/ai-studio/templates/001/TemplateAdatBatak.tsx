import {
	Preset001,
	MASTER_SLIDE_KEYS,
	type MasterSlideKey,
} from "../../presets/001";
import { DEFAULT_BATAK_ASSETS } from "./assets.config";
import { DEFAULT_BATAK_THEME } from "./theme.config";
import { DEFAULT_BATAK_DATA } from "./data.config";
import { DEFAULT_BATAK_ANIMATIONS } from "./animations.config";
import type { TemplateAdatBatakProps } from "./types";

export const SLIDE_KEYS = MASTER_SLIDE_KEYS;
export type SlideKey = MasterSlideKey;

export function TemplateAdatBatak({
	assets = DEFAULT_BATAK_ASSETS,
	theme = DEFAULT_BATAK_THEME,
	data = DEFAULT_BATAK_DATA,
	animations = DEFAULT_BATAK_ANIMATIONS,
}: TemplateAdatBatakProps) {
	return (
		<Preset001
			assets={assets}
			theme={theme}
			data={data}
			animations={animations}
		/>
	);
}

export const PresetAdatBatak = TemplateAdatBatak;
