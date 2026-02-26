import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NavOptionButton from '@/components/ui/slideout/nav-option-button';
import {
    ArrowRightToLine,
    Maximize2,
    Minimize2,
    MoreHorizontal,
    Send,
} from 'lucide-react';

interface InvoiceSlideoutHeaderProps {
    tour: string;
    venue: string;
    market: string;
    onSend: () => void;
    onMaximize: () => void;
    onMore: () => void;
    onClose: () => void;
    isMaximized?: boolean;
}

export default function InvoiceSlideoutHeader({
    tour,
    venue,
    market,
    onSend,
    onMaximize,
    onMore,
    onClose,
    isMaximized = false,
}: InvoiceSlideoutHeaderProps) {
    return (
        <SheetHeader className="relative border-b px-6 pt-6 pb-4">
            <div className="flex flex-col items-start justify-between sm:flex-row">
                <div className="flex-1 font-medium">
                    <SheetTitle className="text-3xl font-medium">
                        {tour}
                    </SheetTitle>
                    <p className="mt-1 text-sm">
                        {venue}, {market}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <NavOptionButton onClick={onSend} icon={Send} />
                    <NavOptionButton
                        onClick={onMaximize}
                        icon={isMaximized ? Minimize2 : Maximize2}
                    />
                    <NavOptionButton onClick={onMore} icon={MoreHorizontal} />
                    <NavOptionButton
                        onClick={onClose}
                        icon={ArrowRightToLine}
                    />
                </div>
            </div>
        </SheetHeader>
    );
}
