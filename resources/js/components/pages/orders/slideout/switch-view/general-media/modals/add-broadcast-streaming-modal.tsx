import { MultiSelectCombobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LabelCheck } from '@/components/ui/label-check';
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
    venueItemLanguageIdToLabel,
} from '@/components/utils/venue-items';
import { cn } from '@/lib/utils';
import {
    broadcastEncodingRowKey,
    buildBroadcastEncodingMatrixRows,
} from '@/lib/venue-items/broadcast-encoding-matrix';
import {
    languageTypeToId,
    modalDurationPillToSeconds,
} from '@/lib/venue-items/modal-mappers';
import type {
    OrderItemEncoding,
    OrderItemLanguage,
    OrderItemsBroadcastRow,
} from '@/types';
import { useEffect, useMemo, useState } from 'react';
import {
    durationSecondsToModalPillLabel,
    isNonDefaultModalDuration,
} from './modal-duration';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';
import { OPTIONS_BY_TYPE } from './spot-type-cuts-options';

const DURATION_OPTIONS = [':10', ':15', ':30'] as const;

/** Placeholder until each row has a selected encoding id */
const ENCODING_UNSET = '__none__';

export interface BroadcastEncodingRow {
    cut: string;
    duration: string;
    language: string;
    encoding: string;
    label: string;
    encodingMode: 'catalog' | 'custom';
}

export interface AddBroadcastStreamingFormValues {
    type: string;
    cuts: string[];
    duration: string[];
    language: string[];
    encodings: BroadcastEncodingRow[];
}

interface AddBroadcastStreamingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (values: AddBroadcastStreamingFormValues) => void;
    venue_item_language: OrderItemLanguage[];
    venue_item_encoding: OrderItemEncoding[];
    /** When set (e.g. edit from table), pre-select duration and optionally show extra pill. */
    initialDurationSeconds?: number;
    mode?: 'add' | 'edit';
    /** Required when mode is `edit` — full row to prefill and merge on save. */
    initialVenueRow?: OrderItemsBroadcastRow;
    onEditSave?: (row: OrderItemsBroadcastRow) => void;
}

