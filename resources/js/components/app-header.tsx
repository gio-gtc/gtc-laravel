import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Search } from 'lucide-react';
import AppLogo from './app-logo';
import { SidebarTrigger } from './ui/sidebar';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    return (
        <>
            <div className="bg-foreground text-background">
                <div className="flex h-[50px] items-center justify-center gap-1 px-2">
                    {/* Menu */}
                    <div className="flex w-full items-center max-sm:w-1/3 sm:gap-3">
                        <SidebarTrigger className="mr-2 h-[34px] w-[34px] cursor-pointer hover:bg-[#333] active:bg-[#666]" />

                        <Link
                            href={dashboard()}
                            prefetch
                            className="flex items-center space-x-2"
                        >
                            <AppLogo />
                        </Link>
                    </div>

                    {/* Searchbar */}
                    <div className="relative mx-auto w-full">
                        <button
                            type="submit"
                            className="absolute top-1.5 left-2.5 cursor-pointer"
                        >
                            <Search className="h-3.5 w-3.5 text-gray-icon" />
                        </button>
                        <input
                            className="h-6 w-full rounded-4xl bg-dark-input pl-7 text-sm focus:outline-none"
                            type="search"
                            name="search"
                            placeholder="Search"
                        />
                    </div>

                    {/* User Dropdown  */}
                    <div className="ml-auto flex w-full justify-end space-x-2 text-right max-sm:w-1/3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span className="flex items-center hover:cursor-pointer">
                                    <Button className="rounded-full p-1 hover:cursor-pointer">
                                        <Avatar className="size-6 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                    <ChevronDown className="size-3" />
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
