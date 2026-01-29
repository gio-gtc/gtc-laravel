import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useInitials } from '@/hooks/use-initials';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import type { User } from '@/types';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';

type SortColumn = 'name' | 'assetsAssigned' | 'assetsUploaded' | 'accuracy';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 7;

const defaultTrend = { direction: 'up' as const, percentage: 0 };

function DesignerStatsTable() {
    const getInitials = useInitials();
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
            return <ArrowUpDown className="h-4 w-4" />;
        }
        return sortDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
        ) : (
            <ArrowDown className="h-4 w-4" />
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
            <h3 className="text-lg font-semibold">Designer Stats</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <button
                                onClick={() => handleSort('name')}
                                className="flex items-center gap-2 hover:text-foreground"
                            >
                                Employees
                                {getSortIcon('name')}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() => handleSort('assetsAssigned')}
                                className="flex items-center gap-2 hover:text-foreground"
                            >
                                Assets Assigned
                                {getSortIcon('assetsAssigned')}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() => handleSort('assetsUploaded')}
                                className="flex items-center gap-2 hover:text-foreground"
                            >
                                Assets Uploaded
                                {getSortIcon('assetsUploaded')}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() => handleSort('accuracy')}
                                className="flex items-center gap-2 hover:text-foreground"
                            >
                                Rolling 30 Day Accuracy
                                {getSortIcon('accuracy')}
                            </button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.map((designer, index) => {
                        const d = designer as User & {
                            assetsAssigned?: number;
                            assetsUploaded?: number;
                            rolling30DayAccuracy?: number;
                            trend?: { direction: 'up' | 'down'; percentage: number };
                        };
                        const assetsAssigned = d.assetsAssigned ?? 0;
                        const assetsUploaded = d.assetsUploaded ?? 0;
                        const rolling30DayAccuracy = d.rolling30DayAccuracy ?? 0;
                        const trend = d.trend ?? defaultTrend;
                        return (
                            <TableRow key={designer.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={designer.avatar || undefined}
                                                alt={designer.name}
                                            />
                                            <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(designer.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {designer.name}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {designer.email}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{assetsAssigned}</TableCell>
                                <TableCell>{assetsUploaded}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <Progress
                                                value={rolling30DayAccuracy}
                                                className="h-2"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium">
                                                {rolling30DayAccuracy}
                                            </span>
                                            <div className="inline-flex items-center gap-1 rounded-md border-1 p-0.5 text-xs">
                                                {trend.direction === 'up' ? (
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
                <Pagination>
                    <PaginationContent>
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
                        {getPageNumbers().map((page, index) => {
                            if (page === 'ellipsis') {
                                return (
                                    <PaginationItem key={`ellipsis-${index}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                );
                            }
                            return (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => setCurrentPage(page)}
                                        isActive={currentPage === page}
                                        size="default"
                                        className="min-w-9 cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}
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
    );
}

export default DesignerStatsTable;
