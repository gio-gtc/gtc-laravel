import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CreateBtn } from './create-btn';
import { RecentOrders } from './recent-orders';

function isNavItemActive(
    item: NavItem,
    url: string,
    allItems: NavItem[],
): boolean {
    const resolved = resolveUrl(item.href);
    const path = resolved.split('?')[0];
    const urlPath = url.split('?')[0];
    if (!urlPath.startsWith(path)) return false;

    const queryIndex = url.indexOf('?');
    const params = new URLSearchParams(
        queryIndex >= 0 ? url.slice(queryIndex) : '',
    );
    const filter = params.get('filter');

    if (item.filterParam) {
        return filter === item.filterParam;
    }
    // No filterParam: active when no other item's filterParam matches current filter
    const hasMatchingFilterParam = allItems.some(
        (other) =>
            other !== item &&
            other.filterParam != null &&
            other.filterParam === filter,
    );
    return !hasMatchingFilterParam;
}

export { RecentOrders };
export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu className="mt-3 gap-3">
                <CreateBtn />
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild={item.href === '' ? false : true}
                            isActive={isNavItemActive(item, page.url, items)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
