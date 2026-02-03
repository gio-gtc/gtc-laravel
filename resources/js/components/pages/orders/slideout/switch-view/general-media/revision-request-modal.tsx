import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Divider from '@/components/utils/divider';
import { useEffect, useState } from 'react';

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="gap-3 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-bold text-gray-900">
                        Revision Request
                    </DialogTitle>
                </DialogHeader>

                <Divider />

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

                <Divider />

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-brand-gtc-red text-white hover:bg-brand-gtc-red/70"
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
