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
