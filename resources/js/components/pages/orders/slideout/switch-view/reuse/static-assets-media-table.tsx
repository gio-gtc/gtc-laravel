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
import { EditableCellInput } from '@/components/utils/editable-table/editable-cell-input';
import { EditableCellSelect } from '@/components/utils/editable-table/editable-cell-select';
import { VENUE_ITEM_STATUS_SELECT_OPTIONS } from '@/components/utils/editable-table/venue-item-status-options';
import { VenueItemStatusBadge } from '@/components/utils/venue-item-status-badge';
import { cn } from '@/lib/utils';
import type {
    StaticAssetsMediaTableProps,
    StaticAssetsTableRow,
} from '@/types';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { DeliverablesCell } from './deliverables-buttons';

export default function StaticAssetsMediaTable({
    title,
    data,
    defaultOpen = true,
    onAdd,
    cellEditing,
}: StaticAssetsMediaTableProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

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
                            <span className="md-gray-700-weight-600">
                                {title}
                            </span>
                        </button>
                    </CollapsibleTrigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-4.5 cursor-pointer rounded-full border-1 border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white"
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
                                                        'xs-gray-300-weight-600',
                                                )}
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
                                                    {row.dueDate}
                                                </TableCell>
                                                <TableCell>
                                                    {row.assigned.length >
                                                        0 && (
                                                        <UserAvatarsStack
                                                            users={row.assigned}
                                                        />
                                                    )}
                                                </TableCell>

                                                {/* Preview Icons */}
                                                <TableCell>
                                                    <div className="flex justify-center rounded-full focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none">
                                                        {cellEditing ? (
                                                            <EditableCellSelect
                                                                value={
                                                                    row.status
                                                                }
                                                                itemId={
                                                                    row.id
                                                                }
                                                                field="status"
                                                                options={
                                                                    VENUE_ITEM_STATUS_SELECT_OPTIONS
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
                                                                disabled={
                                                                    false
                                                                }
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
