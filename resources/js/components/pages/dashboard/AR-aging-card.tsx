import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowUp } from 'lucide-react';

function ARAgingCard({
    label,
    amount,
    change,
}: {
    label: string;
    amount: string;
    change: string;
}) {
    return (
        <Card className="pt-4 pb-0">
            <CardHeader>
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{amount}</div>
                <div className="inline-flex items-center gap-1 rounded-md border-1 p-0.5 text-xs">
                    <ArrowUp className="h-3 w-3 text-green-600" />
                    {change}
                </div>
            </CardContent>
            <CardFooter className="border-t-1">
                <Button
                    variant="link"
                    size="sm"
                    className="w-full text-purple-800"
                    onClick={() => {
                        console.log('Clicked!');
                    }}
                >
                    View report
                </Button>
            </CardFooter>
        </Card>
    );
}

export default ARAgingCard;
