import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    formatCurrency,
    parseWireMoney,
} from '@/helper-functions/format-currency';
import { formatNumericUsDate } from '@/lib/format/date';
import { formatSubmitInvoiceLineDescription } from '@/lib/orders/invoice-line-display';
import { sumInvoiceLineTotals } from '@/lib/orders/invoice-ledger';
import type { SubmitInvoice } from '@/types/orders-api';
import { Download } from 'lucide-react';

interface InvoiceBillingTableProps {
    invoices: SubmitInvoice[];
}

function invoiceTableDate(invoice: SubmitInvoice): string | null | undefined {
    return (
        invoice.created_at ??
        invoice.lines[0]?.created_at ??
        invoice.payment_due
    );
}

function InvoiceBillingTable({ invoices }: InvoiceBillingTableProps) {
    const invoicedTotal = sumInvoiceLineTotals(
        invoices.flatMap((invoice) => invoice.lines),
    );
    const hasInvoiceRows = invoices.some((invoice) => invoice.lines.length > 0);

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
                    invoices.flatMap((invoice) =>
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
                                              invoiceTableDate(invoice),
                                          )
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {formatSubmitInvoiceLineDescription(line)}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(
                                        parseWireMoney(line.total),
                                    )}
                                </TableCell>
                                <TableCell className="flex justify-center">
                                    <Download className="size-[20px] text-green-400" />
                                </TableCell>
                            </TableRow>
                        )),
                    )
                )}
                <TableRow className="xs-gray-500-weight-600">
                    <TableCell colSpan={3} className="pr-4 text-right">
                        Total
                    </TableCell>
                    <TableCell>{formatCurrency(invoicedTotal)}</TableCell>
                    <TableCell />
                </TableRow>
            </TableBody>
        </Table>
    );
}

export default InvoiceBillingTable;
