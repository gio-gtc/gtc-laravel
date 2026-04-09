import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/helper-functions/format-currency';
import { Invoice } from '@/types';
import { Download } from 'lucide-react';

interface NewOrderItem {
    id: string | number;
    reference: string;
    amount: number;
}

const MOCK_NEW_ORDER_ITEMS: NewOrderItem[] = [
    { id: 1, reference: 'Key Art Package 1400 × 400', amount: 420 },
    { id: 2, reference: 'Socials & Web Banners', amount: 150 },
];

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

    const invoicedTotal = billingInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0,
    );
    const newOrderTotal = MOCK_NEW_ORDER_ITEMS.reduce(
        (sum, item) => sum + item.amount,
        0,
    );
    const grandTotal = invoicedTotal + newOrderTotal;

    return (
        <Table compactRows>
            <TableHeader>
                <TableRow className="text-center">
                    <TableHead className="w-[11%] text-center">
                        Invoice #
                    </TableHead>
                    <TableHead className="w-[11%] text-center">Date</TableHead>
                    <TableHead className="w-[56%] text-center">
                        Reference
                    </TableHead>
                    <TableHead className="w-[12%] text-center">Amt</TableHead>
                    <TableHead className="w-[10%] text-center">
                        Download
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {billingInvoices.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={5}
                            className="h-16 text-center text-muted-foreground"
                        ></TableCell>
                    </TableRow>
                ) : (
                    billingInvoices.map((inv) => (
                        <TableRow
                            key={inv.id}
                            className="xs-gray-500-weight-600"
                        >
                            <TableCell className="text-center">
                                {inv.invoiceNumber || String(inv.id)}
                            </TableCell>
                            <TableCell className="text-center">
                                {formatBillingDate(inv.date)}
                            </TableCell>
                            <TableCell>{inv.clientReference || '—'}</TableCell>
                            <TableCell>{formatCurrency(inv.amount)}</TableCell>
                            <TableCell className="flex justify-center">
                                <Download className="size-[20px] text-green-400" />
                            </TableCell>
                        </TableRow>
                    ))
                )}
                {/* New Order section */}
                <TableRow className="xs-gray-500-weight-600 bg-neutral-100">
                    <TableCell colSpan={5} className="text-center">
                        New Order
                    </TableCell>
                </TableRow>
                {MOCK_NEW_ORDER_ITEMS.map((item) => (
                    <TableRow key={item.id} className="xs-gray-500-weight-600">
                        <TableCell />
                        <TableCell />
                        <TableCell>{item.reference}</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                        <TableCell />
                    </TableRow>
                ))}
                <TableRow className="xs-gray-500-weight-600">
                    <TableCell colSpan={3} className="pr-4 text-right">
                        In Cart
                    </TableCell>
                    <TableCell>{formatCurrency(newOrderTotal)}</TableCell>
                    <TableCell />
                </TableRow>
                {/* In Cart + Invoiced grand total */}
                <TableRow className="xs-gray-500-weight-600">
                    <TableCell colSpan={3} className="pr-4 text-right">
                        In Cart + Invoiced
                    </TableCell>
                    <TableCell>{formatCurrency(grandTotal)}</TableCell>
                    <TableCell />
                </TableRow>
            </TableBody>
        </Table>
    );
}

export default BillingSection;
