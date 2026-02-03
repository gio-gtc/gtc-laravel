import { cn } from '@/lib/utils';

/** Toggle a value in an array (add if missing, remove if present). */
export function toggleInArray<T>(arr: T[], value: T): T[] {
    if (arr.includes(value)) return arr.filter((v) => v !== value);
    return [...arr, value];
}

/** Shared modal styling. */
export const orderModalStyles = {
    dialogTitle: 'font-bold text-gray-900',
    selectTrigger: 'rounded-md border-gray-300 bg-white text-xs',
    label: 'text-gray-900',
    helper: 'text-gray-500',
    pillBase: 'w-fit rounded-md transition-colors text-xs',
    pillFull: 'w-full rounded-md transition-colors text-xs',
    pillUnselected:
        'border-gray-300 bg-white text-gray-900 hover:bg-brand-gtc-red/80',
    pillSelected:
        'bg-brand-gtc-red/70 text-white hover:bg-brand-gtc-red/60 hover:text-white',
    cancelButton:
        'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900',
    primaryButton: 'bg-brand-gtc-red text-white hover:bg-brand-gtc-red/70',
} as const;

/** Class names for a pill button (multi or single select). */
export function pillButtonClassName(
    selected: boolean,
    base: string = orderModalStyles.pillBase,
    className?: string,
): string {
    return cn(
        base,
        orderModalStyles.pillUnselected,
        selected && orderModalStyles.pillSelected,
        className,
    );
}
