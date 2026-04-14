import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface LabelCheckProps {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}

export function LabelCheck({
    id,
    label,
    checked,
    onCheckedChange,
    className,
}: LabelCheckProps) {
    return (
        <label
            htmlFor={id}
            className={cn(
                'relative flex cursor-pointer items-center gap-2 text-sm',
                className,
            )}
        >
            <input
                id={id}
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={(e) => onCheckedChange(e.target.checked)}
            />
            <span>{label}</span>
            <span className="pointer-events-none right-2 flex size-3.5 items-center justify-center text-muted-foreground peer-checked:text-brand-gtc-red">
                <CheckIcon className="size-4" />
            </span>
        </label>
    );
}
