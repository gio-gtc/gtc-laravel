import type { SubmitInvoiceLine } from '@/types/orders-api';

export function formatSubmitInvoiceLineDescription(
    line: SubmitInvoiceLine,
): string {
    if (line.quantity > 1) {
        return `${line.description} × ${line.quantity}`;
    }

    return line.description;
}
