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
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import { toggleRowSelectionOnRowClick } from '@/lib/row-select-toggle';
import { cn } from '@/lib/utils';
import { EditableCellInput } from '@/components/utils/editable-table/editable-cell-input';
import { useInitials } from '@/hooks/use-initials';
import type { LocalizedArtTableProps } from '@/types';
import { ChevronDown, ChevronRight, Paperclip, Plus } from 'lucide-react';
import { useState } from 'react';

export default function LocalizedArtTable({
    title,
    data,
    defaultOpen = true,
    onAdd,
    onOpenNotes,
    cellEditing,
    selectedRowIds,
    onRowSelectToggle,
}: LocalizedArtTableProps) {
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
                            <span className="font-semibold text-gray-700">
                                {title}
                            </span>
                        </button>
                    </CollapsibleTrigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-4.5 cursor-pointer rounded-full border border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
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
                                    <TableHead className="xs-gray-500-weight-600 w-[31%] text-center">
                                        Description
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 w-[7%] text-center">
                                        W
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 w-[7%] text-center">
                                        H
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 w-[16%] text-center">
                                        CTA
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 w-[10%] text-center">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 w-[10%] text-center">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 w-[7%] text-center">
                                        Notes
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 w-[12%] text-center">
                                        Download
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length > 0 ? (
                                    data.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className={cn(
                                                'xs-gray-500-weight-600',
                                                selectedRowIds?.has(row.id) &&
                                                    'bg-red-100',
                                            )}
                                            onClick={(e) =>
                                                toggleRowSelectionOnRowClick(
                                                    e,
                                                    row.id,
                                                    onRowSelectToggle,
                                                )
                                            }
                                        >
                                            <TableCell>
                                                {cellEditing ? (
                                                    <EditableCellInput
                                                        value={
                                                            row.description
                                                        }
                                                        itemId={row.id}
                                                        field="description"
                                                        type="text"
                                                        onChange={
                                                            cellEditing.onCellChange
                                                        }
                                                        onDoubleClick={
                                                            cellEditing.onCellDoubleClick
                                                        }
                                                        onBlur={
                                                            cellEditing.onCellBlur
                                                        }
                                                        onKeyDown={
                                                            cellEditing.onCellKeyDown
                                                        }
                                                        isEditing={cellEditing.isCellEditing(
                                                            row.id,
                                                            'description',
                                                        )}
                                                    />
                                                ) : (
                                                    row.description
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {cellEditing ? (
                                                    <EditableCellInput
                                                        value={row.width}
                                                        itemId={row.id}
                                                        field="width"
                                                        type="number"
                                                        min={0}
                                                        step={1}
                                                        emptyValue={0}
                                                        emptyPlaceholder="0"
                                                        onChange={
                                                            cellEditing.onCellChange
                                                        }
                                                        onDoubleClick={
                                                            cellEditing.onCellDoubleClick
                                                        }
                                                        onBlur={
                                                            cellEditing.onCellBlur
                                                        }
                                                        onKeyDown={
                                                            cellEditing.onCellKeyDown
                                                        }
                                                        isEditing={cellEditing.isCellEditing(
                                                            row.id,
                                                            'width',
                                                        )}
                                                        align="center"
                                                    />
                                                ) : (
                                                    row.width
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {cellEditing ? (
                                                    <EditableCellInput
                                                        value={row.height}
                                                        itemId={row.id}
                                                        field="height"
                                                        type="number"
                                                        min={0}
                                                        step={1}
                                                        emptyValue={0}
                                                        emptyPlaceholder="0"
                                                        onChange={
                                                            cellEditing.onCellChange
                                                        }
                                                        onDoubleClick={
                                                            cellEditing.onCellDoubleClick
                                                        }
                                                        onBlur={
                                                            cellEditing.onCellBlur
                                                        }
                                                        onKeyDown={
                                                            cellEditing.onCellKeyDown
                                                        }
                                                        isEditing={cellEditing.isCellEditing(
                                                            row.id,
                                                            'height',
                                                        )}
                                                        align="center"
                                                    />
                                                ) : (
                                                    row.height
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {cellEditing ? (
                                                    <EditableCellInput
                                                        value={row.cta}
                                                        itemId={row.id}
                                                        field="cta"
                                                        type="text"
                                                        onChange={
                                                            cellEditing.onCellChange
                                                        }
                                                        onDoubleClick={
                                                            cellEditing.onCellDoubleClick
                                                        }
                                                        onBlur={
                                                            cellEditing.onCellBlur
                                                        }
                                                        onKeyDown={
                                                            cellEditing.onCellKeyDown
                                                        }
                                                        isEditing={cellEditing.isCellEditing(
                                                            row.id,
                                                            'cta',
                                                        )}
                                                    />
                                                ) : (
                                                    row.cta
                                                )}
                                            </TableCell>
                                            <TableCell>{row.dueDate}</TableCell>
                                            <TableCell>
                                                {row.assigned.length > 0 && (
                                                    <UserAvatarsStack
                                                        users={row.assigned}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-[16px] cursor-pointer rounded-full border-2 border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white"
                                                    onClick={() =>
                                                        onOpenNotes?.(row)
                                                    }
                                                >
                                                    <Plus
                                                        className="size-[12px]"
                                                        strokeWidth={3}
                                                    />
                                                </Button>
                                            </TableCell>

                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-[18px] cursor-pointer rounded-full text-gray-400 hover:border-gray-400"
                                                    onClick={() => {}}
                                                >
                                                    <Paperclip className="size-[14px]" />
                                                </Button>
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
