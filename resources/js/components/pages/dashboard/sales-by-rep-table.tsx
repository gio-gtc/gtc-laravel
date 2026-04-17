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
import { formatCurrency } from '@/helper-functions/format-currency';
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

    function renderCurrencyCell(value: number) {
        return <span className="tabular-nums">{formatCurrency(value)}</span>;
    }

    function renderChangeBadge(change: {
        direction: string;
        percentage: number;
    }) {
        const isUp = change.direction === 'up';
        const arrowColor = isUp ? 'text-green-600' : 'text-red-600';

        return (
            <div
                //  width needs to be changes in 3 pleases to work
                className={`flex w-full max-w-[50px] items-center justify-between gap-1 rounded-md border-1 p-0.5 text-xs whitespace-nowrap ${arrowColor}`}
            >
                {isUp ? (
                    <ArrowUp className="h-3 w-3 shrink-0" />
                ) : (
                    <ArrowDown className="h-3 w-3 shrink-0" />
                )}
                <span>{change.percentage}%</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 px-4 py-2">
            <Heading title="Sales by Rep" type="section" />
            <Table layout="none" className="table-fixed overflow-y-auto">
                <TableHeader>
                    <TableRow>
                        <TableHead className="max-w-[26%]">Rep</TableHead>
                        <TableHead className="w-[22%] text-right">
                            CURRENT MONTH
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="w-[22%] text-right">
                            YTD
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="w-[22%] text-right">
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
                                {renderCurrencyCell(rep.currentMonth)}
                            </TableCell>
                            <TableCell className="p-0 text-right align-middle">
                                {renderChangeBadge(rep.currentMonthChange)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {renderCurrencyCell(rep.ytd)}
                            </TableCell>
                            <TableCell className="p-0 text-right align-middle">
                                {renderChangeBadge(rep.ytdChange)}
                            </TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap">
                                {renderCurrencyCell(rep.total)}
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
                        <TableCell aria-hidden />
                        <TableCell className="text-right text-lg font-semibold">
                            {formatCurrency(totals.ytd)}
                        </TableCell>
                        <TableCell aria-hidden />
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
