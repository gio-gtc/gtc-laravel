import Heading from '@/components/heading';
import CardLink from '@/components/pages/dashboard/card-link';
import DesignerStatsTable from '@/components/pages/dashboard/designer-stats-table';
import KPICard from '@/components/pages/dashboard/KPI-Card';
import RevenueTable from '@/components/pages/dashboard/revenue-table';
import SalesByRepTable from '@/components/pages/dashboard/sales-by-rep-table';
import { Button } from '@/components/ui/button';
import DateRangePicker from '@/components/utils/date-range-picker';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type DashboardPageProps } from '@/types/inertia-pages';
import { Head, usePage } from '@inertiajs/react';
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
    const page = usePage<SharedData & DashboardPageProps>();
    const {
        auth: {
            user: { name },
        },
        sales_chart: salesChartData,
        ytd_chart: ytdChartData,
        yoy_chart: yoyChartData,
    } = page.props;

    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('custom');
    const defaultDates = getDefaultDates();
    const [dateRange, setDateRange] = useState<{
        startDate: string | null;
        endDate: string | null;
    }>({
        startDate: defaultDates.start,
        endDate: defaultDates.end,
    });

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
                                onClick={() => setSelectedPeriod(period.value)}
                                className={cn(
                                    'rounded-md border-0 transition-all',
                                    selectedPeriod === period.value
                                        ? 'border-gray-200 bg-white text-foreground shadow-sm hover:bg-white hover:text-foreground'
                                        : 'text-gray-500 hover:bg-white hover:text-foreground',
                                )}
                            >
                                {period.label}
                            </Button>
                        ))}
                    </div>
                    <DateRangePicker
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        onDateRangeChange={setDateRange}
                    />
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
                    <Heading title="Accounts Receivable" type="section" />
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
                    <div className="font-semibold text-gray-900">
                        <div className="flex justify-between py-2">
                            <span className="text-sm">Total</span>
                            <span className="text-2xl">$1,361,428</span>
                        </div>
                        <div className="flex justify-between border-t-1 pt-2">
                            <span className="text-sm">Total Follow up</span>
                            <span className="text-2xl">$261,428</span>
                        </div>
                    </div>
                </div>

                {/* Orders and Held Invoices Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Orders Section */}
                    <div className="space-y-4">
                        <Heading title="Orders" type="section" />
                        <div className="grid justify-center gap-4 sm:grid-cols-2">
                            <CardLink
                                cardClassName="max-w-[430px] w-full lg:max-w-none"
                                label="Pending"
                                content="48"
                            />
                            <CardLink
                                cardClassName="max-w-[430px] w-full lg:max-w-none"
                                label="In Production"
                                content="218"
                            />
                            <CardLink
                                cardClassName="max-w-[430px] w-full lg:max-w-none"
                                label="Outstanding ER"
                                content="34"
                            />
                            <CardLink
                                cardClassName="max-w-[430px] w-full lg:max-w-none"
                                label="Outstanding Custom"
                                content="21"
                            />
                        </div>
                    </div>

                    {/* Held Invoices Section */}
                    <div className="space-y-4">
                        <Heading title="Held Invoices" type="section" />
                        <div className="grid justify-center gap-4 sm:grid-cols-2">
                            <CardLink
                                cardClassName="max-w-[430px] w-full lg:max-w-none"
                                label="Amount"
                                content="32"
                            />
                            <CardLink
                                cardClassName="max-w-[430px] w-full lg:max-w-none"
                                label="In Production"
                                content="218"
                            />
                        </div>
                    </div>
                </div>

                <RevenueTable />

                <SalesByRepTable />

                <DesignerStatsTable />
            </div>
        </AppLayout>
    );
}
