import { NavMain } from '@/components/globals/navigation/nav-main';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { ClipboardCheck, House, Star } from 'lucide-react';
import { ClipboardClock } from './ui/icons';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: dashboard(),
        icon: House,
    },
    {
        title: 'Pending Orders',
        href: '/#',
        icon: ClipboardClock,
    },
    {
        title: 'My Tasks',
        href: '/#',
        icon: ClipboardCheck,
    },
    {
        title: 'Starred',
        href: '/#',
        icon: Star,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="background absolute top-16"
        >
            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
