import type { AddSocialVideoFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-social-video-modal';
import { venueItemLanguageIdToLabel } from '@/components/utils/venue-items';
import { durationWireFromPill } from '@/lib/orders/broadcast-spec-wire';
import type { OrderItemLanguage, OrderItemsSocialRow } from '@/types';

export type SocialCombinationParts = {
    spot_type: string;
    cut: string;
    duration_seconds: string;
    language: string;
    card_holder: string;
};

export function socialCombinationKey(parts: SocialCombinationParts): string {
    return [
        parts.spot_type,
        parts.cut,
        parts.duration_seconds,
        parts.language,
        parts.card_holder,
    ].join('|');
}

export type SocialDuplicateCatalogs = {
    venue_item_language?: OrderItemLanguage[];
};

export function socialRowCombinationKey(
    row: OrderItemsSocialRow,
    catalogs: SocialDuplicateCatalogs = {},
): string | null {
    const languageCatalog = catalogs.venue_item_language ?? [];
    const language =
        row.language?.trim() ||
        (row.language_id != null
            ? venueItemLanguageIdToLabel(row.language_id, languageCatalog)
            : '');

    const cardHolder = row.card_holder?.trim() ?? '';
    if (!language || !cardHolder) {
        return null;
    }

    const durationWire =
        typeof row.duration_seconds === 'string'
            ? row.duration_seconds.trim()
            : String(row.duration_seconds);

    return socialCombinationKey({
        spot_type: row.spot_type,
        cut: row.cut,
        duration_seconds: durationWire,
        language,
        card_holder: cardHolder,
    });
}

function formCombinationParts(
    form: AddSocialVideoFormValues,
    layout: string,
    cut: string,
    cardHolder: string,
    duration: string,
    language: string,
): SocialCombinationParts | null {
    const lang = language.trim();
    const holder = cardHolder.trim();
    if (!lang || !holder) {
        return null;
    }

    return {
        spot_type: layout,
        cut,
        duration_seconds: durationWireFromPill(duration),
        language: lang,
        card_holder: holder,
    };
}

/** Cartesian combinations from add form that match an existing social line. */
export function findSocialFormDuplicates(
    form: AddSocialVideoFormValues,
    existingRows: OrderItemsSocialRow[],
    catalogs: SocialDuplicateCatalogs = {},
): Array<{
    layout: string;
    cut: string;
    cardHolder: string;
    duration: string;
    language: string;
}> {
    const existingKeys = new Set(
        existingRows
            .map((row) => socialRowCombinationKey(row, catalogs))
            .filter((key): key is string => key != null),
    );

    if (existingKeys.size === 0) {
        return [];
    }

    const duplicates: Array<{
        layout: string;
        cut: string;
        cardHolder: string;
        duration: string;
        language: string;
    }> = [];

    for (const layout of form.type) {
        for (const cut of form.cuts) {
            for (const cardHolder of form.cardHolder) {
                for (const duration of form.duration) {
                    for (const language of form.language) {
                        const parts = formCombinationParts(
                            form,
                            layout,
                            cut,
                            cardHolder,
                            duration,
                            language,
                        );
                        if (
                            parts &&
                            existingKeys.has(socialCombinationKey(parts))
                        ) {
                            duplicates.push({
                                layout,
                                cut,
                                cardHolder: cardHolder.trim(),
                                duration,
                                language,
                            });
                        }
                    }
                }
            }
        }
    }

    return duplicates;
}

export function hasSocialFormDuplicates(
    form: AddSocialVideoFormValues,
    existingRows: OrderItemsSocialRow[],
    catalogs: SocialDuplicateCatalogs = {},
): boolean {
    return findSocialFormDuplicates(form, existingRows, catalogs).length > 0;
}
