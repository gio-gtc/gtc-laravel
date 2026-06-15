import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import OrderModalLayout from './order-modal-layout';

const PLACEHOLDER =
    'Can you please make the numbering on the tour dates pop out more, and the background darker';

interface RevisionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (revisionText: string) => void | Promise<void>;
}

export default function RevisionRequestModal({
    isOpen,
    onClose,
    onSubmit,
}: RevisionRequestModalProps) {
    const [revisionText, setRevisionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setRevisionText('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        const trimmed = revisionText.trim();
        if (!trimmed || isSubmitting) {
            if (!trimmed) {
                toast.error('Please enter a revision comment.');
            }
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit?.(trimmed);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) {
            return;
        }
        onClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={handleClose}
            title="Revision Request"
            primaryLabel="Submit"
            onPrimaryClick={() => {
                void handleSubmit();
            }}
            primaryDisabled={!revisionText.trim()}
            primaryLoading={isSubmitting}
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
                    disabled={isSubmitting}
                />
            </div>
        </OrderModalLayout>
    );
}
