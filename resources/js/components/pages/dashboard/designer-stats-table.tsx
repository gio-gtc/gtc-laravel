import Heading from '@/components/heading';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import {
    ArrowDown,
    ArrowUp,
    ChevronDownIcon,
    ChevronsUpDownIcon,
    ChevronUpIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type SortColumn = 'name' | 'assetsAssigned' | 'assetsUploaded' | 'accuracy';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 7;

const defaultTrend = { direction: 'up' as const, percentage: 0 };

function DesignerStatsTable() {
    const getInitials = useInitials();
    const isMobile = useIsMobile();
    const usersWithFallback = useUsersWithFallback();
    const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);

    // Sort data (mock-only fields use fallbacks for real users)
    const sortedData = useMemo(() => {
        if (!sortColumn) return usersWithFallback;

        return [...usersWithFallback].sort((a, b) => {
            const aUser = a as User & {
                assetsAssigned?: number;
                assetsUploaded?: number;
                rolling30DayAccuracy?: number;
            };
            const bUser = b as User & {
                assetsAssigned?: number;
                assetsUploaded?: number;
                rolling30DayAccuracy?: number;
            };
            let aValue: string | number;
            let bValue: string | number;

            switch (sortColumn) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'assetsAssigned':
                    aValue = aUser.assetsAssigned ?? 0;
                    bValue = bUser.assetsAssigned ?? 0;
                    break;
                case 'assetsUploaded':
                    aValue = aUser.assetsUploaded ?? 0;
                    bValue = bUser.assetsUploaded ?? 0;
                    break;
                case 'accuracy':
                    aValue = aUser.rolling30DayAccuracy ?? 0;
                    bValue = bUser.rolling30DayAccuracy ?? 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [sortColumn, sortDirection, usersWithFallback]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

    // Handle column sort
    function handleSort(column: SortColumn) {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    }

    // Get sort icon
    function getSortIcon(column: SortColumn) {
        if (sortColumn !== column) {
            return <ChevronsUpDownIcon className="size-[12px]" />;
        }
        return sortDirection === 'asc' ? (
            <ChevronUpIcon className="size-[12px]" />
        ) : (
            <ChevronDownIcon className="size-[12px]" />
        );
    }

    // Generate page numbers with ellipsis
    function getPageNumbers() {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage <= 3) {
                // Show first few pages
                for (let i = 2; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages - 1);
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Show last few pages
                pages.push(2);
                pages.push('ellipsis');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show pages around current
                pages.push(2);
                pages.push('ellipsis');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages - 1);
                pages.push(totalPages);
            }
        }

        return pages;
    }

    return (
        <div className="space-y-4 px-4 py-2">
            <Heading title="Designer Stats" type="section" />
            <div className="space-y-4">
                <Table layout="none">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-full max-w-[20%]">
                                <button
                                    onClick={() => handleSort('name')}
                                    className="flex items-center gap-2 hover:text-foreground"
                                >
                                    Employees
                                    {getSortIcon('name')}
                                </button>
                            </TableHead>
                            <TableHead className="w-full max-w-[15%]">
                                <button
                                    onClick={() => handleSort('assetsAssigned')}
                                    className="flex items-center gap-2 hover:text-foreground"
                                >
                                    Assets Assigned
                                    {getSortIcon('assetsAssigned')}
                                </button>
                            </TableHead>
                            <TableHead className="w-full max-w-[15%]">
                                <button
                                    onClick={() => handleSort('assetsUploaded')}
                                    className="flex items-center gap-2 hover:text-foreground"
                                >
                                    Assets Uploaded
                                    {getSortIcon('assetsUploaded')}
                                </button>
                            </TableHead>
                            <TableHead className="w-full max-w-[50%]">
                                Rolling 30 Day Accuracy
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((designer, index) => {
                            const d = designer as User & {
                                assetsAssigned?: number;
                                assetsUploaded?: number;
                                rolling30DayAccuracy?: number;
                                trend?: {
                                    direction: 'up' | 'down';
                                    percentage: number;
                                };
                            };
                            const assetsAssigned = d.assetsAssigned ?? 0;
                            const assetsUploaded = d.assetsUploaded ?? 0;
                            const rolling30DayAccuracy =
                                d.rolling30DayAccuracy ?? 0;
                            const trend = d.trend ?? defaultTrend;
                            return (
                                <TableRow key={designer.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <UserAvatar
                                                user={designer}
                                                className="size-8"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {designer.name}
                                                </span>
                                                <span className="sm-gray-600-weight-400">
                                                    {designer.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="sm-gray-600-weight-400 px-2">
                                        {assetsAssigned}
                                    </TableCell>
                                    <TableCell className="sm-gray-600-weight-400 px-2">
                                        {assetsUploaded}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <Progress
                                                    value={rolling30DayAccuracy}
                                                    className="h-2"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {rolling30DayAccuracy}
                                                </span>
                                                <div className="ml-2 inline-flex items-center gap-1 rounded-md border-1 p-0.5 text-xs md:ml-7">
                                                    {trend.direction ===
                                                    'up' ? (
                                                        <ArrowUp className="h-3 w-3 text-green-600" />
                                                    ) : (
                                                        <ArrowDown className="h-3 w-3 text-red-600" />
                                                    )}
                                                    <span>
                                                        {trend.percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {totalPages > 1 && (
                    <Pagination className="overflow-visible">
                        <PaginationContent className="flex w-full justify-between">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(1, prev - 1),
                                        )
                                    }
                                    className={`${
                                        currentPage === 1
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }`}
                                />
                            </PaginationItem>
                            <div className="flex">
                                {isMobile ? (
                                    <PaginationItem className="sm-gray-500-weight-500 min-w-[65px] px-2">
                                        {currentPage} of {totalPages}
                                    </PaginationItem>
                                ) : (
                                    getPageNumbers().map((page, index) => {
                                        const isActive = currentPage === page;
                                        if (page === 'ellipsis') {
                                            return (
                                                <PaginationItem
                                                    key={`ellipsis-${index}`}
                                                >
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    onClick={() =>
                                                        setCurrentPage(page)
                                                    }
                                                    isActive={isActive}
                                                    size="default"
                                                    className={cn(
                                                        isActive
                                                            ? 'sm-gray-700-weight-500'
                                                            : 'sm-gray-500-weight-500',
                                                        'min-w-9 cursor-pointer',
                                                    )}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })
                                )}
                            </div>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(totalPages, prev + 1),
                                        )
                                    }
                                    className={`${
                                        currentPage === totalPages
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    );
}

export default DesignerStatsTable;
