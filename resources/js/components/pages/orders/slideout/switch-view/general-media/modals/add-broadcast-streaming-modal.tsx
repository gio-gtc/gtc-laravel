import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ColumnedRowsChild,
    ColumnedRowsParent,
} from '@/components/utils/column-row-layouts';
import Divider from '@/components/utils/divider';
import { useEffect, useState } from 'react';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';

const DURATION_OPTIONS = [':10', ':15', ':30'] as const;
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French'] as const;

export interface AddBroadcastStreamingFormValues {
    type: string;
    cuts: string;
    duration: string[];
    language: string[];
    presaleEncoding: string;
    onSaleNowEncoding: string;
}

interface AddBroadcastStreamingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (values: AddBroadcastStreamingFormValues) => void;
}

export default function AddBroadcastStreamingModal({
    isOpen,
    onClose,
    onAdd,
}: AddBroadcastStreamingModalProps) {
    const [type, setType] = useState('Generic');
    const [cuts, setCuts] = useState('Cuts');
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>([]);
    const [presaleEncoding, setPresaleEncoding] = useState('Encoding Types');
    const [onSaleNowEncoding, setOnSaleNowEncoding] =
        useState('Encoding Types');

    useEffect(() => {
        if (!isOpen) {
            setType('Generic');
            setCuts('Cuts');
            setDuration([]);
            setLanguage([]);
            setPresaleEncoding('Encoding Types');
            setOnSaleNowEncoding('Encoding Types');
        }
    }, [isOpen]);

    const handleAddToOrder = () => {
        onAdd?.({
            type,
            cuts,
            duration,
            language,
            presaleEncoding,
            onSaleNowEncoding,
        });
        onClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Add Broadcast & Streaming Video"
            primaryLabel="Add to Order"
            onPrimaryClick={handleAddToOrder}
            maxWidth="2xl"
        >
            <div className="flex flex-col gap-2 text-xs sm:flex-row">
                <div className="flex flex-3 flex-col gap-1.5">
                    <Label htmlFor="type" className={orderModalStyles.label}>
                        Type
                    </Label>
                    <p className={orderModalStyles.helper}>
                        Select the type of TV Spot
                    </p>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger
                            id="type"
                            className={orderModalStyles.selectTrigger}
                        >
                            <SelectValue placeholder="Select the type of TV Spot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Generic">Generic</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-3 flex-col gap-1.5">
                    <Label htmlFor="cuts" className={orderModalStyles.label}>
                        Cuts
                    </Label>
                    <p className={orderModalStyles.helper}>
                        Select the type of Cuts
                    </p>
                    <Select value={cuts} onValueChange={setCuts}>
                        <SelectTrigger
                            id="cuts"
                            className={orderModalStyles.selectTrigger}
                        >
                            <SelectValue placeholder="Select the type of Cuts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cuts">Cuts</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-2 flex-col gap-2 sm:flex-row">
                    <div className="flex flex-col gap-2">
                        <Label className={orderModalStyles.label}>
                            Duration
                        </Label>
                        <p className="hidden pt-2 sm:block"> </p>
                        <div className="flex flex-col gap-2">
                            {DURATION_OPTIONS.map((d) => (
                                <PillButton
                                    key={d}
                                    selected={duration.includes(d)}
                                    onClick={() =>
                                        setDuration((prev) =>
                                            toggleInArray(prev, d),
                                        )
                                    }
                                >
                                    {d}
                                </PillButton>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className={orderModalStyles.label}>
                            Language
                        </Label>
                        <p className="hidden pt-2 sm:block"> </p>
                        <div className="flex flex-col gap-2">
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <PillButton
                                    key={lang}
                                    selected={language.includes(lang)}
                                    onClick={() =>
                                        setLanguage((prev) =>
                                            toggleInArray(prev, lang),
                                        )
                                    }
                                >
                                    {lang}
                                </PillButton>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Divider />

            <div className="space-y-4 text-xs">
                <div className="flex flex-col gap-1.5">
                    <Label className="font-bold text-gray-900">Encoding</Label>
                    <p className={orderModalStyles.helper}>
                        Select the types of encoding for each Spot
                    </p>
                </div>
                <ColumnedRowsParent>
                    <ColumnedRowsChild
                        labelFor="presale"
                        labelContent="Presale"
                    >
                        <Select
                            value={presaleEncoding}
                            onValueChange={setPresaleEncoding}
                        >
                            <SelectTrigger
                                id="presale"
                                className={orderModalStyles.selectTrigger}
                            >
                                <SelectValue placeholder="Encoding Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Encoding Types">
                                    Encoding Types
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </ColumnedRowsChild>

                    <ColumnedRowsChild
                        labelFor="on-sale-now"
                        labelContent="On Sale Now"
                    >
                        <Select
                            value={onSaleNowEncoding}
                            onValueChange={setOnSaleNowEncoding}
                        >
                            <SelectTrigger
                                id="on-sale-now"
                                className={orderModalStyles.selectTrigger}
                            >
                                <SelectValue placeholder="Encoding Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Encoding Types">
                                    Encoding Types
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </ColumnedRowsChild>
                </ColumnedRowsParent>
            </div>
        </OrderModalLayout>
    );
}
