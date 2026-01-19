import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExpandableSearch } from '@/components/utils/expandable-search';
import DateRangePicker from '@/components/utils/date-range-picker';
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
    dateRangeFilter: { startDate: string | null; endDate: string | null };
    onDateRangeFilterChange: (filter: {
        startDate: string | null;
        endDate: string | null;
    }) => void;
    onSearchChange: (query: string) => void;
}

export default function InvoiceAdvancedFilters({
    countryFilter,
    onCountryFilterChange,
    dateFilter,
    onDateFilterChange,
    dateRangeFilter,
    onDateRangeFilterChange,
    onSearchChange,
}: InvoiceAdvancedFiltersProps) {
    // Allow reversed date ranges (start date can be after end date)
    const allowReversedRange = true;

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        // Country filter is active if not both are selected
        const countryFilterActive =
            !countryFilter.us || !countryFilter.international;
        // Date filter is active if a date filter is selected
        const dateFilterActive = dateFilter !== null;
        // Date range filter is active if both dates are set
        const dateRangeFilterActive =
            dateRangeFilter.startDate !== null &&
            dateRangeFilter.endDate !== null;
        return countryFilterActive || dateFilterActive || dateRangeFilterActive;
    }, [countryFilter, dateFilter, dateRangeFilter]);

    const handleDateRangeChange = (range: {
        startDate: string | null;
        endDate: string | null;
    }) => {
        onDateRangeFilterChange(range);
        // Clear days filter when date range is applied
        if (range.startDate && range.endDate) {
            onDateFilterChange(null);
        }
    };

    const handleDaysFilterClick = (value: '30' | '60' | '61+') => {
        // Clear date range when Days filter is selected
        onDateRangeFilterChange({ startDate: null, endDate: null });
        // Toggle the days filter
        onDateFilterChange(dateFilter === value ? null : value);
    };

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
                                            handleDaysFilterClick('30')
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
                                            handleDaysFilterClick('60')
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
                                            handleDaysFilterClick('61+')
                                        }
                                    >
                                        61+
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Date Range Filter Section */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Date Range
                            </p>
                            <DateRangePicker
                                startDate={dateRangeFilter.startDate}
                                endDate={dateRangeFilter.endDate}
                                onDateRangeChange={handleDateRangeChange}
                                buttonVariant="secondary"
                                buttonSize="sm"
                                buttonClassName="w-full justify-start"
                                placeholder="Select date range"
                                allowReversedRange={allowReversedRange}
                            />
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
