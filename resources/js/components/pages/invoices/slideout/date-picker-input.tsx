import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

function formatDateInput(value: string | undefined | null): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

interface DatePickerInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function DatePickerInput({
    id,
    label,
    value,
    onChange,
    className,
}: DatePickerInputProps) {
    return (
        <div className={className}>
            <Label htmlFor={id} className="pt-2">
                {label}
            </Label>
            <div className="relative">
                <Input
                    id={id}
                    type="date"
                    value={formatDateInput(value)}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => {
                        const el = document.getElementById(
                            id,
                        ) as HTMLInputElement | null;
                        el?.showPicker?.();
                        el?.focus();
                        el?.click();
                    }}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <Calendar className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
