import { Button } from '@/components/ui/button';
import { type OrdersFilterState } from '@/hooks/use-orders-filters';
import OrdersAdvancedFilters from './orders-advanced-filters';
import OrdersSearchFilter from './orders-search-filter';

interface OrdersTableHeaderActionsProps {
    selectedOrderCount: number;
    onAddOrderClick: () => void;
    filters: OrdersFilterState;
    onFilterChange: (filters: OrdersFilterState) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isSearching?: boolean;
}

export default function OrdersTableHeaderActions({
    selectedOrderCount,
    onAddOrderClick,
    filters,
    onFilterChange,
    searchQuery,
    onSearchChange,
    isSearching = false,
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
                <OrdersSearchFilter
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    isSearching={isSearching}
                />
            </div>
        </div>
    );
}
