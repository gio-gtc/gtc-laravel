import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthVideoLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    videoSrc?: string;
    posterSrc?: string;
    /** Max width for the centered auth column (shell + inner cards). Defaults preserve legacy narrow login width. */
    contentMaxWidthClass?: string;
}

export default function AuthVideoLayout({
    children,
    title,
    description,
    videoSrc = '/videos/auth-login.mp4',
    posterSrc,
    contentMaxWidthClass,
}: PropsWithChildren<AuthVideoLayoutProps>) {
    const showHeader = Boolean(title ?? description);

    return (
        <div
            className={cn(
                'relative min-h-svh overflow-hidden',
                '[&_input]:selection:!bg-white [&_input]:selection:!text-black [&_textarea]:selection:!bg-white [&_textarea]:selection:!text-black',
            )}
        >
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

            <Link href={home()} className="absolute top-5 left-5 z-11">
                <AppLogoIcon className="w-[130px] fill-current text-white" />
            </Link>

            <div className="relative z-10 flex min-h-svh items-center justify-center p-6 pt-17 md:p-10 md:pt-17">
                <div
                    className={cn(
                        'flex w-full flex-col items-center justify-center',
                        contentMaxWidthClass ?? 'max-w-md',
                    )}
                >
                    {showHeader ? (
                        <div
                            className={cn(
                                'w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-8 text-white shadow-2xl backdrop-blur-sm',
                                contentMaxWidthClass ?? 'max-w-[350px]',
                            )}
                        >
                            <div className="space-y-2 text-center">
                                {title ? (
                                    <h1 className="text-xl font-semibold tracking-tight text-white">
                                        {title}
                                    </h1>
                                ) : null}

                                {description ? (
                                    <p className="text-sm text-white/80">
                                        {description}
                                    </p>
                                ) : null}
                            </div>
                            <div className="mt-6">{children}</div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'w-full text-white',
                                contentMaxWidthClass ?? 'max-w-[350px]',
                            )}
                        >
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
