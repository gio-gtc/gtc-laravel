import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUp, MoreVertical } from 'lucide-react';
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

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
                    stroke="#9e77ed"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

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
    const matchingStyles = 'px-4 py-2.5';

    return (
        <Card className="gap-1 bg-gray-50 py-0">
            <CardHeader
                className={`flex flex-row items-center justify-between space-y-0 ${matchingStyles}`}
            >
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-4">
                            <MoreVertical className="size-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Export</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent
                className={`rounded-xl border-t-1 bg-white py-2 ${matchingStyles}`}
            >
                <div className="flex flex-col justify-between lg:flex-row">
                    <div className="text-3xl font-semibold">{value}</div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                        <ArrowUp className="h-3 w-3" />
                        {change}
                    </div>
                </div>
                <div className="mt-4 h-[60px]">
                    <MiniChart data={chartData} />
                </div>
            </CardContent>
        </Card>
    );
}

export default KPICard;
