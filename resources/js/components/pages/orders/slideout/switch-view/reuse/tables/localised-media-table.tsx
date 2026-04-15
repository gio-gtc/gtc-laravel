import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import { EditableCellInput } from '@/components/utils/editable-table/editable-cell-input';
import { useInitials } from '@/hooks/use-initials';
import { toggleRowSelectionOnRowClick } from '@/lib/row-select-toggle';
import { cn } from '@/lib/utils';
import type { LocalizedArtTableProps } from '@/types';
import { Paperclip, Plus } from 'lucide-react';
import { useState } from 'react';
import { CollapsibleTableSectionHeader } from './collapsible-table-section-header';

export default function LocalizedArtTable({
    title,
    data,
    defaultOpen = true,
    onAdd,
    onOpenNotes,
    cellEditing,
    selectedRowIds,
    onRowSelectToggle,
    onBulkEditDueDateDoubleClick,
    onBulkEditAssignedDoubleClick,
}: LocalizedArtTableProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const getInitials = useInitials();

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="space-y-2">
                <CollapsibleTableSectionHeader
                    title={title}
                    isOpen={isOpen}
                    onAdd={onAdd}
                />

                {/* Table */}
                <CollapsibleContent>
                    <div className="rounded-lg border">
                        <Table compactRows>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-full max-w-[31%] text-center">
                                        Description
                                    </TableHead>
                                    <TableHead className="w-full max-w-[7%] text-center">
                                        W
                                    </TableHead>
                                    <TableHead className="w-full max-w-[7%] text-center">
                                        H
                                    </TableHead>
                                    <TableHead className="w-full max-w-[16%] text-center">
                                        CTA
                                    </TableHead>
                                    <TableHead className="w-full max-w-[10%] text-center">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="w-full max-w-[10%] text-center">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="w-full max-w-[7%] text-center">
                                        Notes
                                    </TableHead>
                                    <TableHead className="w-full max-w-[12%] text-center">
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
                                                'xs-gray-500-weight-600 hover:bg-gray-100',
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
                                                        value={row.description}
                                                        itemId={row.id}
                                                        field="description"
                                                        type="text"
                                                        variant="orderSlideoutTableCells"
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

                                            {/* W Section */}
                                            <TableCell>
                                                {cellEditing ? (
                                                    <EditableCellInput
                                                        value={row.width}
                                                        itemId={row.id}
                                                        field="width"
                                                        type="number"
                                                        variant="orderSlideoutTableCells"
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

                                            {/* H Section */}
                                            <TableCell>
                                                {cellEditing ? (
                                                    <EditableCellInput
                                                        value={row.height}
                                                        itemId={row.id}
                                                        field="height"
                                                        type="number"
                                                        variant="orderSlideoutTableCells"
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

                                            {/* CTA Section */}
                                            <TableCell>
                                                {cellEditing ? (
                                                    <EditableCellInput
                                                        value={row.cta}
                                                        itemId={row.id}
                                                        field="cta"
                                                        type="text"
                                                        variant="orderSlideoutTableCells"
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

                                            {/* Due Date Section */}
                                            <TableCell>
                                                <div
                                                    className="min-h-[inherit] cursor-pointer"
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            !selectedRowIds?.has(
                                                                row.id,
                                                            ) ||
                                                            !onBulkEditDueDateDoubleClick
                                                        )
                                                            return;
                                                        onBulkEditDueDateDoubleClick(
                                                            row.id,
                                                        );
                                                    }}
                                                >
                                                    {row.dueDate}
                                                </div>
                                            </TableCell>

                                            {/* Assigned Section */}
                                            <TableCell>
                                                <div
                                                    className="min-h-[inherit] cursor-pointer"
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            !selectedRowIds?.has(
                                                                row.id,
                                                            ) ||
                                                            !onBulkEditAssignedDoubleClick
                                                        )
                                                            return;
                                                        onBulkEditAssignedDoubleClick(
                                                            row.id,
                                                        );
                                                    }}
                                                >
                                                    {row.assigned.length >
                                                        0 && (
                                                        <UserAvatarsStack
                                                            users={row.assigned}
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Notes Section */}
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

                                            {/* Downloads Section */}
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
                                        ></TableCell>
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
