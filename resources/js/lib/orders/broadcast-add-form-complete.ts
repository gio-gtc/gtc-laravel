export const BROADCAST_ENCODING_UNSET = '__none__';

export type BroadcastEncodingMatrixRow = {
    key: string;
    cut: string;
    duration: string;
    language: string;
    label: string;
};

export type BroadcastAddFormCompleteInput = {
    catalogReady: boolean;
    type: string;
    cuts: string[];
    duration: string[];
    language: string[];
    encodingRows: BroadcastEncodingMatrixRow[];
    encodingByRowKey: Record<string, string>;
    encodingCustomEnabled: Record<string, boolean>;
    encodingCustomText: Record<string, string>;
    /** When true, skip membership checks (values come from applyInternationalLocks). */
    isInternationalLocked?: boolean;
    enabledCuts?: string[];
    enabledDurationPills?: string[];
    enabledLanguages?: string[];
    encodingUnset?: string;
};

function everyInSet(values: string[], allowed: string[] | undefined): boolean {
    if (!allowed || allowed.length === 0) {
        return values.length > 0;
    }
    return values.every((v) => allowed.includes(v));
}

/**
 * True when broadcast add-mode form has all required fields and encodings.
 */
export function isBroadcastAddFormComplete(
    input: BroadcastAddFormCompleteInput,
): boolean {
    const {
        catalogReady,
        type,
        cuts,
        duration,
        language,
        encodingRows,
        encodingByRowKey,
        encodingCustomEnabled,
        encodingCustomText,
        isInternationalLocked = false,
        enabledCuts,
        enabledDurationPills,
        enabledLanguages,
        encodingUnset = BROADCAST_ENCODING_UNSET,
    } = input;

    if (!catalogReady) {
        return false;
    }

    if (!type.trim()) {
        return false;
    }

    if (cuts.length === 0 || duration.length === 0 || language.length === 0) {
        return false;
    }

    if (!isInternationalLocked) {
        if (!everyInSet(cuts, enabledCuts)) {
            return false;
        }
        if (!everyInSet(duration, enabledDurationPills)) {
            return false;
        }
        if (!everyInSet(language, enabledLanguages)) {
            return false;
        }
    }

    if (encodingRows.length === 0) {
        return false;
    }

    return encodingRows.every((row) => {
        if (encodingCustomEnabled[row.key]) {
            return (encodingCustomText[row.key] ?? '').trim() !== '';
        }
        const value = encodingByRowKey[row.key];
        return Boolean(value && value !== encodingUnset);
    });
}
