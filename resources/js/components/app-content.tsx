import { MainPortalContext } from '@/contexts/main-portal-context';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import { useCallback, useState } from 'react';
import { AppSidebar } from './app-sidebar';

interface AppContentProps extends ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({
    children,
    className,
    ...props
}: AppContentProps) {
    const [mainNode, setMainNode] = useState<HTMLElement | null>(null);
    const setMainRef = useCallback((node: HTMLElement | null) => {
        setMainNode(node);
    }, []);

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
            <main
                ref={setMainRef}
                className={cn(
                    'relative mx-auto flex min-h-screen min-w-0 w-full flex-1 flex-col gap-4 rounded-xl px-3 py-2 sm:px-6.5 sm:py-7',
                    className,
                )}
                {...props}
            >
                <MainPortalContext.Provider value={mainNode}>
                    {children}
                </MainPortalContext.Provider>
            </main>
        </div>
    );
}
