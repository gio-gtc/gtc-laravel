import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format, parse, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

function toISOString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

const DATE_FORMATS = [
    'yyyy-MM-dd',
    'yyyy-M-d',
    'MM/dd/yyyy',
    'M/d/yyyy',
    'MM/dd/yy',
    'M/d/yy',
] as const;

function parseDateInput(input: string): Date | null {
    if (!input.trim()) return null;
    const trimmed = input.trim();

    for (const fmt of DATE_FORMATS) {
        const parsed = parse(trimmed, fmt, new Date());
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
}

interface DatePickerInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    required?: boolean;
    placeholder?: string;
    iconPosition?: 'start' | 'end';
    buttonClassName?: string;
}

// TODO: Make styles align with eachother date range and single
export default function DatePickerInput({
    id,
    label,
    value,
    onChange,
    className,
    required = false,
    placeholder = 'Select date',
    iconPosition = 'start',
    buttonClassName = '',
}: DatePickerInputProps) {
    const [open, setOpen] = useState(false);
    const [tempDate, setTempDate] = useState<Date | undefined>(() =>
        value ? parseISO(value) : undefined,
    );
    const [inputValue, setInputValue] = useState(value || '');

    // Sync input value when value prop changes externally
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            const parsed = value ? parseISO(value) : parseDateInput(inputValue);
            setTempDate(parsed ?? undefined);
        }
        setOpen(isOpen);
    };

    const handleSelect = (date: Date | undefined) => {
        setTempDate(date);
    };

    const handleSave = () => {
        if (tempDate) {
            const iso = toISOString(tempDate);
            onChange(iso);
            setInputValue(iso);
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
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const parsed = parseDateInput(inputValue);
        if (parsed) {
            const iso = toISOString(parsed);
            onChange(iso);
            setInputValue(iso);
        } else if (inputValue.trim() === '') {
            onChange('');
        }
    };

    const calendarIcon = (
        <Calendar className="h-4 w-4 text-gray-400" aria-hidden />
    );

    const calendarButton = (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    type="button"
                    className="h-auto shrink-0 p-0 hover:cursor-pointer hover:bg-transparent"
                    aria-label="Open calendar"
                >
                    {calendarIcon}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                    <CalendarComponent
                        mode="single"
                        selected={tempDate}
                        onSelect={handleSelect}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button onClick={handleSave} disabled={!tempDate}>
                            Save
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );

    return (
        <div className={className}>
            {label ? (
                <Label htmlFor={id} className="pt-2">
                    {label}
                </Label>
            ) : null}
            <div className="flex w-full items-center gap-2 rounded-md border border-input bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 md:text-sm">
                {iconPosition === 'start' ? calendarButton : null}
                <Input
                    id={id}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    required={required}
                    className="min-w-0 flex-1 border-0 px-0 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label={placeholder}
                />
                {iconPosition === 'end' ? calendarButton : null}
            </div>
        </div>
    );
}
