import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCents, formatCurrency } from '@/helper-functions/format-currency';
import { formatNumericUsDate } from '@/lib/format/date';
import { formatSubmitInvoiceLineDescription } from '@/lib/orders/invoice-line-display';
import type { OrderCartBillingLine } from '@/lib/orders/order-item-specifications';
import { Invoice } from '@/types';
import type { SubmitInvoice } from '@/types/orders-api';
import { Download } from 'lucide-react';

interface BillingSectionProps {
    billingInvoices: Invoice[];
    cartLines: OrderCartBillingLine[];
    heldInvoices: SubmitInvoice[];
}

function BillingSection({
    billingInvoices,
    cartLines,
    heldInvoices,
}: BillingSectionProps) {
    const legacyInvoicedTotal = billingInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0,
    );
    const heldInvoicedTotal = heldInvoices.reduce(
        (sum, inv) => sum + inv.total_cents / 100,
        0,
    );
    const invoicedTotal = legacyInvoicedTotal + heldInvoicedTotal;
    const newOrderTotal = cartLines.reduce((sum, item) => sum + item.amount, 0);
    const grandTotal = invoicedTotal + newOrderTotal;
    const hasInvoiceRows =
        billingInvoices.length > 0 || heldInvoices.length > 0;

    return (
        <Table compactRows>
            <TableHeader>
                <TableRow className="text-center">
                    <TableHead className="w-full max-w-[11%] text-center">
                        Invoice #
                    </TableHead>
                    <TableHead className="w-full max-w-[11%] text-center">
                        Date
                    </TableHead>
                    <TableHead className="w-full max-w-[56%] text-center">
                        Reference
                    </TableHead>
                    <TableHead className="w-full max-w-[12%] text-center">
                        Amt
                    </TableHead>
                    <TableHead className="w-full max-w-[10%] text-center">
                        Download
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {!hasInvoiceRows ? (
                    <TableRow>
                        <TableCell
                            colSpan={5}
                            className="h-16 text-center text-muted-foreground"
                        ></TableCell>
                    </TableRow>
                ) : (
                    <>
                        {billingInvoices.map((inv) => (
                            <TableRow
                                key={inv.id}
                                className="xs-gray-500-weight-600"
                            >
                                <TableCell className="text-center">
                                    {inv.invoiceNumber || String(inv.id)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {formatNumericUsDate(inv.date)}
                                </TableCell>
                                <TableCell>
                                    {inv.clientReference || '—'}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(inv.amount)}
                                </TableCell>
                                <TableCell className="flex justify-center">
                                    <Download className="size-[20px] text-green-400" />
                                </TableCell>
                            </TableRow>
                        ))}
                        {heldInvoices.flatMap((invoice) =>
                            invoice.lines.map((line, lineIndex) => (
                                    <TableRow
                                        key={`${invoice.id}-${line.id}`}
                                        className="xs-gray-500-weight-600"
                                    >
                                        <TableCell className="text-center">
                                            {lineIndex === 0
                                                ? invoice.document_number
                                                : ''}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {lineIndex === 0
                                                ? formatNumericUsDate(
                                                      invoice.created_at,
                                                  )
                                                : ''}
                                        </TableCell>
                                        <TableCell>
                                            {formatSubmitInvoiceLineDescription(
                                                line,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatCents(line.total_cents)}
                                        </TableCell>
                                        <TableCell className="flex justify-center">
                                            <Download className="size-[20px] text-green-400" />
                                        </TableCell>
                                    </TableRow>
                            )),
                        )}
                    </>
                )}
                {/* New Order section */}
                <TableRow className="xs-gray-500-weight-600 bg-neutral-100">
                    <TableCell colSpan={5} className="text-center">
                        New Order
                    </TableCell>
                </TableRow>
                {cartLines.map((item) => (
                    <TableRow key={item.id} className="xs-gray-500-weight-600">
                        <TableCell />
                        <TableCell />
                        <TableCell className="truncate">
                            {item.reference}
                        </TableCell>
                        <TableCell className="truncate">
                            {formatCurrency(item.amount)}
                        </TableCell>
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
