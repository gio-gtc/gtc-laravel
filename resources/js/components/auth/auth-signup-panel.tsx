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
import { Form } from '@inertiajs/react';
import type { RefObject } from 'react';

export interface AuthSignupPanelProps {
    firstNameInputRef: RefObject<HTMLInputElement | null>;
    onRequestLogin: () => void;
}

export default function AuthSignupPanel({
    firstNameInputRef,
    onRequestLogin,
}: AuthSignupPanelProps) {
    return (
        <>
            <div className="space-y-2 text-center">
                <h1 className="text-xl font-semibold tracking-tight text-white">
                    Create an account
                </h1>
                <p className="text-sm text-white/80">
                    Enter your details below to create your account
                </p>
            </div>

            <div className="mt-6">
                <Form
                    action="/register"
                    method="post"
                    resetOnSuccess={['password', 'password_confirmation']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors, clearErrors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-first_name">
                                        First Name
                                    </Label>
                                    <Input
                                        ref={firstNameInputRef}
                                        id="signup-first_name"
                                        type="text"
                                        required
                                        tabIndex={1}
                                        autoComplete="given-name"
                                        name="first_name"
                                        placeholder="First name"
                                        className={authFlipInputClass}
                                        onInput={() => clearErrors()}
                                    />
                                    <InputError
                                        message={errors.first_name}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="signup-last_name">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="signup-last_name"
                                        type="text"
                                        required
                                        tabIndex={2}
                                        autoComplete="family-name"
                                        name="last_name"
                                        placeholder="Last name"
                                        className={authFlipInputClass}
                                        onInput={() => clearErrors()}
                                    />
                                    <InputError
                                        message={errors.last_name}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="signup-email">
                                        Email address
                                    </Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        required
                                        tabIndex={3}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="email@example.com"
                                        className={authFlipInputClass}
                                        onInput={() => clearErrors()}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="signup-password">
                                        Password
                                    </Label>
                                    <PasswordInput
                                        id="signup-password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                        className={authFlipInputClass}
                                        toggleButtonClassName="text-white/70 hover:bg-white/10 hover:text-white"
                                        onInput={() => clearErrors()}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="signup-password_confirmation">
                                        Confirm password
                                    </Label>
                                    <PasswordInput
                                        id="signup-password_confirmation"
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm password"
                                        className={authFlipInputClass}
                                        toggleButtonClassName="text-white/70 hover:bg-white/10 hover:text-white"
                                        onInput={() => clearErrors()}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full bg-white text-black hover:bg-white/90"
                                    tabIndex={6}
                                    disabled={processing}
                                    data-test="register-user-button"
                                    onClick={() => clearErrors()}
                                >
                                    {processing && <Spinner />}
                                    Create account
                                </Button>
                            </div>

                            <div className="text-center text-sm text-white/80">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    className={authFlipLinkButtonClass}
                                    tabIndex={7}
                                    onClick={onRequestLogin}
                                >
                                    Log in
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
