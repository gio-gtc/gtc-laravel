import { Button } from '@/components/ui/button';
import {
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Maximize2, MoreHorizontal, Send } from 'lucide-react';

interface InvoiceSlideoutHeaderProps {
    tour: string;
    venue: string;
    market: string;
    onSend?: () => void;
    onMaximize?: () => void;
    onMore?: () => void;
}

export default function InvoiceSlideoutHeader({
    tour,
    venue,
    market,
    onSend,
    onMaximize,
    onMore,
}: InvoiceSlideoutHeaderProps) {
    return (
        <SheetHeader className="relative border-b px-6 pt-6 pb-4">
            <div className="flex flex-col items-start justify-between pr-10 sm:flex-row">
                <div className="flex-1">
                    <SheetTitle className="text-2xl font-semibold">
                        {tour}
                    </SheetTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {venue}, {market}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onSend}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onMaximize}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onMore}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </SheetHeader>
    );
}
