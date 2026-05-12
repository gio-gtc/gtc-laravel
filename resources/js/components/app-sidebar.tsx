import { NavMain, RecentOrders } from '@/components/globals/navigation/';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { dashboard, invoices, orders } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { ClipboardTimeIcon, HomeIcon, ListCheckIcon } from './ui/icons';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const roles = auth.roles ?? [];
    const permissions = auth.permissions ?? [];

    const isSuperAdmin = roles.includes('Super Admin');

    const canSeeDashboard =
        isSuperAdmin || permissions.includes('GTC - View Management Dashboard');

    const canSeeMyTasks =
        isSuperAdmin || permissions.includes('GTC - View My Tasks');

    const canSeeInvoices =
        isSuperAdmin ||
        permissions.includes('GTC - Accounts Receivable') ||
        permissions.includes('GTC - View Billing');

    const mainNavItems: NavItem[] = [
        canSeeDashboard && {
            title: 'Home',
            href: dashboard(),
            icon: HomeIcon,
        },
        {
            title: 'Orders',
            href: orders(),
            icon: ClipboardTimeIcon,
        },
        canSeeMyTasks && {
            title: 'My Tasks',
            href: `${orders().url}?filter=my-tasks`,
            icon: ListCheckIcon,
            filterParam: 'my-tasks',
        },
        canSeeInvoices && {
            title: 'Invoices',
            href: invoices(),
            icon: Receipt,
        },
    ].filter(Boolean) as NavItem[];

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-t border-[#5b5b5c] bg-foreground text-white"
        >
            <SidebarContent>
                <NavMain items={mainNavItems} />
                <RecentOrders />
            </SidebarContent>
        </Sidebar>
    );
}
