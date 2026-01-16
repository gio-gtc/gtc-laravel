import { type Company, type Invoice } from '@/types';
import { differenceInCalendarDays } from 'date-fns';

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function getDaysRemaining(
    targetDate: string | null,
    id?: number,
): number {
    if (targetDate === null) {
        console.log(`Release date missing! ID: ${id}`);
        return 0;
    }
    return differenceInCalendarDays(new Date(targetDate), new Date());
}

/**
 * Gets address data from invoice if available, otherwise falls back to company address.
 * Returns an object with billing_address, city, state, zip, and country_id.
 *
 * @param invoice - The invoice object (must be non-null)
 * @param company - The company object (must be non-null)
 * @returns Address data object with all fields as strings (empty strings if no data available)
 */
export function getInvoiceAddress(
    invoice: Invoice,
    company: Company,
): {
    billing_address: string;
    city: string;
    state: string;
    zip: string;
    country_id: string;
} {
    // Check if invoice has address data filled
    const hasInvoiceAddress =
        invoice.address !== null ||
        invoice.city !== null ||
        invoice.state !== null ||
        invoice.zip !== null ||
        invoice.country_id !== null;

    if (hasInvoiceAddress) {
        return {
            billing_address: invoice.address || '',
            city: invoice.city || '',
            state: invoice.state || '',
            zip: invoice.zip || '',
            country_id: invoice.country_id?.toString() || '',
        };
    }

    // Fallback to company address
    return {
        billing_address: company.billing_address || '',
        city: company.city || '',
        state: company.state || '',
        zip: company.zip || '',
        country_id: company.country_id?.toString() || '',
    };
}
