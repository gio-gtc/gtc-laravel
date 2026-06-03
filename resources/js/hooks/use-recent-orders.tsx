import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gtc-recent-order-slideouts';
const MAX_RECENT = 5;

export type RecentOrderItem = {
    orderId: number;
    uuid: string;
    tourName: string;
    venueName: string;
};

function loadRecentOrders(): RecentOrderItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter(
                (item): item is RecentOrderItem =>
                    typeof item === 'object' &&
                    item !== null &&
                    typeof (item as RecentOrderItem).orderId === 'number' &&
                    typeof (item as RecentOrderItem).uuid === 'string' &&
                    typeof (item as RecentOrderItem).tourName === 'string' &&
                    typeof (item as RecentOrderItem).venueName === 'string',
            )
            .slice(0, MAX_RECENT);
    } catch {
        return [];
    }
}

function saveRecentOrders(items: RecentOrderItem[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Ignore storage errors
    }
}

type RecentOrdersContextValue = {
    recentOrders: RecentOrderItem[];
    addRecentOrder: (item: RecentOrderItem) => void;
};

const RecentOrdersContext = React.createContext<RecentOrdersContextValue | null>(
    null,
);

export function RecentOrdersProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [recentOrders, setRecentOrders] = useState<RecentOrderItem[]>(
        loadRecentOrders,
    );

    useEffect(() => {
        saveRecentOrders(recentOrders);
    }, [recentOrders]);

    const addRecentOrder = useCallback((item: RecentOrderItem) => {
        setRecentOrders((prev) => {
            const filtered = prev.filter((v) => v.orderId !== item.orderId);
            return [item, ...filtered].slice(0, MAX_RECENT);
        });
    }, []);

    const value = React.useMemo(
        () => ({ recentOrders, addRecentOrder }),
        [recentOrders, addRecentOrder],
    );

    return (
        <RecentOrdersContext.Provider value={value}>
            {children}
        </RecentOrdersContext.Provider>
    );
}

export function useRecentOrders() {
    const context = React.useContext(RecentOrdersContext);
    if (!context) {
        return {
            recentOrders: [] as RecentOrderItem[],
            addRecentOrder: () => {},
        };
    }
    return context;
}
