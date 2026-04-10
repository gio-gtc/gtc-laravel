export const CUTS_OPTIONS = [
    'Sign Up Now',
    'Pre Sale',
    'On Sale Now',
    'Week of',
    'Day Prior',
    'Day of',
    'Superless',
    'Sample',
] as const;

export const VENUE_CUT_OPTIONS = ['Pre Sale', 'Now Through'] as const;

export const INTERNATIONAL_TV_PACKAGE = 'International TV Package';

export const OPTIONS_BY_TYPE: Record<string, { cuts: readonly string[] }> = {
    Generic: { cuts: CUTS_OPTIONS },
    AmEx: {
        cuts: VENUE_CUT_OPTIONS,
    },
    Verizon: {
        cuts: VENUE_CUT_OPTIONS,
    },
    Citi: { cuts: VENUE_CUT_OPTIONS },
    International: { cuts: [INTERNATIONAL_TV_PACKAGE] },
};

export const AUDIO_GENERIC_CUTS_OPTIONS = [
    'Sign Up Now',
    'Pre Sale',
    'On Sale Now',
    'Week of',
    'Day Prior',
    'Day of',
] as const;

export const OPTIONS_BY_TYPE_AUDIO: Record<
    string,
    { cuts: readonly string[] }
> = {
    Generic: { cuts: AUDIO_GENERIC_CUTS_OPTIONS },
    AmEx: {
        cuts: VENUE_CUT_OPTIONS,
    },
    Verizon: {
        cuts: VENUE_CUT_OPTIONS,
    },
    Citi: { cuts: VENUE_CUT_OPTIONS },
    International: { cuts: [INTERNATIONAL_TV_PACKAGE] },
};

/** Add Social Video modal — layout / aspect "Type" multi-select. */
export const SOCIAL_VIDEO_TYPE_OPTIONS = [
    'Social - 16:9',
    'FB/IG Story',
    'TikTok',
    'Social Square',
    'Social - 4:5',
] as const;

/** Add Social Video modal — "Cuts" multi-select. */
export const SOCIAL_CUT_OPTIONS = [
    'Pre Sale',
    'On Sale Now',
    'Evergreen',
    'Sign Up Now',
] as const;

export const BROADCAST_SPOT_TYPES = [
    'Generic',
    'AmEx',
    'Verizon',
    'Citi',
    'International',
] as const;

export type BroadcastSpotType = (typeof BROADCAST_SPOT_TYPES)[number];

/** Same key set as broadcast/audio add-modals' spot type dropdown. */
export type AudioSpotType = BroadcastSpotType;

export type SocialVideoLayoutType = (typeof SOCIAL_VIDEO_TYPE_OPTIONS)[number];

export type SocialCutOption = (typeof SOCIAL_CUT_OPTIONS)[number];

/** Any cut string that appears in the broadcast add-modal for some spot type. */
export type AllBroadcastCuts =
    | (typeof CUTS_OPTIONS)[number]
    | (typeof VENUE_CUT_OPTIONS)[number]
    | typeof INTERNATIONAL_TV_PACKAGE;

/** Any cut string that appears in the audio add-modal for some spot type. */
export type AllAudioCuts =
    | (typeof AUDIO_GENERIC_CUTS_OPTIONS)[number]
    | (typeof VENUE_CUT_OPTIONS)[number]
    | typeof INTERNATIONAL_TV_PACKAGE;

export function isValidBroadcastSpotCut(
    spotType: string,
    cut: string,
): boolean {
    const config = OPTIONS_BY_TYPE[spotType];
    return config ? config.cuts.includes(cut) : false;
}

export function isValidAudioSpotCut(spotType: string, cut: string): boolean {
    const config = OPTIONS_BY_TYPE_AUDIO[spotType];
    return config ? config.cuts.includes(cut) : false;
}

export function isValidSocialSpotCut(
    spotType: string,
    cut: string,
): boolean {
    return (
        (SOCIAL_VIDEO_TYPE_OPTIONS as readonly string[]).includes(spotType) &&
        (SOCIAL_CUT_OPTIONS as readonly string[]).includes(cut)
    );
}
