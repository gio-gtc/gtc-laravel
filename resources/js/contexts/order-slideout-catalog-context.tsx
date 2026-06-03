import {
    OrdersCatalogProvider,
    useOrdersCatalog,
} from '@/contexts/orders-catalog-context';
import {
    apiOrderToLegacySlideout,
    mergeSlideoutVenueItems,
    replaceOrderItemInOrder,
    upsertOrderItem,
    venueRowToStoreItemPayload,
} from '@/lib/orders/slideout';
import type { VenueItemsRow } from '@/types';
import type { OrdersCatalogValue } from '@/types/inertia-pages';
import type { SharedData } from '@/types';
import type { ApiOrder, OrderItem } from '@/types/orders-api';
import { router, usePage } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { toast } from 'react-toastify';

type OrderSlideoutCatalogContextValue = {
    openOrder: ApiOrder | null;
    setOpenOrder: (order: ApiOrder | null) => void;
    slideoutCatalog: OrdersCatalogValue;
    legacyTour: ReturnType<typeof apiOrderToLegacySlideout>['tour'] | null;
    legacyVenueItem: ReturnType<
        typeof apiOrderToLegacySlideout
    >['venueItem'] | null;
    legacyEventDates: string | undefined;
    submitOpenOrder: () => void;
};

const OrderSlideoutCatalogContext =
    createContext<OrderSlideoutCatalogContextValue | null>(null);

export function OrderSlideoutCatalogProvider({
    children,
}: {
    children: ReactNode;
}) {
    const baseCatalog = useOrdersCatalog();
    const page = usePage<SharedData>();
    const [openOrder, setOpenOrder] = useState<ApiOrder | null>(null);
    const [extraVenueItems, setExtraVenueItems] = useState<VenueItemsRow[]>([]);

    useEffect(() => {
        const created = (
            page.props as { flash?: { created_order_item?: OrderItem } }
        ).flash?.created_order_item;
        if (!created || !openOrder || openOrder.id !== created.order_id) {
            return;
        }
        setOpenOrder((prev) => (prev ? upsertOrderItem(prev, created) : prev));
    }, [page.props, openOrder?.id]);

    const legacyPayload = useMemo(() => {
        if (!openOrder) {
            return null;
        }
        return apiOrderToLegacySlideout(openOrder);
    }, [openOrder]);

    const submitOpenOrder = useCallback(() => {
        if (!openOrder) {
            return;
        }
        router.post(`/orders/${openOrder.id}/submit`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Order submitted.');
                router.reload({
                    only: ['orders', 'grouped_orders'],
                });
            },
            onError: () => {
                toast.error('Failed to submit order.');
            },
        });
    }, [openOrder]);

    const replaceVenueItem = useCallback(
        (row: VenueItemsRow) => {
            if (!openOrder) {
                return;
            }

            const existingItem = (openOrder.order_items ?? []).find(
                (i) => String(i.id) === String(row.id),
            );

            if (existingItem) {
                toast.info(
                    'Saving line item changes via the API is not available yet.',
                );
                setOpenOrder((prev) =>
                    prev ? replaceOrderItemInOrder(prev, row) : prev,
                );
                return;
            }

            const payload = venueRowToStoreItemPayload(row, openOrder);
            if (!payload) {
                toast.error(
                    'Could not map this line to an order menu item. Choose a line type supported by the API.',
                );
                return;
            }

            router.post(
                `/orders/${openOrder.id}/items`,
                {
                    order_menu_item_id: payload.order_menu_item_id,
                    due_date: payload.due_date,
                    specifications: payload.specifications as Record<
                        string,
                        string | number | boolean | null
                    >,
                    ...(payload.assignee_ids
                        ? { assignee_ids: payload.assignee_ids }
                        : {}),
                },
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        const props = page.props as {
                            flash?: { created_order_item?: OrderItem };
                        };
                        const created = props.flash?.created_order_item;
                        if (created) {
                            setOpenOrder((prev) =>
                                prev ? upsertOrderItem(prev, created) : prev,
                            );
                            setExtraVenueItems((prev) =>
                                prev.filter(
                                    (r) => String(r.id) !== String(row.id),
                                ),
                            );
                            toast.success('Line item added.');
                            return;
                        }
                        router.reload({
                            only: ['orders', 'grouped_orders'],
                        });
                    },
                    onError: () => {
                        toast.error('Failed to add line item.');
                    },
                },
            );
        },
        [openOrder],
    );

    const slideoutCatalog = useMemo((): OrdersCatalogValue => {
        if (!legacyPayload) {
            return {
                ...baseCatalog,
                replaceVenueItem,
                submitOpenOrder,
            };
        }

        const apiItems = [
            ...(legacyPayload.catalogExtensions.venue_items ?? []),
            ...extraVenueItems,
        ];

        return {
            ...baseCatalog,
            venue_items: mergeSlideoutVenueItems(
                apiItems,
                baseCatalog.venue_items,
            ),
            venue_item_assigned: [
                ...(legacyPayload.catalogExtensions.venue_item_assigned ?? []),
                ...(baseCatalog.venue_item_assigned ?? []),
            ],
            replaceVenueItem,
            submitOpenOrder,
            slideoutApiOrderId: openOrder?.id,
        };
    }, [
        baseCatalog,
        legacyPayload,
        extraVenueItems,
        replaceVenueItem,
        submitOpenOrder,
        openOrder?.id,
    ]);

    const value = useMemo(
        (): OrderSlideoutCatalogContextValue => ({
            openOrder,
            setOpenOrder,
            slideoutCatalog,
            legacyTour: legacyPayload?.tour ?? null,
            legacyVenueItem: legacyPayload?.venueItem ?? null,
            legacyEventDates: legacyPayload?.eventDates,
            submitOpenOrder,
        }),
        [
            openOrder,
            slideoutCatalog,
            legacyPayload?.tour,
            legacyPayload?.venueItem,
            legacyPayload?.eventDates,
            submitOpenOrder,
        ],
    );

    return (
        <OrderSlideoutCatalogContext.Provider value={value}>
            {/* Nested provider merges API-derived venue_items when a slideout is open. */}
            <OrdersCatalogProvider value={slideoutCatalog}>
                {children}
            </OrdersCatalogProvider>
        </OrderSlideoutCatalogContext.Provider>
    );
}

export function useOrderSlideoutCatalog(): OrderSlideoutCatalogContextValue {
    const ctx = useContext(OrderSlideoutCatalogContext);
    if (!ctx) {
        throw new Error(
            'useOrderSlideoutCatalog must be used within OrderSlideoutCatalogProvider',
        );
    }
    return ctx;
}
