import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/helper-functions/format-currency';
import type { OrderCartBillingLine } from '@/lib/orders/order-item-specifications';

interface CartBillingTableProps {
    cartLines: OrderCartBillingLine[];
    cartTotal: number;
}

function CartBillingTable({ cartLines, cartTotal }: CartBillingTableProps) {
    return (
        <Table compactRows>
            <TableHeader>
                <TableRow className="text-center">
                    <TableHead className="w-full max-w-[11%] text-center" />
                    <TableHead className="w-full max-w-[11%] text-center" />
                    <TableHead className="w-full max-w-[56%] text-center">
                        Reference
                    </TableHead>
                    <TableHead className="w-full max-w-[12%] text-center">
                        Amt
                    </TableHead>
                    <TableHead className="w-full max-w-[10%] text-center" />
                </TableRow>
            </TableHeader>
            <TableBody>
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
                    <TableCell>{formatCurrency(cartTotal)}</TableCell>
                    <TableCell />
                </TableRow>
            </TableBody>
        </Table>
    );
}

export default CartBillingTable;
