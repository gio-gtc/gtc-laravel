import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { orderModalStyles } from './shared';

interface TextPillInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    onCommit: () => void;
    disabled?: boolean;
    selected?: boolean;
    placeholder?: string;
    className?: string;
    numericOnly?: boolean;
}

export default function TextPillInput({
    id,
    value,
    onChange,
    onCommit,
    disabled = false,
    selected = false,
    placeholder,
    className,
    numericOnly = false,
}: TextPillInputProps) {
    const resolvedPlaceholder = placeholder ?? (numericOnly ? 'Sec' : 'Custom');

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onCommit();
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        onChange(numericOnly ? raw.replace(/[^\d]/g, '') : raw);
    };

    return (
        <Input
            id={id}
            type="text"
            inputMode={numericOnly ? 'numeric' : undefined}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={onCommit}
            disabled={disabled}
            placeholder={resolvedPlaceholder}
            variant="orderSlideoutpopup"
            className={cn(
                orderModalStyles.pillInput,
                selected && orderModalStyles.pillInputSelected,
                className,
            )}
        />
    );
}
