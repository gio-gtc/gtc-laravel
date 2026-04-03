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

const INTERNATIONAL_TV_PACKAGE = 'International TV Package';

/** Placeholder value until real encoding options are provided */
const ENCODING_UNSET = '__none__';

export interface BroadcastEncodingRow {
    cut: string;
    duration: string;
    language: string;
    encoding: string;
    label: string;
}

export interface AddBroadcastStreamingFormValues {
    type: string;
    cuts: string[];
    duration: string[];
    language: string[];
    encodings: BroadcastEncodingRow[];
}

function rowKey(cut: string, duration: string, language: string) {
    return `${cut} ${duration} ${language}`;
}

function buildEncodingRows(
    cuts: string[],
    duration: string[],
    language: string[],
): Array<{
    key: string;
    cut: string;
    duration: string;
    language: string;
    label: string;
}> {
    const rows: Array<{
        key: string;
        cut: string;
        duration: string;
        language: string;
        label: string;
    }> = [];

    for (const cut of cuts) {
        const durs =
            cut === INTERNATIONAL_TV_PACKAGE ? ([':30'] as const) : duration;
        const langs =
            cut === INTERNATIONAL_TV_PACKAGE
                ? (['English'] as const)
                : language;
        if (durs.length === 0 || langs.length === 0) continue;

        for (const d of durs) {
            for (const lang of langs) {
                const label = `${cut} ${d} ${lang}`;
                rows.push({
                    key: rowKey(cut, d, lang),
                    cut,
                    duration: d,
                    language: lang,
                    label,
                });
            }
        }
    }
    return rows;
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
    const [encodingSelections, setEncodingSelections] = useState<
        Record<string, string>
    >({});

    const { availableCuts } = useMemo(() => {
        const config = type ? OPTIONS_BY_TYPE[type] : null;
        return {
            availableCuts: config?.cuts ?? [],
        };
    }, [type]);

    const encodingRows = useMemo(
        () => buildEncodingRows(cuts, duration, language),
        [cuts, duration, language],
    );

    const encodingByRowKey = useMemo(() => {
        const next: Record<string, string> = {};
        for (const row of encodingRows) {
            next[row.key] = encodingSelections[row.key] ?? ENCODING_UNSET;
        }
        return next;
    }, [encodingRows, encodingSelections]);

    const canSubmit = useMemo(() => {
        if (encodingRows.length === 0) return false;
        return encodingRows.every(
            (row) =>
                encodingByRowKey[row.key] &&
                encodingByRowKey[row.key] !== ENCODING_UNSET,
        );
    }, [encodingRows, encodingByRowKey]);

    const resetForm = () => {
        setCuts([]);
        setDuration([]);
        setLanguage(['English']);
    };

    const resetEncodingFields = () => {
        setEncodingSelections({});
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
        if (!canSubmit) return;

        const encodings: BroadcastEncodingRow[] = encodingRows.map((row) => ({
            cut: row.cut,
            duration: row.duration,
            language: row.language,
            encoding: encodingByRowKey[row.key]!,
            label: row.label,
        }));

        onAdd?.({
            type,
            cuts,
            duration,
            language,
            encodings,
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
            primaryDisabled={!canSubmit}
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
                                    cuts.includes(INTERNATIONAL_TV_PACKAGE);

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
                                    INTERNATIONAL_TV_PACKAGE,
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
                <ColumnedRowsParent className="max-h-[215px] overflow-auto">
                    {encodingRows.map((row) => (
                        <ColumnedRowsChild
                            key={row.key}
                            labelFor={`encoding-${row.key}`}
                            labelContent={row.label}
                            required
                            childrenContainerClasses="flex gap-1"
                            labelClassName="sm:flex-none max-w-[192px] w-full"
                        >
                            <Select
                                value={
                                    encodingByRowKey[row.key] ?? ENCODING_UNSET
                                }
                                onValueChange={(v) =>
                                    setEncodingSelections((prev) => ({
                                        ...prev,
                                        [row.key]: v,
                                    }))
                                }
                            >
                                <SelectTrigger
                                    id={`encoding-${row.key}`}
                                    className={cn(
                                        'max-w-[191px]',
                                        orderModalStyles.selectTrigger,
                                    )}
                                >
                                    <SelectValue placeholder="Select encoding" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ENCODING_UNSET}>
                                        Select encoding
                                    </SelectItem>
                                    <SelectItem value="tbd">TBD</SelectItem>
                                </SelectContent>
                            </Select>
                        </ColumnedRowsChild>
                    ))}
                </ColumnedRowsParent>
            </div>
        </OrderModalLayout>
    );
}
