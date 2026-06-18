import type { VenueItemSocialCardHolder } from '@/components/pages/orders/slideout/switch-view/general-media/modals/spot-type-cuts-options';
import { MultiSelectCombobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import {
    defaultVenueItemLanguageLabels,
    venueItemLanguageIdToLabel,
} from '@/components/utils/venue-items';
import { cn } from '@/lib/utils';
import {
    languageTypeToId,
    modalDurationPillToSeconds,
} from '@/lib/venue-items/modal-mappers';
import type { OrderItemLanguage, OrderItemsSocialRow } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import {
    durationSecondsToModalPillLabel,
    isNonDefaultModalDuration,
} from './modal-duration';
import OrderModalLayout from './order-modal-layout';
import PillButton from './pill-button';
import { orderModalStyles, toggleInArray } from './shared';
import {
    SOCIAL_CUT_OPTIONS,
    SOCIAL_VIDEO_TYPE_OPTIONS,
} from './spot-type-cuts-options';

const CARD_HOLDER_OPTIONS = ['Amex', 'Citi'] as const;
const DURATION_OPTIONS = [':10', ':15', ':30'] as const;
const CARD_NONE = '__none__';

export interface AddSocialVideoFormValues {
    type: string[];
    cuts: string[];
    cardHolder: string[];
    duration: string[];
    language: string[];
}

interface AddSocialVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (values: AddSocialVideoFormValues) => void;
    venue_item_language: OrderItemLanguage[];
    initialDurationSeconds?: number;
    mode?: 'add' | 'edit';
    initialVenueRow?: OrderItemsSocialRow;
    onEditSave?: (row: OrderItemsSocialRow) => void;
}

