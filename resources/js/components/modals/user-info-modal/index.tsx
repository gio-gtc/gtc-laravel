import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { UserInfoOutOfOfficeFields } from '@/components/modals/user-info-modal/out-of-office-fields';
import { UserInfoTextField } from '@/components/modals/user-info-modal/text-field';
import {
    buildUserInfoFormDefaults,
    phoneRawToE164,
    type CreateContactPrefill,
} from '@/components/modals/user-info-modal/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    PhoneInput,
    tryParsePhoneE164,
    type PhoneInputHandle,
} from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { type SharedData, type User } from '@/types';
import { Form, usePage } from '@inertiajs/react';
import { Camera, HelpCircle } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { UserAvatar } from '../../ui/user-avatar';
import Divider from '../../utils/divider';

export type { CreateContactPrefill };

function firstContactValidationToastMessage(
    errs: Record<string, string | string[]>,
): string | undefined {
    for (const value of Object.values(errs)) {
        if (Array.isArray(value) && value.length > 0 && value[0]) {
            return value[0];
        }
        if (typeof value === 'string' && value !== '') {
            return value;
        }
    }
    return undefined;
}

type UserInfoModalMode = 'edit' | 'create';

const MODE_LABELS: Record<
    UserInfoModalMode,
    {
        defaultTitle: string;
        photoLabel: string;
        photoUploadTitle: string;
        submitLabel: string;
        permissionsPlaceholder: string | undefined;
    }
> = {
    create: {
        defaultTitle: 'Create Contact',
        photoLabel: 'Photo',
        photoUploadTitle: 'Upload photo',
        submitLabel: 'Create Contact',
        permissionsPlaceholder: 'Select permissions level',
    },
    edit: {
        defaultTitle: 'Profile',
        photoLabel: 'Your Photo',
        photoUploadTitle: 'Change photo',
        submitLabel: 'Submit',
        permissionsPlaceholder: undefined,
    },
};

interface UserInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User;
    mode?: UserInfoModalMode;
    title?: string;
    createPrefill?: CreateContactPrefill | null;
}

