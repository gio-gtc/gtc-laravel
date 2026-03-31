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
                                    <TableHead className="w-[40%]">
                                        Cut Name
                                    </TableHead>
                                    <TableHead className="w-[6%]">W</TableHead>
                                    <TableHead className="w-[6]">H</TableHead>
                                    <TableHead className="w-[9%]">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="w-[9%]">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="w-[19%]">
                                        Status
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
                                                <TableCell>
                                                    {cellEditing ? (
                                                        <EditableCellInput
                                                            className=""
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
                                                <TableCell>
                                                    {cellEditing ? (
                                                        <EditableCellInput
                                                            className="text-gray-400"
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

                                                {/* Preview Icons */}
                                                <TableCell>
                                                    <div className="flex justify-center rounded-full focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none">
                                                        {cellEditing ? (
                                                            <EditableCellSelect
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
                                            colSpan={7}
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
