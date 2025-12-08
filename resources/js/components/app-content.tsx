import * as React from 'react';
import { AppSidebar } from './app-sidebar';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ children, ...props }: AppContentProps) {
    return (
        <div className="flex h-full min-h-screen">
            <AppSidebar />
            <main
                className="mx-auto flex h-full min-h-screen w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl"
                {...props}
            >
                {children}
            </main>
        </div>
    );
}
