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
import { type InvoiceItem } from '@/types';
import { Plus, X } from 'lucide-react';

interface InvoiceLineItemsTableProps {
    items: InvoiceItem[];
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
    onRemoveItem?: (itemId: number) => void;
    totalAmount: number;
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
}: InvoiceLineItemsTableProps) {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[100px] text-right">
                                Quantity
                            </TableHead>
                            <TableHead className="w-[150px] text-right">
                                Price
                            </TableHead>
                            <TableHead className="w-[150px] text-right">
                                Total
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length > 0 ? (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <EditableTableCell
                                            value={item.code}
                                            itemId={item.id}
                                            field="code"
                                            type="text"
                                            onChange={onItemChange}
                                            onDoubleClick={onItemDoubleClick}
                                            onBlur={onItemBlur}
                                            onKeyDown={onItemKeyDown}
                                            isEditing={isEditing(
                                                item.id,
                                                'code',
                                            )}
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
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EditableTableCell
                                            value={item.quantity}
                                            itemId={item.id}
                                            field="quantity"
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            onChange={onItemChange}
                                            onDoubleClick={onItemDoubleClick}
                                            onBlur={onItemBlur}
                                            onKeyDown={onItemKeyDown}
                                            isEditing={isEditing(
                                                item.id,
                                                'quantity',
                                            )}
                                            align="right"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EditableTableCell
                                            value={item.price}
                                            itemId={item.id}
                                            field="price"
                                            type="number"
                                            min={0}
                                            step={0.01}
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
                                            isEditing={isEditing(
                                                item.id,
                                                'price',
                                            )}
                                            align="right"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(
                                            item.quantity * item.price,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-full border-2 border-destructive text-destructive hover:bg-destructive/90"
                                            onClick={() =>
                                                onRemoveItem?.(item.id)
                                            }
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center"
                                >
                                    No items found.
                                </TableCell>
                            </TableRow>
                        )}
                        {/* Add Item Row */}
                        <TableRow>
                            <TableCell colSpan={5}></TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full bg-muted text-muted-foreground"
                                    onClick={onAddItem}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Total Amount */}
            <div className="flex justify-end pr-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Total Amount:</span>
                    <span className="text-lg font-semibold">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>
            </div>
        </div>
    );
}
