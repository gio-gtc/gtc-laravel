import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { useState } from 'react';

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
    allowReversedRange?: boolean;
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
    allowReversedRange = false,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [tempRange, setTempRange] = useState<DateRange | undefined>(() =>
        toDateRange(startDate, endDate),
    );
    const [tempStartDate, setTempStartDate] = useState<Date | undefined>(() =>
        startDate ? parseISO(startDate) : undefined,
    );
    const [tempEndDate, setTempEndDate] = useState<Date | undefined>(() =>
        endDate ? parseISO(endDate) : undefined,
    );

    const formattedStartDate = formatDateLabel(startDate);
    const formattedEndDate = formatDateLabel(endDate);

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setTempRange(toDateRange(startDate, endDate));
            setTempStartDate(startDate ? parseISO(startDate) : undefined);
            setTempEndDate(endDate ? parseISO(endDate) : undefined);
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

    const handleClearReversed = () => {
        setTempStartDate(undefined);
        setTempEndDate(undefined);
    };

    const handleSingleStartSelect = (date: Date | undefined) => {
        setTempStartDate(date);
    };

    const handleSingleEndSelect = (date: Date | undefined) => {
        setTempEndDate(date);
    };

    const handleSaveReversed = () => {
        onDateRangeChange({
            startDate: tempStartDate ? toISOString(tempStartDate) : null,
            endDate: tempEndDate ? toISOString(tempEndDate) : null,
        });
        setOpen(false);
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
                    <Calendar className="h-4 w-4 text-gray-icon" />
                    {displayRangeText}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                {dialogTitle && (
                    <PopoverHeader className="px-4 pt-4">
                        <PopoverTitle>{dialogTitle}</PopoverTitle>
                    </PopoverHeader>
                )}
                {allowReversedRange ? (
                    <div className="flex flex-col gap-4 p-4">
                        <div className="flex justify-center gap-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Start Date
                                </p>
                                <CalendarComponent
                                    mode="single"
                                    selected={tempStartDate}
                                    onSelect={handleSingleStartSelect}
                                    initialFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    End Date
                                </p>
                                <CalendarComponent
                                    mode="single"
                                    selected={tempEndDate}
                                    onSelect={handleSingleEndSelect}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={handleClearReversed}
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={handleSaveReversed}
                                disabled={!tempStartDate || !tempEndDate}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        <CalendarComponent
                            mode="range"
                            selected={tempRange}
                            onSelect={handleRangeSelect}
                            numberOfMonths={2}
                            initialFocus
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={handleClearRange}
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={handleSaveRange}
                                disabled={
                                    !tempRange?.from || !tempRange?.to
                                }
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
