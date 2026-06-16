import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
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
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import { EditableCellInput } from '@/components/utils/editable-table/editable-cell-input';
import { EditableCellSelect } from '@/components/utils/editable-table/editable-cell-select';
import { durationSelectOptionsForMediaTable } from '@/components/utils/editable-table/media-duration-options';
import { VenueItemStatusBadge } from '@/components/utils/venue-item-status-badge';
import { formatDurationSeconds } from '@/helper-functions/format-time';
import {
    durationDisplayLabel,
    durationWireFromNumericInput,
    parseDurationWireAsSeconds,
} from '@/lib/orders/broadcast-spec-wire';
import { toggleRowSelectionOnRowClick } from '@/lib/row-select-toggle';
import { cn } from '@/lib/utils';
import { MediaTableProps, MediaTableRow } from '@/types';
import { useState } from 'react';
import AwaitingAssetsIconGroup from '@/components/pages/orders/awaiting-assets-icons';
import { CollapsibleTableSectionHeader } from './collapsible-table-section-header';
import { DeliverablesCell } from './sections/deliverables-buttons';
import { MediaPreviewCell } from './sections/media-preview-cell';

export default function MediaTable({
    title,
    data,
    defaultOpen = true,
    onAdd,
    previewKind = 'video',
    onUploadRow,
    onEditIsciRow,
    onEditLineInModal,
    isEditLineDisabled,
    onRemoveFromCart,
    canRemoveFromCart,
    allowEditInactiveRows = false,
    onPreviewClick,
    cellEditing,
    editScope,
    selectedRowIds,
    onRowSelectToggle,
    onBulkEditDueDateDoubleClick,
    onBulkEditAssignedDoubleClick,
    canEditAssignees = false,
    canEditStatus = false,
    orderItemStatusSelectOptions,
}: MediaTableProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const durationVariant =
        previewKind === 'audio' ? 'audio' : 'broadcastSocial';

    const showAssetTrackingColumn = editScope === 'broadcast';

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
                                    <TableHead className="w-full max-w-[13%] text-center">
                                        ISCI
                                    </TableHead>
                                    <TableHead className="w-full max-w-[24%] text-center">
                                        Cut Name
                                    </TableHead>
                                    <TableHead className="w-full max-w-[8%] text-center">
                                        Duration
                                    </TableHead>
                                    <TableHead className="w-full max-w-[9%] text-center">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="w-full max-w-[9%] text-center">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="w-full max-w-[18%] text-center">
                                        Status
                                    </TableHead>
                                    {showAssetTrackingColumn ? (
                                        <TableHead className="w-full max-w-[8%] text-center">
                                            Assets
                                        </TableHead>
                                    ) : null}
                                    <TableHead className="w-full max-w-[8%] text-center">
                                        Preview
                                    </TableHead>
                                    <TableHead className="w-full max-w-[11%] text-center">
                                        Deliverables
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length > 0 ? (
                                    data.map((row) => {
                                        const isCancelledRow =
                                            row.status === 'Cancelled';
                                        const isRevisionRequestedRow =
                                            row.status === 'Revision Request';
                                        const isInactiveRow =
                                            isCancelledRow ||
                                            isRevisionRequestedRow;
                                        const isDisabledRow =
                                            isInactiveRow &&
                                            !allowEditInactiveRows;
                                        const rowEditsLocked = isDisabledRow;
                                        const statusEditsLocked =
                                            rowEditsLocked || !canEditStatus;
                                        const assigneeEditsLocked =
                                            isDisabledRow || !canEditAssignees;
                                        return (
                                            <TableRow
                                                key={row.id}
                                                className={cn(
                                                    'xs-gray-500-weight-600 hover:bg-gray-100',
                                                    isDisabledRow &&
                                                        'xs-gray-300-weight-600',
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
                                                <TableCell className="truncate">
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
                                                            {onEditLineInModal && (
                                                                <DropdownMenuItem
                                                                    disabled={
                                                                        rowEditsLocked ||
                                                                        isEditLineDisabled?.(
                                                                            row,
                                                                        )
                                                                    }
                                                                    onClick={() =>
                                                                        onEditLineInModal(
                                                                            row,
                                                                        )
                                                                    }
                                                                >
                                                                    Edit Line
                                                                    Details
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                disabled={
                                                                    rowEditsLocked
                                                                }
                                                                onClick={() =>
                                                                    onEditIsciRow?.(
                                                                        row,
                                                                    )
                                                                }
                                                            >
                                                                Edit ISCI
                                                            </DropdownMenuItem>
                                                            {onRemoveFromCart &&
                                                            canRemoveFromCart?.(
                                                                row,
                                                            ) ? (
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() =>
                                                                        onRemoveFromCart(
                                                                            row,
                                                                        )
                                                                    }
                                                                >
                                                                    Remove from
                                                                    cart
                                                                </DropdownMenuItem>
                                                            ) : null}
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

                                                {/* Cut Name Section */}
                                                <TableCell className="truncate">
                                                    {/* {cellEditing ? (
                                                        <EditableCellInput
                                                            value={row.cutName}
                                                            itemId={row.id}
                                                            field="cutName"
                                                            type="text"
                                                            variant="orderSlideoutTableCells"
                                                            onChange={
                                                                cellEditing.onCellChange
                                                            }
                                                            onDoubleClick={(
                                                                id,
                                                                field,
                                                            ) =>
                                                                cellEditing.onCellDoubleClick(
                                                                    id,
                                                                    field,
                                                                    editScope,
                                                                )
                                                            }
                                                            onBlur={
                                                                cellEditing.onCellBlur
                                                            }
                                                            onKeyDown={(
                                                                e,
                                                                id,
                                                                field,
                                                            ) =>
                                                                cellEditing.onCellKeyDown(
                                                                    e,
                                                                    id,
                                                                    field,
                                                                    editScope,
                                                                )
                                                            }
                                                            isEditing={cellEditing.isCellEditing(
                                                                row.id,
                                                                'cutName',
                                                                editScope,
                                                            )}
                                                            disabled={
                                                                rowEditsLocked
                                                            }
                                                        />
                                                    ) : ( */}
                                                    {row.cutName}
                                                    {/* )} */}
                                                </TableCell>
                                                <TableCell>
                                                    {cellEditing &&
                                                    editScope === 'broadcast' ? (
                                                        <EditableCellInput
                                                            variant="orderSlideoutTableCells"
                                                            type="number"
                                                            min={0}
                                                            step={1}
                                                            value={
                                                                parseDurationWireAsSeconds(
                                                                    row.duration_wire ??
                                                                        String(
                                                                            row.duration_seconds,
                                                                        ),
                                                                ) ??
                                                                row.duration_seconds
                                                            }
                                                            itemId={row.id}
                                                            field="duration_seconds"
                                                            formatValue={() =>
                                                                durationDisplayLabel(
                                                                    row.duration_wire ??
                                                                        String(
                                                                            row.duration_seconds,
                                                                        ),
                                                                )
                                                            }
                                                            onChange={(
                                                                itemId,
                                                                field,
                                                                value,
                                                            ) => {
                                                                const seconds =
                                                                    typeof value ===
                                                                    'number'
                                                                        ? value
                                                                        : Number(
                                                                              value,
                                                                          ) ||
                                                                          0;
                                                                cellEditing.onCellChange(
                                                                    itemId,
                                                                    field,
                                                                    seconds,
                                                                );
                                                                cellEditing.onCellChange(
                                                                    itemId,
                                                                    'duration_wire',
                                                                    durationWireFromNumericInput(
                                                                        seconds,
                                                                    ),
                                                                );
                                                            }}
                                                            onDoubleClick={(
                                                                id,
                                                                field,
                                                            ) =>
                                                                cellEditing.onCellDoubleClick(
                                                                    id,
                                                                    field,
                                                                    editScope,
                                                                )
                                                            }
                                                            onBlur={
                                                                cellEditing.onCellBlur
                                                            }
                                                            onKeyDown={(
                                                                e,
                                                                id,
                                                                field,
                                                            ) =>
                                                                cellEditing.onCellKeyDown(
                                                                    e,
                                                                    id,
                                                                    field,
                                                                    editScope,
                                                                )
                                                            }
                                                            isEditing={cellEditing.isCellEditing(
                                                                row.id,
                                                                'duration_seconds',
                                                                editScope,
                                                            )}
                                                            disabled={
                                                                rowEditsLocked
                                                            }
                                                        />
                                                    ) : cellEditing ? (
                                                        <EditableCellSelect
                                                            variant="orderSlideoutTableCells"
                                                            value={String(
                                                                row.duration_seconds,
                                                            )}
                                                            itemId={row.id}
                                                            field="duration_seconds"
                                                            options={durationSelectOptionsForMediaTable(
                                                                row.duration_seconds,
                                                                durationVariant,
                                                            )}
                                                            renderDisplay={(
                                                                v,
                                                            ) =>
                                                                formatDurationSeconds(
                                                                    Number(v) ||
                                                                        0,
                                                                )
                                                            }
                                                            onChange={(
                                                                itemId,
                                                                field,
                                                                value,
                                                            ) =>
                                                                cellEditing.onCellChange(
                                                                    itemId,
                                                                    field,
                                                                    field ===
                                                                        'duration_seconds'
                                                                        ? Number(
                                                                              value,
                                                                          )
                                                                        : value,
                                                                )
                                                            }
                                                            onDoubleClick={(
                                                                id,
                                                                field,
                                                            ) =>
                                                                cellEditing.onCellDoubleClick(
                                                                    id,
                                                                    field,
                                                                    editScope,
                                                                )
                                                            }
                                                            onBlur={
                                                                cellEditing.onCellBlur
                                                            }
                                                            onKeyDown={(
                                                                e,
                                                                id,
                                                                field,
                                                            ) =>
                                                                cellEditing.onCellKeyDown(
                                                                    e,
                                                                    id,
                                                                    field,
                                                                    editScope,
                                                                )
                                                            }
                                                            isEditing={cellEditing.isCellEditing(
                                                                row.id,
                                                                'duration_seconds',
                                                                editScope,
                                                            )}
                                                            disabled={
                                                                rowEditsLocked
                                                            }
                                                        />
                                                    ) : editScope ===
                                                      'broadcast' ? (
                                                        durationDisplayLabel(
                                                            row.duration_wire ??
                                                                String(
                                                                    row.duration_seconds,
                                                                ),
                                                        )
                                                    ) : (
                                                        formatDurationSeconds(
                                                            row.duration_seconds,
                                                        )
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

                                                {/* Assigned Section */}
                                                <TableCell>
                                                    <div
                                                        className={cn(
                                                            'flex min-h-[30px] align-middle',
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

                                                <TableCell className="h-[30px] py-0 text-center">
                                                    {cellEditing ? (
                                                        <EditableCellSelect
                                                            variant="orderSlideoutTableCells"
                                                            value={row.status}
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
                                                                        v as MediaTableRow['status']
                                                                    }
                                                                />
                                                            )}
                                                            onChange={
                                                                cellEditing.onCellChange
                                                            }
                                                            onDoubleClick={(
                                                                id,
                                                                field,
                                                            ) =>
                                                                cellEditing.onCellDoubleClick(
                                                                    id,
                                                                    field,
                                                                    editScope,
                                                                )
                                                            }
                                                            onBlur={
                                                                cellEditing.onCellBlur
                                                            }
                                                            onKeyDown={(
                                                                e,
                                                                id,
                                                                field,
                                                            ) =>
                                                                cellEditing.onCellKeyDown(
                                                                    e,
                                                                    id,
                                                                    field,
                                                                    editScope,
                                                                )
                                                            }
                                                            isEditing={cellEditing.isCellEditing(
                                                                row.id,
                                                                'status',
                                                                editScope,
                                                            )}
                                                            disabled={
                                                                statusEditsLocked
                                                            }
                                                        />
                                                    ) : (
                                                        <VenueItemStatusBadge
                                                            status={row.status}
                                                        />
                                                    )}
                                                </TableCell>

                                                {showAssetTrackingColumn ? (
                                                    <TableCell>
                                                        <div className="flex justify-center gap-1">
                                                            <AwaitingAssetsIconGroup
                                                                tags={
                                                                    row.missingAssetTags
                                                                }
                                                                iconClassName="size-3"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                ) : null}

                                                <TableCell>
                                                    <MediaPreviewCell
                                                        kind={previewKind}
                                                        disabled={isDisabledRow}
                                                        onPreviewClick={(
                                                            iconIndex,
                                                        ) =>
                                                            onPreviewClick?.(
                                                                row,
                                                                iconIndex,
                                                            )
                                                        }
                                                    />
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
