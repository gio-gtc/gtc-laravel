import { tourRevenueData } from '@/components/mockdata';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useMemo } from 'react';

function RevanueTable() {
    // Calculate totals for each column
    const totals = useMemo(() => {
        return tourRevenueData.reduce(
            (acc, tour) => ({
                currentMonth: acc.currentMonth + tour.currentMonth,
                ytd: acc.ytd + tour.ytd,
                total: acc.total + tour.total,
            }),
            { currentMonth: 0, ytd: 0, total: 0 },
        );
    }, []);

    // Format currency
    function formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    return (
        <div className="space-y-4 px-4 py-2">
            <h3 className="text-lg font-semibold">Revenue by Tour</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tour</TableHead>
                        <TableHead className="text-right">
                            CURRENT MONTH
                        </TableHead>
                        <TableHead className="text-right">YTD</TableHead>
                        <TableHead className="text-right">TOTAL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tourRevenueData.map((tour, index) => (
                        <TableRow key={index}>
                            <TableCell>{tour.tour}</TableCell>
                            <TableCell className="text-right">
                                {formatCurrency(tour.currentMonth)}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatCurrency(tour.ytd)}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatCurrency(tour.total)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter className="bg-white">
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

export default RevanueTable;
