import { INTERNATIONAL_TV_PACKAGE_CUT } from '@/lib/orders/order-catalog';

export function broadcastEncodingRowKey(
    cut: string,
    duration: string,
    language: string,
): string {
    return `${cut} ${duration} ${language}`;
}

/**
 * Rows to drive encoding UI and expansion — same matrix as Add Broadcast & Streaming modal.
 */
export function buildBroadcastEncodingMatrixRows(
    cuts: string[],
    duration: string[],
    language: string[],
    internationalSingleLanguage: string,
): Array<{
    key: string;
    cut: string;
    duration: string;
    language: string;
    label: string;
}> {
    const rows: Array<{
        key: string;
        cut: string;
        duration: string;
        language: string;
        label: string;
    }> = [];

    for (const cut of cuts) {
        const durs =
            cut === INTERNATIONAL_TV_PACKAGE_CUT ? ([':30'] as const) : duration;
        const langs =
            cut === INTERNATIONAL_TV_PACKAGE_CUT
                ? ([internationalSingleLanguage] as const)
                : language;
        if (durs.length === 0 || langs.length === 0) continue;

        for (const d of durs) {
            for (const lang of langs) {
                const label = `${cut} ${d} ${lang}`;
                rows.push({
                    key: broadcastEncodingRowKey(cut, d, lang),
                    cut,
                    duration: d,
                    language: lang,
                    label,
                });
            }
        }
    }
    return rows;
}
