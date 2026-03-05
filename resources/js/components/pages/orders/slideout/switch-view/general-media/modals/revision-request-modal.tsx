import { Textarea } from '@/components/ui/textarea';
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
            modalClasses="sm:max-w-[600px]"
        >
            <div className="flex flex-col gap-2 text-xs">
                <Textarea
                    id="revision-request"
                    className="min-h-[120px]"
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                    placeholder={PLACEHOLDER}
                    rows={5}
                />
            </div>
        </OrderModalLayout>
    );
}