export default function UserInfoModal({
    isOpen,
    onClose,
    user: providedUser,
    mode = 'edit',
    title: providedTitle,
    createPrefill = null,
}: UserInfoModalProps) {
    const { auth } = usePage<SharedData>().props;
    const profileFormProps = ProfileController.update.form();

    const user = providedUser ?? auth.user;
    const isCreateMode = mode === 'create';
    const isProfileEdit = mode === 'edit';
    const modeLabels = MODE_LABELS[mode];
    const modalTitle = providedTitle ?? modeLabels.defaultTitle;
    const createFormKey = isCreateMode
        ? `create-contact-${isOpen}-${JSON.stringify(createPrefill ?? {})}`
        : undefined;

    const userSyncKey = useMemo(
        () => `${mode}-${user.id}-${user.email}`,
        [mode, user.id, user.email],
    );

    const defaults = useMemo(
        () => buildUserInfoFormDefaults(user, isCreateMode, createPrefill),
        [user, isCreateMode, createPrefill],
    );

    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setPhotoPreviewUrl((prev) => {
                if (prev) {
                    URL.revokeObjectURL(prev);
                }
                return null;
            });
        }
    }, [isOpen]);

    const phoneInputRef = useRef<PhoneInputHandle>(null);
    const [phoneE164, setPhoneE164] = useState(() =>
        phoneRawToE164(defaults.phone_number),
    );

    useLayoutEffect(() => {
        if (!isOpen) {
            return;
        }
        setPhoneE164(phoneRawToE164(defaults.phone_number));
    }, [isOpen, userSyncKey, defaults.phone_number]);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-[716px]">
                <DialogHeader>
                    <DialogTitle>{modalTitle}</DialogTitle>
                </DialogHeader>
                <Divider />

                {/* Create posts to BFF/API contact invite; edit uses session profile (Laravel auth — not used in BFF-only login). */}
                <Form
                    key={createFormKey}
                    {...(isCreateMode
                        ? {
                              action: '/contacts/invite',
                              method: 'post' as const,
                          }
                        : profileFormProps)}
                    transform={(data) => {
                        if (isCreateMode) {
                            const next = {
                                ...(data as Record<string, unknown>),
                            };
                            delete next.photo;
                            return {
                                ...next,
                                phone_number:
                                    tryParsePhoneE164(
                                        phoneInputRef.current?.getDisplayValue() ??
                                            '',
                                        'US',
                                    ) ?? '',
                            };
                        }
                        return {
                            ...data,
                            phone_number:
                                tryParsePhoneE164(
                                    phoneInputRef.current?.getDisplayValue() ??
                                        '',
                                    'US',
                                ) ?? '',
                        };
                    }}
                    options={{
                        preserveScroll: true,
                    }}
                    onSuccess={() => {
                        if (isCreateMode) {
                            toast.success('Invitation email sent.');
                        }
                        onClose();
                    }}
                    onError={(errors) => {
                        if (isCreateMode) {
                            const msg =
                                firstContactValidationToastMessage(errors);
                            toast.error(
                                msg ??
                                    'Unable to send the invitation. Please check the form.',
                            );
                        }
                    }}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <div className="space-y-4">
                                    <span className="inline-block text-center">
                                        <Label className="xs-gray-400-weight-400">
                                            {modeLabels.photoLabel}
                                        </Label>

                                        <div className="relative w-fit">
                                            <UserAvatar
                                                user={user}
                                                imageOverride={photoPreviewUrl}
                                                className="size-[88px] rounded-full border border-gray-100 p-0.5"
                                            />

                                            <label
                                                htmlFor="photo"
                                                className="absolute right-0 bottom-0 inline-flex cursor-pointer items-center justify-center rounded-full border bg-background p-1 text-gray-500 shadow-sm hover:bg-muted"
                                                title={
                                                    modeLabels.photoUploadTitle
                                                }
                                            >
                                                <Camera className="size-3" />
                                            </label>

                                            <input
                                                id="photo"
                                                name="photo"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(e) => {
                                                    const file =
                                                        e.currentTarget
                                                            .files?.[0];
                                                    if (!file) return;

                                                    setPhotoPreviewUrl(
                                                        (prev) => {
                                                            if (prev) {
                                                                URL.revokeObjectURL(
                                                                    prev,
                                                                );
                                                            }
                                                            return URL.createObjectURL(
                                                                file,
                                                            );
                                                        },
                                                    );
                                                }}
                                            />
                                        </div>
                                    </span>
                                </div>

                                <div className="grid gap-2">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <UserInfoTextField
                                            id="first_name"
                                            name="first_name"
                                            label="First Name"
                                            defaultValue={defaults.first_name}
                                            error={errors.first_name}
                                            required
                                            autoComplete="given-name"
                                            placeholder="First name"
                                        />
                                        <UserInfoTextField
                                            id="last_name"
                                            name="last_name"
                                            label="Last Name"
                                            defaultValue={defaults.last_name}
                                            error={errors.last_name}
                                            required
                                            autoComplete="family-name"
                                            placeholder="Last name"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <UserInfoTextField
                                            id="organisation"
                                            name="organisation"
                                            label="Organisation"
                                            defaultValue={defaults.organisation}
                                            error={errors.organisation}
                                            required
                                            placeholder="Organisation"
                                        />
                                        <UserInfoTextField
                                            id="job_title"
                                            name="job_title"
                                            label="Job Title"
                                            defaultValue={defaults.job_title}
                                            error={errors.job_title}
                                            labelVariant="plain"
                                            placeholder="Job title"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <UserInfoTextField
                                            id="email"
                                            name="email"
                                            label="Email"
                                            type="email"
                                            defaultValue={defaults.email}
                                            error={errors.email}
                                            required
                                            autoComplete="email"
                                            placeholder="Email"
                                        />
                                        <UserInfoTextField
                                            id="department"
                                            name="department"
                                            label="Department or Team"
                                            defaultValue={defaults.department}
                                            error={errors.department}
                                            labelVariant="plain"
                                            placeholder="Department or Team"
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <FieldLabel
                                                className="xs-gray-700-weight-500"
                                                htmlFor="phone_number"
                                                required
                                            >
                                                Phone Number
                                            </FieldLabel>
                                            <PhoneInput
                                                ref={phoneInputRef}
                                                id="phone_number"
                                                value={phoneE164}
                                                onChange={setPhoneE164}
                                                autoComplete="tel"
                                                aria-invalid={Boolean(
                                                    errors.phone_number,
                                                )}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center gap-2">
                                                <Label
                                                    htmlFor="permissions_level"
                                                    className="text-xs font-medium text-gray-400"
                                                >
                                                    Permissions Level
                                                </Label>
                                                <HelpCircle className="size-3 text-gray-400" />
                                            </div>
                                            <Input
                                                id="permissions_level"
                                                name="permissions_level"
                                                defaultValue={
                                                    defaults.permissions_level
                                                }
                                                disabled={isProfileEdit}
                                                readOnly={isProfileEdit}
                                                placeholder={
                                                    modeLabels.permissionsPlaceholder
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    className="xs-gray-700-weight-500"
                                    htmlFor="about_me"
                                >
                                    About Me
                                </Label>
                                <Textarea
                                    id="about_me"
                                    name="about_me"
                                    defaultValue={defaults.about_me}
                                    placeholder="Enter a description..."
                                    className="min-h-28"
                                />
                            </div>

                            {isProfileEdit && (
                                <UserInfoOutOfOfficeFields
                                    isOpen={isOpen}
                                    syncKey={userSyncKey}
                                    initial={{
                                        out_of_office: defaults.out_of_office,
                                        out_of_office_start_date:
                                            defaults.out_of_office_start_date,
                                        out_of_office_end_date:
                                            defaults.out_of_office_end_date,
                                    }}
                                    errors={{
                                        out_of_office: errors.out_of_office,
                                        out_of_office_start_date:
                                            errors.out_of_office_start_date,
                                        out_of_office_end_date:
                                            errors.out_of_office_end_date,
                                    }}
                                />
                            )}

                            <Divider />
                            <DialogFooter className="gap-3 sm:gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {modeLabels.submitLabel}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
