import { invoiceItemsData, mockUsers } from '@/components/mockdata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { type Invoice } from '@/types';
import { Calendar, Maximize2, MoreHorizontal, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InvoiceDetailSlideoutProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
}

function formatDateInput(value: string | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function InvoiceDetailSlideout({
    invoice,
    isOpen,
    onClose,
}: InvoiceDetailSlideoutProps) {
    const [formData, setFormData] = useState({
        companyName: invoice?.companyName || '',
        address: invoice?.address || '',
        invoiceReleaseDate: invoice?.invoiceReleaseDate || '',
        invoiceDueDate: invoice?.invoiceDueDate || '',
        clientReference: invoice?.clientReference || '',
    });

    // Update form data when invoice changes
    useEffect(() => {
        if (invoice) {
            setFormData({
                companyName: invoice.companyName || '',
                address: invoice.address || '',
                invoiceReleaseDate: invoice.invoiceReleaseDate || '',
                invoiceDueDate: invoice.invoiceDueDate || '',
                clientReference: invoice.clientReference || '',
            });
        }
    }, [invoice]);

    if (!invoice) return null;

    // Find user by user_id
    const orderedByUser = mockUsers.find((user) => user.id === invoice.user_id);

    // Filter invoice items by invoice_id
    const invoiceItems = invoiceItemsData.filter(
        (item) => item.invoice_id === invoice.id,
    );

    // Calculate total amount
    const totalAmount = invoiceItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
    );

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto p-0 sm:max-w-5xl"
            >
                <SheetHeader className="relative border-b px-6 pt-6 pb-4">
                    <div className="flex flex-col items-start justify-between pr-10 sm:flex-row">
                        <div className="flex-1">
                            <SheetTitle className="text-2xl font-semibold">
                                {invoice.tour}
                            </SheetTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {invoice.venue}, {invoice.market}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 px-6 py-6">
                    {/* Customer and Invoice Details Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <ColumnedRowsParent>
                                <RowsColumnedChild>
                                    <Label
                                        htmlFor="companyName"
                                        className="pt-2"
                                    >
                                        Company Name
                                    </Label>
                                    <Input
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'companyName',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </RowsColumnedChild>

                                <RowsColumnedChild>
                                    <Label htmlFor="address" className="pt-2">
                                        Address
                                    </Label>
                                    <textarea
                                        id="address"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.address}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'address',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                    />
                                </RowsColumnedChild>
                            </ColumnedRowsParent>

                            <ColumnedRowsParent>
                                <RowsColumnedChild>
                                    <Label
                                        htmlFor="invoiceReleaseDate"
                                        className="pt-2"
                                    >
                                        Invoice Release Date
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="invoiceReleaseDate"
                                            type="date"
                                            value={formatDateInput(
                                                formData.invoiceReleaseDate,
                                            )}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'invoiceReleaseDate',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const el =
                                                    document.getElementById(
                                                        'invoiceReleaseDate',
                                                    ) as HTMLInputElement | null;
                                                el?.showPicker?.();
                                                el?.focus();
                                                el?.click();
                                            }}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <Calendar className="h-4 w-4" />
                                        </button>
                                    </div>
                                </RowsColumnedChild>

                                <RowsColumnedChild>
                                    <Label
                                        htmlFor="invoiceDueDate"
                                        className="pt-2"
                                    >
                                        Invoice Due Date
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="invoiceDueDate"
                                            type="date"
                                            value={formatDateInput(
                                                formData.invoiceDueDate,
                                            )}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'invoiceDueDate',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const el =
                                                    document.getElementById(
                                                        'invoiceDueDate',
                                                    ) as HTMLInputElement | null;
                                                el?.showPicker?.();
                                                el?.focus();
                                                el?.click();
                                            }}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <Calendar className="h-4 w-4" />
                                        </button>
                                    </div>
                                </RowsColumnedChild>

                                <RowsColumnedChild>
                                    <Label
                                        htmlFor="clientReference"
                                        className="pt-2"
                                    >
                                        Client Reference
                                    </Label>
                                    <Input
                                        id="clientReference"
                                        value={formData.clientReference}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'clientReference',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </RowsColumnedChild>

                                <RowsColumnedChild>
                                    <Label htmlFor="orderedBy" className="pt-2">
                                        Ordered By
                                    </Label>
                                    <Input
                                        id="orderedBy"
                                        value={orderedByUser?.name || ''}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </RowsColumnedChild>
                            </ColumnedRowsParent>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="outline">Save Changes</Button>
                        </div>
                    </div>

                    <Separator />
                    {/* Action Buttons Section */}
                    <div className="flex justify-center gap-2">
                        <Button variant="destructive">Release Hold</Button>
                        <Button variant="outline">Delete Invoice</Button>
                    </div>

                    <Separator />
                    {/* Line Items Table */}
                    <div className="space-y-4">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">
                                            Code
                                        </TableHead>
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
                                    {invoiceItems.length > 0 ? (
                                        invoiceItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.code}
                                                </TableCell>
                                                <TableCell>
                                                    {item.description || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(item.price)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        item.quantity *
                                                            item.price,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                                                className="h-6 w-6 rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                                            >
                                                <svg
                                                    className="h-3 w-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 4v16m8-8H4"
                                                    />
                                                </svg>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        {/* Total Amount */}
                        <div className="flex justify-end pr-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">
                                    Total Amount:
                                </span>
                                <span className="text-lg font-semibold">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function RowsColumnedChild({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-start gap-2 md:grid md:grid-cols-[150px_1fr]">
            {children}
        </div>
    );
}

function ColumnedRowsParent({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-1 flex-col gap-2">{children}</div>;
}
