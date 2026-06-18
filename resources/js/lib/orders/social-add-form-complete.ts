export type SocialAddFormCompleteInput = {
    type: string[];
    cuts: string[];
    cardHolder: string[];
    duration: string[];
    language: string[];
};

export type SocialEditFormCompleteInput = {
    layout: string;
    cut: string;
    cardHolder: string;
    duration: string;
    language: string;
};

export function isSocialAddFormComplete(
    form: SocialAddFormCompleteInput,
): boolean {
    return (
        form.type.length > 0 &&
        form.cuts.length > 0 &&
        form.cardHolder.some((h) => h.trim() !== '') &&
        form.duration.length > 0 &&
        form.language.length > 0
    );
}

export function isSocialEditFormComplete(
    form: SocialEditFormCompleteInput,
): boolean {
    return Boolean(
        form.layout.trim() &&
            form.cut.trim() &&
            form.cardHolder.trim() &&
            form.duration.trim() &&
            form.language.trim(),
    );
}
