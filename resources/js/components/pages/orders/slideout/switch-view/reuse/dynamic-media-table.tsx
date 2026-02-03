import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { MediaTableProps, MediaTableRow } from '@/types';
import {
    AudioLines,
    Check,
    ChevronDown,
    ChevronRight,
    Download,
    Plus,
    RefreshCw,
    X,
} from 'lucide-react';
import { useState } from 'react';

function getStatusBadge(status: MediaTableRow['status']): React.ReactNode {
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

export default function MediaTable({
    title,
    data,
    defaultOpen = true,
    onAdd,
    previewVariant = 'default',
    onUploadRow,
    onPreviewClick,
}: MediaTableProps) {
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
                            <span className="font-semibold text-gray-900">
                                {title}
                            </span>
                        </button>
                    </CollapsibleTrigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-4.5 cursor-pointer rounded-full border-1 border-gray-400 text-gray-400 hover:border-gray-500"
                        onClick={onAdd ?? undefined}
                    >
                        <Plus className="size-3" />
                    </Button>
                </div>

                {/* Table */}
                <CollapsibleContent>
                    <div className="rounded-lg border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ISCI</TableHead>
                                    <TableHead>Cut Name</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Assigned</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Deliverables</TableHead>
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
                                            <TableRow key={row.id}>
                                                <TableCell
                                                    className={cn(
                                                        isDisabledRow &&
                                                            'text-muted-foreground opacity-70',
                                                    )}
                                                >
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <button
                                                                type="button"
                                                                className="cursor-pointer text-left hover:underline focus:ring-0 focus:outline-none"
                                                            >
                                                                {row.isci}
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="start"
                                                            className="min-w-[10rem]"
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    onUploadRow?.(
                                                                        row,
                                                                    )
                                                                }
                                                            >
                                                                Upload
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                Edit Order
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                Edit ISCI
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={async () => {
                                                                    try {
                                                                        await navigator.clipboard.writeText(
                                                                            row.isci,
                                                                        );
                                                                    } catch {
                                                                        /* clipboard not available or denied */
                                                                    }
                                                                }}
                                                            >
                                                                Copy File Name
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        isDisabledRow &&
                                                            'text-muted-foreground opacity-70',
                                                    )}
                                                >
                                                    {row.cutName}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        isDisabledRow &&
                                                            'text-muted-foreground opacity-70',
                                                    )}
                                                >
                                                    {row.duration}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        isDisabledRow &&
                                                            'text-muted-foreground opacity-70',
                                                    )}
                                                >
                                                    {row.dueDate}
                                                </TableCell>
                                                <TableCell>
                                                    {row.assigned ? (
                                                        <Avatar className="size-5 overflow-hidden rounded-full">
                                                            <AvatarImage
                                                                src={
                                                                    row.assigned
                                                                        .avatar ||
                                                                    undefined
                                                                }
                                                                alt={
                                                                    row.assigned
                                                                        .name
                                                                }
                                                            />
                                                            <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                                {getInitials(
                                                                    row.assigned
                                                                        .name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ) : (
                                                        <span className="text-muted-foreground"></span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(row.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {isDisabledRow ? (
                                                        <span className="text-muted-foreground"></span>
                                                    ) : previewVariant ===
                                                      'audio' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                className="cursor-pointer text-gray-600 hover:text-gray-900"
                                                                onClick={() =>
                                                                    onPreviewClick?.(row, 0)
                                                                }
                                                            >
                                                                <AudioLines className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            {row.previewIcons.map(
                                                                (
                                                                    icon,
                                                                    index,
                                                                ) => (
                                                                    <button
                                                                        key={`${row.id}-preview-${index}`}
                                                                        className="cursor-pointer text-gray-600 hover:text-gray-900"
                                                                        onClick={() =>
                                                                            onPreviewClick?.(
                                                                                row,
                                                                                index,
                                                                            )
                                                                        }
                                                                    >
                                                                        {icon}
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="flex items-center justify-center gap-2">
                                                    {hideDeliverablesButtons ? (
                                                        <span className="text-muted-foreground"></span>
                                                    ) : row.status ===
                                                      'Out for Delivery' ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-6 cursor-pointer rounded-full text-red-500 hover:border-red-600 hover:bg-red-300 hover:text-white"
                                                                onClick={
                                                                    row
                                                                        .deliverables
                                                                        ?.onReject
                                                                }
                                                            >
                                                                <RefreshCw className="size-4.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-6 cursor-pointer rounded-full text-green-500 hover:border-green-600 hover:bg-green-300 hover:text-white"
                                                                onClick={
                                                                    row
                                                                        .deliverables
                                                                        ?.onApprove
                                                                }
                                                            >
                                                                <Download className="size-4.5" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-4 cursor-pointer rounded-full border border-red-500 text-red-500 hover:border-red-600 hover:bg-red-300 hover:text-white"
                                                                onClick={
                                                                    row
                                                                        .deliverables
                                                                        ?.onReject
                                                                }
                                                            >
                                                                <X className="size-3" />
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-4 cursor-pointer rounded-full border border-green-500 text-green-500 hover:border-green-600 hover:bg-green-300 hover:text-white"
                                                                    >
                                                                        <Check className="size-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="min-w-[7rem]"
                                                                >
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            row.deliverables?.onApprove?.()
                                                                        }
                                                                    >
                                                                        Approve
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        Cancel
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
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
