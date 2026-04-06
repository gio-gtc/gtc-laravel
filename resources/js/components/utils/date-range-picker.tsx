import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, parseISO, startOfDay } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

function formatDateLabel(value: string | null) {
    if (!value) return 'Select date';
    const date = parseISO(value);
    if (Number.isNaN(date.getTime())) return 'Select date';
    return format(date, 'MMM dd, yyyy');
}

function toDateRange(
    startDate: string | null,
    endDate: string | null,
): DateRange | undefined {
    if (!startDate || !endDate) return undefined;
    const from = parseISO(startDate);
    const to = parseISO(endDate);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()))
        return undefined;
    return { from, to };
}

function toISOString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

interface DateRangePickerProps {
    startDate: string | null;
    endDate: string | null;
    onDateRangeChange: (range: {
        startDate: string | null;
        endDate: string | null;
    }) => void;
    buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
    buttonClassName?: string;
    placeholder?: string;
    dialogTitle?: string;
    forwardOnlyFromToday?: boolean;
}

export default function DateRangePicker({
    startDate,
    endDate,
    onDateRangeChange,
    buttonSize = 'sm',
    buttonClassName = '',
    placeholder = 'Select date range',
    dialogTitle = 'Select Date Range',
    forwardOnlyFromToday = false,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [tempRange, setTempRange] = useState<DateRange | undefined>(() =>
        toDateRange(startDate, endDate),
    );
    const isMobile = useIsMobile();

    const formattedStartDate = formatDateLabel(startDate);
    const formattedEndDate = formatDateLabel(endDate);

    const commitTempRangeIfComplete = () => {
        if (tempRange?.from && tempRange?.to) {
            onDateRangeChange({
                startDate: toISOString(tempRange.from),
                endDate: toISOString(tempRange.to),
            });
            return true;
        }
        return false;
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setTempRange(toDateRange(startDate, endDate));
        } else {
            commitTempRangeIfComplete();
        }
        setOpen(isOpen);
    };

    const handleRangeSelect = (range: DateRange | undefined) => {
        setTempRange(range);
    };

    const handleSaveRange = () => {
        if (commitTempRangeIfComplete()) {
            setOpen(false);
        }
    };

    const handleClearRange = () => {
        setTempRange(undefined);
    };

    const displayRangeText =
        startDate && endDate
            ? `${formattedStartDate} - ${formattedEndDate}`
            : placeholder;

    const pickerContent = (
        <>
            <div className="flex justify-center">
                <CalendarComponent
                    mode="range"
                    selected={tempRange}
                    onSelect={handleRangeSelect}
                    numberOfMonths={1}
                    fixedWeeks
                    disabled={
                        forwardOnlyFromToday
                            ? { before: startOfDay(new Date()) }
                            : undefined
                    }
                />
            </div>
            <div className="flex justify-end gap-2 p-4 pt-0.5">
                <Button variant="outline" onClick={handleClearRange}>
                    Clear
                </Button>
                <Button
                    onClick={handleSaveRange}
                    disabled={!tempRange?.from || !tempRange?.to}
                >
                    Save
                </Button>
            </div>
        </>
    );

    const triggerButton = (
        <Button
            variant={'outline'}
            size={buttonSize}
            className={`gap-2 font-semibold text-gray-700 ${buttonClassName}`}
            {...(isMobile && { onClick: () => setOpen(true) })}
        >
            <Calendar className="size-[15px] text-gray-400" />
            {displayRangeText}
        </Button>
    );

    if (isMobile) {
        return (
            <>
                {triggerButton}
                <Sheet open={open} onOpenChange={handleOpenChange}>
                    <SheetContent
                        side="bottom"
                        className="max-h-[90vh] overflow-y-auto"
                    >
                        {dialogTitle && (
                            <SheetHeader>
                                <SheetTitle>{dialogTitle}</SheetTitle>
                            </SheetHeader>
                        )}
                        {pickerContent}
                    </SheetContent>
                </Sheet>
            </>
        );
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                {dialogTitle && (
                    <PopoverHeader className="px-4 pt-4">
                        <PopoverTitle>{dialogTitle}</PopoverTitle>
                    </PopoverHeader>
                )}
                {pickerContent}
            </PopoverContent>
        </Popover>
    );
}
