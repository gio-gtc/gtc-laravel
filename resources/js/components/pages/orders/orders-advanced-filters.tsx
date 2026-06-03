import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Divider from '@/components/utils/divider';
import FilterUserGroupSection from '@/components/utils/filter-user-group-section';
import { useOrdersCatalog } from '@/contexts/orders-catalog-context';
import { useOrdersFilterUsers } from '@/hooks/use-orders-filter-users';
import {
    type OrdersFilterState,
    DEFAULT_FILTERS,
} from '@/hooks/use-orders-filters';
import { cn } from '@/lib/utils';
import type { AwaitingAssetTag, OrderStatus } from '@/types/orders-api';
import { usePage } from '@inertiajs/react';
import { Filter, X } from 'lucide-react';
import { useMemo } from 'react';

interface OrdersAdvancedFiltersProps {
    filter: OrdersFilterState;
    onFilterChange: (filter: OrdersFilterState) => void;
}

export default function OrdersAdvancedFilters({
    filter,
    onFilterChange,
}: OrdersAdvancedFiltersProps) {
    const { url } = usePage();
    const searchParams = new URL(url, window.location.origin).searchParams;
    const isMyTasksFilterActive = searchParams.get('filter') === 'my-tasks';

    const { order_status_options: orderStatusOptions } = useOrdersCatalog();
    const { clientUsers, collaboratorUsers } = useOrdersFilterUsers();

    const selectedClients = useMemo(
        () => clientUsers.filter((u) => filter.clientIds.includes(u.id)),
        [clientUsers, filter.clientIds],
    );
    const selectedCollaborators = useMemo(
        () =>
            collaboratorUsers.filter((u) =>
                filter.collaboratorIds.includes(u.id),
            ),
        [collaboratorUsers, filter.collaboratorIds],
    );

    const hasActiveFilters = useMemo(() => {
        const clientActive = filter.clientIds.length > 0;
        const collaboratorActive =
            filter.collaboratorIds.length > 0 || filter.myCollaborators;
        const statusActive = filter.statuses.length > 0;
        const assetTagsActive = filter.assetTags.length > 0;
        const countryActive =
            !filter.country.us || !filter.country.international;
        return (
            clientActive ||
            collaboratorActive ||
            statusActive ||
            assetTagsActive ||
            countryActive
        );
    }, [filter]);

    const toggleAssetTag = (tag: AwaitingAssetTag) => {
        const isSelected = filter.assetTags.includes(tag);
        onFilterChange({
            ...filter,
            assetTags: isSelected
                ? filter.assetTags.filter((t) => t !== tag)
                : [...filter.assetTags, tag],
        });
    };

    const assetTagOptions: { value: AwaitingAssetTag; label: string }[] = [
        { value: 'Voice Over', label: 'Voice Over' },
        { value: 'Audio', label: 'Audio Tracks' },
        { value: 'Art', label: 'Key Art / Assets' },
    ];

    const handleClearFilters = () => {
        onFilterChange(DEFAULT_FILTERS);
    };

    const toggleStatus = (status: OrderStatus) => {
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
                        selectedUsers={selectedClients}
                        onUsersChange={(users) =>
                            onFilterChange({
                                ...filter,
                                clientIds: users.map((u) => u.id),
                            })
                        }
                        availableUsers={clientUsers.filter(
                            (u) => !filter.clientIds.includes(u.id),
                        )}
                    />

                    {!isMyTasksFilterActive && (
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
                            availableUsers={collaboratorUsers.filter(
                                (u) => !filter.collaboratorIds.includes(u.id),
                            )}
                        />
                    )}

                    {isMyTasksFilterActive && (
                        <p className="text-sm text-muted-foreground">
                            Assignee filtering is locked while My Tasks view is
                            active.
                        </p>
                    )}

                    <div className="space-y-2">
                        <p className="text-sm font-medium">Asset Bottlenecks</p>
                        <div className="flex flex-wrap gap-2">
                            {assetTagOptions.map((opt) => (
                                <Button
                                    key={opt.value}
                                    variant={
                                        filter.assetTags.includes(opt.value)
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    size="sm"
                                    onClick={() => toggleAssetTag(opt.value)}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">Status</p>
                        <div className="flex flex-wrap gap-2">
                            {orderStatusOptions.map((opt) => (
                                <Button
                                    key={opt.value}
                                    variant={
                                        filter.statuses.includes(opt.value)
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    size="sm"
                                    onClick={() => toggleStatus(opt.value)}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </div>

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
