import Heading from '@/components/heading';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/components/utils/functions';
import { type SharedData } from '@/types';
import { type DashboardPageProps } from '@/types/inertia-pages';
import { usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useMemo } from 'react';

function SalesByRepTable() {
    const { sales_by_rep: salesByRepData } = usePage<
        SharedData & DashboardPageProps
    >().props;

    const totals = useMemo(
        () =>
            salesByRepData.reduce(
                (acc, rep) => ({
                    currentMonth: acc.currentMonth + rep.currentMonth,
                    ytd: acc.ytd + rep.ytd,
                    total: acc.total + rep.total,
                }),
                { currentMonth: 0, ytd: 0, total: 0 },
            ),
        [salesByRepData],
    );

    function renderValueWithChange(
        value: number,
        change: { direction: string; percentage: number },
    ) {
        const isUp = change.direction === 'up';
        const arrowColor = isUp ? 'text-green-600' : 'text-red-600';

        return (
            <div className="flex items-center justify-end gap-2">
                <span>{formatCurrency(value)}</span>
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
            <Heading title="Sales by Rep" type="section" />
            <Table layout="none">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/8">Rep</TableHead>
                        <TableHead className="w-[400px] text-right">
                            CURRENT MONTH
                        </TableHead>
                        <TableHead className="w-[200px] text-right">
                            YTD
                        </TableHead>
                        <TableHead className="w-[200px] text-right">
                            TOTAL
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="text-gray-900">
                    {salesByRepData.map((rep, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">
                                {rep.rep}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {renderValueWithChange(
                                    rep.currentMonth,
                                    rep.currentMonthChange,
                                )}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {renderValueWithChange(rep.ytd, rep.ytdChange)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                <span>{formatCurrency(rep.total)}</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter className="bg-white text-gray-900">
                    <TableRow>
                        <TableCell className="font-semibold">Total</TableCell>
                        <TableCell className="text-right text-lg font-semibold">
                            {formatCurrency(totals.currentMonth)}
                        </TableCell>
                        <TableCell className="text-right text-lg font-semibold">
                            {formatCurrency(totals.ytd)}
                        </TableCell>
                        <TableCell className="text-right text-lg font-semibold">
                            {formatCurrency(totals.total)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}

export default SalesByRepTable;
