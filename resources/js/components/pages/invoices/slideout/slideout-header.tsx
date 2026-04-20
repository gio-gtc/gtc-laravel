import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NavOptionButton from '@/components/ui/slideout/nav-option-button';
import Divider from '@/components/utils/divider';
import { cn } from '@/lib/utils';
import {
    ArrowRightToLine,
    ExpandIcon,
    MoreHorizontal,
    Send,
    ShrinkIcon,
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
        <SheetHeader className="relative gap-0 p-0">
            <div className="slide-out-container flex items-end justify-end shadow-lg">
                <div className="flex items-center gap-0.5">
                    <NavOptionButton onClick={onSend} icon={Send} />
                    <NavOptionButton
                        onClick={onMaximize}
                        icon={isMaximized ? ShrinkIcon : ExpandIcon}
                    />
                    <NavOptionButton onClick={onMore} icon={MoreHorizontal} />
                    <NavOptionButton
                        onClick={onClose}
                        icon={ArrowRightToLine}
                    />
                </div>
            </div>

            <div
                className={cn(
                    'flex flex-col px-3 lg:flex-row lg:items-baseline lg:gap-2',
                    'py-[7px]',
                )}
            >
                <SheetTitle className="text-[28px] font-medium text-black">
                    {tour}
                </SheetTitle>
                <p className="sm-black-weight-500">
                    {venue}, {market}
                </p>
            </div>
            <Divider />
        </SheetHeader>
    );
}
