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
import {
    defaultVenueItemLanguageLabels,
    venueItemEncodingIdToLabel,
} from '@/components/utils/venue-items';
import { cn } from '@/lib/utils';
import type { VenueItemEncoding, VenueItemLanguage } from '@/types';
import { useMemo, useState } from 'react';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';
import {
    INTERNATIONAL_TV_PACKAGE,
    OPTIONS_BY_TYPE,
} from './spot-type-cuts-options';

const DURATION_OPTIONS = [':10', ':15', ':30'] as const;

/** Placeholder until each row has a selected encoding id */
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
    internationalSingleLanguage: string,
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
                ? ([internationalSingleLanguage] as const)
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
    venue_item_language: VenueItemLanguage[];
    venue_item_encoding: VenueItemEncoding[];
}

export default function AddBroadcastStreamingModal({
    isOpen,
    onClose,
    onAdd,
    venue_item_language,
    venue_item_encoding,
}: AddBroadcastStreamingModalProps) {
    const [type, setType] = useState('Generic');
    const [cuts, setCuts] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>(() =>
        defaultVenueItemLanguageLabels(venue_item_language),
    );
    const [encodingSelections, setEncodingSelections] = useState<
        Record<string, string>
    >({});

    const { availableCuts } = useMemo(() => {
        const config = type ? OPTIONS_BY_TYPE[type] : null;
        return {
            availableCuts: config?.cuts ?? [],
        };
    }, [type]);

    const internationalLangLabel = useMemo(
        () =>
            venue_item_language.find((l) => l.type === 'English')?.type ??
            defaultVenueItemLanguageLabels(venue_item_language)[0] ??
            '',
        [venue_item_language],
    );

    const encodingRows = useMemo(
        () =>
            buildEncodingRows(
                cuts,
                duration,
                language,
                internationalLangLabel,
            ),
        [cuts, duration, language, internationalLangLabel],
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
        setLanguage(defaultVenueItemLanguageLabels(venue_item_language));
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

        const encodings: BroadcastEncodingRow[] = encodingRows.map((row) => {
            const raw = encodingByRowKey[row.key]!;
            const encodingId = Number.parseInt(raw, 10);
            return {
                cut: row.cut,
                duration: row.duration,
                language: row.language,
                encoding: venueItemEncodingIdToLabel(
                    encodingId,
                    venue_item_encoding,
                ),
                label: row.label,
            };
        });

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
                                    type === 'International';

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
                            {venue_item_language.map((lang) => {
                                const isDisabled = type === 'International';
                                return (
                                    <PillButton
                                        key={lang.id}
                                        className="w-full"
                                        selected={language.includes(lang.type)}
                                        disabled={isDisabled}
                                        onClick={() =>
                                            !isDisabled &&
                                            setLanguage((prev) =>
                                                toggleInArray(prev, lang.type),
                                            )
                                        }
                                    >
                                        {lang.type}
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
                                        'max-w-[191px] text-left',
                                        orderModalStyles.selectTrigger,
                                    )}
                                >
                                    <SelectValue placeholder="Select encoding" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ENCODING_UNSET}>
                                        Select encoding
                                    </SelectItem>
                                    {venue_item_encoding.map((enc) => (
                                        <SelectItem
                                            key={enc.id}
                                            value={String(enc.id)}
                                            className="text-left"
                                        >
                                            {enc.type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </ColumnedRowsChild>
                    ))}
                </ColumnedRowsParent>
            </div>
        </OrderModalLayout>
    );
}
