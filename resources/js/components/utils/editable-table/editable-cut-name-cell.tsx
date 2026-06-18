import { EditableCellInput } from '@/components/utils/editable-table/editable-cell-input';
import type { VenueTableCellEditing } from '@/types';

interface EditableCutNameCellProps {
    itemId: string | number;
    spotType: string;
    cut: string;
    cellEditing: VenueTableCellEditing;
    editScope?: string;
    disabled?: boolean;
    inactive?: boolean;
}

export function EditableCutNameCell({
    itemId,
    spotType,
    cut,
    cellEditing,
    editScope,
    disabled = false,
    inactive = false,
}: EditableCutNameCellProps) {
    const sharedInputProps = {
        type: 'text' as const,
        variant: 'orderSlideoutTableCells' as const,
        fitContentWidth: true,
        itemId,
        onChange: cellEditing.onCellChange,
        onBlur: cellEditing.onCellBlur,
        disabled,
        inactive,
    };

    return (
        <div className="flex min-w-0 items-center gap-0.5">
            <EditableCellInput
                {...sharedInputProps}
                value={spotType}
                field="spot_type"
                onDoubleClick={(id, field) =>
                    cellEditing.onCellDoubleClick(id, field, editScope)
                }
                onKeyDown={(e, id, field) =>
                    cellEditing.onCellKeyDown(e, id, field, editScope)
                }
                isEditing={cellEditing.isCellEditing(
                    itemId,
                    'spot_type',
                    editScope,
                )}
            />
            <EditableCellInput
                {...sharedInputProps}
                value={cut}
                field="cut"
                onDoubleClick={(id, field) =>
                    cellEditing.onCellDoubleClick(id, field, editScope)
                }
                onKeyDown={(e, id, field) =>
                    cellEditing.onCellKeyDown(e, id, field, editScope)
                }
                isEditing={cellEditing.isCellEditing(itemId, 'cut', editScope)}
            />
        </div>
    );
}
