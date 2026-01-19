import { getDaysRemaining } from '@/components/utils/functions';
import { type Invoice } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { getReleasedInvoiceDayBadge } from './pieces/day-badge';
import { InvoiceTableBase } from './pieces/table-base';
import { createInvoiceColumns } from './pieces/table-columns';

interface ReleasedInvoicesTableProps {
    data: Invoice[];
    onSelectionChange: (selectedIds: number[]) => void;
}

function ReleasedInvoicesTable({
    data,
    onSelectionChange,
}: ReleasedInvoicesTableProps) {
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<number>>(
        new Set(),
    );

    // Notify parent of selection changes
    useEffect(() => {
        onSelectionChange(Array.from(selectedInvoiceIds));
    }, [selectedInvoiceIds, onSelectionChange]);

    const columns = useMemo(
        () =>
            createInvoiceColumns({
                getDayBadge: getReleasedInvoiceDayBadge,
                daysAccessorFn: (row) =>
                    getDaysRemaining(row.release_date, row.id),
            }),
        [],
    );

    const handleRowClick = (invoice: Invoice) => {
        setSelectedInvoiceIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(invoice.id)) {
                newSet.delete(invoice.id);
            } else {
                newSet.add(invoice.id);
            }
            return newSet;
        });
    };

    return (
        <InvoiceTableBase
            data={data}
            columns={columns}
            onRowClick={handleRowClick}
            isRowSelected={(invoice) => selectedInvoiceIds.has(invoice.id)}
        />
    );
}

export default ReleasedInvoicesTable;
