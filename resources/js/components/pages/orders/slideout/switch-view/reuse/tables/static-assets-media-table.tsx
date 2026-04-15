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
import { EditableCellSelect } from '@/components/utils/editable-table/editable-cell-select';
import { VenueItemStatusBadge } from '@/components/utils/venue-item-status-badge';
import { toggleRowSelectionOnRowClick } from '@/lib/row-select-toggle';
import { cn } from '@/lib/utils';
import type {
    StaticAssetsMediaTableProps,
    StaticAssetsTableRow,
} from '@/types';
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { CollapsibleTableSectionHeader } from './collapsible-table-section-header';
import { DeliverablesCell } from './sections/deliverables-buttons';

export default function StaticAssetsMediaTable({
    title,
    data,
    defaultOpen = true,
    onAdd,
    cellEditing,
    selectedRowIds,
    onRowSelectToggle,
    onBulkEditDueDateDoubleClick,
    onBulkEditAssignedDoubleClick,
    onPreviewImageClick,
    venueItemStatusSelectOptions,
}: StaticAssetsMediaTableProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

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
                                    <TableHead className="w-full max-w-[32%] text-center">
                                        Cut Name
                                    </TableHead>
                                    <TableHead className="w-full max-w-[8%] text-center">
                                        W
                                    </TableHead>
                                    <TableHead className="w-full max-w-[8%] text-center">
                                        H
                                    </TableHead>
                                    <TableHead className="w-full max-w-[10%] text-center">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="w-full max-w-[9%] text-center">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="w-full max-w-[15%] text-center">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-full max-w-[8%] text-center">
                                        Preview
                                    </TableHead>
                                    <TableHead className="w-full max-w-[10%] text-center">
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
                                                        'xs-gray-300-weight-600 hover:bg-gray-100',
                                                    selectedRowIds?.has(
                                                        row.id,
                                                    ) &&
                                                        !isDisabledRow &&
                                                        'bg-red-100',
                                                )}
                                                onClick={(e) =>
                                                    toggleRowSelectionOnRowClick(
                                                        e,
                                                        row.id,
                                                        onRowSelectToggle,
                                                        isDisabledRow,
                                                    )
                                                }
                                            >
                                                {/* Cut Name Section */}
                                                <TableCell>
                                                    {cellEditing ? (
                                                        <EditableCellInput
                                                            value={row.cutName}
                                                            itemId={row.id}
                                                            field="cutName"
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
                                                                'cutName',
                                                            )}
                                                            disabled={
                                                                isDisabledRow
                                                            }
                                                        />
                                                    ) : (
                                                        row.cutName
                                                    )}
                                                </TableCell>

                                                {/* W Section */}
                                                <TableCell>
                                                    {cellEditing ? (
                                                        <EditableCellInput
                                                            variant="orderSlideoutTableCells"
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
                                                            disabled={
                                                                isDisabledRow
                                                            }
                                                        />
                                                    ) : (
                                                        row.width
                                                    )}
                                                </TableCell>

                                                {/* H Section */}
                                                <TableCell>
                                                    {cellEditing ? (
                                                        <EditableCellInput
                                                            variant="orderSlideoutTableCells"
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
                                                            disabled={
                                                                isDisabledRow
                                                            }
                                                        />
                                                    ) : (
                                                        row.height
                                                    )}
                                                </TableCell>

                                                {/* Due Date Section */}
                                                <TableCell>
                                                    <div
                                                        className={cn(
                                                            'min-h-[inherit]',
                                                            !isDisabledRow &&
                                                                'cursor-pointer',
                                                        )}
                                                        onDoubleClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                                !selectedRowIds?.has(
                                                                    row.id,
                                                                ) ||
                                                                isDisabledRow ||
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
                                                        className={cn(
                                                            'min-h-[inherit]',
                                                            !isDisabledRow &&
                                                                'cursor-pointer',
                                                        )}
                                                        onDoubleClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                                !selectedRowIds?.has(
                                                                    row.id,
                                                                ) ||
                                                                isDisabledRow ||
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
                                                                users={
                                                                    row.assigned
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Status Section */}
                                                <TableCell>
                                                    <div className="flex justify-center rounded-full focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none">
                                                        {cellEditing ? (
                                                            <EditableCellSelect
                                                                variant="orderSlideoutTableCells"
                                                                value={
                                                                    row.status
                                                                }
                                                                itemId={row.id}
                                                                field="status"
                                                                options={
                                                                    venueItemStatusSelectOptions
                                                                }
                                                                renderDisplay={(
                                                                    v,
                                                                ) => (
                                                                    <VenueItemStatusBadge
                                                                        status={
                                                                            v as StaticAssetsTableRow['status']
                                                                        }
                                                                    />
                                                                )}
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
                                                                    'status',
                                                                )}
                                                                disabled={false}
                                                            />
                                                        ) : (
                                                            <VenueItemStatusBadge
                                                                status={
                                                                    row.status
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Preview Section */}
                                                <TableCell className="text-center">
                                                    {row.previewImageUrl &&
                                                    onPreviewImageClick ? (
                                                        <button
                                                            type="button"
                                                            className="inline-flex cursor-pointer text-gray-400 hover:text-gray-900"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onPreviewImageClick(
                                                                    row,
                                                                );
                                                            }}
                                                            aria-label="Preview image"
                                                        >
                                                            <ImageIcon className="size-4" />
                                                        </button>
                                                    ) : null}
                                                </TableCell>

                                                {/* Deliverables Section */}
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
