import { getDaysRemaining } from '@/components/utils/functions';
import { type Invoice } from '@/types';
import { useMemo } from 'react';
import { getInvoiceDayBadge } from './pieces/day-badge';
import { InvoiceTableBase } from './pieces/table-base';
import { createInvoiceColumns } from './pieces/table-columns';

interface InvoiceDetailTableProps {
    data: Invoice[];
    onInvoiceSelect: (invoice: Invoice | null) => void;
    selectedInvoice: Invoice | null;
}

function InvoiceDetailTable({
    data,
    onInvoiceSelect,
    selectedInvoice,
}: InvoiceDetailTableProps) {
    const columns = useMemo(
        () =>
            createInvoiceColumns({
                getDayBadge: getInvoiceDayBadge,
                daysAccessorFn: (row) =>
                    row.held === 1
                        ? getDaysRemaining(row.showDate)
                        : getDaysRemaining(row.release_date, row.id),
            }),
        [],
    );

    return (
        <InvoiceTableBase
            data={data}
            columns={columns}
            onRowClick={(invoice, _event) => {
                onInvoiceSelect(
                    selectedInvoice?.id === invoice.id ? null : invoice,
                );
            }}
            isRowSelected={(invoice) => selectedInvoice?.id === invoice.id}
        />
    );
}

export default InvoiceDetailTable;
