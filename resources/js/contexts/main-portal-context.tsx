import { createContext, useContext } from 'react';

const MainPortalContext = createContext<HTMLElement | null>(null);

export function useMainPortal(): HTMLElement | null {
    return useContext(MainPortalContext);
}

export { MainPortalContext };
