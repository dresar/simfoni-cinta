import type {
	AssetSlots,
	InvitationData,
	PresetThemeTokens,
	AnimationSettings,
} from "../../types";

export type SlideKeyDefault =
	| "cover"
	| "opening"
	| "couple"
	| "events"
	| "location"
	| "gallery"
	| "gifts"
	| "wishes"
	| "closing";

export interface PresetDefaultProps {
	assets?: Partial<AssetSlots>;
	data?: Partial<InvitationData>;
	theme?: Partial<PresetThemeTokens>;
	animations?: AnimationSettings;
}
