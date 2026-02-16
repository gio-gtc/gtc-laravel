import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function formatDateInput(value: string | undefined | null): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// invoice slideout, add tour modal, add venue modal, profile modal

interface DatePickerInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    required?: boolean;
}

export default function DatePickerInput({
    id,
    label,
    value,
    onChange,
    className,
    required = false,
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
                    required={required}
                />
            </div>
        </div>
    );
}
