import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Divider from '@/components/utils/divider';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const TYPE_OPTIONS = [
    'Key Art Package',
    'Socials & Web Banners',
    'International Key art & Social Package',
] as const;

export type KeyArtType = (typeof TYPE_OPTIONS)[number];

export interface AddKeyArtStaticAssetsFormValues {
    type: KeyArtType;
}

interface AddKeyArtStaticAssetsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (values: AddKeyArtStaticAssetsFormValues) => void;
}

export default function AddKeyArtStaticAssetsModal({
    isOpen,
    onClose,
    onAdd,
}: AddKeyArtStaticAssetsModalProps) {
    const [type, setType] = useState<KeyArtType>('Key Art Package');

    useEffect(() => {
        if (!isOpen) {
            setType('Key Art Package');
        }
    }, [isOpen]);

    const handleAddToOrder = () => {
        onAdd?.({ type });
        onClose();
    };

    const pillBase = 'w-full rounded-md transition-colors text-xs';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="gap-3 sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-gray-900">
                        Add Key Art & Static Assets
                    </DialogTitle>
                </DialogHeader>

                <Divider />

                <div className="flex flex-col gap-2 text-xs">
                    <Label className="text-gray-900">Type</Label>
                    <p className="text-gray-500">Select Print Package</p>
                    <div className="flex flex-col gap-2">
                        {TYPE_OPTIONS.map((option) => (
                            <Button
                                key={option}
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cn(
                                    pillBase,
                                    'border-gray-300 bg-white text-gray-900 hover:bg-brand-gtc-red/80',
                                    type === option &&
                                        'bg-brand-gtc-red/70 text-white hover:bg-brand-gtc-red/60 hover:text-white',
                                )}
                                onClick={() => setType(option)}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
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
                        onClick={handleAddToOrder}
                    >
                        Add to Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
