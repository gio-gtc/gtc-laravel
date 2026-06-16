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
    encodingByRowKey: Record<string, string[]>;
    /** When true, skip membership checks (values come from applyInternationalLocks). */
    isInternationalLocked?: boolean;
    enabledCuts?: readonly string[];
    enabledDurationPills?: readonly string[];
    enabledLanguages?: readonly string[];
};

export type BroadcastEditFormCompleteInput = {
    type: string;
    cut: string;
    duration: string;
    language: string;
    editEncodings: string[];
    /** When true, skip membership checks (values come from applyInternationalLocks). */
    isInternationalLocked?: boolean;
    enabledCuts?: readonly string[];
    enabledDurationPills?: readonly string[];
    enabledLanguages?: readonly string[];
};

function everyInSet(
    values: string[],
    allowed: readonly string[] | undefined,
): boolean {
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
        isInternationalLocked = false,
        enabledCuts,
        enabledDurationPills,
        enabledLanguages,
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
        const values = encodingByRowKey[row.key];
        return Array.isArray(values) && values.length > 0;
    });
}

/**
 * True when broadcast edit-mode form has all required fields and valid selections.
 */
export function isBroadcastEditFormComplete(
    input: BroadcastEditFormCompleteInput,
): boolean {
    const {
        type,
        cut,
        duration,
        language,
        editEncodings,
        isInternationalLocked = false,
        enabledCuts,
        enabledDurationPills,
        enabledLanguages,
    } = input;

    if (!type.trim() || !cut.trim() || !duration.trim() || !language.trim()) {
        return false;
    }

    if (!isInternationalLocked) {
        if (enabledCuts && enabledCuts.length > 0 && !enabledCuts.includes(cut)) {
            return false;
        }
        if (
            enabledDurationPills &&
            enabledDurationPills.length > 0 &&
            !enabledDurationPills.includes(duration)
        ) {
            return false;
        }
        if (
            enabledLanguages &&
            enabledLanguages.length > 0 &&
            !enabledLanguages.includes(language)
        ) {
            return false;
        }
    }

    return editEncodings.length > 0;
}
