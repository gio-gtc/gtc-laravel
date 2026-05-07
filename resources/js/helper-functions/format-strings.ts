import { Invoice, Organisation } from '@/types';

/**
 * Gets address data from invoice if available, otherwise falls back to organisation address.
 * Returns an object with billing_address, city, state, zip, and country_id.
 *
 * @param invoice - The invoice object (must be non-null)
 * @param organisation - The organisation object (must be non-null)
 * @returns Address data object with all fields as strings (empty strings if no data available)
 */
export function getInvoiceAddress(
    invoice: Invoice,
    organisation: Organisation,
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

    // Fallback to organisation address
    return {
        billing_address: organisation.billing_address || '',
        city: organisation.city || '',
        state: organisation.state || '',
        zip: organisation.zip || '',
        country_id: organisation.country_id?.toString() || '',
    };
}

export function getInvoiceVenueName(
    invoice: { venue_id: number },
    venues: { id: number; name: string }[],
): string {
    const venue = venues.find((v) => v.id === invoice.venue_id);
    return venue?.name ?? 'N/A';
}
