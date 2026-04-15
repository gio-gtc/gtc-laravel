import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input, InputVariants } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { cn } from '@/lib/utils';
import { format, parseISO, startOfDay } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Matcher } from 'react-day-picker';

function toISOString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

function isoToMasked(iso: string): string {
    if (!iso || iso.length !== 10) return '';
    const [yyyy, mm, dd] = iso.split('-');
    return `${mm}/${dd}/${yyyy}`;
}

function formatForMask(digits: string): string {
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

function parseMaskedValue(masked: string): Date | null {
    if (masked.length !== 10) return null;
    const parts = masked.split('/');
    if (parts.length !== 3) return null;
    const [mm, dd, yyyy] = parts.map(Number);
    const d = new Date(yyyy, mm - 1, dd);
    return d.getFullYear() === yyyy &&
        d.getMonth() === mm - 1 &&
        d.getDate() === dd
        ? d
        : null;
}

function toDate(v: string | Date): Date {
    return typeof v === 'string' ? parseISO(v) : v;
}

interface DatePickerInputProps {
    id: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    variant?: InputVariants;
    required?: boolean;
    placeholder?: string;
    inputClassName?: string;
    dialogTitle?: string;
    forwardOnlyFromToday?: boolean;
    minDate?: string | Date;
    maxDate?: string | Date;
    name?: string;
    disabled?: boolean;
}

export default function DatePickerInput({
    id,
    label,
    value,
    onChange,
    className,
    variant = 'default',
    required = false,
    placeholder = 'mm/dd/yyyy',
    inputClassName = '',
    dialogTitle = 'Select Date',
    forwardOnlyFromToday = false,
    minDate,
    maxDate,
    name,
    disabled = false,
}: DatePickerInputProps) {
    const [open, setOpen] = useState(false);
    const [tempDate, setTempDate] = useState<Date | undefined>(() =>
        value ? parseISO(value) : undefined,
    );
    const [inputValue, setInputValue] = useState(() =>
        value ? isoToMasked(value) : '',
    );
    const isMobile = useIsMobile();

    const containerVariantClasses = cn(
        variant === 'invoiceSlideout' && 'max-w-[130px]',
        variant === 'default' && 'max-w-[150px]',
    );

    useEffect(() => {
        setInputValue(value ? isoToMasked(value) : '');
    }, [value]);

    const commitTempDate = (date: Date | undefined) => {
        if (!date) return;
        const iso = toISOString(date);
        onChange(iso);
        setInputValue(isoToMasked(iso));
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (disabled && isOpen) return;
        if (isOpen) {
            const parsed = value
                ? parseISO(value)
                : parseMaskedValue(inputValue);
            setTempDate(parsed ?? undefined);
        } else {
            commitTempDate(tempDate);
        }
        setOpen(isOpen);
    };

    const handleSelect = (date: Date | undefined) => {
        setTempDate(date);
    };

    const handleSave = () => {
        if (tempDate) {
            commitTempDate(tempDate);
            setOpen(false);
        }
    };

    const handleClear = () => {
        setTempDate(undefined);
        onChange('');
        setInputValue('');
        setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        const capped = raw.slice(0, 8);
        setInputValue(formatForMask(capped));
    };

    const handleInputBlur = () => {
        const parsed = parseMaskedValue(inputValue);
        if (parsed) {
            const iso = toISOString(parsed);
            onChange(iso);
            setInputValue(isoToMasked(iso));
        } else if (inputValue.trim() === '') {
            onChange('');
        }
    };

    const calendarIcon = (
        <Calendar className="h-4 w-4 text-gray-400" aria-hidden />
    );

    const disabledMatchers: Matcher[] = [];
    if (minDate) disabledMatchers.push({ before: toDate(minDate) });
    if (maxDate) disabledMatchers.push({ after: toDate(maxDate) });
    if (forwardOnlyFromToday)
        disabledMatchers.push({ before: startOfDay(new Date()) });
    const calendarDisabled: Matcher[] | undefined =
        disabledMatchers.length > 0 ? disabledMatchers : undefined;

    const pickerContent = (
        <>
            <div className="flex justify-center">
                <CalendarComponent
                    mode="single"
                    selected={tempDate}
                    onSelect={handleSelect}
                    fixedWeeks
                    disabled={calendarDisabled}
                />
            </div>
            <div className="flex justify-end gap-2 p-4 pt-0">
                <Button variant="outline" onClick={handleClear}>
                    Clear
                </Button>
                <Button onClick={handleSave} disabled={!tempDate}>
                    Save
                </Button>
            </div>
        </>
    );

    const calendarButton = (
        <Button
            variant="ghost"
            type="button"
            disabled={disabled}
            className={cn(
                'absolute right-0 h-auto shrink-0 p-0 hover:cursor-pointer hover:bg-transparent',
            )}
            aria-label="Open calendar"
            {...(isMobile && {
                onClick: () => !disabled && setOpen(true),
            })}
        >
            {calendarIcon}
        </Button>
    );

    if (isMobile) {
        return (
            <div
                className={cn(
                    className,
                    disabled && 'pointer-events-none opacity-50',
                )}
            >
                {name ? (
                    <input type="hidden" name={name} value={value} />
                ) : null}
                {label ? (
                    <Label htmlFor={id} className="pt-2">
                        {label}
                    </Label>
                ) : null}
                <div
                    className={cn(
                        'relative flex w-full items-center gap-2 rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                        containerVariantClasses,
                    )}
                >
                    {calendarButton}
                    <Input
                        id={id}
                        type="text"
                        variant={variant}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        className={cn(
                            'min-w-0 flex-1 border-0 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
                            inputClassName,
                        )}
                        aria-label={placeholder}
                    />
                </div>
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
            </div>
        );
    }

    return (
        <div
            className={cn(
                className,
                disabled && 'pointer-events-none opacity-50',
            )}
        >
            {name ? <input type="hidden" name={name} value={value} /> : null}
            {label ? (
                <Label htmlFor={id} className="pt-2">
                    {label}
                </Label>
            ) : null}
            <div
                className={cn(
                    'relative flex w-full items-center gap-2 rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                    containerVariantClasses,
                )}
            >
                <Popover open={open} onOpenChange={handleOpenChange}>
                    <PopoverTrigger asChild>{calendarButton}</PopoverTrigger>
                    <PopoverContent
                        onWheel={(e) => e.stopPropagation()}
                        className="max-h-[var(--radix-popover-content-available-height)] w-auto overflow-y-auto p-0"
                        align="start"
                    >
                        {dialogTitle && (
                            <PopoverHeader className="px-4 pt-4">
                                <PopoverTitle>{dialogTitle}</PopoverTitle>
                            </PopoverHeader>
                        )}
                        {pickerContent}
                    </PopoverContent>
                </Popover>
                <Input
                    id={id}
                    type="text"
                    variant={variant}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={cn(
                        'min-w-0 flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
                        inputClassName,
                    )}
                    aria-label={placeholder}
                />
            </div>
        </div>
    );
}
