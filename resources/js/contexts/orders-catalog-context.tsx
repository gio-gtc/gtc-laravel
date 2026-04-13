import { type OrdersCatalogValue } from '@/types/inertia-pages';
import { createContext, useContext, type ReactNode } from 'react';

const OrdersCatalogContext = createContext<OrdersCatalogValue | null>(null);

export function OrdersCatalogProvider({
    value,
    children,
}: {
    value: OrdersCatalogValue;
    children: ReactNode;
}) {
    return (
        <OrdersCatalogContext.Provider value={value}>
            {children}
        </OrdersCatalogContext.Provider>
    );
}

export function useOrdersCatalog(): OrdersCatalogValue {
    const ctx = useContext(OrdersCatalogContext);
    if (!ctx) {
        throw new Error(
            'useOrdersCatalog must be used within OrdersCatalogProvider',
        );
    }
    return ctx;
}
