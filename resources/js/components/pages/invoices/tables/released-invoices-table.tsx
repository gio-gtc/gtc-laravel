import { getDaysRemaining } from '@/components/utils/functions';
import { type Invoice } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';
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
    const lastClickedIndexRef = useRef<number | null>(null);

    // Reset last clicked index when data changes
    useEffect(() => {
        lastClickedIndexRef.current = null;
    }, [data]);

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

    const handleRowClick = (
        invoice: Invoice,
        event: React.MouseEvent,
    ) => {
        const currentIndex = data.findIndex((inv) => inv.id === invoice.id);

        if (event.shiftKey) {
            // Shift-click: select range
            let startIndex: number;
            
            // If nothing is selected, start from first item
            if (selectedInvoiceIds.size === 0) {
                startIndex = 0;
            } else if (lastClickedIndexRef.current !== null) {
                // Use last clicked index if available
                startIndex = lastClickedIndexRef.current;
            } else {
                // Fallback to first item if no last clicked index
                startIndex = 0;
            }
            
            const endIndex = currentIndex;
            const minIndex = Math.min(startIndex, endIndex);
            const maxIndex = Math.max(startIndex, endIndex);

            setSelectedInvoiceIds((prev) => {
                const newSet = new Set(prev);
                // Add all invoices in the range
                for (let i = minIndex; i <= maxIndex; i++) {
                    newSet.add(data[i].id);
                }
                return newSet;
            });
            lastClickedIndexRef.current = currentIndex;
        } else {
            // Normal click: toggle selection
            setSelectedInvoiceIds((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(invoice.id)) {
                    newSet.delete(invoice.id);
                } else {
                    newSet.add(invoice.id);
                }
                return newSet;
            });
            lastClickedIndexRef.current = currentIndex;
        }
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
