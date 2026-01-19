import {
    companiesData,
    countriesData,
    invoicesData,
} from '@/components/mockdata';
import InvoiceAdvancedFilters from '@/components/pages/invoices/advanced-filters';
import InvoiceDetailSlideout from '@/components/pages/invoices/detail-slideout';
import InvoiceStatusFilters from '@/components/pages/invoices/status-filters';
import HoldInvoicesTable from '@/components/pages/invoices/tables/hold-invoices-table';
import ReleasedInvoicesTable from '@/components/pages/invoices/tables/released-invoices-table';
import {
    getDaysRemaining,
    getInvoiceAddress,
} from '@/components/utils/functions';
import { type Invoice } from '@/types';
import { useEffect, useMemo, useState } from 'react';

function InvoicesTable() {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
        null,
    );
    const [filter, setFilter] = useState<'all' | 'on-hold' | 'released'>(
        'on-hold',
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [countryFilter, setCountryFilter] = useState({
        us: true,
        international: true,
    });
    const [dateFilter, setDateFilter] = useState<'30' | '60' | '61+' | null>(
        null,
    );
    const [dateRangeFilter, setDateRangeFilter] = useState<{
        startDate: string | null;
        endDate: string | null;
    }>({ startDate: null, endDate: null });
    const [selectedReleasedInvoiceIds, setSelectedReleasedInvoiceIds] =
        useState<number[]>([]);

    // Clear selected invoices when switching away from released filter
    useEffect(() => {
        if (filter !== 'released') {
            setSelectedReleasedInvoiceIds([]);
        }
    }, [filter]);

    // Handler for Send Payment Reminder button
    const handleSendReminder = () => {
        const selectedInvoices = filteredData.filter((invoice) =>
            selectedReleasedInvoiceIds.includes(invoice.id),
        );
        console.log(
            'Selected invoices for payment reminder:',
            selectedInvoices,
        );
    };

    // Helper function to get country code for an invoice
    const getInvoiceCountryCode = (
        invoice: Invoice,
    ): 'US' | 'International' => {
        const company = companiesData.find((c) => c.id === invoice.company_id);
        if (!company) return 'International';

        const addressData = getInvoiceAddress(invoice, company);
        const countryId = addressData.country_id
            ? parseInt(addressData.country_id, 10)
            : null;

        if (!countryId) return 'International';

        const country = countriesData.find((c) => c.id === countryId);
        return country?.code === 'US' ? 'US' : 'International';
    };

    // Filter invoices based on selected filter and search query
    const filteredData = useMemo(() => {
        let result = invoicesData;

        // Apply held/released filter
        if (filter === 'on-hold') {
            result = result.filter(
                (invoice) => invoice.held === 1 && !invoice.isDeleted,
            );
        } else if (filter === 'released') {
            result = result.filter(
                (invoice) => invoice.held === 0 && !invoice.isDeleted,
            );
        }

        // Apply country filter
        if (countryFilter.us || countryFilter.international) {
            result = result.filter((invoice) => {
                const countryCode = getInvoiceCountryCode(invoice);
                if (countryFilter.us && countryFilter.international) {
                    return true;
                } else if (countryFilter.us) {
                    return countryCode === 'US';
                } else if (countryFilter.international) {
                    return countryCode === 'International';
                }
                return true;
            });
        }

        // Apply date range filter (takes precedence over days filter)
        const startDate = dateRangeFilter.startDate;
        const endDate = dateRangeFilter.endDate;

        if (startDate && endDate) {
            result = result.filter((invoice) => {
                // Use release_date for released invoices (held === 0), showDate for held invoices (held === 1)
                const invoiceDate =
                    invoice.held === 0
                        ? invoice.release_date
                        : invoice.showDate;

                // Skip if invoice date is null (for released invoices without release_date)
                if (!invoiceDate) {
                    return false;
                }

                const invoiceDateObj = new Date(invoiceDate);
                let startDateObj = new Date(startDate);
                let endDateObj = new Date(endDate);

                // Set time to start of day for accurate comparison
                invoiceDateObj.setHours(0, 0, 0, 0);
                startDateObj.setHours(0, 0, 0, 0);
                endDateObj.setHours(23, 59, 59, 999);

                // Normalize reversed ranges: if start > end, swap them
                // This allows users to enter dates in any order, but we always filter for dates BETWEEN the range
                if (startDateObj > endDateObj) {
                    const temp = startDateObj;
                    startDateObj = endDateObj;
                    endDateObj = temp;
                    // Adjust endDateObj to end of day
                    endDateObj.setHours(23, 59, 59, 999);
                }

                // Filter dates BETWEEN start and end (normalized range)
                return (
                    invoiceDateObj >= startDateObj &&
                    invoiceDateObj <= endDateObj
                );
            });
        }
        // Apply days filter (only if date range is not active)
        else if (dateFilter) {
            result = result.filter((invoice) => {
                const daysRemaining =
                    invoice.held === 1
                        ? getDaysRemaining(invoice.showDate)
                        : getDaysRemaining(invoice.release_date, invoice.id);

                if (invoice.held === 1) {
                    // On hold invoices: use showDate countdown
                    // Ranges: 30 = 0-30, 60 = 31-60, 61+ = 61+
                    if (dateFilter === '30') {
                        return daysRemaining >= 0 && daysRemaining <= 30;
                    } else if (dateFilter === '60') {
                        return daysRemaining > 30 && daysRemaining <= 60;
                    } else if (dateFilter === '61+') {
                        return daysRemaining > 60;
                    }
                } else {
                    // Released invoices: use release_date age
                    if (dateFilter === '30') {
                        return daysRemaining >= -30 && daysRemaining <= 0;
                    } else if (dateFilter === '60') {
                        return daysRemaining > -60 && daysRemaining <= -30;
                    } else if (dateFilter === '61+') {
                        return daysRemaining < -60;
                    }
                }
                return false;
            });
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((invoice) => {
                const invoiceNumber =
                    invoice.invoiceNumber?.toLowerCase() || '';
                const tour = invoice.tour?.toLowerCase() || '';
                const market = invoice.market?.toLowerCase() || '';
                const venue = invoice.venue?.toLowerCase() || '';
                const clientReference =
                    invoice.clientReference?.toLowerCase() || '';

                return (
                    invoiceNumber.includes(query) ||
                    tour.includes(query) ||
                    market.includes(query) ||
                    venue.includes(query) ||
                    clientReference.includes(query)
                );
            });
        }

        return result;
    }, [filter, searchQuery, countryFilter, dateFilter, dateRangeFilter]);

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex justify-between gap-1 overflow-auto">
                <InvoiceStatusFilters
                    filter={filter}
                    onFilterChange={setFilter}
                    selectedCount={
                        filter === 'released'
                            ? selectedReleasedInvoiceIds.length
                            : 0
                    }
                    onSendReminder={
                        filter === 'released' ? handleSendReminder : undefined
                    }
                />
                <InvoiceAdvancedFilters
                    countryFilter={countryFilter}
                    onCountryFilterChange={setCountryFilter}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                    dateRangeFilter={dateRangeFilter}
                    onDateRangeFilterChange={setDateRangeFilter}
                    onSearchChange={setSearchQuery}
                />
            </div>

            {/* Table */}
            {filter === 'released' ? (
                <ReleasedInvoicesTable
                    data={filteredData}
                    onSelectionChange={setSelectedReleasedInvoiceIds}
                />
            ) : (
                <HoldInvoicesTable
                    data={filteredData}
                    onInvoiceSelect={setSelectedInvoice}
                    selectedInvoice={selectedInvoice}
                />
            )}

            {/* Invoice Detail Slide-out */}
            <InvoiceDetailSlideout
                invoice={selectedInvoice}
                isOpen={selectedInvoice !== null}
                onClose={() => setSelectedInvoice(null)}
            />
        </div>
    );
}

export default InvoicesTable;
