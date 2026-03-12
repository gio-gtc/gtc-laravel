import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gtc-recent-venue-slideouts';
const MAX_RECENT = 5;

export type RecentVenueItem = {
    tourVenueId: number;
    tourName: string;
    venueName: string;
};

function loadRecentVenues(): RecentVenueItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter(
                (item): item is RecentVenueItem =>
                    typeof item === 'object' &&
                    item !== null &&
                    typeof (item as RecentVenueItem).tourVenueId === 'number' &&
                    typeof (item as RecentVenueItem).tourName === 'string' &&
                    typeof (item as RecentVenueItem).venueName === 'string',
            )
            .slice(0, MAX_RECENT);
    } catch {
        return [];
    }
}

function saveRecentVenues(items: RecentVenueItem[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Ignore storage errors
    }
}

type RecentVenuesContextValue = {
    recentVenues: RecentVenueItem[];
    addRecentVenue: (item: RecentVenueItem) => void;
};

const RecentVenuesContext = React.createContext<RecentVenuesContextValue | null>(
    null,
);

export function RecentVenuesProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [recentVenues, setRecentVenues] = useState<RecentVenueItem[]>(
        loadRecentVenues,
    );

    useEffect(() => {
        saveRecentVenues(recentVenues);
    }, [recentVenues]);

    const addRecentVenue = useCallback((item: RecentVenueItem) => {
        setRecentVenues((prev) => {
            const filtered = prev.filter(
                (v) => v.tourVenueId !== item.tourVenueId,
            );
            return [item, ...filtered].slice(0, MAX_RECENT);
        });
    }, []);

    const value = React.useMemo(
        () => ({ recentVenues, addRecentVenue }),
        [recentVenues, addRecentVenue],
    );

    return (
        <RecentVenuesContext.Provider value={value}>
            {children}
        </RecentVenuesContext.Provider>
    );
}

export function useRecentVenues() {
    const context = React.useContext(RecentVenuesContext);
    if (!context) {
        return {
            recentVenues: [] as RecentVenueItem[],
            addRecentVenue: () => {},
        };
    }
    return context;
}