export default function AddBroadcastStreamingModal({
    isOpen,
    onClose,
    onAdd,
    venue_item_language,
    venue_item_encoding,
    initialDurationSeconds,
    mode = 'add',
    initialVenueRow,
    onEditSave,
}: AddBroadcastStreamingModalProps) {
    const isEdit = mode === 'edit' && initialVenueRow != null;

    const [type, setType] = useState('Generic');
    const [cuts, setCuts] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>(() =>
        defaultVenueItemLanguageLabels(venue_item_language),
    );
    const [encodingSelections, setEncodingSelections] = useState<
        Record<string, string>
    >({});
    const [encodingCustomEnabled, setEncodingCustomEnabled] = useState<
        Record<string, boolean>
    >({});
    const [encodingCustomText, setEncodingCustomText] = useState<
        Record<string, string>
    >({});

    const [editType, setEditType] = useState('Generic');
    const [editCut, setEditCut] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editLanguage, setEditLanguage] = useState('');
    const [editEncodingId, setEditEncodingId] = useState(ENCODING_UNSET);
    const [editEncodingCustom, setEditEncodingCustom] = useState(false);
    const [editEncodingCustomText, setEditEncodingCustomText] = useState('');

    useEffect(() => {
        if (!isOpen || !isEdit || !initialVenueRow) return;
        /* eslint-disable react-hooks/set-state-in-effect -- prefill edit form when modal opens */
        setEditType(initialVenueRow.spot_type);
        setEditCut(initialVenueRow.cut);
        const pill = durationSecondsToModalPillLabel(
            initialVenueRow.duration_seconds,
            'broadcast',
        );
        setEditDuration(pill);
        const langLabel = venueItemLanguageIdToLabel(
            initialVenueRow.language_id ?? -1,
            venue_item_language,
        );
        setEditLanguage(langLabel || venue_item_language[0]?.type || '');
        if (
            initialVenueRow.encoding_custom != null &&
            initialVenueRow.encoding_custom !== ''
        ) {
            setEditEncodingCustom(true);
            setEditEncodingCustomText(initialVenueRow.encoding_custom);
            setEditEncodingId(ENCODING_UNSET);
        } else if (initialVenueRow.encoding_id != null) {
            setEditEncodingCustom(false);
            setEditEncodingCustomText('');
            setEditEncodingId(String(initialVenueRow.encoding_id));
        } else {
            setEditEncodingCustom(false);
            setEditEncodingCustomText('');
            setEditEncodingId(ENCODING_UNSET);
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [isOpen, isEdit, initialVenueRow, venue_item_language]);

    useEffect(() => {
        if (!isOpen || isEdit) return;
        /* eslint-disable react-hooks/set-state-in-effect -- add-mode duration hint from table */
        if (initialDurationSeconds === undefined) {
            setDuration([]);
            return;
        }
        const s = Math.floor(initialDurationSeconds);
        setDuration([durationSecondsToModalPillLabel(s, 'broadcast')]);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [isOpen, isEdit, initialDurationSeconds]);

    const extraDurationLabel =
        !isEdit &&
        initialDurationSeconds !== undefined &&
        isNonDefaultModalDuration(initialDurationSeconds, 'broadcast')
            ? durationSecondsToModalPillLabel(
                  initialDurationSeconds,
                  'broadcast',
              )
            : null;

    const { availableCuts } = useMemo(() => {
        const config = type ? OPTIONS_BY_TYPE[type] : null;
        return {
            availableCuts: config?.cuts ?? [],
        };
    }, [type]);

    const editAvailableCuts = useMemo(() => {
        const config = editType ? OPTIONS_BY_TYPE[editType] : null;
        return config?.cuts ?? [];
    }, [editType]);

    const editDurationSeconds = useMemo(
        () => modalDurationPillToSeconds(editDuration, 'broadcast'),
        [editDuration],
    );

    const editExtraDurationLabel =
        isEdit &&
        editDuration &&
        isNonDefaultModalDuration(editDurationSeconds, 'broadcast')
            ? durationSecondsToModalPillLabel(editDurationSeconds, 'broadcast')
            : null;

    const editEncodingRowLabel = useMemo(() => {
        if (!editCut || !editDuration || !editLanguage) return '';
        return `${editCut} ${editDuration} ${editLanguage}`;
    }, [editCut, editDuration, editLanguage]);

    const internationalLangLabel = useMemo(
        () =>
            venue_item_language.find((l) => l.type === 'English')?.type ??
            defaultVenueItemLanguageLabels(venue_item_language)[0] ??
            '',
        [venue_item_language],
    );

    const encodingRows = useMemo(
        () =>
            buildBroadcastEncodingMatrixRows(
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
        return encodingRows.every((row) => {
            if (encodingCustomEnabled[row.key]) {
                return (encodingCustomText[row.key] ?? '').trim() !== '';
            }
            const v = encodingByRowKey[row.key];
            return Boolean(v && v !== ENCODING_UNSET);
        });
    }, [
        encodingRows,
        encodingByRowKey,
        encodingCustomEnabled,
        encodingCustomText,
    ]);

    const canSubmitEdit = useMemo(() => {
        if (!editCut || !editDuration || !editLanguage) return false;
        if (editEncodingCustom) {
            return editEncodingCustomText.trim() !== '';
        }
        return editEncodingId !== ENCODING_UNSET;
    }, [
        editCut,
        editDuration,
        editLanguage,
        editEncodingId,
        editEncodingCustom,
        editEncodingCustomText,
    ]);

    const resetForm = () => {
        setCuts([]);
        setDuration([]);
        setLanguage(defaultVenueItemLanguageLabels(venue_item_language));
    };

    const resetEncodingFields = () => {
        setEncodingSelections({});
        setEncodingCustomEnabled({});
        setEncodingCustomText({});
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

    const handleEditTypeChange = (newType: string) => {
        setEditType(newType);
        const config = OPTIONS_BY_TYPE[newType];
        const cutOpts = config?.cuts ?? [];
        if (cutOpts.length) {
            setEditCut((c) => (cutOpts.includes(c) ? c : (cutOpts[0] ?? '')));
        } else {
            setEditCut('');
        }
    };

    const handleClose = () => {
        resetForm();
        resetEncodingFields();
        setEditEncodingCustom(false);
        setEditEncodingCustomText('');
        setEditEncodingId(ENCODING_UNSET);
        onClose();
    };

    const handleAddToOrder = () => {
        if (!canSubmit) return;

        const encodings: BroadcastEncodingRow[] = encodingRows.map((row) => {
            if (encodingCustomEnabled[row.key]) {
                return {
                    cut: row.cut,
                    duration: row.duration,
                    language: row.language,
                    encoding: (encodingCustomText[row.key] ?? '').trim(),
                    label: row.label,
                    encodingMode: 'custom' as const,
                };
            }
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
                encodingMode: 'catalog' as const,
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

    const handleEditSave = () => {
        if (!canSubmitEdit || !initialVenueRow) return;
        const langId = languageTypeToId(venue_item_language, editLanguage);
        if (langId === undefined) return;

        if (editEncodingCustom) {
            const text = editEncodingCustomText.trim();
            if (!text) return;
            onEditSave?.({
                ...initialVenueRow,
                spot_type: editType as OrderItemsBroadcastRow['spot_type'],
                cut: editCut as OrderItemsBroadcastRow['cut'],
                duration_seconds: modalDurationPillToSeconds(
                    editDuration,
                    'broadcast',
                ),
                language_id: langId,
                encoding_custom: text,
                encoding_id: undefined,
            });
        } else {
            const encodingId = Number.parseInt(editEncodingId, 10);
            if (Number.isNaN(encodingId)) return;
            onEditSave?.({
                ...initialVenueRow,
                spot_type: editType as OrderItemsBroadcastRow['spot_type'],
                cut: editCut as OrderItemsBroadcastRow['cut'],
                duration_seconds: modalDurationPillToSeconds(
                    editDuration,
                    'broadcast',
                ),
                language_id: langId,
                encoding_id: encodingId,
                encoding_custom: undefined,
            });
        }
        handleClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={handleClose}
            title={
                isEdit
                    ? 'Edit Broadcast & Streaming Video'
                    : 'Add Broadcast & Streaming Video'
            }
            primaryLabel={isEdit ? 'Save changes' : 'Add to Order'}
            onPrimaryClick={isEdit ? handleEditSave : handleAddToOrder}
            primaryDisabled={isEdit ? !canSubmitEdit : !canSubmit}
            modalClasses="sm:max-w-[585px]"
        >
            {isEdit ? (
                <>
                    <div className="flex flex-col gap-2 text-xs sm:flex-row">
                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="edit-broadcast-type"
                                className={orderModalStyles.label}
                            >
                                Type
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the type of Spot
                            </p>
                            <Select
                                value={editType}
                                onValueChange={handleEditTypeChange}
                            >
                                <SelectTrigger
                                    id="edit-broadcast-type"
                                    variant="orderSlideoutpopup"
                                    className={orderModalStyles.selectTrigger}
                                >
                                    <SelectValue placeholder="Select the type of Spot" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Generic">
                                        Generic
                                    </SelectItem>
                                    <SelectItem value="AmEx">AmEx</SelectItem>
                                    <SelectItem value="Verizon">
                                        Verizon
                                    </SelectItem>
                                    <SelectItem value="Citi">Citi</SelectItem>
                                    <SelectItem value="International">
                                        International
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="edit-cuts"
                                className={orderModalStyles.label}
                            >
                                Cuts
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the type of Cuts
                            </p>
                            <MultiSelectCombobox
                                id="edit-cuts"
                                mode="single"
                                options={editAvailableCuts}
                                value={editCut ? [editCut] : []}
                                onValueChange={(v) => setEditCut(v[0] ?? '')}
                                placeholder="Select Cuts"
                                emptyMessage="No cuts found."
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
                            />
                        </div>

                        <div className="flex flex-row justify-around gap-2 text-xs sm:justify-center">
                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Duration
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {DURATION_OPTIONS.map((d) => {
                                        const isDisabled =
                                            (d == ':10' &&
                                                editType != 'Generic') ||
                                            editType === 'International';

                                        return (
                                            <PillButton
                                                key={d}
                                                className="w-full"
                                                selected={editDuration === d}
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    setEditDuration(d)
                                                }
                                            >
                                                {d}
                                            </PillButton>
                                        );
                                    })}
                                    {editExtraDurationLabel !== null && (
                                        <PillButton
                                            key={editExtraDurationLabel}
                                            className="w-full"
                                            selected={
                                                editDuration ===
                                                editExtraDurationLabel
                                            }
                                            disabled={
                                                editType === 'International'
                                            }
                                            onClick={() =>
                                                editType !== 'International' &&
                                                setEditDuration(
                                                    editExtraDurationLabel,
                                                )
                                            }
                                        >
                                            {editExtraDurationLabel}
                                        </PillButton>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Language
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {venue_item_language.map((lang) => {
                                        const isDisabled =
                                            editType === 'International';
                                        return (
                                            <PillButton
                                                key={lang.id}
                                                className="w-full"
                                                selected={
                                                    editLanguage === lang.type
                                                }
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    setEditLanguage(lang.type)
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
                            <Label className="font-bold text-gray-900">
                                Encoding
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the types of encoding for each Spot
                            </p>
                        </div>
                        <ColumnedRowsParent className="max-h-[215px] overflow-y-auto py-0.5">
                            <ColumnedRowsChild
                                labelFor={`edit-encoding-ctl-${broadcastEncodingRowKey(
                                    editCut || ' ',
                                    editDuration || ' ',
                                    editLanguage || ' ',
                                ).replace(/\s+/g, '-')}`}
                                labelContent={
                                    editEncodingRowLabel ||
                                    'Select cut, duration, and language'
                                }
                                required
                                multiInput
                                childrenContainerClasses="flex flex-col gap-2"
                                labelClassName="sm:flex-none max-w-[192px] w-full"
                            >
                                <div className="flex gap-2">
                                    <div className="w-full max-w-[190px]">
                                        {editEncodingCustom ? (
                                            <Input
                                                id={`edit-encoding-ctl-${broadcastEncodingRowKey(
                                                    editCut || ' ',
                                                    editDuration || ' ',
                                                    editLanguage || ' ',
                                                ).replace(/\s+/g, '-')}`}
                                                value={editEncodingCustomText}
                                                onChange={(e) =>
                                                    setEditEncodingCustomText(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Custom Encoding"
                                                className={cn(
                                                    'text-xs',
                                                    orderModalStyles.selectTrigger,
                                                )}
                                            />
                                        ) : (
                                            <Select
                                                value={editEncodingId}
                                                onValueChange={
                                                    setEditEncodingId
                                                }
                                            >
                                                <SelectTrigger
                                                    id={`edit-encoding-ctl-${broadcastEncodingRowKey(
                                                        editCut || ' ',
                                                        editDuration || ' ',
                                                        editLanguage || ' ',
                                                    ).replace(/\s+/g, '-')}`}
                                                    className={cn(
                                                        'truncate text-left',
                                                        orderModalStyles.selectTrigger,
                                                    )}
                                                >
                                                    <SelectValue placeholder="Select encoding" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value={ENCODING_UNSET}
                                                    >
                                                        Select encoding
                                                    </SelectItem>
                                                    {venue_item_encoding.map(
                                                        (enc) => (
                                                            <SelectItem
                                                                key={enc.id}
                                                                value={String(
                                                                    enc.id,
                                                                )}
                                                                className="text-left"
                                                            >
                                                                {enc.type}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    <LabelCheck
                                        id={`edit-encoding-custom-${broadcastEncodingRowKey(
                                            editCut || ' ',
                                            editDuration || ' ',
                                            editLanguage || ' ',
                                        ).replace(/\s+/g, '-')}`}
                                        label="Custom"
                                        checked={editEncodingCustom}
                                        onCheckedChange={(checked) => {
                                            setEditEncodingCustom(checked);
                                            if (checked) {
                                                setEditEncodingId(
                                                    ENCODING_UNSET,
                                                );
                                            } else {
                                                setEditEncodingCustomText('');
                                            }
                                        }}
                                    />
                                </div>
                            </ColumnedRowsChild>
                        </ColumnedRowsParent>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-col gap-2 text-xs sm:flex-row">
                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="type"
                                className={orderModalStyles.label}
                            >
                                Type
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the type of Spot
                            </p>
                            <Select
                                value={type}
                                onValueChange={handleTypeChange}
                            >
                                <SelectTrigger
                                    id="type"
                                    variant="orderSlideoutpopup"
                                    className={orderModalStyles.selectTrigger}
                                >
                                    <SelectValue placeholder="Select the type of Spot" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Generic">
                                        Generic
                                    </SelectItem>
                                    <SelectItem value="AmEx">AmEx</SelectItem>
                                    <SelectItem value="Verizon">
                                        Verizon
                                    </SelectItem>
                                    <SelectItem value="Citi">Citi</SelectItem>
                                    <SelectItem value="International">
                                        International
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="cuts"
                                className={orderModalStyles.label}
                            >
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
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
                            />
                        </div>

                        <div className="flex flex-row justify-around gap-2 text-xs sm:justify-center">
                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
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
                                    {extraDurationLabel !== null && (
                                        <PillButton
                                            key={extraDurationLabel}
                                            className="w-full"
                                            selected={duration.includes(
                                                extraDurationLabel,
                                            )}
                                            disabled={type === 'International'}
                                            onClick={() =>
                                                type !== 'International' &&
                                                setDuration((prev) =>
                                                    toggleInArray(
                                                        prev,
                                                        extraDurationLabel,
                                                    ),
                                                )
                                            }
                                        >
                                            {extraDurationLabel}
                                        </PillButton>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label
                                    className={cn(
                                        'pb-4',
                                        orderModalStyles.label,
                                    )}
                                >
                                    Language
                                </Label>
                                <div className="flex flex-col gap-2">
                                    {venue_item_language.map((lang) => {
                                        const isDisabled =
                                            type === 'International';
                                        return (
                                            <PillButton
                                                key={lang.id}
                                                className="w-full"
                                                selected={language.includes(
                                                    lang.type,
                                                )}
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    setLanguage((prev) =>
                                                        toggleInArray(
                                                            prev,
                                                            lang.type,
                                                        ),
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
                            <Label className="font-bold text-gray-900">
                                Encoding
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the types of encoding for each Spot
                            </p>
                        </div>
                        <ColumnedRowsParent className="max-h-[215px] overflow-auto py-0.5">
                            {encodingRows.map((row) => {
                                const encCtlId = `enc-ctl-${row.key.replace(
                                    /\s+/g,
                                    '-',
                                )}`;
                                const encCustomId = `enc-custom-${row.key.replace(
                                    /\s+/g,
                                    '-',
                                )}`;
                                return (
                                    <ColumnedRowsChild
                                        key={row.key}
                                        labelFor={encCtlId}
                                        labelContent={row.label}
                                        required
                                        multiInput
                                        childrenContainerClasses="flex flex-col gap-2"
                                        labelClassName="sm:flex-none max-w-[191px] w-full"
                                    >
                                        <div className="flex gap-2">
                                            <div className="w-full max-w-[190px]">
                                                {encodingCustomEnabled[
                                                    row.key
                                                ] ? (
                                                    <Input
                                                        id={encCtlId}
                                                        value={
                                                            encodingCustomText[
                                                                row.key
                                                            ] ?? ''
                                                        }
                                                        onChange={(e) =>
                                                            setEncodingCustomText(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [row.key]:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        placeholder="Custom Encoding"
                                                        className={cn(
                                                            'max-w-[191px] text-xs',
                                                            orderModalStyles.selectTrigger,
                                                        )}
                                                    />
                                                ) : (
                                                    <Select
                                                        value={
                                                            encodingByRowKey[
                                                                row.key
                                                            ] ?? ENCODING_UNSET
                                                        }
                                                        onValueChange={(v) =>
                                                            setEncodingSelections(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [row.key]:
                                                                        v,
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={encCtlId}
                                                            className={cn(
                                                                'truncate text-left',
                                                                orderModalStyles.selectTrigger,
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Select encoding" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem
                                                                value={
                                                                    ENCODING_UNSET
                                                                }
                                                            >
                                                                Select encoding
                                                            </SelectItem>
                                                            {venue_item_encoding.map(
                                                                (enc) => (
                                                                    <SelectItem
                                                                        key={
                                                                            enc.id
                                                                        }
                                                                        value={String(
                                                                            enc.id,
                                                                        )}
                                                                        className="text-left"
                                                                    >
                                                                        {
                                                                            enc.type
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>

                                            <LabelCheck
                                                id={encCustomId}
                                                className="flex-1"
                                                label="Custom"
                                                checked={Boolean(
                                                    encodingCustomEnabled[
                                                        row.key
                                                    ],
                                                )}
                                                onCheckedChange={(checked) => {
                                                    setEncodingCustomEnabled(
                                                        (prev) => ({
                                                            ...prev,
                                                            [row.key]: checked,
                                                        }),
                                                    );
                                                    if (checked) {
                                                        setEncodingSelections(
                                                            (p) => ({
                                                                ...p,
                                                                [row.key]:
                                                                    ENCODING_UNSET,
                                                            }),
                                                        );
                                                    } else {
                                                        setEncodingCustomText(
                                                            (p) => {
                                                                const next = {
                                                                    ...p,
                                                                };
                                                                delete next[
                                                                    row.key
                                                                ];
                                                                return next;
                                                            },
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                    </ColumnedRowsChild>
                                );
                            })}
                        </ColumnedRowsParent>
                    </div>
                </>
            )}
        </OrderModalLayout>
    );
}
