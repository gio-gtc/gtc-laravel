import type { AddAudioFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-audio-modal';
import { venueItemLanguageIdToLabel } from '@/components/utils/venue-items';
import { durationWireFromPill } from '@/lib/orders/broadcast-spec-wire';
import type { OrderItemLanguage, OrderItemsRadioRow } from '@/types';

export type RadioCombinationParts = {
    spot_type: string;
    cut: string;
    duration_seconds: string;
    language: string;
};

export function radioCombinationKey(parts: RadioCombinationParts): string {
    return [
        parts.spot_type,
        parts.cut,
        parts.duration_seconds,
        parts.language,
    ].join('|');
}

export type RadioDuplicateCatalogs = {
    venue_item_language?: OrderItemLanguage[];
};

export function radioRowCombinationKey(
    row: OrderItemsRadioRow,
    catalogs: RadioDuplicateCatalogs = {},
): string | null {
    const languageCatalog = catalogs.venue_item_language ?? [];
    const language =
        row.language?.trim() ||
        (row.language_id != null
            ? venueItemLanguageIdToLabel(row.language_id, languageCatalog)
            : '');

    if (!language) {
        return null;
    }

    const durationWire =
        typeof row.duration_seconds === 'string'
            ? row.duration_seconds.trim()
            : String(row.duration_seconds);

    return radioCombinationKey({
        spot_type: row.spot_type,
        cut: row.cut,
        duration_seconds: durationWire,
        language,
    });
}

function formCombinationParts(
    form: AddAudioFormValues,
    cut: string,
    duration: string,
    language: string,
): RadioCombinationParts | null {
    const lang = language.trim();
    if (!lang || !form.type) {
        return null;
    }

    return {
        spot_type: form.type,
        cut,
        duration_seconds: durationWireFromPill(duration),
        language: lang,
    };
}

/** Cartesian combinations from add form that match an existing radio line. */
export function findRadioFormDuplicates(
    form: AddAudioFormValues,
    existingRows: OrderItemsRadioRow[],
    catalogs: RadioDuplicateCatalogs = {},
): Array<{
    cut: string;
    duration: string;
    language: string;
}> {
    const existingKeys = new Set(
        existingRows
            .map((row) => radioRowCombinationKey(row, catalogs))
            .filter((key): key is string => key != null),
    );

    if (existingKeys.size === 0) {
        return [];
    }

    const duplicates: Array<{
        cut: string;
        duration: string;
        language: string;
    }> = [];

    for (const cut of form.cuts) {
        for (const duration of form.duration) {
            for (const language of form.language) {
                const parts = formCombinationParts(
                    form,
                    cut,
                    duration,
                    language,
                );
                if (parts && existingKeys.has(radioCombinationKey(parts))) {
                    duplicates.push({
                        cut,
                        duration,
                        language,
                    });
                }
            }
        }
    }

    return duplicates;
}

export function hasRadioFormDuplicates(
    form: AddAudioFormValues,
    existingRows: OrderItemsRadioRow[],
    catalogs: RadioDuplicateCatalogs = {},
): boolean {
    return findRadioFormDuplicates(form, existingRows, catalogs).length > 0;
}
