import {
    authFlipInputClass,
    authFlipLinkButtonClass,
    authFlipLoginCardClass,
} from '@/components/auth/auth-flip-classes';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import AuthVideoLayout from '@/layouts/auth/auth-video-layout';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    const readOnlyEmailClass = cn(
        authFlipInputClass,
        'cursor-not-allowed bg-white/5 opacity-80',
    );

    return (
        <AuthVideoLayout>
            <Head title="Reset Password" />

            <div className={authFlipLoginCardClass}>
                <div className="space-y-2 text-center">
                    <h1 className="text-xl font-semibold tracking-tight text-white">
                        Reset password
                    </h1>
                    <p className="text-sm text-white/80">
                        Enter and confirm your new password below.
                    </p>
                </div>

                <div className="mt-6">
                    <form onSubmit={submit} className="flex flex-col gap-6">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="reset-email">
                                    Email address
                                </Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    readOnly
                                    tabIndex={-1}
                                    autoComplete="email"
                                    className={readOnlyEmailClass}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reset-password">
                                    New password
                                </Label>
                                <PasswordInput
                                    id="reset-password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                    autoFocus
                                    autoComplete="new-password"
                                    placeholder="New password"
                                    className={authFlipInputClass}
                                    toggleButtonClassName="text-white/70 hover:bg-white/10 hover:text-white"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reset-password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="reset-password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                    className={authFlipInputClass}
                                    toggleButtonClassName="text-white/70 hover:bg-white/10 hover:text-white"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Reset password
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="mt-3 text-center text-sm">
                    <Link href="/login" className={authFlipLinkButtonClass}>
                        Back to log in
                    </Link>
                </div>
            </div>
        </AuthVideoLayout>
    );
}
