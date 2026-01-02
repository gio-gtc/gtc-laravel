import { salesByRepData } from '@/components/mockdata';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useMemo } from 'react';

function SalesByRepTable() {
    // Totals from the image (may include additional reps not shown)
    const totals = useMemo(
        () => ({
            currentMonth: 1561000,
            ytd: 13125000,
            total: 14686000,
        }),
        [],
    );

    // Format currency
    function formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    // Render value with change indicator
    function renderValueWithChange(
        value: number,
        change: { direction: 'up' | 'down'; percentage: number },
    ) {
        const isPositive = value >= 0;
        const isUp = change.direction === 'up';
        const arrowColor = isUp ? 'text-green-600' : 'text-red-600';

        return (
            <div className="flex items-center justify-end gap-2">
                <span className={isPositive ? '' : 'text-red-600'}>
                    {formatCurrency(value)}
                </span>
                <div
                    className={`inline-flex items-center gap-1 rounded-md border-1 p-0.5 text-xs ${arrowColor}`}
                >
                    {isUp ? (
                        <ArrowUp className="h-3 w-3" />
                    ) : (
                        <ArrowDown className="h-3 w-3" />
                    )}
                    <span>{change.percentage}%</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 px-4 py-2">
            <h3 className="text-lg font-semibold">Sales by Rep</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rep</TableHead>
                        <TableHead className="text-right">
                            CURRENT MONTH
                        </TableHead>
                        <TableHead className="text-right">YTD</TableHead>
                        <TableHead className="text-right">TOTAL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {salesByRepData.map((rep, index) => (
                        <TableRow key={index}>
                            <TableCell>{rep.rep}</TableCell>
                            <TableCell className="text-right">
                                {renderValueWithChange(
                                    rep.currentMonth,
                                    rep.currentMonthChange,
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {renderValueWithChange(rep.ytd, rep.ytdChange)}
                            </TableCell>
                            <TableCell className="text-right">
                                <span>{formatCurrency(rep.total)}</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter className="bg-white">
                    <TableRow>
                        <TableCell className="font-semibold">Total</TableCell>
                        <TableCell className="text-right font-semibold">
                            {formatCurrency(totals.currentMonth)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            {formatCurrency(totals.ytd)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            {formatCurrency(totals.total)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}

export default SalesByRepTable;
