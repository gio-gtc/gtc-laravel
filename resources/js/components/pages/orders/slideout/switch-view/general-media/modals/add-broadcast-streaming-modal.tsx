import { MultiSelectCombobox } from '@/components/ui/combobox';
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
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';

const CUTS_OPTIONS = [
    'Sign Up Now',
    'Pre Sale',
    'On Sale Now',
    'Week of',
    'Day Prior',
    'Day of',
    'Superless',
    'Sample',
] as const;
const VENUE_CUT_OPTIONS = ['Pre Sale', 'Now Through'] as const;
const DURATION_OPTIONS = [':10', ':15', ':30'] as const;
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French'] as const;

const OPTIONS_BY_TYPE: Record<string, { cuts: readonly string[] }> = {
    Generic: { cuts: CUTS_OPTIONS },
    AmEx: {
        cuts: VENUE_CUT_OPTIONS,
    },
    Verizon: {
        cuts: VENUE_CUT_OPTIONS,
    },
    Citi: { cuts: VENUE_CUT_OPTIONS },
    International: { cuts: ['International TV Package'] },
};

export interface AddBroadcastStreamingFormValues {
    type: string;
    cuts: string[];
    duration: string[];
    language: string[];
    presaleEncoding: string;
    encodeLater: boolean;
    encodeAll: boolean;
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
    const [cuts, setCuts] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>(['English']);
    const [presaleEncoding, setPresaleEncoding] = useState('Encoding Types');
    const [encodeLater, setEncodeLater] = useState(false);
    const [encodeAll, setEncodeAll] = useState(false);
    const [onSaleNowEncoding, setOnSaleNowEncoding] =
        useState('Encoding Types');

    const { availableCuts } = useMemo(() => {
        const config = type ? OPTIONS_BY_TYPE[type] : null;
        return {
            availableCuts: config?.cuts ?? [],
        };
    }, [type]);

    const resetForm = () => {
        setCuts([]);
        setDuration([]);
        setLanguage(['English']);
    };

    const resetEncodingFields = () => {
        setPresaleEncoding('Encoding Types');
        setEncodeLater(false);
        setEncodeAll(false);
        setOnSaleNowEncoding('Encoding Types');
    };

    const handleTypeChange = (newType: string) => {
        resetForm();
        setType(newType);
        const config = OPTIONS_BY_TYPE[newType];
        if (config) {
            setCuts((prev) => prev.filter((c) => config.cuts.includes(c)));
        } else {
            setCuts([]);
            setDuration([]);
        }
    };

    const handleClose = () => {
        resetForm();
        resetEncodingFields();
        onClose();
    };

    const handleAddToOrder = () => {
        onAdd?.({
            type,
            cuts,
            duration,
            language,
            presaleEncoding,
            encodeLater,
            encodeAll,
            onSaleNowEncoding,
        });
        handleClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Broadcast & Streaming Video"
            primaryLabel="Add to Order"
            onPrimaryClick={handleAddToOrder}
            modalClasses="sm:max-w-[585px]"
        >
            <div className="flex flex-col gap-2 text-xs sm:flex-row">
                <div className="flex flex-3 flex-col gap-1.5">
                    <Label htmlFor="type" className={orderModalStyles.label}>
                        Type
                    </Label>
                    <p className={orderModalStyles.helper}>
                        Select the type of Spot
                    </p>
                    <Select value={type} onValueChange={handleTypeChange}>
                        <SelectTrigger
                            id="type"
                            className={orderModalStyles.selectTrigger}
                        >
                            <SelectValue placeholder="Select the type of Spot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Generic">Generic</SelectItem>
                            <SelectItem value="AmEx">AmEx</SelectItem>
                            <SelectItem value="Verizon">Verizon</SelectItem>
                            <SelectItem value="Citi">Citi</SelectItem>
                            <SelectItem value="International">
                                International
                            </SelectItem>
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
                    <MultiSelectCombobox
                        id="cuts"
                        options={availableCuts}
                        value={cuts}
                        onValueChange={setCuts}
                        placeholder="Select Cuts"
                        emptyMessage="No cuts found."
                        triggerClassName={orderModalStyles.selectTrigger}
                    />
                </div>

                <div className="flex flex-row justify-around gap-2 text-xs sm:justify-center">
                    <div className="flex flex-col gap-2">
                        <Label className={cn('pb-4', orderModalStyles.label)}>
                            Duration
                        </Label>
                        <div className="flex flex-col gap-2">
                            {DURATION_OPTIONS.map((d) => {
                                const isDisabled =
                                    (d == ':10' && type != 'Generic') ||
                                    cuts.includes('International TV Package');

                                return (
                                    <PillButton
                                        key={d}
                                        className="w-full"
                                        selected={duration.includes(d)}
                                        disabled={isDisabled}
                                        onClick={() =>
                                            !isDisabled &&
                                            setDuration((prev) =>
                                                toggleInArray(prev, d),
                                            )
                                        }
                                    >
                                        {d}
                                    </PillButton>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className={cn('pb-4', orderModalStyles.label)}>
                            Language
                        </Label>
                        <div className="flex flex-col gap-2">
                            {LANGUAGE_OPTIONS.map((lang) => {
                                const isDisabled = cuts.includes(
                                    'International TV Package',
                                );
                                return (
                                    <PillButton
                                        key={lang}
                                        className="w-full"
                                        selected={language.includes(lang)}
                                        disabled={isDisabled}
                                        onClick={() =>
                                            !isDisabled &&
                                            setLanguage((prev) =>
                                                toggleInArray(prev, lang),
                                            )
                                        }
                                    >
                                        {lang}
                                    </PillButton>
                                );
                            })}
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
                        labelContent={`{Cut name} :{Duration} {Language}`}
                        childrenContainerClasses="flex gap-1"
                    >
                        <Select
                            value={presaleEncoding}
                            onValueChange={setPresaleEncoding}
                        >
                            <SelectTrigger
                                id="presale"
                                className={cn(
                                    'max-w-[167px]',
                                    orderModalStyles.selectTrigger,
                                )}
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
