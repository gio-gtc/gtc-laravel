import {
    authFlipInputClass,
    authFlipLinkButtonClass,
} from '@/components/auth/auth-flip-classes';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Form } from '@inertiajs/react';
import { CheckIcon } from 'lucide-react';
import type { RefObject } from 'react';

export interface AuthLoginPanelProps {
    emailInputRef: RefObject<HTMLInputElement | null>;
    onOpenForgotPassword: () => void;
    onRequestSignup: () => void;
}

export default function AuthLoginPanel({
    emailInputRef,
    onOpenForgotPassword,
    onRequestSignup,
}: AuthLoginPanelProps) {
    return (
        <>
            <div className="space-y-2 text-center">
                <h1 className="text-xl font-semibold tracking-tight text-white">
                    Log in to your account
                </h1>
            </div>

            <div className="mt-6">
                <Form
                    action="/login"
                    method="post"
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors, clearErrors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="login-email">
                                        Email address
                                    </Label>
                                    <Input
                                        ref={emailInputRef}
                                        id="login-email"
                                        type="email"
                                        name="email"
                                        required
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className={authFlipInputClass}
                                        onInput={() => clearErrors()}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex flex-col justify-between gap-1 xs:flex-row xs:items-center">
                                        <Label htmlFor="login-password">
                                            Password
                                        </Label>
                                        <button
                                            type="button"
                                            className={cn(
                                                authFlipLinkButtonClass,
                                            )}
                                            tabIndex={2}
                                            onClick={onOpenForgotPassword}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <PasswordInput
                                        id="login-password"
                                        name="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        className={authFlipInputClass}
                                        toggleButtonClassName="text-white/70 hover:bg-white/10 hover:text-white"
                                        onInput={() => clearErrors()}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <label
                                    htmlFor="login-remember"
                                    className="relative flex w-full cursor-pointer items-center pr-8 text-sm text-white"
                                >
                                    <input
                                        id="login-remember"
                                        type="checkbox"
                                        name="remember"
                                        tabIndex={4}
                                        className="peer sr-only"
                                    />
                                    <span className="flex-1">Remember me</span>
                                    <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center text-white peer-checked:text-brand-gtc-red">
                                        <CheckIcon className="size-4" />
                                    </span>
                                </label>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    tabIndex={5}
                                    disabled={processing}
                                    data-test="login-button"
                                    onClick={() => clearErrors()}
                                >
                                    {processing && <Spinner />}
                                    Log in
                                </Button>
                            </div>

                            <div className="text-center text-sm text-white/80">
                                Need access?{' '}
                                <button
                                    type="button"
                                    className={authFlipLinkButtonClass}
                                    tabIndex={6}
                                    onClick={onRequestSignup}
                                >
                                    Request access
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
