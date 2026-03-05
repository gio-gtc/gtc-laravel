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
import { UserAvatar } from '@/components/ui/user-avatar';
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

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="space-y-2">
                {/* Collapsible Header */}
                <div className="flex gap-2">
                    <CollapsibleTrigger asChild>
                        <button className="flex gap-2 hover:opacity-90">
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
                        className="size-[24px] cursor-pointer rounded-full border-1 border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white"
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
                                        ISCI
                                    </TableHead>
                                    <TableHead className="h-[30px]">
                                        Cut Name
                                    </TableHead>
                                    <TableHead className="h-[30px]">
                                        Duration
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
                                        Preview
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
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                className="h-[30px] p-0 text-left hover:bg-transparent"
                                                            >
                                                                {row.isci}
                                                            </Button>
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
                                                <TableCell className="h-[30px] py-0">
                                                    {row.cutName}
                                                </TableCell>
                                                <TableCell className="h-[30px] py-0">
                                                    {row.duration}
                                                </TableCell>
                                                <TableCell className="h-[30px] py-0">
                                                    {row.dueDate}
                                                </TableCell>
                                                <TableCell className="h-[30px] py-0">
                                                    {row.assigned ? (
                                                        <UserAvatar
                                                            user={row.assigned}
                                                        />
                                                    ) : (
                                                        <span className="text-muted-foreground"></span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-0 text-center">
                                                    {getStatusBadge(row.status)}
                                                </TableCell>

                                                {/* Preview Icons */}
                                                <TableCell className="h-[30px] py-0">
                                                    {isDisabledRow ? (
                                                        <span className="text-muted-foreground"></span>
                                                    ) : previewVariant ===
                                                      'audio' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                className="cursor-pointer text-gray-600 hover:text-gray-900"
                                                                onClick={() =>
                                                                    onPreviewClick?.(
                                                                        row,
                                                                        0,
                                                                    )
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
                                                                        className="cursor-pointer text-gray-400 hover:text-gray-900"
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
                                                <TableCell className="items-cente flex h-[30px] items-center justify-center gap-2 py-0">
                                                    {hideDeliverablesButtons ? (
                                                        <span className="text-muted-foreground"></span>
                                                    ) : row.status ===
                                                      'Out for Delivery' ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-5.5 cursor-pointer rounded-full text-red-400 hover:border-red-400 hover:bg-red-400 hover:text-white"
                                                                onClick={
                                                                    row
                                                                        .deliverables
                                                                        ?.onReject
                                                                }
                                                            >
                                                                <RefreshCw className="size-[24px]" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-5.5 cursor-pointer rounded-full text-green-500 hover:border-green-600 hover:bg-green-300 hover:text-white"
                                                                onClick={
                                                                    row
                                                                        .deliverables
                                                                        ?.onApprove
                                                                }
                                                            >
                                                                <Download className="size-[24px]" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-4 cursor-pointer rounded-full border border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
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
                                                                        className="size-4 cursor-pointer rounded-full border border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
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
