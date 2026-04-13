import type { AddBroadcastStreamingFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-broadcast-streaming-modal';
import type { AddAudioFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-audio-modal';
import type { AddSocialVideoFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-social-video-modal';
import type { AddKeyArtStaticAssetsFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-key-art-static-assets-modal';
import type { ModalDurationKind } from '@/components/pages/orders/slideout/switch-view/general-media/modals/modal-duration';
import type { VenueItemSocialCardHolder } from '@/components/pages/orders/slideout/switch-view/general-media/modals/spot-type-cuts-options';
import type {
    VenueItemEncoding,
    VenueItemLanguage,
    VenueItemsArtRow,
    VenueItemsBroadcastRow,
    VenueItemsRadioRow,
    VenueItemsSocialRow,
} from '@/types';
import {
    encodingLabelToId,
    languageTypeToId,
    modalDurationPillToSeconds,
} from './modal-mappers';

export type VenueItemExpandContext = {
    tourVenueId: number;
    dueDate: string;
    statusId: number;
    nextId: () => string;
    /** Generates ISCI strings for new lines (until API assigns). */
    nextIsci: () => string;
};

export type VenueItemExpandCatalogs = {
    venue_item_language: VenueItemLanguage[];
    venue_item_encoding: VenueItemEncoding[];
};

const BROADCAST_DURATION_KIND: ModalDurationKind = 'broadcast';
const AUDIO_DURATION_KIND: ModalDurationKind = 'audio';
const SOCIAL_DURATION_KIND: ModalDurationKind = 'social';

function asBroadcastCut(cut: string): VenueItemsBroadcastRow['cut'] {
    return cut as VenueItemsBroadcastRow['cut'];
}

function asRadioCut(cut: string): VenueItemsRadioRow['cut'] {
    return cut as VenueItemsRadioRow['cut'];
}

function asSocialLayout(
    layout: string,
): VenueItemsSocialRow['spot_type'] {
    return layout as VenueItemsSocialRow['spot_type'];
}

function asSocialCut(cut: string): VenueItemsSocialRow['cut'] {
    return cut as VenueItemsSocialRow['cut'];
}

/** One broadcast row per finalized encoding row from the modal. */
export function expandBroadcastRowsFromForm(
    ctx: VenueItemExpandContext,
    form: AddBroadcastStreamingFormValues,
    catalogs: VenueItemExpandCatalogs,
): VenueItemsBroadcastRow[] {
    const spotType = form.type as VenueItemsBroadcastRow['spot_type'];
    const rows: VenueItemsBroadcastRow[] = [];

    for (const enc of form.encodings) {
        const languageId = languageTypeToId(
            catalogs.venue_item_language,
            enc.language,
        );
        const encodingId = encodingLabelToId(
            catalogs.venue_item_encoding,
            enc.encoding,
        );
        if (languageId === undefined || encodingId === undefined) continue;

        rows.push({
            id: ctx.nextId(),
            tour_venue_id: ctx.tourVenueId,
            type: 'broadcast',
            dueDate: ctx.dueDate,
            spot_type: spotType,
            cut: asBroadcastCut(enc.cut),
            isci: ctx.nextIsci(),
            duration_seconds: modalDurationPillToSeconds(
                enc.duration,
                BROADCAST_DURATION_KIND,
            ),
            status_id: ctx.statusId,
            language_id: languageId,
            encoding_id: encodingId,
        });
    }

    return rows;
}

/** Cartesian product: cuts × duration × language for the selected audio spot type. */
export function expandRadioRowsFromForm(
    ctx: VenueItemExpandContext,
    form: AddAudioFormValues,
    catalogs: VenueItemExpandCatalogs,
): VenueItemsRadioRow[] {
    const spotType = form.type as VenueItemsRadioRow['spot_type'];
    const rows: VenueItemsRadioRow[] = [];

    const durs = form.duration.length > 0 ? form.duration : [];
    const langs = form.language.length > 0 ? form.language : [];
    const cutList = form.cuts.length > 0 ? form.cuts : [];
    if (durs.length === 0 || langs.length === 0 || cutList.length === 0) {
        return rows;
    }

    for (const cut of cutList) {
        for (const dur of durs) {
            for (const lang of langs) {
                const languageId = languageTypeToId(
                    catalogs.venue_item_language,
                    lang,
                );
                if (languageId === undefined) continue;

                rows.push({
                    id: ctx.nextId(),
                    tour_venue_id: ctx.tourVenueId,
                    type: 'radio',
                    dueDate: ctx.dueDate,
                    spot_type: spotType,
                    cut: asRadioCut(cut),
                    isci: ctx.nextIsci(),
                    duration_seconds: modalDurationPillToSeconds(
                        dur,
                        AUDIO_DURATION_KIND,
                    ),
                    status_id: ctx.statusId,
                    language_id: languageId,
                });
            }
        }
    }

    return rows;
}

/** Cartesian product of layout types × cuts × card holders × duration × language. */
export function expandSocialRowsFromForm(
    ctx: VenueItemExpandContext,
    form: AddSocialVideoFormValues,
    catalogs: VenueItemExpandCatalogs,
): VenueItemsSocialRow[] {
    const rows: VenueItemsSocialRow[] = [];

    const layouts = form.type.length > 0 ? form.type : [];
    const cuts = form.cuts.length > 0 ? form.cuts : [];
    const cardHolders: (VenueItemSocialCardHolder | undefined)[] =
        form.cardHolder.length > 0
            ? (form.cardHolder as VenueItemSocialCardHolder[])
            : [undefined];
    const durs = form.duration.length > 0 ? form.duration : [];
    const langs = form.language.length > 0 ? form.language : [];

    if (
        layouts.length === 0 ||
        cuts.length === 0 ||
        durs.length === 0 ||
        langs.length === 0
    ) {
        return rows;
    }

    for (const layout of layouts) {
        for (const cut of cuts) {
            for (const holder of cardHolders) {
                for (const dur of durs) {
                    for (const lang of langs) {
                        const languageId = languageTypeToId(
                            catalogs.venue_item_language,
                            lang,
                        );
                        if (languageId === undefined) continue;

                        const row: VenueItemsSocialRow = {
                            id: ctx.nextId(),
                            tour_venue_id: ctx.tourVenueId,
                            type: 'social',
                            dueDate: ctx.dueDate,
                            spot_type: asSocialLayout(layout),
                            cut: asSocialCut(cut),
                            isci: ctx.nextIsci(),
                            duration_seconds: modalDurationPillToSeconds(
                                dur,
                                SOCIAL_DURATION_KIND,
                            ),
                            status_id: ctx.statusId,
                            language_id: languageId,
                        };
                        if (holder !== undefined) {
                            row.card_holder = holder;
                        }
                        rows.push(row);
                    }
                }
            }
        }
    }

    return rows;
}

const DEFAULT_ART_BY_PACKAGE: Record<
    VenueItemsArtRow['package_type'],
    Pick<VenueItemsArtRow, 'label' | 'width' | 'height'>
> = {
    'Key Art Package': {
        label: 'Key Art',
        width: 1400,
        height: 400,
    },
    'Socials & Web Banners': {
        label: 'Socials & Web Banners',
        width: 1400,
        height: 400,
    },
    'International Key art & Social Package': {
        label: 'International Key art & Social Package',
        width: 1400,
        height: 400,
    },
};

/** One art row per selected package type. */
export function expandKeyArtRowsFromForm(
    ctx: VenueItemExpandContext,
    form: AddKeyArtStaticAssetsFormValues,
): VenueItemsArtRow[] {
    return form.types.map((package_type) => {
        const defaults = DEFAULT_ART_BY_PACKAGE[package_type];
        return {
            id: ctx.nextId(),
            tour_venue_id: ctx.tourVenueId,
            type: 'art',
            package_type,
            label: defaults.label,
            width: defaults.width,
            height: defaults.height,
            dueDate: ctx.dueDate,
            status_id: ctx.statusId,
        };
    });
}
