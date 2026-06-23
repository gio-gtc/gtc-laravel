import { formatShortUsDate } from '@/lib/format/date';
import { formatCents } from '@/helper-functions/format-currency';
import type { SubmitInvoice } from '@/types/orders-api';
import OrderModalLayout from './order-modal-layout';

interface OrderSubmitSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: SubmitInvoice | null;
}

export default function OrderSubmitSuccessModal({
    isOpen,
    onClose,
    invoice,
}: OrderSubmitSuccessModalProps) {
    if (!invoice) {
        return null;
    }

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Invoice Generated"
            primaryLabel="Close"
            onPrimaryClick={onClose}
            modalClasses="sm:max-w-[600px]"
        >
            <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Document #</span>
                    <span className="font-medium text-gray-700">
                        {invoice.document_number}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Total</span>
                    <span className="font-medium text-gray-700">
                        {formatCents(invoice.total_cents)}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Payment due</span>
                    <span className="font-medium text-gray-700">
                        {formatShortUsDate(invoice.payment_due)}
                    </span>
                </div>

                <div className="pt-1">
                    <p className="mb-2 text-gray-500">Line items</p>
                    <ul className="space-y-2">
                        {invoice.lines.map((line) => (
                            <li
                                key={line.id}
                                className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                            >
                                <span className="text-gray-700">
                                    {line.description}
                                    {line.quantity > 1
                                        ? ` × ${line.quantity}`
                                        : ''}
                                </span>
                                <span className="shrink-0 font-medium text-gray-700">
                                    {formatCents(line.total_cents)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </OrderModalLayout>
    );
}
