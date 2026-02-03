import { useEffect, useState } from 'react';
import OrderModalLayout from './order-modal-layout';

const PLACEHOLDER =
    'Can you please make the numbering on the tour dates pop out more, and the background darker';

interface RevisionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (revisionText: string) => void;
}

export default function RevisionRequestModal({
    isOpen,
    onClose,
    onSubmit,
}: RevisionRequestModalProps) {
    const [revisionText, setRevisionText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setRevisionText('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        onSubmit?.(revisionText);
        onClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Revision Request"
            primaryLabel="Submit"
            onPrimaryClick={handleSubmit}
            maxWidth="2xl"
        >
            <div className="flex flex-col gap-2 text-xs">
                <textarea
                    id="revision-request"
                    className="min-h-[120px] w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs transition-[color,box-shadow] outline-none placeholder:text-gray-500 focus-visible:border-gray-400 focus-visible:ring-[3px] focus-visible:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                    placeholder={PLACEHOLDER}
                    rows={5}
                />
            </div>
        </OrderModalLayout>
    );
}
