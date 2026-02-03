import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles } from './shared';

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

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Add Key Art & Static Assets"
            primaryLabel="Add to Order"
            onPrimaryClick={handleAddToOrder}
            maxWidth="sm"
        >
            <div className="flex flex-col gap-2 text-xs">
                <Label className={orderModalStyles.label}>Type</Label>
                <p className={orderModalStyles.helper}>Select Print Package</p>
                <div className="flex flex-col gap-2">
                    {TYPE_OPTIONS.map((option) => (
                        <PillButton
                            key={option}
                            selected={type === option}
                            onClick={() => setType(option)}
                            baseClassName={orderModalStyles.pillFull}
                        >
                            {option}
                        </PillButton>
                    ))}
                </div>
            </div>
        </OrderModalLayout>
    );
}
