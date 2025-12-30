import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ArrowUp, Calendar, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Mock data for mini charts - static data showing upward trend
const salesChartData = [
    { name: 'Day 1', value: 45 },
    { name: 'Day 2', value: 52 },
    { name: 'Day 3', value: 58 },
    { name: 'Day 4', value: 65 },
    { name: 'Day 5', value: 72 },
    { name: 'Day 6', value: 78 },
    { name: 'Day 7', value: 85 },
];

const ytdChartData = [
    { name: 'Day 1', value: 48 },
    { name: 'Day 2', value: 55 },
    { name: 'Day 3', value: 62 },
    { name: 'Day 4', value: 68 },
    { name: 'Day 5', value: 75 },
    { name: 'Day 6', value: 82 },
    { name: 'Day 7', value: 90 },
];

const yoyChartData = [
    { name: 'Day 1', value: 50 },
    { name: 'Day 2', value: 57 },
    { name: 'Day 3', value: 64 },
    { name: 'Day 4', value: 71 },
    { name: 'Day 5', value: 78 },
    { name: 'Day 6', value: 85 },
    { name: 'Day 7', value: 92 },
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

// Mini chart component
function MiniChart({ data }: { data: { name: string; value: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={60}>
            <LineChart data={data}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip content={() => null} />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// KPI Card Component
function KPICard({
    title,
    value,
    change,
    chartData,
}: {
    title: string;
    value: string;
    change: string;
    chartData: { name: string; value: number }[];
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Export</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <ArrowUp className="h-3 w-3" />
                    {change}
                </div>
                <div className="mt-4 h-[60px]">
                    <MiniChart data={chartData} />
                </div>
            </CardContent>
        </Card>
    );
}

// Accounts Receivable Aging Card
function AgingCard({
    label,
    amount,
    change,
}: {
    label: string;
    amount: string;
    change: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{amount}</div>
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <ArrowUp className="h-3 w-3" />
                    {change}
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                        // No-op for now
                    }}
                >
                    View report
                </Button>
            </CardFooter>
        </Card>
    );
}

// Order/Invoice Card Component
function CountCard({ title, count }: { title: string; count: number }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{count}</div>
            </CardContent>
            <CardFooter>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                        // No-op for now
                    }}
                >
                    View report
                </Button>
            </CardFooter>
        </Card>
    );
}

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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex gap-0.5 rounded-md bg-gray-100 p-0.5">
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
                <div className="grid gap-4 md:grid-cols-3">
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
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                        Accounts Receivable
                    </h3>
                    <div className="grid gap-4 md:grid-cols-5">
                        <AgingCard
                            label="0-30 days"
                            amount="$361,428"
                            change="10%"
                        />
                        <AgingCard
                            label="30-60 days"
                            amount="$261,897"
                            change="10%"
                        />
                        <AgingCard
                            label="60-90 days"
                            amount="$541,419"
                            change="10%"
                        />
                        <AgingCard
                            label="90-120 days"
                            amount="$675,395"
                            change="10%"
                        />
                        <AgingCard
                            label="120+ days"
                            amount="$275,823"
                            change="10%"
                        />
                    </div>
                    <div className="flex gap-6 text-sm">
                        <div>
                            <span className="text-muted-foreground">
                                Total:{' '}
                            </span>
                            <span className="font-semibold">$1,361,428</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Total Follow up:{' '}
                            </span>
                            <span className="font-semibold">$261,428</span>
                        </div>
                    </div>
                </div>

                {/* Orders and Held Invoices Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Orders Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Orders</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <CountCard title="Pending" count={48} />
                            <CountCard title="In Production" count={218} />
                            <CountCard title="Outstanding ER" count={34} />
                            <CountCard title="Outstanding Custom" count={21} />
                        </div>
                    </div>

                    {/* Held Invoices Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Held Invoices</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <CountCard title="Amount" count={32} />
                            <CountCard title="In Production" count={218} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
