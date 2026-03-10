import { Button } from '@/components/ui/button';
import { type OrdersFilterState } from '@/hooks/use-orders-filters';
import { type Tour, type TourVenue, type User, type Venue } from '@/types';
import OrdersAdvancedFilters from './orders-advanced-filters';
import OrdersSearchFilter from './orders-search-filter';

export type GroupedOrderData = {
    order: Tour;
    venues: Array<{
        orderVenue: TourVenue;
        venue: Venue;
    }>;
};

interface OrdersTableHeaderActionsProps {
    selectedVenueCount: number;
    onAddVenueClick: () => void;
    filters: OrdersFilterState;
    onFilterChange: (filters: OrdersFilterState) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    groupedData: GroupedOrderData[];
    getClientUser: (clientId: number) => User | undefined;
    getVenueCollaborators: (venueId: number) => User[];
}

export default function OrdersTableHeaderActions({
    selectedVenueCount,
    onAddVenueClick,
    filters,
    onFilterChange,
    searchQuery,
    onSearchChange,
    groupedData,
    getClientUser,
    getVenueCollaborators,
}: OrdersTableHeaderActionsProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size={'md'}
                    disabled={selectedVenueCount === 0}
                    onClick={onAddVenueClick}
                >
                    Add Venue
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
                    groupedData={groupedData}
                    getClientUser={getClientUser}
                    getVenueCollaborators={getVenueCollaborators}
                />
            </div>
        </div>
    );
}
