import { Button } from '@/components/ui/button';
import { ExpandableSearch } from '@/components/utils/expandable-search';
import { type OrdersFilterState } from '@/hooks/use-orders-filters';
import OrdersAdvancedFilters from './orders-advanced-filters';

interface OrdersTableHeaderActionsProps {
    selectedOrderCount: number;
    onAddOrderClick: () => void;
    filters: OrdersFilterState;
    onFilterChange: (filters: OrdersFilterState) => void;
    onSearchChange: (query: string) => void;
}

export default function OrdersTableHeaderActions({
    selectedOrderCount,
    onAddOrderClick,
    filters,
    onFilterChange,
    onSearchChange,
}: OrdersTableHeaderActionsProps) {
    return (
        <div className="flex items-center justify-between gap-1 overflow-y-auto">
            <div className="items-center">
                <Button
                    variant="outline"
                    size={'md'}
                    disabled={selectedOrderCount === 0}
                    onClick={onAddOrderClick}
                >
                    Add Order
                </Button>
            </div>
            <div className="flex items-center gap-1">
                <OrdersAdvancedFilters
                    filter={filters}
                    onFilterChange={onFilterChange}
                />
                <ExpandableSearch
                    onSearchChange={onSearchChange}
                    debounceMs={400}
                    placeholder="Search tours, venues, clients…"
                />
            </div>
        </div>
    );
}
