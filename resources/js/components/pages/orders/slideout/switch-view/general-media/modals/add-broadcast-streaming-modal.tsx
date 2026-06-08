import { Button } from '@/components/ui/button';
import { MultiSelectCombobox } from '@/components/ui/combobox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import {
    BROADCAST_ENCODING_UNSET,
    isBroadcastAddFormComplete,
} from '@/lib/orders/broadcast-add-form-complete';
import { hasBroadcastFormDuplicates } from '@/lib/orders/broadcast-duplicate-check';
import {
    applyInternationalLocks,
    getAllBroadcastDurationPills,
    getAllBroadcastLanguages,
    getBlueprintSlice,
    getBlueprintTypeKeys,
    getBroadcastCutsForType,
    getBroadcastDurationPills,
    getBroadcastLanguagesForType,
    isInternationalSpotType,
} from '@/lib/orders/order-catalog';
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
import type { OrderMenuFormBlueprint } from '@/types/order-catalog';
import { useEffect, useMemo, useState } from 'react';
import {
    durationSecondsToModalPillLabel,
    isNonDefaultModalDuration,
} from './modal-duration';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';
import { OPTIONS_BY_TYPE } from './spot-type-cuts-options';

/** Placeholder until each row has a selected encoding id */
const ENCODING_UNSET = BROADCAST_ENCODING_UNSET;

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
    onAdd?: (
        values: AddBroadcastStreamingFormValues,
    ) => void | Promise<{ failed: boolean }>;
    /** Category 1 form blueprint from order catalog menu (required for add). */
    blueprint?: OrderMenuFormBlueprint | null;
    fieldErrors?: Record<string, string[]>;
    catalogLoading?: boolean;
    venue_item_language: OrderItemLanguage[];
    /** Legacy edit prefill only — add mode uses blueprint.encodings. */
    venue_item_encoding?: OrderItemEncoding[];
    /** When set (e.g. edit from table), pre-select duration and optionally show extra pill. */
    initialDurationSeconds?: number;
    mode?: 'add' | 'edit';
    /** Required when mode is `edit` — full row to prefill and merge on save. */
    initialVenueRow?: OrderItemsBroadcastRow;
    onEditSave?: (row: OrderItemsBroadcastRow) => void;
    /** Broadcast lines already on this order (add-mode duplicate check). */
    existingBroadcastRows?: OrderItemsBroadcastRow[];
}

