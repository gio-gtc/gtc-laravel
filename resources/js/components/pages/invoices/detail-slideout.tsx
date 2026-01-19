import {
    companiesData,
    invoiceItemsData,
    mockUsers,
} from '@/components/mockdata';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { getInvoiceAddress } from '@/components/utils/functions';
import { useEditableTable } from '@/hooks/use-editable-table';
import { type Invoice, type InvoiceItem } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import InvoiceActionButtons from './slideout/action-buttons';
import InvoiceAddressForm from './slideout/address-form';
import DeleteInvoiceModal from './slideout/delete-invoice-modal';
import InvoiceFormActions from './slideout/form-actions';
import InvoiceDetailsForm from './slideout/invoice-details-form';
import InvoiceLineItemsTable from './slideout/line-items-table';
import InvoiceSlideoutHeader from './slideout/slideout-header';

interface InvoiceDetailSlideoutProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
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

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

    // Find user who deleted the invoice
    const deletedByUser = mockUsers.find(
        (user) => user.id === invoice.deleted_by,
    );

    // Format delete date as readable date and time with AM/PM
    const formatDeleteDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    // Calculate total amount from local invoice items
    const totalAmount = localInvoiceItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
    );

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDeleteConfirm = (reason: string) => {
        console.log('Deleting invoice:', invoice, 'Reason:', reason);
        setIsDeleteModalOpen(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto p-0 sm:max-w-5xl"
            >
                <InvoiceSlideoutHeader
                    tour={invoice.tour}
                    venue={invoice.venue}
                    market={invoice.market}
                />

                <div className="space-y-6 px-6 py-6">
                    {/* Customer and Invoice Details Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <InvoiceAddressForm
                                formData={{
                                    name: formData.name,
                                    billing_address: formData.billing_address,
                                    city: formData.city,
                                    state: formData.state,
                                    zip: formData.zip,
                                    country_id: formData.country_id,
                                }}
                                onChange={handleInputChange}
                            />

                            <InvoiceDetailsForm
                                formData={{
                                    release_date: formData.release_date,
                                    payment_due: formData.payment_due,
                                    clientReference: formData.clientReference,
                                }}
                                onChange={handleInputChange}
                                orderedByUser={orderedByUser}
                            />
                        </div>

                        <InvoiceFormActions onCancel={onClose} />
                    </div>

                    <Separator />
                    {/* Action Buttons Section */}
                    <InvoiceActionButtons
                        onDeleteInvoice={() => setIsDeleteModalOpen(true)}
                        disabled={invoice.isDeleted}
                    />

                    <Separator />
                    {/* Deletion Info */}
                    {invoice.isDeleted && (
                        <div className="space-y-1 font-semibold">
                            <p>
                                <span className="text-red-500">
                                    Deleted By:{' '}
                                </span>
                                {deletedByUser
                                    ? [
                                          deletedByUser.first_name,
                                          deletedByUser.last_name,
                                      ]
                                          .filter(Boolean)
                                          .join(' ')
                                    : 'Unknown User'}{' '}
                                on {formatDeleteDate(invoice.delete_date)}
                            </p>
                            {invoice.deleted_reason && (
                                <p>
                                    <span className="text-red-500">
                                        Reason:{' '}
                                    </span>
                                    {invoice.deleted_reason}
                                </p>
                            )}
                        </div>
                    )}
                    {/* Line Items Table */}
                    <InvoiceLineItemsTable
                        items={localInvoiceItems}
                        onItemChange={handleCellChange}
                        onItemDoubleClick={handleDoubleClick}
                        onItemBlur={handleCellBlur}
                        onItemKeyDown={handleCellKeyDown}
                        isEditing={isEditing}
                        totalAmount={totalAmount}
                        isDeleted={invoice.isDeleted}
                    />
                </div>
            </SheetContent>

            {/* Delete Invoice Modal */}
            <DeleteInvoiceModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                invoice={invoice}
            />
        </Sheet>
    );
}