export default function AddSocialVideoModal({
    isOpen,
    onClose,
    onAdd,
    venue_item_language,
    initialDurationSeconds,
    mode = 'add',
    initialVenueRow,
    onEditSave,
}: AddSocialVideoModalProps) {
    const isEdit = mode === 'edit' && initialVenueRow != null;

    const [type, setType] = useState<string[]>([]);
    const [cuts, setCuts] = useState<string[]>([]);
    const [cardHolder, setCardHolder] = useState<string[]>([]);
    const [duration, setDuration] = useState<string[]>([]);
    const [language, setLanguage] = useState<string[]>(() =>
        defaultVenueItemLanguageLabels(venue_item_language),
    );

    const [editLayout, setEditLayout] = useState('');
    const [editCut, setEditCut] = useState('');
    const [editCardHolder, setEditCardHolder] = useState(CARD_NONE);
    const [editDuration, setEditDuration] = useState('');
    const [editLanguage, setEditLanguage] = useState('');

    useEffect(() => {
        if (!isOpen || !isEdit || !initialVenueRow) return;
        /* eslint-disable react-hooks/set-state-in-effect -- prefill edit form when modal opens */
        setEditLayout(initialVenueRow.spot_type);
        setEditCut(initialVenueRow.cut);
        setEditDuration(
            durationSecondsToModalPillLabel(
                initialVenueRow.duration_seconds,
                'social',
            ),
        );
        const langLabel = venueItemLanguageIdToLabel(
            initialVenueRow.language_id ?? -1,
            venue_item_language,
        );
        setEditLanguage(
            initialVenueRow.language ??
                (langLabel || venue_item_language[0]?.type || ''),
        );
        const ch = initialVenueRow.card_holder;
        setEditCardHolder(
            ch && CARD_HOLDER_OPTIONS.includes(ch as 'Amex' | 'Citi')
                ? ch
                : CARD_NONE,
        );
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
        setDuration([durationSecondsToModalPillLabel(s, 'social')]);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [isOpen, isEdit, initialDurationSeconds]);

    const extraDurationLabel =
        !isEdit &&
        initialDurationSeconds !== undefined &&
        isNonDefaultModalDuration(initialDurationSeconds, 'social')
            ? durationSecondsToModalPillLabel(initialDurationSeconds, 'social')
            : null;

    const editSocialDurationSeconds = useMemo(
        () => modalDurationPillToSeconds(editDuration, 'social'),
        [editDuration],
    );

    const editExtraDurationLabel =
        isEdit &&
        editDuration &&
        isNonDefaultModalDuration(editSocialDurationSeconds, 'social')
            ? durationSecondsToModalPillLabel(
                  editSocialDurationSeconds,
                  'social',
              )
            : null;

    const canSubmitEdit = useMemo(() => {
        return Boolean(editLayout && editCut && editDuration && editLanguage);
    }, [editLayout, editCut, editDuration, editLanguage]);

    const resetForm = () => {
        setType([]);
        setCuts([]);
        setCardHolder([]);
        setDuration([]);
        setLanguage(defaultVenueItemLanguageLabels(venue_item_language));
    };

    const handleOnClose = () => {
        resetForm();
        onClose();
    };

    const handleAddToOrder = () => {
        onAdd?.({ type, cuts, cardHolder, duration, language });
        handleOnClose();
    };

    const handleEditSave = () => {
        if (!canSubmitEdit || !initialVenueRow) return;
        const langId = languageTypeToId(venue_item_language, editLanguage);
        if (langId === undefined) return;

        const restSocial: OrderItemsSocialRow = { ...initialVenueRow };
        delete restSocial.card_holder;
        const next: OrderItemsSocialRow = {
            ...restSocial,
            spot_type: editLayout as OrderItemsSocialRow['spot_type'],
            cut: editCut as OrderItemsSocialRow['cut'],
            duration_seconds: modalDurationPillToSeconds(
                editDuration,
                'social',
            ),
            language_id: langId,
            ...(editCardHolder !== CARD_NONE
                ? {
                      card_holder: editCardHolder as VenueItemSocialCardHolder,
                  }
                : {}),
        };
        onEditSave?.(next);
        handleOnClose();
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={handleOnClose}
            title={isEdit ? 'Edit Social Video' : 'Add Social Video'}
            primaryLabel={isEdit ? 'Save changes' : 'Add to Order'}
            onPrimaryClick={isEdit ? handleEditSave : handleAddToOrder}
            primaryDisabled={isEdit ? !canSubmitEdit : false}
            modalClasses="sm:max-w-[484px]"
        >
            {isEdit ? (
                <div className="flex flex-col gap-2 text-xs sm:flex-row">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="edit-social-type"
                                className={orderModalStyles.label}
                            >
                                Type
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the type of Social Video
                            </p>
                            <MultiSelectCombobox
                                id="edit-social-type"
                                mode="single"
                                options={SOCIAL_VIDEO_TYPE_OPTIONS}
                                value={editLayout ? [editLayout] : []}
                                onValueChange={(v) => setEditLayout(v[0] ?? '')}
                                placeholder="Select Type"
                                emptyMessage="No cuts found."
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
                            />
                        </div>

                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="edit-social-cuts"
                                className={orderModalStyles.label}
                            >
                                Cuts
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the type of Cuts
                            </p>
                            <MultiSelectCombobox
                                id="edit-social-cuts"
                                mode="single"
                                options={SOCIAL_CUT_OPTIONS}
                                value={editCut ? [editCut] : []}
                                onValueChange={(v) => setEditCut(v[0] ?? '')}
                                placeholder="Select Cuts"
                                emptyMessage="No cuts found."
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
                            />
                        </div>
                    </div>

                    <div className="flex flex-row justify-between gap-2 text-xs sm:justify-center">
                        <div className="flex flex-col gap-2">
                            <Label
                                className={cn('pb-4', orderModalStyles.label)}
                            >
                                Card Holder
                            </Label>
                            <div className="flex flex-col gap-2">
                                {CARD_HOLDER_OPTIONS.map((option) => (
                                    <PillButton
                                        key={option}
                                        className="w-full"
                                        selected={editCardHolder === option}
                                        onClick={() =>
                                            setEditCardHolder(option)
                                        }
                                    >
                                        {option}
                                    </PillButton>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label
                                className={cn('pb-4', orderModalStyles.label)}
                            >
                                Duration
                            </Label>
                            <div className="flex flex-col gap-2">
                                {DURATION_OPTIONS.map((d) => {
                                    const isDisabled = d == ':10';

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
                                        onClick={() =>
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
                                className={cn('pb-4', orderModalStyles.label)}
                            >
                                Language
                            </Label>
                            <div className="flex flex-col gap-2">
                                {venue_item_language.map((lang) => (
                                    <PillButton
                                        key={lang.id}
                                        className="w-full"
                                        selected={editLanguage === lang.type}
                                        onClick={() =>
                                            setEditLanguage(lang.type)
                                        }
                                    >
                                        {lang.type}
                                    </PillButton>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2 text-xs sm:flex-row">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-3 flex-col gap-1.5">
                            <Label
                                htmlFor="type"
                                className={orderModalStyles.label}
                            >
                                Type
                            </Label>
                            <p className={orderModalStyles.helper}>
                                Select the type of Social Video
                            </p>
                            <MultiSelectCombobox
                                id="type"
                                options={SOCIAL_VIDEO_TYPE_OPTIONS}
                                value={type}
                                onValueChange={setType}
                                placeholder="Select Type"
                                emptyMessage="No cuts found."
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
                            />
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
                                options={SOCIAL_CUT_OPTIONS}
                                value={cuts}
                                onValueChange={setCuts}
                                placeholder="Select Cuts"
                                emptyMessage="No cuts found."
                                triggerClassName={
                                    orderModalStyles.selectTrigger
                                }
                            />
                        </div>
                    </div>

                    <div className="flex flex-row justify-between gap-2 text-xs sm:justify-center">
                        <div className="flex flex-col gap-2">
                            <Label
                                className={cn('pb-4', orderModalStyles.label)}
                            >
                                Card Holder
                            </Label>
                            <div className="flex flex-col gap-2">
                                {CARD_HOLDER_OPTIONS.map((option) => (
                                    <PillButton
                                        key={option}
                                        className="w-full"
                                        selected={cardHolder.includes(option)}
                                        onClick={() =>
                                            setCardHolder((prev) =>
                                                toggleInArray(prev, option),
                                            )
                                        }
                                    >
                                        {option}
                                    </PillButton>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label
                                className={cn('pb-4', orderModalStyles.label)}
                            >
                                Duration
                            </Label>
                            <div className="flex flex-col gap-2">
                                {DURATION_OPTIONS.map((d) => {
                                    const isDisabled = d == ':10';

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
                                        onClick={() =>
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
                                className={cn('pb-4', orderModalStyles.label)}
                            >
                                Language
                            </Label>
                            <div className="flex flex-col gap-2">
                                {venue_item_language.map((lang) => (
                                    <PillButton
                                        key={lang.id}
                                        className="w-full"
                                        selected={language.includes(lang.type)}
                                        onClick={() =>
                                            setLanguage((prev) =>
                                                toggleInArray(prev, lang.type),
                                            )
                                        }
                                    >
                                        {lang.type}
                                    </PillButton>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </OrderModalLayout>
    );
}
