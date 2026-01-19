import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExpandableSearch } from '@/components/utils/expandable-search';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';
import { useMemo } from 'react';

interface InvoiceAdvancedFiltersProps {
    countryFilter: { us: boolean; international: boolean };
    onCountryFilterChange: (filter: {
        us: boolean;
        international: boolean;
    }) => void;
    dateFilter: '30' | '60' | '61+' | null;
    onDateFilterChange: (filter: '30' | '60' | '61+' | null) => void;
    onSearchChange: (query: string) => void;
}

export default function InvoiceAdvancedFilters({
    countryFilter,
    onCountryFilterChange,
    dateFilter,
    onDateFilterChange,
    onSearchChange,
}: InvoiceAdvancedFiltersProps) {
    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        // Country filter is active if not both are selected
        const countryFilterActive =
            !countryFilter.us || !countryFilter.international;
        // Date filter is active if a date filter is selected
        const dateFilterActive = dateFilter !== null;
        return countryFilterActive || dateFilterActive;
    }, [countryFilter, dateFilter]);

    return (
        <div className="flex items-center gap-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Filter
                            className={cn(
                                'size-3',
                                hasActiveFilters && 'fill-current',
                            )}
                        />
                        Filters
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-4">
                    <div className="space-y-4">
                        {/* Country Filter Section */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Country
                            </p>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    variant={
                                        countryFilter.us
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() =>
                                        onCountryFilterChange({
                                            ...countryFilter,
                                            us: !countryFilter.us,
                                        })
                                    }
                                >
                                    US
                                </Button>
                                <Button
                                    variant={
                                        countryFilter.international
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() =>
                                        onCountryFilterChange({
                                            ...countryFilter,
                                            international:
                                                !countryFilter.international,
                                        })
                                    }
                                >
                                    International
                                </Button>
                            </div>
                        </div>

                        {/* Date Filter Section */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Days
                            </p>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button
                                        variant={
                                            dateFilter === '30'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() =>
                                            onDateFilterChange(
                                                dateFilter === '30'
                                                    ? null
                                                    : '30',
                                            )
                                        }
                                    >
                                        30
                                    </Button>
                                    <Button
                                        variant={
                                            dateFilter === '60'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() =>
                                            onDateFilterChange(
                                                dateFilter === '60'
                                                    ? null
                                                    : '60',
                                            )
                                        }
                                    >
                                        60
                                    </Button>
                                    <Button
                                        variant={
                                            dateFilter === '61+'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() =>
                                            onDateFilterChange(
                                                dateFilter === '61+'
                                                    ? null
                                                    : '61+',
                                            )
                                        }
                                    >
                                        61+
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
            <ExpandableSearch
                onSearchChange={onSearchChange}
                placeholder="Search Invoice #, Tour, Market, Venue, Refs..."
            />
        </div>
    );
}
