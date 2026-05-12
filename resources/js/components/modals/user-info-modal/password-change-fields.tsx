import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field-label';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { router } from '@inertiajs/react';
import {
    useCallback,
    useRef,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
} from 'react';

type PasswordChangeErrors = Partial<
    Record<'current_password' | 'password' | 'password_confirmation', string>
>;

export function UserInfoPasswordChangeFields() {
    const [enabled, setEnabled] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<PasswordChangeErrors>({});
    const [processing, setProcessing] = useState(false);

    const currentPasswordRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const resetFields = useCallback(() => {
        setCurrentPassword('');
        setPassword('');
        setPasswordConfirmation('');
        setErrors({});
    }, []);

    const collapse = useCallback(() => {
        resetFields();
        setEnabled(false);
    }, [resetFields]);

    const handleSubmit = useCallback(() => {
        setProcessing(true);
        router.put(
            PasswordController.update().url,
            {
                current_password: currentPassword,
                password,
                password_confirmation: passwordConfirmation,
            },
            {
                preserveScroll: true,
                preserveState: true,
                // Scope errors so they don't collide with the profile form.
                errorBag: 'changePassword',
                onSuccess: () => {
                    resetFields();
                    setEnabled(false);
                    // Success flash toast is surfaced by app-layout's global
                    // flash listener; no need to toast here.
                },
                onError: (errs) => {
                    setErrors(errs as PasswordChangeErrors);
                    if (errs.password) {
                        passwordRef.current?.focus();
                    } else if (errs.current_password) {
                        currentPasswordRef.current?.focus();
                    }
                },
                onFinish: () => setProcessing(false),
            },
        );
    }, [currentPassword, password, passwordConfirmation, resetFields]);

    const allFilled =
        currentPassword.length > 0 &&
        password.length > 0 &&
        passwordConfirmation.length > 0;

    const clearError = useCallback((field: keyof PasswordChangeErrors) => {
        setErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    // Hijack Enter inside any password input so it submits *this* form
    const handleEnterSubmit = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== 'Enter' || e.shiftKey) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (processing || !allFilled) {
                return;
            }
            handleSubmit();
        },
        [allFilled, handleSubmit, processing],
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    id="change_password_toggle"
                    onClick={() => {
                        setEnabled((v) => {
                            const next = !v;
                            if (!next) {
                                resetFields();
                            }
                            return next;
                        });
                    }}
                    className={[
                        'relative inline-flex h-4 w-8 items-center rounded-full transition-colors',
                        enabled ? 'bg-brand-gtc-red' : 'bg-muted',
                        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                    ].join(' ')}
                >
                    <span
                        className={[
                            'inline-block h-3 w-3 transform rounded-full bg-background shadow-lg transition-transform',
                            enabled ? 'translate-x-4.5' : 'translate-x-1',
                        ].join(' ')}
                    />
                </button>
                <Label
                    htmlFor="change_password_toggle"
                    className="sm-gray-700-weight-500 cursor-pointer"
                >
                    Change Password
                </Label>
            </div>

            {enabled && (
                <div className="space-y-3">
                    <div className="grid w-full gap-2 md:w-1/2">
                        <FieldLabel
                            className="xs-gray-700-weight-500"
                            htmlFor="current_password"
                            required
                        >
                            Current Password
                        </FieldLabel>
                        <PasswordInput
                            id="current_password"
                            ref={currentPasswordRef}
                            value={currentPassword}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setCurrentPassword(e.target.value);
                                clearError('current_password');
                            }}
                            onKeyDown={handleEnterSubmit}
                            autoComplete="current-password"
                            placeholder="Current password"
                            aria-invalid={Boolean(errors.current_password)}
                        />
                        <InputError message={errors.current_password} />
                    </div>

                    <div className="grid w-full gap-2 md:w-1/2">
                        <FieldLabel
                            className="xs-gray-700-weight-500"
                            htmlFor="password"
                            required
                        >
                            New Password
                        </FieldLabel>
                        <PasswordInput
                            id="password"
                            ref={passwordRef}
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setPassword(e.target.value);
                                clearError('password');
                            }}
                            onKeyDown={handleEnterSubmit}
                            autoComplete="new-password"
                            placeholder="New password"
                            aria-invalid={Boolean(errors.password)}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid w-full gap-2 md:w-1/2">
                        <FieldLabel
                            className="xs-gray-700-weight-500"
                            htmlFor="password_confirmation"
                            required
                        >
                            Confirm New Password
                        </FieldLabel>
                        <PasswordInput
                            id="password_confirmation"
                            value={passwordConfirmation}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setPasswordConfirmation(e.target.value);
                                clearError('password_confirmation');
                            }}
                            onKeyDown={handleEnterSubmit}
                            autoComplete="new-password"
                            placeholder="Confirm new password"
                            aria-invalid={Boolean(errors.password_confirmation)}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={collapse}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing || !allFilled}
                        >
                            Update Password
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
