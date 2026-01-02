import Heading from '@/components/heading';
import {
    salesChartData,
    yoyChartData,
    ytdChartData,
} from '@/components/mockdata.js';
import CardLink from '@/components/pages/dashboard/card-link';
import DesignerStatsTable from '@/components/pages/dashboard/designer-stats-table';
import KPICard from '@/components/pages/dashboard/KPI-Card';
import RevanueTable from '@/components/pages/dashboard/revanue-table';
import SalesByRepTable from '@/components/pages/dashboard/sales-by-rep-table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Time period filter options
const timePeriods = [
    { label: 'Custom', value: 'custom' },
    { label: '12 months', value: '12months' },
    { label: '30 days', value: '30days' },
    { label: '7 days', value: '7days' },
    { label: '24 hours', value: '24hours' },
] as const;

type TimePeriod = (typeof timePeriods)[number]['value'];

// Format date for display
function formatDateLabel(value: string) {
    if (!value) return 'Select date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Select date';
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}

// Format date to YYYY-MM-DD for input
function formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get default dates: end date is today, start date is one month ago
function getDefaultDates() {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
        start: formatDateInput(oneMonthAgo),
        end: formatDateInput(today),
    };
}

function todaysDateDisplay() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return formattedDate;
}

export default function Dashboard() {
    const page = usePage<SharedData>();
    const {
        auth: {
            user: { name },
        },
    } = page.props;

    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('custom');
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    const defaultDates = getDefaultDates();
    const [startDate, setStartDate] = useState(defaultDates.start);
    const [endDate, setEndDate] = useState(defaultDates.end);

    const formattedStartDate = formatDateLabel(startDate);
    const formattedEndDate = formatDateLabel(endDate);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl">
                <Heading
                    title={`Welcome back, ${name}`}
                    description={todaysDateDisplay()}
                />

                {/* Time Period Filters and Date Range */}
                <div className="flex flex-col gap-4 sm:items-center sm:justify-between lg:flex-row">
                    <div className="inline-flex gap-0.5 overflow-auto rounded-md bg-gray-100 p-0.5">
                        {timePeriods.map((period) => (
                            <Button
                                key={period.value}
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPeriod(period.value)}
                                className={cn(
                                    'rounded-md border-0 transition-all',
                                    selectedPeriod === period.value
                                        ? 'border-gray-200 bg-white text-foreground shadow-sm hover:bg-white hover:text-foreground'
                                        : 'text-muted-foreground hover:bg-white hover:text-foreground',
                                )}
                            >
                                {period.label}
                            </Button>
                        ))}
                    </div>
                    <Dialog
                        open={isDateDialogOpen}
                        onOpenChange={setIsDateDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Calendar className="h-4 w-4" />
                                {formattedStartDate} - {formattedEndDate}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Select Date Range</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start-date">
                                        Start Date
                                    </Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            if (e.target.value > endDate) {
                                                setEndDate(e.target.value);
                                            }
                                        }}
                                        max={endDate}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            if (e.target.value < startDate) {
                                                setStartDate(e.target.value);
                                            }
                                        }}
                                        min={startDate}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDateDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => setIsDateDialogOpen(false)}
                                >
                                    Apply
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <KPICard
                        title="Sales"
                        value="$500,000"
                        change="2.4%"
                        chartData={salesChartData}
                    />
                    <KPICard
                        title="YtD"
                        value="$5,432,100"
                        change="8.6%"
                        chartData={ytdChartData}
                    />
                    <KPICard
                        title="YoY"
                        value="+$1,108.10"
                        change="6.0%"
                        chartData={yoyChartData}
                    />
                </div>

                {/* Accounts Receivable Section */}
                <div className="space-y-4 rounded-lg border-1 bg-gray-50 px-4 py-2">
                    <h3 className="text-lg font-semibold">
                        Accounts Receivable
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <CardLink
                            label="0-30 days"
                            content="$361,428"
                            change="10%"
                        />
                        <CardLink
                            label="30-60 days"
                            content="$261,897"
                            change="10%"
                        />
                        <CardLink
                            label="60-90 days"
                            content="$541,419"
                            change="10%"
                        />
                        <CardLink
                            label="90-120 days"
                            content="$675,395"
                            change="10%"
                        />
                        <CardLink
                            label="120+ days"
                            content="$275,823"
                            change="10%"
                        />
                    </div>
                    <div className="text-sm font-semibold">
                        <div className="flex justify-between py-2">
                            <span>Total</span>
                            <span className="text-2xl">$1,361,428</span>
                        </div>
                        <div className="flex justify-between border-t-1 py-2">
                            <span>Total Follow up</span>
                            <span className="text-2xl">$261,428</span>
                        </div>
                    </div>
                </div>

                {/* Orders and Held Invoices Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Orders Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Orders</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <CardLink label="Pending" content="48" />
                            <CardLink label="In Production" content="218" />
                            <CardLink label="Outstanding ER" content="34" />
                            <CardLink label="Outstanding Custom" content="21" />
                        </div>
                    </div>

                    {/* Held Invoices Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Held Invoices</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <CardLink label="Amount" content="32" />
                            <CardLink label="In Production" content="218" />
                        </div>
                    </div>
                </div>

                <RevanueTable />

                <SalesByRepTable />

                <DesignerStatsTable />
            </div>
        </AppLayout>
    );
}
