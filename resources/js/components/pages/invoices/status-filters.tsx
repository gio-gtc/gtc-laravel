import { Button } from '@/components/ui/button';

interface InvoiceStatusFiltersProps {
    filter: 'all' | 'on-hold' | 'released' | 'reminder';
    onFilterChange: (
        filter: 'all' | 'on-hold' | 'released' | 'reminder',
    ) => void;
}

export default function InvoiceStatusFilters({
    filter,
    onFilterChange,
}: InvoiceStatusFiltersProps) {
    return (
        <div className="flex items-center gap-1">
            <Button
                size={'md'}
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => onFilterChange('all')}
            >
                All
            </Button>
            <Button
                size={'md'}
                variant={filter === 'on-hold' ? 'default' : 'outline'}
                onClick={() => onFilterChange('on-hold')}
            >
                On Hold
            </Button>
            <Button
                size={'md'}
                variant={filter === 'released' ? 'default' : 'outline'}
                onClick={() => onFilterChange('released')}
            >
                Released
            </Button>
            <Button
                size={'md'}
                variant={filter === 'reminder' ? 'default' : 'outline'}
                onClick={() => onFilterChange('reminder')}
            >
                Payment Reminder
            </Button>
        </div>
    );
}
