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
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronDown,
    Folder,
    LayoutGrid,
    Search,
} from 'lucide-react';
import AppLogo from './app-logo';
import { SidebarTrigger } from './ui/sidebar';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    return (
        <>
            <div className="border-b border-sidebar-border/80 border-b-neutral-600">
                <div className="flex h-16 items-center gap-1 px-4">
                    {/* Menu */}
                    <div className="flex w-full items-center max-sm:w-1/3">
                        <SidebarTrigger className="mr-2 h-[34px] w-[34px]" />

                        <Link
                            href={dashboard()}
                            prefetch
                            className="flex items-center space-x-2"
                        >
                            <AppLogo />
                        </Link>
                    </div>

                    {/* Searchbar */}
                    <div className="relative mx-auto w-full pt-2">
                        <button
                            type="submit"
                            className="absolute top-0 left-2.5 mt-5 mr-4"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                        <input
                            className="h-10 w-full rounded-4xl bg-input pl-8 text-sm focus:outline-none"
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
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1 hover:cursor-pointer"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                    <ChevronDown className="size-4" />
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
