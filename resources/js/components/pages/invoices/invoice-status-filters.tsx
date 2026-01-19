import { Button } from '@/components/ui/button';

interface InvoiceStatusFiltersProps {
    filter: 'all' | 'on-hold' | 'released';
    onFilterChange: (filter: 'all' | 'on-hold' | 'released') => void;
}

export default function InvoiceStatusFilters({
    filter,
    onFilterChange,
}: InvoiceStatusFiltersProps) {
    return (
        <div className="flex items-center gap-1">
            <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => onFilterChange('all')}
            >
                All
            </Button>
            <Button
                variant={filter === 'on-hold' ? 'default' : 'outline'}
                onClick={() => onFilterChange('on-hold')}
            >
                On Hold
            </Button>
            <Button
                variant={filter === 'released' ? 'default' : 'outline'}
                onClick={() => onFilterChange('released')}
            >
                Released
            </Button>
        </div>
    );
}
