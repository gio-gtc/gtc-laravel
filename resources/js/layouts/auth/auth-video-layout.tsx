import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthVideoLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    videoSrc?: string;
    posterSrc?: string;
}

export default function AuthVideoLayout({
    children,
    title,
    description,
    videoSrc = '/videos/auth-login.mp4',
    posterSrc,
}: PropsWithChildren<AuthVideoLayoutProps>) {
    return (
        <div className="relative min-h-svh overflow-hidden">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
            >
                <video
                    className="h-full w-full object-cover motion-reduce:hidden"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster={posterSrc}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/65" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),rgba(0,0,0,0)_55%),linear-gradient(to_bottom,rgba(0,0,0,0.65),rgba(0,0,0,0.85))] opacity-0 motion-reduce:opacity-100" />
            </div>

            <div className="relative z-10 flex min-h-svh items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    <Link
                        href={home()}
                        className="mx-auto flex w-fit items-center gap-2 font-medium text-white"
                    >
                        <div className="flex h-9 w-9 items-center justify-center">
                            <AppLogoIcon className="size-9 fill-current text-white" />
                        </div>
                    </Link>

                    <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-sm">
                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-semibold tracking-tight">
                                {title}
                            </h1>

                            <p className="text-sm text-white/80">
                                {description}
                            </p>
                        </div>
                        <div className="mt-6">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
