import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { EditableTableCell } from '@/components/utils/editable-table-cell';
import { formatCurrency } from '@/components/utils/functions';
import { cn } from '@/lib/utils';
import { type Item } from '@/types';
import { Plus, X } from 'lucide-react';

interface InvoiceLineItemsTableProps {
    items: Item[];
    onItemChange: (
        itemId: number | string,
        field: string,
        value: string | number,
    ) => void;
    onItemDoubleClick: (itemId: number | string, field: string) => void;
    onItemBlur: () => void;
    onItemKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement>,
        itemId: number | string,
        field: string,
    ) => void;
    isEditing: (itemId: number | string, field: string) => boolean;
    onAddItem?: () => void;
    onRemoveItem?: (itemId: number | string) => void;
    totalAmount: number;
    isDeleted?: boolean;
}

export default function InvoiceLineItemsTable({
    items,
    onItemChange,
    onItemDoubleClick,
    onItemBlur,
    onItemKeyDown,
    isEditing,
    onAddItem,
    onRemoveItem,
    totalAmount,
    isDeleted = false,
}: InvoiceLineItemsTableProps) {
    const iconSizes = {
        container: 'size-4',
        icon: 'size-2.5',
        stroke: 3,
    };

    return (
        <div className="space-y-4 rounded-md border">
            <Table
                className={cn(
                    isDeleted &&
                        '[background-image:repeating-linear-gradient(-45deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)]',
                )}
            >
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[120px] text-center">
                            Code
                        </TableHead>
                        <TableHead className="text-center">
                            Description
                        </TableHead>
                        <TableHead className="w-[100px] text-center">
                            Quantity
                        </TableHead>
                        <TableHead className="w-[150px] text-center">
                            Price
                        </TableHead>
                        <TableHead className="w-[150px] text-center">
                            Total
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length > 0 ? (
                        items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <EditableTableCell
                                        value={item.code}
                                        itemId={item.id}
                                        field="code"
                                        type="text"
                                        onChange={onItemChange}
                                        onDoubleClick={onItemDoubleClick}
                                        onBlur={onItemBlur}
                                        onKeyDown={onItemKeyDown}
                                        isEditing={isEditing(item.id, 'code')}
                                        disabled={isDeleted}
                                    />
                                </TableCell>
                                <TableCell>
                                    <EditableTableCell
                                        value={item.description || ''}
                                        itemId={item.id}
                                        field="description"
                                        type="text"
                                        formatValue={(val) =>
                                            val === '' ||
                                            val === null ||
                                            val === undefined
                                                ? 'N/A'
                                                : String(val)
                                        }
                                        onChange={onItemChange}
                                        onDoubleClick={onItemDoubleClick}
                                        onBlur={onItemBlur}
                                        onKeyDown={onItemKeyDown}
                                        isEditing={isEditing(
                                            item.id,
                                            'description',
                                        )}
                                        disabled={isDeleted}
                                    />
                                </TableCell>
                                <TableCell>
                                    <EditableTableCell
                                        className="text-gray-400"
                                        value={item.quantity}
                                        itemId={item.id}
                                        field="quantity"
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        emptyValue={0}
                                        emptyPlaceholder="0"
                                        onChange={onItemChange}
                                        onDoubleClick={onItemDoubleClick}
                                        onBlur={onItemBlur}
                                        onKeyDown={onItemKeyDown}
                                        isEditing={isEditing(
                                            item.id,
                                            'quantity',
                                        )}
                                        align="center"
                                        disabled={isDeleted}
                                    />
                                </TableCell>
                                <TableCell>
                                    <EditableTableCell
                                        className="text-gray-400"
                                        value={item.price}
                                        itemId={item.id}
                                        field="price"
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        emptyValue={0}
                                        emptyPlaceholder={formatCurrency(0)}
                                        formatValue={(val) =>
                                            formatCurrency(
                                                typeof val === 'string'
                                                    ? parseFloat(val) || 0
                                                    : val,
                                            )
                                        }
                                        onChange={onItemChange}
                                        onDoubleClick={onItemDoubleClick}
                                        onBlur={onItemBlur}
                                        onKeyDown={onItemKeyDown}
                                        isEditing={isEditing(item.id, 'price')}
                                        align="right"
                                        disabled={isDeleted}
                                    />
                                </TableCell>
                                <TableCell className="text-right text-xs font-semibold text-gray-500">
                                    {formatCurrency(item.quantity * item.price)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-white ${iconSizes.container}`}
                                        onClick={() => onRemoveItem?.(item.id)}
                                        disabled={isDeleted}
                                    >
                                        <X
                                            className={`${iconSizes.icon}`}
                                            strokeWidth={iconSizes.stroke}
                                        />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No items found.
                            </TableCell>
                        </TableRow>
                    )}
                    {/* Add Item Row */}
                    <TableRow>
                        <TableCell colSpan={5}></TableCell>
                        <TableCell className="text-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`rounded-full border-2 border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white ${iconSizes.container}`}
                                onClick={onAddItem}
                                disabled={isDeleted}
                            >
                                <Plus
                                    className={`${iconSizes.icon}`}
                                    strokeWidth={iconSizes.stroke}
                                />
                            </Button>
                        </TableCell>
                    </TableRow>

                    {/* Total Amount */}
                    <TableRow>
                        <TableCell
                            className="border-transparent"
                            colSpan={3}
                        ></TableCell>
                        <TableCell className="border-transparent text-right">
                            <span className="text-xs font-semibold text-gray-500">
                                Total Amount:
                            </span>
                        </TableCell>
                        <TableCell className="border-transparent text-right">
                            <span className="text-xs font-semibold text-gray-900">
                                {formatCurrency(totalAmount)}
                            </span>
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
