import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { MediaTableProps, MediaTableRow } from '@/types';
import { Check, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
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
                        onClick={
                            onAdd || (() => console.log('Add button clicked'))
                        }
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
                                    data.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.isci}</TableCell>
                                            <TableCell>{row.cutName}</TableCell>
                                            <TableCell>
                                                {row.duration}
                                            </TableCell>
                                            <TableCell>{row.dueDate}</TableCell>
                                            <TableCell>
                                                {row.assigned ? (
                                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full">
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
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(row.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    {row.previewIcons.map(
                                                        (icon, index) => (
                                                            <button
                                                                key={index}
                                                                className="cursor-pointer text-gray-600 hover:text-gray-900"
                                                                onClick={() =>
                                                                    console.log(
                                                                        'Preview icon clicked:',
                                                                        {
                                                                            rowId: row.id,
                                                                            iconIndex:
                                                                                index,
                                                                            isci: row.isci,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                {icon}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 cursor-pointer rounded-full border border-red-500 text-red-500 hover:border-red-600 hover:bg-red-300 hover:text-white"
                                                        onClick={
                                                            row.deliverables
                                                                ?.onReject ||
                                                            (() =>
                                                                console.log(
                                                                    'Reject clicked for row:',
                                                                    row.id,
                                                                ))
                                                        }
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 cursor-pointer rounded-full border border-green-500 text-green-500 hover:border-green-600 hover:bg-green-300 hover:text-white"
                                                        onClick={
                                                            row.deliverables
                                                                ?.onApprove ||
                                                            (() =>
                                                                console.log(
                                                                    'Approve clicked for row:',
                                                                    row.id,
                                                                ))
                                                        }
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
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
