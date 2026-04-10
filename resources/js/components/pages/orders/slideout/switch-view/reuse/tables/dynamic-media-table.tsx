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
import { toggleRowSelectionOnRowClick } from '@/lib/row-select-toggle';
import { cn } from '@/lib/utils';
import { MediaTableProps, MediaTableRow } from '@/types';
import { useState } from 'react';
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
    onPreviewClick,
    cellEditing,
    editScope,
    selectedRowIds,
    onRowSelectToggle,
    onBulkEditDueDateDoubleClick,
    onBulkEditAssignedDoubleClick,
    venueItemStatusSelectOptions,
}: MediaTableProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const durationVariant =
        previewKind === 'audio' ? 'audio' : 'broadcastSocial';

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
                                    <TableHead className="w-[13%] text-center">
                                        ISCI
                                    </TableHead>
                                    <TableHead className="w-[24%] text-center">
                                        Cut Name
                                    </TableHead>
                                    <TableHead className="w-[8%] text-center">
                                        Duration
                                    </TableHead>
                                    <TableHead className="w-[9%] text-center">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="w-[9%] text-center">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="w-[18%] text-center">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-[8%] text-center">
                                        Preview
                                    </TableHead>
                                    <TableHead className="w-[11%] text-center">
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
                                                            <DropdownMenuItem
                                                                disabled={
                                                                    isDisabledRow
                                                                }
                                                                onClick={() =>
                                                                    onEditIsciRow?.(
                                                                        row,
                                                                    )
                                                                }
                                                            >
                                                                Edit ISCI
                                                            </DropdownMenuItem>
                                                            {onEditLineInModal && (
                                                                <DropdownMenuItem
                                                                    disabled={
                                                                        isDisabledRow
                                                                    }
                                                                    onClick={() =>
                                                                        onEditLineInModal(
                                                                            row,
                                                                        )
                                                                    }
                                                                >
                                                                    Edit line details
                                                                </DropdownMenuItem>
                                                            )}
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
                                                    {cellEditing ? (
                                                        <EditableCellInput
                                                            value={row.cutName}
                                                            itemId={row.id}
                                                            field="cutName"
                                                            type="text"
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
                                                                isDisabledRow
                                                            }
                                                        />
                                                    ) : (
                                                        row.cutName
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {cellEditing ? (
                                                        <EditableCellSelect
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
                                                                    Number(
                                                                        v,
                                                                    ) || 0,
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
                                                                isDisabledRow
                                                            }
                                                        />
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

                                                <TableCell className="h-[30px] py-0 text-center">
                                                    {cellEditing ? (
                                                        <EditableCellSelect
                                                            value={row.status}
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
                                                            disabled={false}
                                                        />
                                                    ) : (
                                                        <VenueItemStatusBadge
                                                            status={row.status}
                                                        />
                                                    )}
                                                </TableCell>

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
