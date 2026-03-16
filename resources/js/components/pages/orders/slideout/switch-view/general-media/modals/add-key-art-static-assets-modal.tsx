import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';

const TYPE_OPTIONS = [
    'Key Art Package',
    'Socials & Web Banners',
    'International Key art & Social Package',
] as const;

export type KeyArtType = (typeof TYPE_OPTIONS)[number];

export interface AddKeyArtStaticAssetsFormValues {
    types: KeyArtType[];
}

interface AddKeyArtStaticAssetsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (values: AddKeyArtStaticAssetsFormValues) => void;
    isUSOrder?: boolean;
}

export default function AddKeyArtStaticAssetsModal({
    isOpen,
    onClose,
    onAdd,
    isUSOrder = false,
}: AddKeyArtStaticAssetsModalProps) {
    const [types, setTypes] = useState<KeyArtType[]>(['Key Art Package']);

    useEffect(() => {
        if (isOpen) {
            setTypes(
                isUSOrder
                    ? ['Socials & Web Banners', 'Key Art Package']
                    : ['Key Art Package'],
            );
        }
    }, [isOpen, isUSOrder]);

    const handleToggle = (option: KeyArtType) => {
        setTypes((prev) => toggleInArray(prev, option));
    };

    const handleAddToOrder = () => {
        onAdd?.({ types });
        onClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Add Key Art & Static Assets"
            primaryLabel="Add to Order"
            onPrimaryClick={handleAddToOrder}
            primaryDisabled={types.length === 0}
            modalClasses="sm:max-w-[264px] px-2"
        >
            <div className="flex flex-col gap-2 text-xs">
                <Label className={orderModalStyles.label}>Type</Label>
                <p className={orderModalStyles.helper}>Select one or more</p>
                <div className="flex flex-col gap-2">
                    {TYPE_OPTIONS.map((option) => (
                        <PillButton
                            key={option}
                            selected={types.includes(option)}
                            onClick={() => handleToggle(option)}
                            baseClassName={orderModalStyles.pillFull}
                            className="justify-start px-2 hover:text-white"
                        >
                            {option}
                        </PillButton>
                    ))}
                </div>
            </div>
        </OrderModalLayout>
    );
}
