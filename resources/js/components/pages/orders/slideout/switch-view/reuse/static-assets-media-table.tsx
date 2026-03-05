import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { cn } from '@/lib/utils';
import type {
    StaticAssetsMediaTableProps,
    StaticAssetsTableRow,
} from '@/types';
import {
    ChevronDown,
    ChevronRight,
    Download,
    Plus,
    RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

function getStatusBadge(
    status: StaticAssetsTableRow['status'],
): React.ReactNode {
    const baseClasses =
        'inline-flex items-center rounded-full border-2 border-solid px-2.5 py-0.5 text-xs font-medium';

    let colorClasses = '';

    switch (status) {
        case 'Still in Cart':
        case 'Client Review':
            colorClasses = 'border-yellow-400 bg-yellow-50 text-yellow-700';
            break;
        case 'In Production':
        case 'Out for Delivery':
            colorClasses = 'border-green-400 bg-green-50 text-green-700';
            break;
        case 'Cancelled':
        case 'Revision Requested':
            colorClasses = 'border-gray-400 bg-gray-50 text-gray-700';
            break;
        case 'Unassigned':
            colorClasses = 'border-red-400 bg-red-50 text-red-700';
            break;
    }

    return <span className={cn(baseClasses, colorClasses)}>{status}</span>;
}

export default function StaticAssetsMediaTable({
    title,
    data,
    defaultOpen = true,
    onAdd,
}: StaticAssetsMediaTableProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const getInitials = useInitials();

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="space-y-2">
                {/* Collapsible Header */}
                <div className="flex items-center gap-2">
                    <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 text-left hover:opacity-80">
                            {isOpen ? (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                            )}
                            <span className="md-gray-700-weight-600">
                                {title}
                            </span>
                        </button>
                    </CollapsibleTrigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-4.5 cursor-pointer rounded-full border-1 border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white"
                        onClick={onAdd ?? undefined}
                    >
                        <Plus className="size-3" />
                    </Button>
                </div>

                {/* Table */}
                <CollapsibleContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="h-[30px]">
                                        Cut Name
                                    </TableHead>
                                    <TableHead className="h-[30px]">
                                        W
                                    </TableHead>
                                    <TableHead className="h-[30px]">
                                        H
                                    </TableHead>
                                    <TableHead className="h-[30px]">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="h-[30px]">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="h-[30px]">
                                        Status
                                    </TableHead>
                                    <TableHead className="h-[30px]">
                                        Deliverables
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length > 0 ? (
                                    data.map((row) => {
                                        const isDisabledRow =
                                            row.status === 'Cancelled' ||
                                            row.status === 'Revision Requested';
                                        const hideDeliverablesButtons =
                                            isDisabledRow ||
                                            row.status === 'Unassigned';
                                        return (
                                            <TableRow
                                                key={row.id}
                                                className={cn(
                                                    'xs-gray-500-weight-600',
                                                    isDisabledRow &&
                                                        'xs-gray-300-weight-600',
                                                )}
                                            >
                                                <TableCell className="h-[30px] py-0">
                                                    {row.cutName}
                                                </TableCell>
                                                <TableCell className="h-[30px] py-0">
                                                    {row.width}
                                                </TableCell>
                                                <TableCell className="h-[30px] py-0">
                                                    {row.height}
                                                </TableCell>
                                                <TableCell className="h-[30px] py-0">
                                                    {row.dueDate}
                                                </TableCell>
                                                <TableCell className="h-[30px] py-0">
                                                    {row.assigned && (
                                                        <UserAvatar
                                                            user={row.assigned}
                                                        />
                                                    )}
                                                </TableCell>

                                                {/* Preview Icons */}
                                                <TableCell className="h-[30px] py-0">
                                                    <p className="flex justify-center rounded-full focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none">
                                                        {getStatusBadge(
                                                            row.status,
                                                        )}
                                                    </p>
                                                </TableCell>

                                                <TableCell className="flex h-[30px] items-center justify-center gap-2 py-0">
                                                    {hideDeliverablesButtons ? (
                                                        <span className="text-muted-foreground"></span>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="red-400-hover size-5.5 cursor-pointer rounded-full"
                                                                onClick={() => {}}
                                                            >
                                                                <RefreshCw className="size-[24px]" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="green-400-hover size-5.5 cursor-pointer rounded-full"
                                                                onClick={() => {}}
                                                            >
                                                                <Download className="size-[24px]" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-24 text-center"
                                        >
                                            No data available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
