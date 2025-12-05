import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { House, ClipboardCheck, Star } from 'lucide-react';
import { ClipboardClock } from './ui/icons';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: dashboard(),
        icon: House,
    },
    {
        title: 'Pending Orders',
        href: dashboard(),
        icon: ClipboardClock,
    },
    {
        title: 'My Tasks',
        href: dashboard(),
        icon: ClipboardCheck,
    },
    {
        title: 'Starred',
        href: dashboard(),
        icon: Star,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar" className='absolute top-16'>
            {/* <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader> */}

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
