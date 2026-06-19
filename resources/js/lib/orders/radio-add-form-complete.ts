export type RadioAddFormCompleteInput = {
    type: string;
    cuts: string[];
    duration: string[];
    language: string[];
};

export type RadioEditFormCompleteInput = {
    type: string;
    cut: string;
    duration: string;
    language: string;
};

export function isRadioAddFormComplete(form: RadioAddFormCompleteInput): boolean {
    return Boolean(
        form.type.trim() &&
            form.cuts.length > 0 &&
            form.duration.length > 0 &&
            form.language.length > 0,
    );
}

export function isRadioEditFormComplete(
    form: RadioEditFormCompleteInput,
): boolean {
    return Boolean(
        form.type.trim() &&
            form.cut.trim() &&
            form.duration.trim() &&
            form.language.trim(),
    );
}
