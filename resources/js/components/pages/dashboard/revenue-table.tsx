import Heading from '@/components/heading';
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
import { formatCurrency } from '@/components/utils/functions';
import { useMemo } from 'react';

function RevenueTable() {
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

    return (
        <div className="space-y-4 px-4 py-2">
            <Heading title="Revenue by Tour" type="section" />
            <Table layout="none">
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
                <TableBody className="text-gray-900">
                    {tourRevenueData.map((tour, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">
                                {tour.tour}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {formatCurrency(tour.currentMonth)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {formatCurrency(tour.ytd)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                                {formatCurrency(tour.total)}
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

export default RevenueTable;
