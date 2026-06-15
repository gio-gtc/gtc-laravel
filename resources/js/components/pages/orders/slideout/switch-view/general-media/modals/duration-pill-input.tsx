import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { orderModalStyles } from './shared';

interface DurationPillInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    onCommit: () => void;
    disabled?: boolean;
    selected?: boolean;
    placeholder?: string;
    className?: string;
}

export default function DurationPillInput({
    id,
    value,
    onChange,
    onCommit,
    disabled = false,
    selected = false,
    placeholder = 'Sec',
    className,
}: DurationPillInputProps) {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onCommit();
        }
    };

    return (
        <Input
            id={id}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(event) =>
                onChange(event.target.value.replace(/[^\d]/g, ''))
            }
            onKeyDown={handleKeyDown}
            onBlur={onCommit}
            disabled={disabled}
            placeholder={placeholder}
            variant="orderSlideoutpopup"
            className={cn(
                orderModalStyles.pillInput,
                selected && orderModalStyles.pillInputSelected,
                className,
            )}
        />
    );
}
