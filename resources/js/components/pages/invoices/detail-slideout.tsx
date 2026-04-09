import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
    getInvoiceAddress,
    getInvoiceVenueName,
} from '@/helper-functions/format-currency';
import { useEditableTable } from '@/hooks/use-editable-table';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { cn } from '@/lib/utils';
import {
    type Company,
    type Country,
    type Invoice,
    type InvoiceItem,
    type Venue,
} from '@/types';
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
    companies: Company[];
    countries: Country[];
    venues: Venue[];
    invoiceItems: InvoiceItem[];
}

export default function InvoiceDetailSlideout({
    invoice,
    isOpen,
    onClose,
    companies,
    countries,
    venues,
    invoiceItems: invoiceItemsCatalog,
}: InvoiceDetailSlideoutProps) {
    const usersWithFallback = useUsersWithFallback();

    // Look up company data (before hooks to avoid hook order issues)
    const company = invoice
        ? companies.find((c) => c.id === invoice.company_id)
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
        accountPayableEmail: company?.pay_email || '',
        additionalEmails: [''] as string[],
    });

    // Action modal state (delete or restore)
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<'delete' | 'restore'>(
        'delete',
    );
    const [isMaximized, setIsMaximized] = useState(false);

    // Update form data when invoice changes
    useEffect(() => {
        if (!invoice) return;

        const currentCompany = companies.find(
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
            accountPayableEmail: currentCompany.pay_email || '',
            additionalEmails: [''],
        });
    }, [invoice, companies]);

    // Get filtered invoice items for the current invoice
    const invoiceItems = useMemo(() => {
        if (!invoice) return [];
        return invoiceItemsCatalog.filter(
            (item) => item.invoice_id === invoice.id,
        );
    }, [invoice, invoiceItemsCatalog]);

    // Use editable table hook
    const {
        localData: localInvoiceItems,
        handleDoubleClick,
        handleCellChange,
        handleCellBlur,
        handleCellKeyDown,
        isEditing,
        addItem,
        removeItem,
        startEditing,
    } = useEditableTable<InvoiceItem>({
        data: invoiceItems,
        getId: (item) => item.id,
    });

    // First order_id from existing items (for new rows); fallback to 0 if none
    const firstOrderId =
        localInvoiceItems.length > 0 ? localInvoiceItems[0].order_id : 0;

    const handleAddItem = () => {
        if (!invoice) return;
        const tempId = Date.now();
        const newItem: InvoiceItem = {
            id: tempId,
            order_id: firstOrderId,
            invoice_id: invoice.id,
            code: '',
            description: '',
            quantity: 0,
            price: 0,
        };
        addItem(newItem);
        startEditing(tempId, 'code');
    };

    const handleRemoveItem = (itemId: number | string) => {
        removeItem(itemId);
    };

    // Early return if invoice or company doesn't exist - AFTER all hooks are called
    if (!invoice || !company) {
        return null;
    }

    // Find user by user_id
    const orderedByUser = usersWithFallback.find(
        (user) => user.id === invoice.user_id,
    );

    // Find user who deleted the invoice
    const deletedByUser = usersWithFallback.find(
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

    const handleInputChange = (
        field: keyof typeof formData,
        value: string | string[],
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDeleteConfirm = (reason: string) => {
        console.log('Deleting invoice:', invoice, 'Reason:', reason);
        setIsActionModalOpen(false);
    };

    const handleRestoreConfirm = (reason: string) => {
        console.log('Restoring invoice:', invoice, 'Reason:', reason);
        setIsActionModalOpen(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className={cn(
                    'w-full overflow-y-auto p-0',
                    isMaximized
                        ? 'w-full max-w-full sm:max-w-full'
                        : 'sm:max-w-5xl',
                    'transition-[max-width] duration-300 ease-in-out',
                )}
                showExitBtn={false}
            >
                <InvoiceSlideoutHeader
                    tour={invoice.tour}
                    venue={getInvoiceVenueName(invoice, venues)}
                    market={invoice.market}
                    onSend={() => console.log(`Send invoice: ${invoice}`)}
                    onMaximize={() => setIsMaximized((m) => !m)}
                    onMore={() => console.log(`Moar clicked`)}
                    onClose={onClose}
                    isMaximized={isMaximized}
                />

                <div className="space-y-6 p-4">
                    {/* Customer and Invoice Details Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <InvoiceAddressForm
                                countries={countries}
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
                                    accountPayableEmail:
                                        formData.accountPayableEmail,
                                    additionalEmails: formData.additionalEmails,
                                }}
                                onChange={handleInputChange}
                                orderedByUser={orderedByUser}
                            />
                        </div>

                        <InvoiceFormActions onCancel={onClose} />
                    </div>

                    {/* Action Buttons Section */}
                    <InvoiceActionButtons
                        isDeleted={invoice.isDeleted}
                        onDeleteInvoice={() => {
                            setModalAction('delete');
                            setIsActionModalOpen(true);
                        }}
                        onRestoreInvoice={() => {
                            setModalAction('restore');
                            setIsActionModalOpen(true);
                        }}
                        disabled={false}
                    />

                    {/* Deletion Info */}
                    {invoice.isDeleted && (
                        <div className="space-y-1 text-sm font-semibold text-black">
                            <p>
                                <span className="text-brand-gtc-red">
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
                                    <span className="text-brand-gtc-red">
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
                        onAddItem={handleAddItem}
                        onRemoveItem={handleRemoveItem}
                        totalAmount={totalAmount}
                        isDeleted={invoice.isDeleted}
                    />
                </div>
            </SheetContent>

            {/* Delete / Restore Invoice Modal */}
            <DeleteInvoiceModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                onConfirm={
                    modalAction === 'delete'
                        ? handleDeleteConfirm
                        : handleRestoreConfirm
                }
                invoice={invoice}
                action={modalAction}
            />
        </Sheet>
    );
}
