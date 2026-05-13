import InputError from '@/components/input-error';
import { UserInfoPhotoSection } from '@/components/modals/user-info-modal/photo-section';
import { UserInfoTextField } from '@/components/modals/user-info-modal/text-field';
import type { UserInfoFormDefaults } from '@/components/modals/user-info-modal/utils';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    PhoneNumberField,
    type PhoneNumberFieldHandle,
} from '@/components/ui/phone-number-field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SharedData, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { HelpCircle, MailCheck } from 'lucide-react';
import {
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type RefObject,
    type SetStateAction,
} from 'react';

type ModeLabelsSlice = {
    permissionsPlaceholder: string | undefined;
};

export type UserInfoModalFormErrors = Partial<
    Record<
        | 'first_name'
        | 'last_name'
        | 'organisation_id'
        | 'job_title'
        | 'email'
        | 'department'
        | 'phone_number'
        | 'role',
        string
    >
>;

interface UserInfoFormFieldsProps {
    user: User;
    defaults: UserInfoFormDefaults;
    errors: UserInfoModalFormErrors;
    photoLabel: string;
    photoUploadTitle: string;
    photoPreviewUrl: string | null;
    setPhotoPreviewUrl: Dispatch<SetStateAction<string | null>>;
    phoneFieldRef: RefObject<PhoneNumberFieldHandle | null>;
    phoneRawDefault?: string | null;
    phoneSyncKey?: string | number;
    onPhoneValidChange?: (isValid: boolean) => void;
    /** Create mode only: notified when user has chosen a non-empty role. */
    onCreateRoleFilledChange?: (filled: boolean) => void;
    isProfileEdit: boolean;
    modeLabels: ModeLabelsSlice;
}

export function UserInfoFormFields({
    user,
    defaults,
    errors,
    photoLabel,
    photoUploadTitle,
    photoPreviewUrl,
    setPhotoPreviewUrl,
    phoneFieldRef,
    phoneRawDefault,
    phoneSyncKey,
    onPhoneValidChange,
    onCreateRoleFilledChange,
    isProfileEdit,
    modeLabels,
}: UserInfoFormFieldsProps) {
    const { availableRoles = [] } = usePage<SharedData>().props;
    const [selectedRole, setSelectedRole] = useState<string>('');
    const roleAnchorRef = useRef<HTMLDivElement>(null);

    const editRoleDisplay =
        user.roles?.[0] ?? defaults.role ?? 'No Role Assigned';

    useEffect(() => {
        if (isProfileEdit) return;
        onCreateRoleFilledChange?.(selectedRole !== '');
    }, [isProfileEdit, selectedRole, onCreateRoleFilledChange]);

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
        const form = roleAnchorRef.current?.closest('form');
        form?.dispatchEvent(new Event('input', { bubbles: true }));
    };

    return (
        <>
            <div className="grid gap-2">
                <UserInfoPhotoSection
                    user={user}
                    photoLabel={photoLabel}
                    photoUploadTitle={photoUploadTitle}
                    photoPreviewUrl={photoPreviewUrl}
                    setPhotoPreviewUrl={setPhotoPreviewUrl}
                />

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
                            id="organisation_id"
                            name="organisation_id"
                            label="Organisation"
                            defaultValue={
                                defaults.organisation_id
                                    ? String(defaults.organisation_id)
                                    : ''
                            }
                            error={errors.organisation_id}
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
                            labelSuffix={
                                user.pending_email ? (
                                    <Tooltip>
                                        <TooltipTrigger
                                            type="button"
                                            aria-label={`Pending verification: ${user.pending_email}`}
                                            data-test="pending-email-notice"
                                            className="inline-flex cursor-help rounded-sm text-amber-500 transition-colors hover:text-amber-600 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:outline-none"
                                        >
                                            <MailCheck className="size-3.5" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Pending verification:{' '}
                                            {user.pending_email}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : null
                            }
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
                            <PhoneNumberField
                                ref={phoneFieldRef}
                                id="phone_number"
                                rawDefault={phoneRawDefault}
                                syncKey={phoneSyncKey}
                                autoComplete="tel"
                                aria-invalid={Boolean(errors.phone_number)}
                                nativeRequired
                                onValidChange={onPhoneValidChange}
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center gap-0.5">
                                {isProfileEdit ? (
                                    <Label
                                        htmlFor="role"
                                        className="text-xs font-medium text-gray-400"
                                    >
                                        Permissions Level
                                    </Label>
                                ) : (
                                    <FieldLabel
                                        htmlFor="role"
                                        className="xs-gray-700-weight-500"
                                        required
                                    >
                                        Permissions Level
                                    </FieldLabel>
                                )}
                                <HelpCircle className="size-3 text-gray-400" />
                            </div>
                            {isProfileEdit ? (
                                <Input
                                    id="role"
                                    value={editRoleDisplay}
                                    disabled
                                    readOnly
                                    placeholder={
                                        modeLabels.permissionsPlaceholder
                                    }
                                />
                            ) : (
                                <>
                                    <div ref={roleAnchorRef}>
                                        {/* Role: Radix name= sync can submit first option while UI shows placeholder; use hidden input bound to state. */}
                                        <input
                                            type="hidden"
                                            name="role"
                                            value={selectedRole}
                                            onChange={() => {}}
                                        />
                                        <Select
                                            value={
                                                selectedRole === ''
                                                    ? undefined
                                                    : selectedRole
                                            }
                                            onValueChange={handleRoleChange}
                                        >
                                            <SelectTrigger
                                                id="role"
                                                aria-invalid={Boolean(
                                                    errors.role,
                                                )}
                                                aria-required
                                                data-test="role-select-trigger"
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        modeLabels.permissionsPlaceholder ??
                                                        'Select a Role...'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRoles.map(
                                                    (roleName) => (
                                                        <SelectItem
                                                            key={roleName}
                                                            value={roleName}
                                                        >
                                                            {roleName}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <InputError message={errors.role} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-2">
                <Label className="xs-gray-700-weight-500" htmlFor="about_me">
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
        </>
    );
}
