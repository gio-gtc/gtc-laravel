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
                    stroke="#9333ea"
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
    return (
        <Card className="gap-1 border-gray-300 bg-gray-50 py-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
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
            <CardContent className="rounded-xl border-t-1 border-gray-300 bg-white py-2">
                <div className="flex flex-col justify-between lg:flex-row">
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
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
