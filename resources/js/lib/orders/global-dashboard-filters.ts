import type { OrdersFilterState } from '@/hooks/use-orders-filters';
import type { GlobalDashboardFilters } from '@/types/orders-api';

export function isMyTasksFilterActive(url: string): boolean {
    const queryIndex = url.indexOf('?');
    const params = new URLSearchParams(
        queryIndex >= 0 ? url.slice(queryIndex) : '',
    );

    return params.get('filter') === 'my-tasks';
}

export function ordersFilterStateToGlobalFilters(
    filters: OrdersFilterState,
    options: {
        search?: string;
        url: string;
    },
): GlobalDashboardFilters {
    const global: GlobalDashboardFilters = {};

    const trimmedSearch = options.search?.trim();
    if (trimmedSearch) {
        global.search = trimmedSearch;
    }

    if (filters.clientIds.length > 0) {
        global.client_ids = [...filters.clientIds];
    }

    if (
        filters.collaboratorIds.length > 0 &&
        !isMyTasksFilterActive(options.url)
    ) {
        global.assignee_ids = [...filters.collaboratorIds];
    }

    if (filters.statuses.length > 0) {
        global.statuses = [...filters.statuses];
    }

    if (filters.assetTags.length > 0) {
        global.asset_tags = [...filters.assetTags];
    }

    const { us, international } = filters.country;
    if (us && !international) {
        global.is_international = false;
    } else if (!us && international) {
        global.is_international = true;
    }

    if (isMyTasksFilterActive(options.url)) {
        global.filter = 'my-tasks';
    }

    return global;
}

export function hasRegionalFilter(filters: OrdersFilterState): boolean {
    return !filters.country.us || !filters.country.international;
}

export function buildFilterCacheKey(filters: GlobalDashboardFilters): string {
    const params = buildGlobalFilterParams(filters);
    return params.toString();
}

export function buildGlobalFilterParams(
    filters: GlobalDashboardFilters,
): URLSearchParams {
    const params = new URLSearchParams();

    if (filters.search) {
        params.set('search', filters.search);
    }

    for (const id of filters.client_ids ?? []) {
        params.append('client_ids[]', String(id));
    }

    for (const id of filters.assignee_ids ?? []) {
        params.append('assignee_ids[]', String(id));
    }

    for (const status of filters.statuses ?? []) {
        params.append('statuses[]', status);
    }

    for (const tag of filters.asset_tags ?? []) {
        params.append('asset_tags[]', tag);
    }

    if (filters.is_international !== undefined) {
        params.set('is_international', filters.is_international ? 'true' : 'false');
    }

    if (filters.filter === 'my-tasks') {
        params.set('filter', 'my-tasks');
    }

    return params;
}
