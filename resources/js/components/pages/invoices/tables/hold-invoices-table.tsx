import { getDaysRemaining } from '@/components/utils/functions';
import { type Invoice } from '@/types';
import { useMemo } from 'react';
import { getInvoiceDayBadge } from './pieces/day-badge';
import { InvoiceTableBase } from './pieces/table-base';
import { createInvoiceColumns } from './pieces/table-columns';

interface OnHoldInvoicesTableProps {
    data: Invoice[];
    onInvoiceSelect: (invoice: Invoice | null) => void;
    selectedInvoice: Invoice | null;
}

function OnHoldInvoicesTable({
    data,
    onInvoiceSelect,
    selectedInvoice,
}: OnHoldInvoicesTableProps) {
    const columns = useMemo(
        () =>
            createInvoiceColumns({
                getDayBadge: getInvoiceDayBadge,
                daysAccessorFn: (row) => getDaysRemaining(row.showDate),
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

export default OnHoldInvoicesTable;
