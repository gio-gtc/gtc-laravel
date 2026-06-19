import { VENUE_ITEM_ART_PACKAGE_TYPES } from '@/components/pages/orders/slideout/switch-view/general-media/modals/spot-type-cuts-options';
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
    canEditAssignees = false,
    onPreviewImageClick,
    orderItemStatusSelectOptions,
    artPackageTypeSelectOptions = VENUE_ITEM_ART_PACKAGE_TYPES.map((value) => ({
        value,
        label: value,
    })),
    allowEditInactiveRows = false,
    isDeliverableUpdating,
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
                                    <TableHead className="w-full max-w-[10%] text-center">
                                        Deliverables
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length > 0 ? (
                                    data.map((row) => {
                                        const isCancelledRow =
                                            row.status === 'Cancelled';
                                        const isInactiveRow =
                                            isCancelledRow ||
                                            row.status === 'Revision Request';
                                        const isDisabledRow =
                                            isInactiveRow &&
                                            !allowEditInactiveRows;
                                        const rowEditsLocked = isDisabledRow;
                                        const assigneeEditsLocked =
                                            isDisabledRow || !canEditAssignees;
                                        return (
                                            <TableRow
                                                key={row.id}
                                                className={cn(
                                                    'xs-gray-500-weight-600',
                                                    isCancelledRow &&
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
                                                <TableCell className="truncate">
                                                    {cellEditing ? (
                                                        <EditableCellSelect
                                                            variant="orderSlideoutTableCells"
                                                            value={row.cutName}
                                                            itemId={row.id}
                                                            field="cutName"
                                                            options={
                                                                artPackageTypeSelectOptions
                                                            }
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
                                                                rowEditsLocked
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
                                                            value={
                                                                row.width ?? ''
                                                            }
                                                            itemId={row.id}
                                                            field="width"
                                                            type="number"
                                                            min={0}
                                                            step={1}
                                                            emptyPlaceholder="—"
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
                                                                rowEditsLocked
                                                            }
                                                        />
                                                    ) : (
                                                        (row.width ?? '—')
                                                    )}
                                                </TableCell>

                                                {/* H Section */}
                                                <TableCell>
                                                    {cellEditing ? (
                                                        <EditableCellInput
                                                            variant="orderSlideoutTableCells"
                                                            value={
                                                                row.height ?? ''
                                                            }
                                                            itemId={row.id}
                                                            field="height"
                                                            type="number"
                                                            min={0}
                                                            step={1}
                                                            emptyPlaceholder="—"
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
                                                                rowEditsLocked
                                                            }
                                                        />
                                                    ) : (
                                                        (row.height ?? '—')
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
                                                            'min-h-[30px]',
                                                            !assigneeEditsLocked &&
                                                                'cursor-pointer',
                                                        )}
                                                        onDoubleClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                                !selectedRowIds?.has(
                                                                    row.id,
                                                                ) ||
                                                                assigneeEditsLocked ||
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
                                                                    orderItemStatusSelectOptions
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

                                                {/* Deliverables Section */}
                                                <TableCell className="flex h-[30px] items-center justify-center gap-2 py-0">
                                                    <DeliverablesCell
                                                        status={row.status}
                                                        deliverables={
                                                            row.deliverables
                                                        }
                                                        isUpdating={Boolean(
                                                            isDeliverableUpdating?.(
                                                                row.id,
                                                            ),
                                                        )}
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
