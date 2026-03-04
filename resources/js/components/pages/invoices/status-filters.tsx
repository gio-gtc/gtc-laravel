import { Button } from '@/components/ui/button';

interface InvoiceStatusFiltersProps {
    filter: 'all' | 'on-hold' | 'released';
    onFilterChange: (filter: 'all' | 'on-hold' | 'released') => void;
    selectedCount?: number;
    onSendReminder?: () => void;
}

export default function InvoiceStatusFilters({
    filter,
    onFilterChange,
    selectedCount = 0,
    onSendReminder,
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
            {onSendReminder && (
                <Button
                    size={'md'}
                    variant="outline"
                    onClick={onSendReminder}
                    disabled={selectedCount === 0}
                >
                    Send Payment Reminder
                </Button>
            )}
        </div>
    );
}
