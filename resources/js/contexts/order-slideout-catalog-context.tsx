import {
    OrdersCatalogProvider,
    useOrdersCatalog,
} from '@/contexts/orders-catalog-context';
import { runSequentialOrderItemCreate } from '@/hooks/use-sequential-order-item-create';
import { mergeApiOrderUpdate } from '@/lib/orders/merge-api-order-update';
import {
    deleteOrderItem,
    fetchOrderCatalogMenu,
    OrderItemApiError,
} from '@/lib/orders/order-item-api-client';
import type {
    OrderItemCreateAdapter,
    SequentialCreateResult,
} from '@/lib/orders/order-item-adapters/types';
import { resolveMenuItemByCategoryId } from '@/lib/orders/order-catalog';
import { fetchOrderShow } from '@/lib/orders/orders-api-client';
import {
    apiOrderToLegacySlideout,
    mergeSlideoutVenueItems,
    replaceOrderItemInOrder,
    upsertOrderItem,
    venueRowToStoreItemPayload,
} from '@/lib/orders/slideout';
import type { OrderCatalogMenu } from '@/types/order-catalog';
import type { OrderItemsRow, SharedData } from '@/types';
import type { OrdersCatalogValue } from '@/types/inertia-pages';
import type { ApiOrder, OrderItem, OrderMenuCategoryId } from '@/types/orders-api';
import { router, usePage } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { toast } from 'react-toastify';

type TourOrdersInvalidator = (tourId: number) => void;

