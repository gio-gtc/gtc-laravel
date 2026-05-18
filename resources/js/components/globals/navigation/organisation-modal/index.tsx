import { MultiSelectCombobox } from '@/components/ui/combobox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InputWithLeadingIcon } from '@/components/ui/input-with-leading-icon';
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
import DollarInput from '@/components/utils/dollar-input';
import InputAdditions from '@/components/utils/input-additions';
import { ModalFooterActions } from '@/components/utils/modal-footer-actions';
import type { SharedData } from '@/types';
import type { Errors, FormDataConvertible, Page } from '@inertiajs/core';
import { Form, usePage } from '@inertiajs/react';
import { User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
    ORGANISATIONS_STORE_FORM,
    buildOrganisationModalDefaults,
    mergeOrganisationCreatePayload,
    refRowLabel,
    refRowValue,
    summariseOrganisationValidationErrors,
    type FlashShape,
    type OrganisationModalFormValues,
} from './utils';

interface OrganisationModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** After successful POST when flash includes `new_organisation` (before `onClose`). */
    onOrganisationCreated?: (organisation: {
        id: number;
        name: string;
    }) => void;
}

export default function OrganisationModal({
    isOpen,
    onClose,
    onOrganisationCreated,
}: OrganisationModalProps) {
    const { ApiReferenceData } = usePage<SharedData>().props;

    const dropdowns = ApiReferenceData ?? {
        org_types: [],
        countries: [],
        currency_codes: [],
        roles: [],
    };

    const [organisationFields, setOrganisationFields] =
        useState<OrganisationModalFormValues>(() =>
            buildOrganisationModalDefaults(dropdowns.currency_codes),
        );

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const id = requestAnimationFrame(() => {
            setOrganisationFields(
                buildOrganisationModalDefaults(dropdowns.currency_codes),
            );
        });
        return () => cancelAnimationFrame(id);
    }, [isOpen, dropdowns.currency_codes]);

    const organisationTypeRows = useMemo(
        () => dropdowns.org_types.filter((row) => refRowValue(row) !== ''),
        [dropdowns.org_types],
    );
    const countryRows = useMemo(
        () => dropdowns.countries.filter((row) => refRowValue(row) !== ''),
        [dropdowns.countries],
    );

    const organisationTypeOptions = useMemo(
        () =>
            organisationTypeRows.map((row) => ({
                value: refRowValue(row),
                label: refRowLabel(row),
            })),
        [organisationTypeRows],
    );

    const resetLocalSuccess = useCallback(() => {
        setOrganisationFields(
            buildOrganisationModalDefaults(dropdowns.currency_codes),
        );
    }, [dropdowns.currency_codes]);

    const handleOrganisationSuccess = useCallback(
        (page: Page) => {
            const flash = page.props.flash as FlashShape | undefined;

            const errorFlash =
                typeof flash?.error === 'string' && flash.error.trim() !== ''
                    ? flash.error.trim()
                    : null;
            if (errorFlash !== null) {
                // Session flash error toast is surfaced by app-layout; stay open.
                return;
            }

            const successFlash =
                typeof flash?.success === 'string' &&
                flash.success.trim() !== ''
                    ? flash.success.trim()
                    : null;

            const rawNew = flash?.new_organisation;
            if (
                rawNew &&
                typeof rawNew === 'object' &&
                successFlash !== null &&
                errorFlash === null
            ) {
                const id = Number((rawNew as { id?: unknown }).id);
                const nameRaw = (rawNew as { name?: unknown }).name;
                const name =
                    typeof nameRaw === 'string'
                        ? nameRaw.trim()
                        : String(nameRaw ?? '').trim();
                if (Number.isFinite(id) && id > 0 && name !== '') {
                    onOrganisationCreated?.({ id, name });
                }
            }

            resetLocalSuccess();
            onClose();
        },
        [resetLocalSuccess, onClose, onOrganisationCreated],
    );

    const handleOrganisationError = useCallback((errors: Errors) => {
        toast.error(summariseOrganisationValidationErrors(errors), {
            toastId: 'organisation-modal-validation-error',
            style: { whiteSpace: 'pre-line' },
        });
    }, []);

    const transformPayload = useCallback(
        (data: Record<string, FormDataConvertible>) =>
            mergeOrganisationCreatePayload(data, organisationFields),
        [organisationFields],
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="overflow-y-auto sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Organisation Information</DialogTitle>
                </DialogHeader>

                <Divider />

                <Form
                    {...ORGANISATIONS_STORE_FORM}
                    transform={transformPayload}
                    options={{ preserveScroll: true }}
                    onSuccess={handleOrganisationSuccess}
                    onError={handleOrganisationError}
                    resetOnSuccess={false}
                    className="space-y-4"
                >
                    {({ processing }) => (
                        <>
                            <ColumnedRowsParent>
                                <ColumnedRowsChild
                                    labelFor="name"
                                    labelContent="Organisation Name"
                                    childrenContainerClasses="modal-child-container"
                                    required
                                >
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Enter Organisation Name"
                                        required
                                        value={organisationFields.name}
                                        onChange={(e) =>
                                            setOrganisationFields((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                    />
                                </ColumnedRowsChild>

                                <ColumnedRowsChild
                                    labelFor="types"
                                    labelContent="Organisation Type"
                                    childrenContainerClasses="modal-child-container"
                                    required
                                >
                                    <MultiSelectCombobox
                                        id="types"
                                        mode="multi"
                                        maxBadges={2}
                                        options={organisationTypeOptions}
                                        value={organisationFields.types}
                                        onValueChange={(typesNext) =>
                                            setOrganisationFields((prev) => ({
                                                ...prev,
                                                types: typesNext,
                                            }))
                                        }
                                        placeholder="Select organisation type(s)"
                                        emptyMessage="No organisation types available"
                                        triggerClassName="md-gray-900-weight-400 h-[44px] hover:bg-transparent hover:text-inherit [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
                                        badgeClassName="px-1.5 py-0.5 text-sm"
                                    />
                                </ColumnedRowsChild>
                            </ColumnedRowsParent>

                            <Divider />
                            <ColumnedRowsParent>
                                <ColumnedRowsChild
                                    labelFor="billing_address"
                                    labelContent="Address"
                                    childrenContainerClasses="modal-child-container"
                                    required
                                    multiInput
                                >
                                    <Input
                                        id="billing_address"
                                        name="billing_address"
                                        placeholder="Street Address"
                                        required
                                        value={
                                            organisationFields.billing_address
                                        }
                                        onChange={(e) =>
                                            setOrganisationFields((prev) => ({
                                                ...prev,
                                                billing_address: e.target.value,
                                            }))
                                        }
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            id="city"
                                            name="city"
                                            placeholder="City"
                                            required
                                            className="flex-[2]"
                                            value={organisationFields.city}
                                            onChange={(e) =>
                                                setOrganisationFields(
                                                    (prev) => ({
                                                        ...prev,
                                                        city: e.target.value,
                                                    }),
                                                )
                                            }
                                        />
                                        <Input
                                            id="state"
                                            name="state"
                                            placeholder="State"
                                            required
                                            maxLength={2}
                                            className="flex-1"
                                            value={organisationFields.state}
                                            onChange={(e) =>
                                                setOrganisationFields(
                                                    (prev) => ({
                                                        ...prev,
                                                        state: e.target.value,
                                                    }),
                                                )
                                            }
                                        />
                                        <Input
                                            id="zip"
                                            name="zip"
                                            placeholder="ZIP"
                                            required
                                            maxLength={5}
                                            className="flex-1"
                                            value={organisationFields.zip}
                                            onChange={(e) =>
                                                setOrganisationFields(
                                                    (prev) => ({
                                                        ...prev,
                                                        zip: e.target.value,
                                                    }),
                                                )
                                            }
                                        />
                                    </div>
                                    <Select
                                        required
                                        value={
                                            organisationFields.country_id !== ''
                                                ? organisationFields.country_id
                                                : undefined
                                        }
                                        onValueChange={(v) =>
                                            setOrganisationFields((prev) => ({
                                                ...prev,
                                                country_id: v,
                                            }))
                                        }
                                    >
                                        <SelectTrigger id="country_id">
                                            <SelectValue placeholder="Select Country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryRows.length === 0 ? (
                                                <SelectItem
                                                    value="__none_country"
                                                    disabled
                                                >
                                                    No countries available
                                                </SelectItem>
                                            ) : (
                                                countryRows.map((row) => {
                                                    const val =
                                                        refRowValue(row);

                                                    return (
                                                        <SelectItem
                                                            key={val}
                                                            value={val}
                                                        >
                                                            {refRowLabel(row)}
                                                        </SelectItem>
                                                    );
                                                })
                                            )}
                                        </SelectContent>
                                    </Select>
                                </ColumnedRowsChild>
                            </ColumnedRowsParent>

                            <Divider />
                            <ColumnedRowsParent>
                                <ColumnedRowsChild
                                    labelFor="credit_limit"
                                    labelContent="Credit Limit"
                                    subLabelContent="In US Dollars"
                                    childrenContainerClasses="modal-child-container"
                                    required
                                >
                                    <DollarInput
                                        id="credit_limit"
                                        name="credit_limit"
                                        containerClassNames="flex-1"
                                        placeholder="Enter Credit Limit"
                                        value={organisationFields.credit_limit}
                                        onChangeValue={(v) =>
                                            setOrganisationFields((prev) => ({
                                                ...prev,
                                                credit_limit: v,
                                            }))
                                        }
                                    />
                                </ColumnedRowsChild>

                                <ColumnedRowsChild
                                    labelFor="credit_terms"
                                    labelContent="Credit Terms"
                                    subLabelContent="Number of days"
                                    childrenContainerClasses="modal-child-container"
                                    required
                                >
                                    <Input
                                        id="credit_terms"
                                        name="credit_terms"
                                        type="string"
                                        placeholder="Enter Terms"
                                        required
                                        value={organisationFields.credit_terms}
                                        onChange={(e) =>
                                            setOrganisationFields((prev) => ({
                                                ...prev,
                                                credit_terms: e.target.value,
                                            }))
                                        }
                                    />
                                </ColumnedRowsChild>

                                <ColumnedRowsChild
                                    labelFor="currency_code"
                                    labelContent="Preferred Currency"
                                    childrenContainerClasses="modal-child-container"
                                    required
                                >
                                    <Select
                                        required
                                        value={
                                            organisationFields.currency_code !==
                                            ''
                                                ? organisationFields.currency_code
                                                : undefined
                                        }
                                        onValueChange={(v) =>
                                            setOrganisationFields((prev) => ({
                                                ...prev,
                                                currency_code: v,
                                            }))
                                        }
                                    >
                                        <SelectTrigger id="currency_code">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dropdowns.currency_codes.length ===
                                            0 ? (
                                                <SelectItem
                                                    value="__none_currency"
                                                    disabled
                                                >
                                                    No currencies available
                                                </SelectItem>
                                            ) : (
                                                dropdowns.currency_codes.map(
                                                    (code) => (
                                                        <SelectItem
                                                            key={code}
                                                            value={code}
                                                        >
                                                            {code}
                                                        </SelectItem>
                                                    ),
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </ColumnedRowsChild>
                            </ColumnedRowsParent>

                            <Divider />
                            <ColumnedRowsParent>
                                <ColumnedRowsChild
                                    labelFor="accounts_payable_emails"
                                    labelContent="Accounts Payable Email"
                                    childrenContainerClasses="modal-child-container"
                                    required
                                    multiInput
                                >
                                    <InputAdditions
                                        repeatArrayFieldName="accounts_payable_emails"
                                        inputList={
                                            organisationFields.accounts_payable_emails
                                        }
                                        setInputList={(list) =>
                                            setOrganisationFields((prev) => ({
                                                ...prev,
                                                accounts_payable_emails: list,
                                            }))
                                        }
                                    />
                                </ColumnedRowsChild>

                                <ColumnedRowsChild
                                    // accounts_payable_contact
                                    labelFor="accounts_payable_contact"
                                    labelContent="Accounts Payable Contact"
                                    childrenContainerClasses="modal-child-container"
                                >
                                    <InputWithLeadingIcon
                                        icon={<User />}
                                        id="accounts_payable_contact"
                                        name="accounts_payable_contact"
                                        placeholder="Contact Name"
                                        value={
                                            organisationFields.accounts_payable_contact
                                        }
                                        onChange={(e) =>
                                            setOrganisationFields((prev) => ({
                                                ...prev,
                                                accounts_payable_contact:
                                                    e.target.value,
                                            }))
                                        }
                                    />
                                </ColumnedRowsChild>
                            </ColumnedRowsParent>

                            <Divider />
                            <ModalFooterActions
                                onCancel={onClose}
                                confirmLabel="Save"
                                cancelDisabled={processing}
                                confirmDisabled={
                                    processing ||
                                    organisationFields.types.length === 0
                                }
                            />
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
