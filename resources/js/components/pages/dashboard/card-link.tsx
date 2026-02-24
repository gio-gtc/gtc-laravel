import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowUp } from 'lucide-react';

function CardLink({
    label,
    content,
    change,
}: {
    label: string;
    content: string;
    change?: string;
}) {
    return (
        <Card className="gap-2 pt-4 pb-0">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="pb-2 text-2xl font-semibold text-gray-900">
                    {content}
                </div>

                {change && (
                    <div className="inline-flex items-center gap-1 rounded-md border-1 p-0.5 text-sm font-medium text-gray-700">
                        <ArrowUp className="h-3 w-3 text-green-600" />
                        {change}
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t-1">
                <Button
                    variant="link"
                    className="w-full cursor-pointer font-semibold text-purple-700"
                    // TODO: Make a function prop to handle click
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

export default CardLink;
