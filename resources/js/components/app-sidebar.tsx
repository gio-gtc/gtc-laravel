import { NavMain, RecentOrders } from '@/components/globals/navigation/';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { dashboard, invoices, orders } from '@/routes';
import { type NavItem } from '@/types';
import { Receipt } from 'lucide-react';
import { ClipboardTimeIcon, HomeIcon, ListCheckIcon } from './ui/icons';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: dashboard(),
        icon: HomeIcon,
    },
    {
        title: 'Orders',
        href: orders(),
        icon: ClipboardTimeIcon,
    },
    {
        title: 'My Tasks',
        href: `${resolveUrl(orders())}?filter=my-tasks`,
        icon: ListCheckIcon,
        filterParam: 'my-tasks',
    },
    // TODO: only seen by managers and Russ/James/David
    {
        title: 'Invoices',
        href: invoices(),
        icon: Receipt,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="sticky border-t border-[#5b5b5c] bg-foreground text-white"
        >
            <SidebarContent>
                <NavMain items={mainNavItems} />
                <RecentOrders />
            </SidebarContent>
        </Sidebar>
    );
}
