import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Divider from '@/components/utils/divider';
import FilterUserGroupSection from '@/components/utils/filter-user-group-section';
import {
    type OrdersFilterState,
    DEFAULT_FILTERS,
} from '@/hooks/use-orders-filters';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { cn } from '@/lib/utils';
import { type TourVenue } from '@/types';
import { Filter, X } from 'lucide-react';
import { useMemo } from 'react';

const STATUS_OPTIONS: { value: TourVenue['status']; label: string }[] = [
    { value: 'edit', label: 'Edit' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
];

interface OrdersAdvancedFiltersProps {
    filter: OrdersFilterState;
    onFilterChange: (filter: OrdersFilterState) => void;
}

export default function OrdersAdvancedFilters({
    filter,
    onFilterChange,
}: OrdersAdvancedFiltersProps) {
    const usersWithFallback = useUsersWithFallback();

    const selectedClients = useMemo(
        () => usersWithFallback.filter((u) => filter.clientIds.includes(u.id)),
        [usersWithFallback, filter.clientIds],
    );
    const selectedCollaborators = useMemo(
        () =>
            usersWithFallback.filter((u) =>
                filter.collaboratorIds.includes(u.id),
            ),
        [usersWithFallback, filter.collaboratorIds],
    );

    const hasActiveFilters = useMemo(() => {
        const clientActive = filter.clientIds.length > 0 || filter.myClients;
        const collaboratorActive =
            filter.collaboratorIds.length > 0 || filter.myCollaborators;
        const statusActive = filter.statuses.length > 0;
        const countryActive =
            !filter.country.us || !filter.country.international;
        return (
            clientActive || collaboratorActive || statusActive || countryActive
        );
    }, [filter]);

    const handleClearFilters = () => {
        onFilterChange(DEFAULT_FILTERS);
    };

    const toggleStatus = (status: TourVenue['status']) => {
        const isSelected = filter.statuses.includes(status);
        onFilterChange({
            ...filter,
            statuses: isSelected
                ? filter.statuses.filter((s) => s !== status)
                : [...filter.statuses, status],
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size={'md'}>
                    <Filter
                        className={cn(
                            'size-3 text-gray-400',
                            hasActiveFilters && 'fill-current',
                        )}
                    />
                    Filters
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="max-h-[80vh] w-80 overflow-y-auto p-4"
            >
                <div className="space-y-4">
                    <FilterUserGroupSection
                        title="Clients"
                        myChecked={filter.myClients}
                        onMyChange={(checked) =>
                            onFilterChange({
                                ...filter,
                                myClients: checked,
                            })
                        }
                        selectedUsers={selectedClients}
                        onUsersChange={(users) =>
                            onFilterChange({
                                ...filter,
                                clientIds: users.map((u) => u.id),
                            })
                        }
                        availableUsers={usersWithFallback.filter(
                            (u) => !filter.clientIds.includes(u.id),
                        )}
                    />

                    <FilterUserGroupSection
                        title="Collaborators"
                        myChecked={filter.myCollaborators}
                        onMyChange={(checked) =>
                            onFilterChange({
                                ...filter,
                                myCollaborators: checked,
                            })
                        }
                        selectedUsers={selectedCollaborators}
                        onUsersChange={(users) =>
                            onFilterChange({
                                ...filter,
                                collaboratorIds: users.map((u) => u.id),
                            })
                        }
                        availableUsers={usersWithFallback.filter(
                            (u) => !filter.collaboratorIds.includes(u.id),
                        )}
                    />

                    {/* Status Section */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Status</p>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((opt) => (
                                <Button
                                    key={opt.label}
                                    variant={
                                        filter.statuses.includes(opt.value)
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    size="sm"
                                    className="capitalize"
                                    onClick={() => toggleStatus(opt.value)}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Country Section */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Country</p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                variant={
                                    filter.country.us ? 'default' : 'secondary'
                                }
                                size="sm"
                                className="w-full justify-start"
                                onClick={() =>
                                    onFilterChange({
                                        ...filter,
                                        country: {
                                            ...filter.country,
                                            us: !filter.country.us,
                                        },
                                    })
                                }
                            >
                                US
                            </Button>
                            <Button
                                variant={
                                    filter.country.international
                                        ? 'default'
                                        : 'secondary'
                                }
                                size="sm"
                                className="w-full justify-start"
                                onClick={() =>
                                    onFilterChange({
                                        ...filter,
                                        country: {
                                            ...filter.country,
                                            international:
                                                !filter.country.international,
                                        },
                                    })
                                }
                            >
                                International
                            </Button>
                        </div>
                    </div>

                    <Divider />
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            onClick={handleClearFilters}
                            disabled={!hasActiveFilters}
                            className="cursor-pointer"
                        >
                            <X className="size-3" />
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
