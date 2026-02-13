import { NavMain } from '@/components/globals/navigation/';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { ClipboardCheck, House, Receipt } from 'lucide-react';
import { ClipboardClock } from './ui/icons';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: dashboard(),
        icon: House,
    },
    {
        title: 'Orders',
        href: '/orders',
        icon: ClipboardClock,
    },
    {
        title: 'My Tasks',
        href: '/#',
        icon: ClipboardCheck,
    },
    // TODO: only seen by managers and Russ/James/David
    {
        title: 'Invoices',
        href: '/invoices',
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
            </SidebarContent>
        </Sidebar>
    );
}
