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
import { BookOpen, ChevronDown, Folder, LayoutGrid, Menu, Search } from 'lucide-react';
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
            <div className="border-b border-sidebar-border/80">
                <div className="flex h-16 items-center px-4">
                    {/* Menu */}
                    <div className='flex items-center w-full max-sm:w-1/3'>
                        {/* <Button
                            variant="ghost"
                            size="icon"
                            className="mr-2 h-[34px] w-[34px]">
                            <Menu className="size-6" />
                        </Button> */}
                        <SidebarTrigger className="-ml-1" />

                        <Link
                            href={dashboard()}
                            prefetch
                            className="flex items-center space-x-2"
                            >
                            <AppLogo />
                        </Link>
                    </div>

                    {/* Searchbar */}
                    <div className="pt-2 relative mx-auto  w-full">
                        <button type="submit" className="absolute left-2.5 top-0 mt-5 mr-4">
                            <Search className='h-4 w-4' />
                        </button>
                        <input className=" bg-input h-10 w-full rounded-4xl pl-8 text-sm focus:outline-none"
                        type="search" name="search" placeholder="Search" />
                    </div>

                    {/* User Dropdown  */}
                    <div className="ml-auto flex space-x-2 w-full text-right justify-end max-sm:w-1/3">
                        {/* <div className="relative flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group h-9 w-9 cursor-pointer"
                            >
                                <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                            </Button>
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider
                                        key={item.title}
                                        delayDuration={0}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={resolveUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">
                                                        {item.title}
                                                    </span>
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="size-5 opacity-80 group-hover:opacity-100"
                                                        />
                                                    )}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div> */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <span className='flex items-center hover:cursor-pointer'>
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
                                    <ChevronDown className='size-4' />
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