export default function AddBroadcastStreamingModal({
    isOpen,
    onClose,
    onAdd,
    blueprint,
    fieldErrors,
    catalogLoading = false,
    venue_item_language,
    venue_item_encoding = [],
    initialDurationSeconds,
    mode = 'add',
    initialVenueRow,
    onEditSave,
    existingBroadcastRows = [],
}: AddBroadcastStreamingModalProps) {
    const isEdit = mode === 'edit' && initialVenueRow != null;
    const typeKeys = useMemo(
        () =>
            blueprint
                ? getBlueprintTypeKeys(blueprint)
                : Object.keys(OPTIONS_BY_TYPE),
        [blueprint],
    );
    const defaultType = typeKeys[0] ?? 'Generic';

    const [type, setType] = useState(defaultType);
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);

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
        setEditLanguage(
            initialVenueRow.language ??
                (langLabel ||
                    venue_item_language[0]?.type ||
                    ''),
        );
        if (
            initialVenueRow.encoding_custom != null &&
            initialVenueRow.encoding_custom !== ''
        ) {
            setEditEncodingCustom(true);
            setEditEncodingCustomText(initialVenueRow.encoding_custom);
            setEditEncodingId(ENCODING_UNSET);
        } else if (initialVenueRow.encoding) {
            setEditEncodingCustom(false);
            setEditEncodingCustomText('');
            setEditEncodingId(initialVenueRow.encoding);
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

    useEffect(() => {
        if (!isOpen || isEdit || !isInternationalSpotType(type)) return;
        const locks = applyInternationalLocks(
            type,
            getBlueprintSlice(blueprint, type),
        );
        if (!locks) return;
        /* eslint-disable react-hooks/set-state-in-effect -- keep International fields synced */
        setCuts(locks.cuts);
        setDuration([locks.durationPill]);
        setLanguage(locks.languages);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [isOpen, isEdit, type, blueprint]);

    const extraDurationLabel =
        !isEdit &&
        initialDurationSeconds !== undefined &&
        isNonDefaultModalDuration(initialDurationSeconds, 'broadcast')
            ? durationSecondsToModalPillLabel(
                  initialDurationSeconds,
                  'broadcast',
              )
            : null;

    const typeSlice = useMemo(
        () => getBlueprintSlice(blueprint, type),
        [blueprint, type],
    );

    const enabledCuts = useMemo(() => {
        const fromBlueprint = getBroadcastCutsForType(blueprint, type);
        if (fromBlueprint.length > 0) {
            return fromBlueprint;
        }
        return OPTIONS_BY_TYPE[type]?.cuts ?? [];
    }, [blueprint, type]);

    const isAddInternationalLocked = isInternationalSpotType(type);
    const isEditInternationalLocked = isInternationalSpotType(editType);

    const allDurationPills = useMemo(
        () => getAllBroadcastDurationPills(blueprint),
        [blueprint],
    );

    const enabledDurationPills = useMemo(
        () => getBroadcastDurationPills(blueprint, type),
        [blueprint, type],
    );

    const editEnabledDurationPills = useMemo(
        () => getBroadcastDurationPills(blueprint, editType),
        [blueprint, editType],
    );

    const allLanguages = useMemo(
        () => getAllBroadcastLanguages(blueprint),
        [blueprint],
    );

    const enabledLanguages = useMemo(
        () => getBroadcastLanguagesForType(blueprint, type),
        [blueprint, type],
    );

    useEffect(() => {
        if (!isOpen || isEdit || isAddInternationalLocked) return;
        /* eslint-disable react-hooks/set-state-in-effect -- drop stale pill values on reopen/type */
        setCuts((prev) => {
            const next = prev.filter((c) => enabledCuts.includes(c));
            return next.length === prev.length ? prev : next;
        });
        setDuration((prev) => {
            const next = prev.filter((d) => enabledDurationPills.includes(d));
            return next.length === prev.length ? prev : next;
        });
        setLanguage((prev) => {
            const next = prev.filter((l) => enabledLanguages.includes(l));
            return next.length === prev.length ? prev : next;
        });
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [
        isOpen,
        isEdit,
        isAddInternationalLocked,
        enabledCuts,
        enabledDurationPills,
        enabledLanguages,
    ]);

    const editEnabledLanguages = useMemo(
        () => getBroadcastLanguagesForType(blueprint, editType),
        [blueprint, editType],
    );

    const catalogEncodings = useMemo(
        () => blueprint?.encodings ?? [],
        [blueprint],
    );

    const editEnabledCuts = useMemo(() => {
        const fromBlueprint = getBroadcastCutsForType(blueprint, editType);
        if (fromBlueprint.length > 0) {
            return fromBlueprint;
        }
        return OPTIONS_BY_TYPE[editType]?.cuts ?? [];
    }, [blueprint, editType]);

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

    const internationalLangLabel = useMemo(() => {
        const fromBlueprint = typeSlice?.languages.find((l) => l === 'English');
        if (fromBlueprint) {
            return fromBlueprint;
        }
        return (
            venue_item_language.find((l) => l.type === 'English')?.type ??
            defaultVenueItemLanguageLabels(venue_item_language)[0] ??
            'English'
        );
    }, [typeSlice, venue_item_language]);

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

    const canSubmit = useMemo(
        () =>
            isBroadcastAddFormComplete({
                // Catalog fetch finished; blueprint optional (UI uses legacy fallback).
                catalogReady: !catalogLoading,
                type,
                cuts,
                duration,
                language,
                encodingRows,
                encodingByRowKey,
                encodingCustomEnabled,
                encodingCustomText,
                isInternationalLocked: isAddInternationalLocked,
                enabledCuts,
                enabledDurationPills,
                enabledLanguages,
                encodingUnset: ENCODING_UNSET,
            }),
        [
            catalogLoading,
            type,
            cuts,
            duration,
            language,
            encodingRows,
            encodingByRowKey,
            encodingCustomEnabled,
            encodingCustomText,
            isAddInternationalLocked,
            enabledCuts,
            enabledDurationPills,
            enabledLanguages,
        ],
    );

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

    const resetForm = (typeKey: string = type) => {
        setCuts([]);
        setDuration([]);
        const slice = getBlueprintSlice(blueprint, typeKey);
        setLanguage(
            slice?.languages.length
                ? [slice.languages[0]!]
                : defaultVenueItemLanguageLabels(venue_item_language),
        );
    };

    const resetEncodingFields = () => {
        setEncodingSelections({});
        setEncodingCustomEnabled({});
        setEncodingCustomText({});
    };

    const handleTypeChange = (newType: string) => {
        setType(newType);
        resetEncodingFields();

        const slice = getBlueprintSlice(blueprint, newType);
        const locks = applyInternationalLocks(newType, slice);

        if (locks) {
            setCuts(locks.cuts);
            setDuration([locks.durationPill]);
            setLanguage(locks.languages);
            return;
        }

        setCuts([]);
        setDuration([]);
        const defaultLangs = getBroadcastLanguagesForType(blueprint, newType);
        setLanguage(
            defaultLangs.length
                ? [defaultLangs[0]!]
                : defaultVenueItemLanguageLabels(venue_item_language),
        );
    };

    const handleEditTypeChange = (newType: string) => {
        setEditType(newType);
        const slice = getBlueprintSlice(blueprint, newType);
        const locks = applyInternationalLocks(newType, slice);

        if (locks) {
            setEditCut(locks.cuts[0] ?? '');
            setEditDuration(locks.durationPill);
            setEditLanguage(locks.languages[0] ?? '');
            return;
        }

        const cutOpts = getBroadcastCutsForType(blueprint, newType);
        const fallbackCuts = OPTIONS_BY_TYPE[newType]?.cuts ?? [];
        const cutsForType =
            cutOpts.length > 0 ? cutOpts : [...fallbackCuts];
        if (cutsForType.length) {
            setEditCut((c) =>
                cutsForType.includes(c) ? c : (cutsForType[0] ?? ''),
            );
        } else {
            setEditCut('');
        }
    };

    const handleClose = () => {
        resetForm(defaultType);
        setType(defaultType);
        resetEncodingFields();
        setIsSubmitting(false);
        setDuplicateConfirmOpen(false);
        setEditEncodingCustom(false);
        setEditEncodingCustomText('');
        setEditEncodingId(ENCODING_UNSET);
        onClose();
    };

    const buildAddFormValues = (): AddBroadcastStreamingFormValues => {
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
            return {
                cut: row.cut,
                duration: row.duration,
                language: row.language,
                encoding: raw,
                label: row.label,
                encodingMode: 'catalog' as const,
            };
        });

        return {
            type,
            cuts,
            duration,
            language,
            encodings,
        };
    };

    const submitAdd = async (formValues: AddBroadcastStreamingFormValues) => {
        if (!onAdd) {
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await onAdd(formValues);

            if (!result?.failed) {
                handleClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddToOrder = async () => {
        if (!canSubmit || !onAdd || isSubmitting) return;

        const formValues = buildAddFormValues();

        if (
            !isEdit &&
            hasBroadcastFormDuplicates(formValues, existingBroadcastRows, {
                venue_item_language,
                venue_item_encoding,
            })
        ) {
            setDuplicateConfirmOpen(true);
            return;
        }

        await submitAdd(formValues);
    };

    const handleConfirmDuplicate = async () => {
        setDuplicateConfirmOpen(false);
        await submitAdd(buildAddFormValues());
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
            if (editEncodingId === ENCODING_UNSET) return;
            const encodingId = Number.parseInt(editEncodingId, 10);
            const encodingLabel = Number.isNaN(encodingId)
                ? editEncodingId
                : venueItemEncodingIdToLabel(
                      encodingId,
                      venue_item_encoding,
                  );
            onEditSave?.({
                ...initialVenueRow,
                spot_type: editType as OrderItemsBroadcastRow['spot_type'],
                cut: editCut as OrderItemsBroadcastRow['cut'],
                duration_seconds: modalDurationPillToSeconds(
                    editDuration,
                    'broadcast',
                ),
                language_id: langId,
                language: editLanguage,
                encoding: encodingLabel || undefined,
                encoding_id: Number.isNaN(encodingId) ? undefined : encodingId,
                encoding_custom: undefined,
            });
        }
        handleClose();
    };

    return (
        <>
        <OrderModalLayout
            isOpen={isOpen}
            onClose={handleClose}
            title={
                isEdit
                    ? 'Edit Broadcast & Streaming Video'
                    : 'Add Broadcast & Streaming Video'
            }
            primaryLabel={
                isEdit
                    ? 'Save changes'
                    : isSubmitting
                      ? 'Adding…'
                      : 'Add to Order'
            }
            onPrimaryClick={isEdit ? handleEditSave : handleAddToOrder}
            primaryDisabled={
                isEdit ? !canSubmitEdit : !canSubmit || isSubmitting
            }
            modalClasses="sm:max-w-[585px]"
        >
            {fieldErrors && Object.keys(fieldErrors).length > 0 && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {Object.entries(fieldErrors).map(([field, messages]) => (
                        <p key={field}>
                            {messages.join(' ')}
                        </p>
                    ))}
                </div>
            )}
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
                                options={editEnabledCuts}
                                value={editCut ? [editCut] : []}
                                onValueChange={
                                    isEditInternationalLocked
                                        ? () => {}
                                        : (v) => setEditCut(v[0] ?? '')
                                }
                                disabled={isEditInternationalLocked}
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
                                    {allDurationPills.map((d) => {
                                        const isDisabled =
                                            isEditInternationalLocked ||
                                            !editEnabledDurationPills.includes(
                                                d,
                                            );

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
                                                isEditInternationalLocked ||
                                                !editEnabledDurationPills.includes(
                                                    editExtraDurationLabel,
                                                )
                                            }
                                            onClick={() =>
                                                !isEditInternationalLocked &&
                                                editEnabledDurationPills.includes(
                                                    editExtraDurationLabel,
                                                ) &&
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
                                    {allLanguages.map((lang) => {
                                        const isDisabled =
                                            isEditInternationalLocked ||
                                            !editEnabledLanguages.includes(
                                                lang,
                                            );
                                        return (
                                            <PillButton
                                                key={lang}
                                                className="w-full"
                                                selected={editLanguage === lang}
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    setEditLanguage(lang)
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
                                                    {(catalogEncodings.length
                                                        ? catalogEncodings
                                                        : venue_item_encoding.map(
                                                              (e) => e.type,
                                                          )
                                                    ).map((enc) => (
                                                        <SelectItem
                                                            key={enc}
                                                            value={enc}
                                                            className="text-left"
                                                        >
                                                            {enc}
                                                        </SelectItem>
                                                    ))}
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
                                    {typeKeys.map((typeKey) => (
                                        <SelectItem
                                            key={typeKey}
                                            value={typeKey}
                                        >
                                            {typeKey}
                                        </SelectItem>
                                    ))}
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
                                options={enabledCuts}
                                value={cuts}
                                onValueChange={
                                    isAddInternationalLocked
                                        ? () => {}
                                        : setCuts
                                }
                                disabled={isAddInternationalLocked}
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
                                    {allDurationPills.map((d) => {
                                        const isDisabled =
                                            isAddInternationalLocked ||
                                            !enabledDurationPills.includes(d);
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
                                            disabled={
                                                isAddInternationalLocked ||
                                                !enabledDurationPills.includes(
                                                    extraDurationLabel,
                                                )
                                            }
                                            onClick={() =>
                                                !isAddInternationalLocked &&
                                                enabledDurationPills.includes(
                                                    extraDurationLabel,
                                                ) &&
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
                                    {allLanguages.map((lang) => {
                                        const isDisabled =
                                            isAddInternationalLocked ||
                                            !enabledLanguages.includes(lang);
                                        return (
                                            <PillButton
                                                key={lang}
                                                className="w-full"
                                                selected={language.includes(
                                                    lang,
                                                )}
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    setLanguage((prev) =>
                                                        toggleInArray(
                                                            prev,
                                                            lang,
                                                        ),
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
                                                            {(catalogEncodings.length
                                                                ? catalogEncodings
                                                                : venue_item_encoding.map(
                                                                      (e) =>
                                                                          e.type,
                                                                  )
                                                            ).map((enc) => (
                                                                <SelectItem
                                                                    key={enc}
                                                                    value={enc}
                                                                    className="text-left"
                                                                >
                                                                    {enc}
                                                                </SelectItem>
                                                            ))}
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

        <Dialog
            open={duplicateConfirmOpen}
            onOpenChange={(open) => {
                if (!open) {
                    setDuplicateConfirmOpen(false);
                }
            }}
        >
            <DialogContent className="gap-2.5 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className={orderModalStyles.dialogTitle}>
                        Duplicate line item
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-600">
                        This combination already exists in this order. Are you
                        sure you want to add a duplicate?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => setDuplicateConfirmOpen(false)}
                        className={orderModalStyles.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={orderModalStyles.primaryButton}
                        onClick={() => void handleConfirmDuplicate()}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding…' : 'Add anyway'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
