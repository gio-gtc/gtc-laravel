import { cn } from '@/lib/utils';

/** Toggle a value in an array (add if missing, remove if present). */
export function toggleInArray<T>(arr: T[], value: T): T[] {
    if (arr.includes(value)) return arr.filter((v) => v !== value);
    return [...arr, value];
}

/** Shared modal styling. */
export const orderModalStyles = {
    dialogTitle: 'font-bold text-gray-900',
    input: 'text-xs max-h-[30px]',
    selectTrigger: 'rounded-md border-gray-300 bg-white text-xs max-h-[30px]',
    label: 'text-gray-900',
    helper: 'text-gray-500',
    pillBase:
        'w-fit rounded-md transition-colors text-xs hover:text-white max-h-[30px]',
    pillFull: 'w-full rounded-md transition-colors text-xs',
    pillUnselected:
        'border-gray-300 bg-white text-gray-900 hover:bg-brand-gtc-red/80',
    pillSelected:
        'bg-brand-gtc-red/70 text-white hover:bg-brand-gtc-red/60 hover:text-white',
    /** Pill-shaped field — unselected pill look without hover. */
    pillInput:
        'w-fit rounded-md border border-gray-300 bg-white text-gray-900 text-xs max-h-[30px] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400',
    pillInputSelected: 'border-brand-gtc-red/70 bg-brand-gtc-red/70 text-white placeholder:text-white/70',
    cancelButton:
        'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900',
    primaryButton: 'bg-brand-gtc-red text-white hover:bg-brand-gtc-red/70',
} as const;

/** Class names for a pill button (multi or single select). */
export function pillButtonClassName(
    selected: boolean,
    base: string = orderModalStyles.pillBase,
    className?: string,
    disabled?: boolean,
): string {
    return cn(
        base,
        orderModalStyles.pillUnselected,
        selected && orderModalStyles.pillSelected,
        disabled &&
            !selected &&
            'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-60 hover:bg-gray-50 hover:text-gray-400',
        disabled &&
            selected &&
            'cursor-not-allowed opacity-80 hover:bg-brand-gtc-red/70 hover:text-white',
        className,
    );
}
