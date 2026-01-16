import { differenceInCalendarDays } from 'date-fns';

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function getDaysRemaining(
    targetDate: string | null,
    id?: number,
): number {
    if (targetDate === null) {
        console.log(`Release date missing! ID: ${id}`);
        return 0;
    }
    return differenceInCalendarDays(new Date(targetDate), new Date());
}