type OrderSlideoutCatalogContextValue = {
    openOrder: ApiOrder | null;
    setOpenOrder: (order: ApiOrder | null) => void;
    openOrderById: (orderId: number) => Promise<ApiOrder | null>;
    loadingOrderId: number | null;
    slideoutCatalog: OrdersCatalogValue;
    legacyTour: ReturnType<typeof apiOrderToLegacySlideout>['tour'] | null;
    legacyVenueItem:
        | ReturnType<typeof apiOrderToLegacySlideout>['venueItem']
        | null;
    legacyEventDates: string | undefined;
    updateOpenOrder: (order: ApiOrder) => void;
    refreshOpenOrder: (orderId: number) => Promise<ApiOrder | null>;
    submitOpenOrder: () => void;
    registerTourOrdersInvalidator: (fn: TourOrdersInvalidator) => void;
    orderCatalog: OrderCatalogMenu | null;
    orderCatalogLoading: boolean;
    getMenuItemForCategory: (
        categoryId: OrderMenuCategoryId,
    ) => ReturnType<typeof resolveMenuItemByCategoryId>;
    createOrderItemsFromForm: <TForm>(
        adapter: OrderItemCreateAdapter<TForm>,
        form: TForm,
    ) => Promise<SequentialCreateResult>;
    removeOrderItemFromCart: (orderItemId: number) => Promise<boolean>;
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
    const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
    const [ordersDetailCache, setOrdersDetailCache] = useState<
        Record<number, ApiOrder>
    >({});
    const [extraVenueItems, setExtraVenueItems] = useState<OrderItemsRow[]>([]);
    const [orderCatalog, setOrderCatalog] = useState<OrderCatalogMenu | null>(
        null,
    );
    const [orderCatalogLoading, setOrderCatalogLoading] = useState(true);
    const tourInvalidatorRef = useRef<TourOrdersInvalidator | null>(null);

    useEffect(() => {
        let cancelled = false;
        setOrderCatalogLoading(true);

        void fetchOrderCatalogMenu()
            .then((catalog) => {
                if (!cancelled) {
                    setOrderCatalog(catalog);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    toast.error('Could not load order catalog menu.');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setOrderCatalogLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const getMenuItemForCategory = useCallback(
        (categoryId: OrderMenuCategoryId) =>
            resolveMenuItemByCategoryId(orderCatalog, categoryId),
        [orderCatalog],
    );

    const registerTourOrdersInvalidator = useCallback(
        (fn: TourOrdersInvalidator) => {
            tourInvalidatorRef.current = fn;
        },
        [],
    );

    const refreshOpenOrder = useCallback(async (orderId: number) => {
        try {
            const order = await fetchOrderShow(orderId);
            setOrdersDetailCache((prev) => ({ ...prev, [orderId]: order }));
            setOpenOrder(order);
            tourInvalidatorRef.current?.(order.tour_id);
            return order;
        } catch {
            toast.error('Could not refresh order details.');
            return null;
        }
    }, []);

    const updateOpenOrder = useCallback(
        (order: ApiOrder) => {
            setOpenOrder((prev) => {
                const merged =
                    prev != null && prev.id === order.id
                        ? mergeApiOrderUpdate(prev, order)
                        : order;

                setOrdersDetailCache((cache) => ({
                    ...cache,
                    [merged.id]: merged,
                }));

                return merged;
            });
            tourInvalidatorRef.current?.(order.tour_id);
            void refreshOpenOrder(order.id);
        },
        [refreshOpenOrder],
    );

    const openOrderById = useCallback(
        async (orderId: number): Promise<ApiOrder | null> => {
            const cached = ordersDetailCache[orderId];
            if (cached) {
                setOpenOrder(cached);
                return cached;
            }

            setLoadingOrderId(orderId);
            setOpenOrder(null);

            try {
                const order = await fetchOrderShow(orderId);
                setOrdersDetailCache((prev) => ({ ...prev, [orderId]: order }));
                setOpenOrder(order);
                return order;
            } catch {
                toast.error('Could not load order details.');
                return null;
            } finally {
                setLoadingOrderId(null);
            }
        },
        [ordersDetailCache],
    );

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
        router.post(
            `/orders/${openOrder.id}/submit`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Order submitted.');
                    void refreshOpenOrder(openOrder.id);
                },
                onError: () => {
                    toast.error('Failed to submit order.');
                },
            },
        );
    }, [openOrder, refreshOpenOrder]);

    const replaceVenueItem = useCallback(
        (row: OrderItemsRow) => {
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
                            void refreshOpenOrder(openOrder.id);
                            return;
                        }
                        void refreshOpenOrder(openOrder.id);
                    },
                    onError: () => {
                        toast.error('Failed to add line item.');
                    },
                },
            );
        },
        [openOrder, refreshOpenOrder],
    );

    const createOrderItemsFromForm = useCallback(
        async <TForm,>(
            adapter: OrderItemCreateAdapter<TForm>,
            form: TForm,
        ): Promise<SequentialCreateResult> => {
            if (!openOrder) {
                toast.error('Open an order before adding line items.');
                return { succeeded: 0, failed: true };
            }

            const menuItem = getMenuItemForCategory(adapter.categoryId);
            if (!menuItem) {
                toast.error(
                    'Could not resolve order menu item for this category.',
                );
                return { succeeded: 0, failed: true };
            }

            const result = await runSequentialOrderItemCreate(
                adapter,
                form,
                menuItem.id,
                {
                    order: openOrder,
                    setOpenOrder,
                    setExtraVenueItems,
                },
                menuItem.tags,
            );

            if (result.failed) {
                if (result.errors) {
                    toast.error('Could not add one or more line items.');
                } else {
                    toast.error('Failed to add line item.');
                }
            } else if (result.succeeded > 0) {
                toast.success(
                    result.succeeded === 1
                        ? 'Line item added.'
                        : `${result.succeeded} line items added.`,
                );
                void refreshOpenOrder(openOrder.id);
            }

            return result;
        },
        [openOrder, getMenuItemForCategory, refreshOpenOrder],
    );

    const removeOrderItemFromCart = useCallback(
        async (orderItemId: number): Promise<boolean> => {
            if (!openOrder) {
                toast.error('Open an order before removing line items.');
                return false;
            }

            try {
                const updated = await deleteOrderItem(orderItemId);
                setOpenOrder((prev) =>
                    prev ? upsertOrderItem(prev, updated) : prev,
                );
                toast.success('Line item removed from cart.');
                void refreshOpenOrder(openOrder.id);
                return true;
            } catch (error) {
                toast.error(
                    error instanceof OrderItemApiError
                        ? error.message
                        : 'Failed to remove line item.',
                );
                return false;
            }
        },
        [openOrder, refreshOpenOrder],
    );

    const slideoutCatalog = useMemo((): OrdersCatalogValue => {
        if (!legacyPayload) {
            return {
                ...baseCatalog,
                replaceVenueItem,
                submitOpenOrder,
                orderCatalog,
                orderCatalogLoading,
                getMenuItemForCategory,
                createOrderItemsFromForm,
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
            orderCatalog,
            orderCatalogLoading,
            getMenuItemForCategory,
            createOrderItemsFromForm,
        };
    }, [
        baseCatalog,
        legacyPayload,
        extraVenueItems,
        replaceVenueItem,
        submitOpenOrder,
        openOrder?.id,
        orderCatalog,
        orderCatalogLoading,
        getMenuItemForCategory,
        createOrderItemsFromForm,
    ]);

    const value = useMemo(
        (): OrderSlideoutCatalogContextValue => ({
            openOrder,
            setOpenOrder,
            openOrderById,
            loadingOrderId,
            slideoutCatalog,
            legacyTour: legacyPayload?.tour ?? null,
            legacyVenueItem: legacyPayload?.venueItem ?? null,
            legacyEventDates: legacyPayload?.eventDates,
            updateOpenOrder,
            refreshOpenOrder,
            submitOpenOrder,
            registerTourOrdersInvalidator,
            orderCatalog,
            orderCatalogLoading,
            getMenuItemForCategory,
            createOrderItemsFromForm,
            removeOrderItemFromCart,
        }),
        [
            openOrder,
            openOrderById,
            loadingOrderId,
            slideoutCatalog,
            legacyPayload?.tour,
            legacyPayload?.venueItem,
            legacyPayload?.eventDates,
            updateOpenOrder,
            refreshOpenOrder,
            submitOpenOrder,
            registerTourOrdersInvalidator,
            orderCatalog,
            orderCatalogLoading,
            getMenuItemForCategory,
            createOrderItemsFromForm,
            removeOrderItemFromCart,
        ],
    );

    return (
        <OrderSlideoutCatalogContext.Provider value={value}>
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
