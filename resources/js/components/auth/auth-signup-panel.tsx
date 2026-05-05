import {
    authFlipInputClass,
    authFlipLinkButtonClass,
} from '@/components/auth/auth-flip-classes';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import type { RefObject } from 'react';
import { flushSync } from 'react-dom';
import { toast } from 'react-toastify';

export interface AuthSignupPanelProps {
    firstNameInputRef: RefObject<HTMLInputElement | null>;
    onRequestLogin: () => void;
}

export default function AuthSignupPanel({
    firstNameInputRef,
    onRequestLogin,
}: AuthSignupPanelProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        job_title: '',
        phone: '',
        details: '',
    });

    return (
        <>
            <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                    Request Access
                </h2>
            </div>

            <div className="mt-6">
                <form
                    className="flex flex-col gap-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!e.currentTarget.reportValidity()) {
                            return;
                        }

                        clearErrors();

                        const trimmed = {
                            first_name: data.first_name.trim(),
                            last_name: data.last_name.trim(),
                            email: data.email.trim(),
                            company: data.company.trim(),
                            job_title: data.job_title.trim(),
                            phone: data.phone.trim(),
                            details: data.details.trim(),
                        };

                        const requiredErrors: Partial<
                            Record<keyof typeof trimmed, string>
                        > = {};
                        if (!trimmed.first_name) {
                            requiredErrors.first_name =
                                'The first name field is required.';
                        }
                        if (!trimmed.last_name) {
                            requiredErrors.last_name =
                                'The last name field is required.';
                        }
                        if (!trimmed.email) {
                            requiredErrors.email =
                                'The email field is required.';
                        }
                        if (!trimmed.company) {
                            requiredErrors.company =
                                'The company field is required.';
                        }
                        if (!trimmed.job_title) {
                            requiredErrors.job_title =
                                'The job title field is required.';
                        }
                        if (!trimmed.phone) {
                            requiredErrors.phone =
                                'The phone field is required.';
                        }
                        if (!trimmed.details) {
                            requiredErrors.details =
                                'The details field is required.';
                        }

                        if (Object.keys(requiredErrors).length > 0) {
                            setError(requiredErrors);
                            return;
                        }

                        flushSync(() => {
                            setData(trimmed);
                        });

                        post('/request-access', {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(
                                    'Your request has been sent. Our team will reach out soon!',
                                );
                                reset();
                                onRequestLogin();
                            },
                        });
                    }}
                >
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <FieldLabel htmlFor="signup-first_name" required>
                                First Name
                            </FieldLabel>
                            <Input
                                ref={firstNameInputRef}
                                id="signup-first_name"
                                type="text"
                                required
                                tabIndex={1}
                                autoComplete="given-name"
                                value={data.first_name}
                                placeholder="First name"
                                className={authFlipInputClass}
                                onChange={(e) =>
                                    setData('first_name', e.target.value)
                                }
                                onInput={() => clearErrors('first_name')}
                            />
                            <InputError
                                message={errors.first_name}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2">
                            <FieldLabel htmlFor="signup-last_name" required>
                                Last Name
                            </FieldLabel>
                            <Input
                                id="signup-last_name"
                                type="text"
                                required
                                tabIndex={2}
                                autoComplete="family-name"
                                value={data.last_name}
                                placeholder="Last name"
                                className={authFlipInputClass}
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                                onInput={() => clearErrors('last_name')}
                            />
                            <InputError
                                message={errors.last_name}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2">
                            <FieldLabel htmlFor="signup-email" required>
                                Email Address
                            </FieldLabel>
                            <Input
                                id="signup-email"
                                type="email"
                                required
                                tabIndex={3}
                                autoComplete="email"
                                value={data.email}
                                placeholder="email@example.com"
                                className={authFlipInputClass}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                onInput={() => clearErrors('email')}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <FieldLabel htmlFor="signup-company" required>
                                Company
                            </FieldLabel>
                            <Input
                                id="signup-company"
                                type="text"
                                required
                                tabIndex={4}
                                autoComplete="organization"
                                value={data.company}
                                placeholder="Company name"
                                className={authFlipInputClass}
                                onChange={(e) =>
                                    setData('company', e.target.value)
                                }
                                onInput={() => clearErrors('company')}
                            />
                            <InputError message={errors.company} />
                        </div>

                        <div className="grid gap-2">
                            <FieldLabel htmlFor="signup-job_title" required>
                                Job Title
                            </FieldLabel>
                            <Input
                                id="signup-job_title"
                                type="text"
                                required
                                tabIndex={5}
                                autoComplete="organization-title"
                                value={data.job_title}
                                placeholder="Job title"
                                className={authFlipInputClass}
                                onChange={(e) =>
                                    setData('job_title', e.target.value)
                                }
                                onInput={() => clearErrors('job_title')}
                            />
                            <InputError message={errors.job_title} />
                        </div>

                        <div className="grid gap-2">
                            <FieldLabel htmlFor="signup-phone" required>
                                Phone Number
                            </FieldLabel>
                            <Input
                                id="signup-phone"
                                type="text"
                                required
                                tabIndex={6}
                                autoComplete="tel"
                                value={data.phone}
                                placeholder="Phone number"
                                className={authFlipInputClass}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                onInput={() => clearErrors('phone')}
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <FieldLabel htmlFor="signup-details" required>
                                Details
                            </FieldLabel>
                            <Textarea
                                id="signup-details"
                                required
                                tabIndex={7}
                                rows={4}
                                value={data.details}
                                placeholder="Please briefly explain how you will use this access and why it's required for your role."
                                className={authFlipInputClass}
                                onChange={(e) =>
                                    setData('details', e.target.value)
                                }
                                onInput={() => clearErrors('details')}
                            />
                            <InputError message={errors.details} />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 inline-flex w-full items-center justify-center gap-2"
                            tabIndex={8}
                            disabled={processing}
                            data-test="request-access-button"
                        >
                            {processing && <Spinner />}
                            Submit Request
                        </Button>
                    </div>

                    <div className="text-center text-sm text-white/80">
                        Already have an account?{' '}
                        <button
                            type="button"
                            className={authFlipLinkButtonClass}
                            tabIndex={9}
                            onClick={onRequestLogin}
                        >
                            Log in
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
