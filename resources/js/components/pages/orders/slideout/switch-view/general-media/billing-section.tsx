import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/components/utils/functions';
import { Invoice } from '@/types';
import { Download } from 'lucide-react';

function BillingSection({ billingInvoices }: { billingInvoices: Invoice[] }) {
    function formatBillingDate(dateString: string): string {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '—';
        return new Intl.DateTimeFormat('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
        }).format(date);
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Amt</TableHead>
                    <TableHead>Download</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {billingInvoices.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={5}
                            className="h-16 text-center text-muted-foreground"
                        >
                            No invoices yet
                        </TableCell>
                    </TableRow>
                ) : (
                    billingInvoices.map((inv) => (
                        <TableRow key={inv.id}>
                            <TableCell>
                                {inv.invoiceNumber || String(inv.id)}
                            </TableCell>
                            <TableCell>{formatBillingDate(inv.date)}</TableCell>
                            <TableCell>{inv.clientReference || '—'}</TableCell>
                            <TableCell>{formatCurrency(inv.amount)}</TableCell>
                            <TableCell>
                                <span
                                    className="inline-flex text-green-600"
                                    aria-label="Download"
                                >
                                    <Download className="h-4 w-4" />
                                </span>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}

export default BillingSection;
