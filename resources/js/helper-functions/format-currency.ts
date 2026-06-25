export function parseWireMoney(
    raw: string | number | null | undefined,
): number {
    if (raw == null || raw === '') {
        return 0;
    }

    const parsed = typeof raw === 'number' ? raw : parseFloat(String(raw));
    return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
