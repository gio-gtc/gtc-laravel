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
import { AudioLines, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { DeliverablesCell } from './deliverables-buttons';

function getStatusBadge(status: MediaTableRow['status']): React.ReactNode {
    const baseClasses =
        'xs-gray-700-weight-600 inline-flex items-center rounded-full border-2 border-solid px-2.5 py-0.5';

    let colorClasses = '';

    switch (status) {
        case 'Still in Cart':
        case 'Client Review':
            colorClasses = 'border-yellow-400 bg-yellow-50';
            break;
        case 'In Production':
        case 'Out for Delivery':
            colorClasses = 'border-green-400 bg-green-50';
            break;
        case 'Cancelled':
        case 'Revision Requested':
            colorClasses = 'border-gray-400 bg-gray-50';
            break;
        case 'Unassigned':
            colorClasses = 'border-red-400 bg-red-50';
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
                        <Table compactRows>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[13%]">
                                        ISCI
                                    </TableHead>
                                    <TableHead className="w-[24%]">
                                        Cut Name
                                    </TableHead>
                                    <TableHead className="w-[8%]">
                                        Duration
                                    </TableHead>
                                    <TableHead className="w-[9%]">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="w-[9%]">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="w-[18%]">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-[8%]">
                                        Preview
                                    </TableHead>
                                    <TableHead className="w-[11%]">
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
                                        return (
                                            <TableRow
                                                key={row.id}
                                                className={cn(
                                                    'xs-gray-500-weight-600',
                                                    isDisabledRow &&
                                                        'xs-gray-300-weight-600',
                                                )}
                                            >
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                className="h-[28px] p-0 text-left hover:bg-transparent"
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
                                                <TableCell>
                                                    {row.cutName}
                                                </TableCell>
                                                <TableCell>
                                                    {row.duration}
                                                </TableCell>
                                                <TableCell>
                                                    {row.dueDate}
                                                </TableCell>
                                                <TableCell>
                                                    {row.assigned && (
                                                        <UserAvatar
                                                            user={row.assigned}
                                                        />
                                                    )}
                                                </TableCell>

                                                {/* Preview Icons */}
                                                <TableCell className="h-[30px] py-0 text-center">
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
                                                <TableCell className="flex h-[30px] items-center justify-center gap-2 py-0">
                                                    <DeliverablesCell
                                                        status={row.status}
                                                        deliverables={
                                                            row.deliverables
                                                        }
                                                    />
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
