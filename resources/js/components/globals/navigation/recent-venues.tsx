import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useRecentVenues } from '@/hooks/use-recent-venues';
import { cn, resolveUrl } from '@/lib/utils';
import { orders } from '@/routes';
import { router } from '@inertiajs/react';
import { History } from 'lucide-react';

export function RecentVenues() {
    const { recentVenues } = useRecentVenues();
    const { state } = useSidebar();

    const isCollapsed = state === 'collapsed';
    if (isCollapsed || recentVenues.length === 0) {
        return null;
    }

    const ordersUrl = resolveUrl(orders());

    const handleClick = (tourVenueId: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        const url = `${ordersUrl}?openVenue=${tourVenueId}`;
        router.visit(url, { preserveState: true });
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="flex items-center gap-1.5">
                <History className="size-4 shrink-0" />
                Recent Venues
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className="mt-1 gap-1">
                    {recentVenues.map((item) => (
                        <SidebarMenuItem key={item.tourVenueId}>
                            <SidebarMenuButton
                                asChild={false}
                                onClick={handleClick(item.tourVenueId)}
                                tooltip={{
                                    children: `${item.venueName} (${item.tourName})`,
                                }}
                                className={cn(
                                    'cursor-pointer text-xs text-sidebar-foreground/90',
                                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                )}
                            >
                                <span className="truncate">
                                    {item.venueName}
                                    <span className="text-sidebar-foreground/60">
                                        {' '}
                                        ({item.tourName})
                                    </span>
                                </span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
