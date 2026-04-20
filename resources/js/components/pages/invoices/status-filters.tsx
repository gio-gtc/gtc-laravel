import { Button } from '@/components/ui/button';

type InvoiceStatusFilter = 'all' | 'on-hold' | 'released' | 'reminder';

const INVOICE_STATUS_FILTER_OPTIONS: {
    value: InvoiceStatusFilter;
    label: string;
}[] = [
    { value: 'all', label: 'All' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'released', label: 'Released' },
    { value: 'reminder', label: 'Payment Reminder' },
];

interface InvoiceStatusFiltersProps {
    filter: InvoiceStatusFilter;
    onFilterChange: (filter: InvoiceStatusFilter) => void;
}

export default function InvoiceStatusFilters({
    filter,
    onFilterChange,
}: InvoiceStatusFiltersProps) {
    return (
        <div className="flex items-center gap-1">
            {INVOICE_STATUS_FILTER_OPTIONS.map(({ value, label }) => (
                <Button
                    key={value}
                    size="md"
                    variant={filter === value ? 'default' : 'outline'}
                    onClick={() => onFilterChange(value)}
                >
                    {label}
                </Button>
            ))}
        </div>
    );
}
