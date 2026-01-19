import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { useState } from 'react';

// Format date for display
function formatDateLabel(value: string | null) {
    if (!value) return 'Select date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Select date';
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
}

interface DateRangePickerProps {
    startDate: string | null;
    endDate: string | null;
    onDateRangeChange: (range: {
        startDate: string | null;
        endDate: string | null;
    }) => void;
    buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
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
    buttonSize = 'default',
    buttonClassName = '',
    placeholder = 'Select date range',
    dialogTitle = 'Select Date Range',
    allowReversedRange = false,
}: DateRangePickerProps) {
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(startDate || '');
    const [tempEndDate, setTempEndDate] = useState(endDate || '');

    const formattedStartDate = formatDateLabel(startDate);
    const formattedEndDate = formatDateLabel(endDate);

    const handleDateRangeApply = () => {
        onDateRangeChange({
            startDate: tempStartDate || null,
            endDate: tempEndDate || null,
        });
        setIsDateDialogOpen(false);
    };

    const handleCancel = () => {
        // Reset temp dates to current values
        setTempStartDate(startDate || '');
        setTempEndDate(endDate || '');
        setIsDateDialogOpen(false);
    };

    return (
        <Dialog
            open={isDateDialogOpen}
            onOpenChange={(open) => {
                setIsDateDialogOpen(open);
                if (open) {
                    // Initialize temp dates when opening dialog
                    setTempStartDate(startDate || '');
                    setTempEndDate(endDate || '');
                }
            }}
        >
            <DialogTrigger asChild>
                <Button
                    variant={buttonVariant}
                    size={buttonSize}
                    className={`gap-2 ${buttonClassName}`}
                >
                    <Calendar className="h-4 w-4" />
                    {startDate && endDate
                        ? `${formattedStartDate} - ${formattedEndDate}`
                        : placeholder}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                            id="start-date"
                            type="date"
                            value={tempStartDate}
                            onChange={(e) => {
                                setTempStartDate(e.target.value);
                                if (!allowReversedRange && e.target.value > tempEndDate) {
                                    setTempEndDate(e.target.value);
                                }
                            }}
                            max={allowReversedRange ? undefined : (tempEndDate || undefined)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                            id="end-date"
                            type="date"
                            value={tempEndDate}
                            onChange={(e) => {
                                setTempEndDate(e.target.value);
                                if (!allowReversedRange && e.target.value < tempStartDate) {
                                    setTempStartDate(e.target.value);
                                }
                            }}
                            min={allowReversedRange ? undefined : (tempStartDate || undefined)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleDateRangeApply}>Apply</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
