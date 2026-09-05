import type {
	AssetSlots,
	InvitationData,
	PresetThemeTokens,
	AnimationSettings,
} from "../../types";

export interface TemplateAdatBatakProps {
	assets?: AssetSlots;
	theme?: PresetThemeTokens;
	data?: InvitationData;
	animations?: AnimationSettings;
}

export type { AssetSlots, InvitationData, PresetThemeTokens, AnimationSettings };
