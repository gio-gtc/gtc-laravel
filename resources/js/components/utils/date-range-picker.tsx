import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
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
    buttonVariant?:
        | 'default'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link'
        | 'destructive';
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
    buttonVariant = 'outline',
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

    const formattedStartDate = formatDateLabel(startDate);
    const formattedEndDate = formatDateLabel(endDate);

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setTempRange(toDateRange(startDate, endDate));
        }
        setOpen(isOpen);
    };

    const handleRangeSelect = (range: DateRange | undefined) => {
        setTempRange(range);
    };

    const handleSaveRange = () => {
        if (tempRange?.from && tempRange?.to) {
            onDateRangeChange({
                startDate: toISOString(tempRange.from),
                endDate: toISOString(tempRange.to),
            });
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

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant={buttonVariant}
                    size={buttonSize}
                    className={`gap-2 ${buttonClassName}`}
                >
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {displayRangeText}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                {dialogTitle && (
                    <PopoverHeader className="px-4 pt-4">
                        <PopoverTitle>{dialogTitle}</PopoverTitle>
                    </PopoverHeader>
                )}
                <div className="p-4">
                    <CalendarComponent
                        mode="range"
                        selected={tempRange}
                        onSelect={handleRangeSelect}
                        numberOfMonths={2}
                        disabled={
                            forwardOnlyFromToday
                                ? { before: startOfDay(new Date()) }
                                : undefined
                        }
                    />
                    <div className="flex justify-end gap-2 pt-4">
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
                </div>
            </PopoverContent>
        </Popover>
    );
}
