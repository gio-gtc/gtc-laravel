import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthVideoLayout from '@/layouts/auth/auth-video-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { CheckIcon } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <AuthVideoLayout title="Log in to your account">
            <Head title="Log in" />

            {status && (
                <div className="mb-4 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors, clearErrors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="border-white/25 !text-white focus-visible:border-white/40 focus-visible:ring-white/20"
                                    onInput={() => clearErrors()}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm text-white/90 decoration-white/50 hover:text-white hover:decoration-white sm:ml-auto"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="border-white/25 !text-white focus-visible:border-white/40 focus-visible:ring-white/20"
                                    onInput={() => clearErrors()}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <label
                                htmlFor="remember"
                                className="relative flex w-full cursor-pointer items-center pr-8 text-sm text-white"
                            >
                                <input
                                    id="remember"
                                    type="checkbox"
                                    name="remember"
                                    tabIndex={3}
                                    className="peer sr-only"
                                />
                                <span className="flex-1">Remember me</span>
                                <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center text-white peer-checked:text-brand-gtc-red">
                                    <CheckIcon className="size-4" />
                                </span>
                            </label>

                            <Button
                                type="submit"
                                className="w-full bg-white text-black hover:bg-white/90"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                onClick={() => clearErrors()}
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-white/80">
                                Don't have an account?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className="text-white/90 decoration-white/50 hover:text-white hover:decoration-white"
                                >
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </AuthVideoLayout>
    );
}
