import DatePickerInput from '@/components/utils/date-picker-input';
import { PlusCircle, XCircle } from 'lucide-react';

type ShowDatesInputListProps = {
    dates: string[];
    onChange: (dates: string[]) => void;
    disabled?: boolean;
    idPrefix?: string;
};

export default function ShowDatesInputList({
    dates,
    onChange,
    disabled = false,
    idPrefix = 'show-date',
}: ShowDatesInputListProps) {
    const addRow = () => {
        onChange([...dates, '']);
    };

    const removeRow = (index: number) => {
        if (dates.length > 1) {
            onChange(dates.filter((_, i) => i !== index));
        }
    };

    const updateRow = (index: number, value: string) => {
        const next = [...dates];
        next[index] = value;
        onChange(next);
    };

    return (
        <div className="space-y-2">
            {dates.map((date, index) => (
                <div
                    key={`${idPrefix}-${index}`}
                    className="flex justify-start gap-2"
                >
                    <DatePickerInput
                        id={`${idPrefix}-${index}`}
                        value={date}
                        onChange={(value) => updateRow(index, value)}
                        required={index === 0}
                        disabled={disabled}
                        inputClassName="pr-9"
                        dialogTitle="Select Show Date"
                    />
                    {!disabled && index === dates.length - 1 && (
                        <button
                            type="button"
                            onClick={addRow}
                            className="text-destructive hover:text-destructive/80"
                            aria-label="Add show date"
                        >
                            <PlusCircle className="h-4 w-4 cursor-pointer" />
                        </button>
                    )}
                    {!disabled &&
                        dates.length > 1 &&
                        index !== dates.length - 1 && (
                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Remove show date"
                            >
                                <XCircle className="h-4 w-4 cursor-pointer" />
                            </button>
                        )}
                </div>
            ))}
        </div>
    );
}
