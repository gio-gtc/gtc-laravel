import { getDaysRemaining } from '@/components/utils/functions';
import { type Invoice } from '@/types';

export function getInvoiceDayBadge(invoice: Invoice): React.ReactNode {
    const normalClasses =
        'inline-flex items-center rounded-full border-2 border-solid px-2.5 py-0.5 text-xs font-medium';
    
    if (invoice.isDeleted) {
        return (
            <span className={`${normalClasses} border-gray-400 bg-gray-50`}>
                DELETED
            </span>
        );
    }

    const daysRemaining =
        invoice.held === 1
            ? getDaysRemaining(invoice.showDate)
            : getDaysRemaining(invoice.release_date, invoice.id);

    let extraClasses = '';
    const abb = invoice.held === 1 ? 'DTS: ' : 'Age: ';

    if (invoice.held === 0) {
        // Released invoices: use release_date age
        if (daysRemaining > -30) {
            // Gray: within 30 days ago or future dates
            extraClasses = 'border-gray-400 bg-gray-50';
        } else if (daysRemaining > -60) {
            // Yellow: 30-60 days ago
            extraClasses = 'border-yellow-400 bg-yellow-50';
        } else {
            // Red: 60+ days ago
            extraClasses = 'border-red-400 bg-red-50';
        }
    } else {
        // On hold invoices: use showDate countdown
        if (daysRemaining <= 30) {
            // Red: 30 days or less until show, or past dates
            extraClasses = 'border-red-400 bg-red-50';
        } else if (daysRemaining <= 60) {
            // Yellow: 31-60 days until show
            extraClasses = 'border-yellow-400 bg-yellow-50';
        } else {
            // Gray: more than 60 days until show
            extraClasses = 'border-gray-400 bg-gray-50';
        }
    }

    return (
        <span className={`${normalClasses} ${extraClasses}`}>
            {abb}
            {daysRemaining}
        </span>
    );
}

export function getReleasedInvoiceDayBadge(invoice: Invoice): React.ReactNode {
    const normalClasses =
        'inline-flex items-center rounded-full border-2 border-solid px-2.5 py-0.5 text-xs font-medium';
    
    if (invoice.isDeleted) {
        return (
            <span className={`${normalClasses} border-gray-400 bg-gray-50`}>
                DELETED
            </span>
        );
    }

    const daysRemaining = getDaysRemaining(invoice.release_date, invoice.id);
    const abb = 'Age: ';

    let extraClasses = '';
    // Released invoices: use release_date age
    if (daysRemaining > -30) {
        // Gray: within 30 days ago or future dates
        extraClasses = 'border-gray-400 bg-gray-50';
    } else if (daysRemaining > -60) {
        // Yellow: 30-60 days ago
        extraClasses = 'border-yellow-400 bg-yellow-50';
    } else {
        // Red: 60+ days ago
        extraClasses = 'border-red-400 bg-red-50';
    }

    return (
        <span className={`${normalClasses} ${extraClasses}`}>
            {abb}
            {daysRemaining}
        </span>
    );
}
