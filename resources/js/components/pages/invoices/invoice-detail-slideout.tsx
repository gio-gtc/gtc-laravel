import {
    companiesData,
    countriesData,
    invoiceItemsData,
    mockUsers,
} from '@/components/mockdata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { EditableTableCell } from '@/components/utils/editable-table-cell';
import {
    formatCurrency,
    getInvoiceAddress,
} from '@/components/utils/functions';
import { useEditableTable } from '@/hooks/use-editable-table';
import { type Invoice, type InvoiceItem } from '@/types';
import {
    Calendar,
    Maximize2,
    MoreHorizontal,
    Plus,
    Send,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface InvoiceDetailSlideoutProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
}

function formatDateInput(value: string | undefined | null): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function InvoiceDetailSlideout({
    invoice,
    isOpen,
    onClose,
}: InvoiceDetailSlideoutProps) {
    // Look up company data from companiesData (before hooks to avoid hook order issues)
    const company = invoice
        ? companiesData.find((c) => c.id === invoice.company_id)
        : null;

    // Get address data: use invoice address if filled, otherwise use company address
    const addressData =
        invoice && company
            ? getInvoiceAddress(invoice, company)
            : {
                  billing_address: '',
                  city: '',
                  state: '',
                  zip: '',
                  country_id: '',
              };

    const [formData, setFormData] = useState({
        name: company?.name || '',
        billing_address: addressData.billing_address,
        city: addressData.city,
        state: addressData.state,
        zip: addressData.zip,
        country_id: addressData.country_id,
        release_date: invoice?.release_date || '',
        payment_due: invoice?.payment_due || '',
        clientReference: invoice?.clientReference || '',
    });

    // Update form data when invoice changes
    useEffect(() => {
        if (!invoice) return;

        const currentCompany = companiesData.find(
            (c) => c.id === invoice.company_id,
        );

        if (!currentCompany) {
            console.error(
                `Company not found for invoice ${invoice.id} with company_id ${invoice.company_id}`,
            );
            return;
        }

        const currentAddressData = getInvoiceAddress(invoice, currentCompany);
        setFormData({
            name: currentCompany.name || '',
            billing_address: currentAddressData.billing_address,
            city: currentAddressData.city,
            state: currentAddressData.state,
            zip: currentAddressData.zip,
            country_id: currentAddressData.country_id,
            release_date: invoice.release_date || '',
            payment_due: invoice.payment_due || '',
            clientReference: invoice.clientReference || '',
        });
    }, [invoice]);

    // Get filtered invoice items for the current invoice
    const invoiceItems = useMemo(() => {
        if (!invoice) return [];
        return invoiceItemsData.filter(
            (item) => item.invoice_id === invoice.id,
        );
    }, [invoice]);

    // Use editable table hook
    const {
        localData: localInvoiceItems,
        handleDoubleClick,
        handleCellChange,
        handleCellBlur,
        handleCellKeyDown,
        isEditing,
    } = useEditableTable<InvoiceItem>({
        data: invoiceItems,
        getId: (item) => item.id,
    });

    // Early return if invoice or company doesn't exist - AFTER all hooks are called
    if (!invoice || !company) {
        return null;
    }

    // Find user by user_id
    const orderedByUser = mockUsers.find((user) => user.id === invoice.user_id);

    // Calculate total amount from local invoice items
    const totalAmount = localInvoiceItems.reduce(
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
                                    <Label htmlFor="name" className="pt-2">
                                        Company Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </RowsColumnedChild>

                                <RowsColumnedChild>
                                    <Label
                                        htmlFor="billing_address"
                                        className="pt-2"
                                    >
                                        Billing Address
                                    </Label>
                                    <textarea
                                        id="billing_address"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.billing_address}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'billing_address',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                    />
                                </RowsColumnedChild>

                                <RowsColumnedChild>
                                    <Label htmlFor="city" className="pt-2">
                                        City
                                    </Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'city',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </RowsColumnedChild>

                                <RowsColumnedChild>
                                    <Label htmlFor="state" className="pt-2">
                                        State/Province
                                    </Label>
                                    <Input
                                        id="state"
                                        value={formData.state}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'state',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </RowsColumnedChild>

                                <RowsColumnedChild>
                                    <Label htmlFor="zip" className="pt-2">
                                        ZIP/Postal Code
                                    </Label>
                                    <Input
                                        id="zip"
                                        value={formData.zip}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'zip',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </RowsColumnedChild>

                                <RowsColumnedChild>
                                    <Label
                                        htmlFor="country_id"
                                        className="pt-2"
                                    >
                                        Country
                                    </Label>
                                    <Select
                                        value={formData.country_id}
                                        onValueChange={(value) =>
                                            handleInputChange(
                                                'country_id',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="country_id">
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countriesData.map((country) => (
                                                <SelectItem
                                                    key={country.id}
                                                    value={country.id.toString()}
                                                >
                                                    {country.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </RowsColumnedChild>
                            </ColumnedRowsParent>

                            <ColumnedRowsParent>
                                <RowsColumnedChild>
                                    <Label
                                        htmlFor="release_date"
                                        className="pt-2"
                                    >
                                        Invoice Release Date
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="release_date"
                                            type="date"
                                            value={formatDateInput(
                                                formData.release_date,
                                            )}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'release_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const el =
                                                    document.getElementById(
                                                        'release_date',
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
                                        htmlFor="payment_due"
                                        className="pt-2"
                                    >
                                        Invoice Due Date
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="payment_due"
                                            type="date"
                                            value={formatDateInput(
                                                formData.payment_due,
                                            )}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'payment_due',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const el =
                                                    document.getElementById(
                                                        'payment_due',
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

                        <div className="flex flex-col justify-end gap-2 sm:flex-row">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="outline">Save Changes</Button>
                        </div>
                    </div>

                    <Separator />
                    {/* Action Buttons Section */}
                    <div className="flex flex-col justify-center gap-2 sm:flex-row">
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
                                    {localInvoiceItems.length > 0 ? (
                                        localInvoiceItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <EditableTableCell
                                                        value={item.code}
                                                        itemId={item.id}
                                                        field="code"
                                                        type="text"
                                                        onChange={
                                                            handleCellChange
                                                        }
                                                        onDoubleClick={
                                                            handleDoubleClick
                                                        }
                                                        onBlur={handleCellBlur}
                                                        onKeyDown={
                                                            handleCellKeyDown
                                                        }
                                                        isEditing={isEditing(
                                                            item.id,
                                                            'code',
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <EditableTableCell
                                                        value={
                                                            item.description ||
                                                            ''
                                                        }
                                                        itemId={item.id}
                                                        field="description"
                                                        type="text"
                                                        // TODO: Check this line out - To funky
                                                        formatValue={(val) =>
                                                            val === '' ||
                                                            val === null ||
                                                            val === undefined
                                                                ? 'N/A'
                                                                : String(val)
                                                        }
                                                        onChange={
                                                            handleCellChange
                                                        }
                                                        onDoubleClick={
                                                            handleDoubleClick
                                                        }
                                                        onBlur={handleCellBlur}
                                                        onKeyDown={
                                                            handleCellKeyDown
                                                        }
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
                                                        onChange={
                                                            handleCellChange
                                                        }
                                                        onDoubleClick={
                                                            handleDoubleClick
                                                        }
                                                        onBlur={handleCellBlur}
                                                        onKeyDown={
                                                            handleCellKeyDown
                                                        }
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
                                                                typeof val ===
                                                                    'string'
                                                                    ? parseFloat(
                                                                          val,
                                                                      ) || 0
                                                                    : val,
                                                            )
                                                        }
                                                        onChange={
                                                            handleCellChange
                                                        }
                                                        onDoubleClick={
                                                            handleDoubleClick
                                                        }
                                                        onBlur={handleCellBlur}
                                                        onKeyDown={
                                                            handleCellKeyDown
                                                        }
                                                        isEditing={isEditing(
                                                            item.id,
                                                            'price',
                                                        )}
                                                        align="right"
                                                    />
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
                                                        className="h-6 w-6 rounded-full border-2 border-destructive text-destructive hover:bg-destructive/90"
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
