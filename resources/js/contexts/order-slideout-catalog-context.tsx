import {
    OrdersCatalogProvider,
    useOrdersCatalog,
} from '@/contexts/orders-catalog-context';
import { runSequentialOrderItemCreate } from '@/hooks/use-sequential-order-item-create';
import type { OrderItemBulkPatch } from '@/lib/orders/order-item-adapters/types';
import {
    commitOrderItemBulkWrite as runCommitOrderItemBulkWrite,
    commitOrderItemSingleWrite as runCommitOrderItemSingleWrite,
} from '@/lib/orders/order-item-commit-write';
import type {
    CommitOrderItemBulkWriteResult,
    CommitOrderItemSingleWriteResult,
} from '@/lib/orders/order-item-commit-write';
import { mergeApiOrderUpdate } from '@/lib/orders/merge-api-order-update';
import { applyParentOrderUpdate } from '@/lib/orders/apply-parent-order-update';
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
import { fetchOrderShow, submitOrder, clearOrderCart } from '@/lib/orders/orders-api-client';
import {
    apiOrderToLegacySlideout,
    mergeSlideoutVenueItems,
    removeOrderItemFromOrder,
    replaceOrderItemInOrder,
    upsertOrderItem,
    venueRowToStoreItemPayload,
} from '@/lib/orders/slideout';
import { mergeApiAndExtraVenueItems } from '@/lib/orders/slideout/merge-api-and-extra-venue-items';
import { billingInvoicesForDisplay, upsertInvoicesById } from '@/lib/orders/invoice-ledger';
import { patchOrderItemsBulkInOrder } from '@/lib/orders/slideout/order-mutations';
import type { OrderCatalogMenu } from '@/types/order-catalog';
import type { OrderItemsRow, SharedData } from '@/types';
import type { OrdersCatalogValue } from '@/types/inertia-pages';
import type {
    ApiOrder,
    OrderItem,
    OrderMenuCategoryId,
    ParentOrderUpdate,
    SubmitInvoice,
    SubmitOrderResponse,
    ClearOrderCartResponse,
} from '@/types/orders-api';
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
    type SetStateAction,
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
    applyParentOrderBadgeUpdate: (
        patch: ParentOrderUpdate | undefined,
    ) => void;
    refreshOpenOrder: (orderId: number) => Promise<ApiOrder | null>;
    submitOpenOrder: () => Promise<SubmitOrderResponse>;
    clearOpenOrderCart: () => Promise<ClearOrderCartResponse>;
    orderInvoicesForOpenOrder: SubmitInvoice[];
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
    commitOrderItemBulkWrite: (
        orderItemIds: number[],
        patch: OrderItemBulkPatch,
        successMessage?: string,
    ) => Promise<CommitOrderItemBulkWriteResult>;
    commitOrderItemSingleWrite: (
        orderItemId: number,
        patch: OrderItemBulkPatch,
        successMessage?: string,
    ) => Promise<CommitOrderItemSingleWriteResult>;
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
    const openOrderFetchAbortRef = useRef<AbortController | null>(null);
    const openOrderFetchIdRef = useRef(0);

    const syncOpenOrder = useCallback(
        (update: SetStateAction<ApiOrder | null>) => {
            setOpenOrder((prev) => {
                const next =
                    typeof update === 'function' ? update(prev) : update;
                if (next) {
                    setOrdersDetailCache((cache) => ({
                        ...cache,
                        [next.id]: next,
                    }));
                }
                return next;
            });
        },
        [],
    );

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

    const applyParentOrderBadgeUpdate = useCallback(
        (patch: ParentOrderUpdate | undefined) => {
            if (!patch) {
                return;
            }

            setOpenOrder((prev) => {
                if (!prev || prev.id !== patch.id) {
                    return prev;
                }

                const merged = applyParentOrderUpdate(prev, patch);
                setOrdersDetailCache((cache) => ({
                    ...cache,
                    [merged.id]: merged,
                }));
                tourInvalidatorRef.current?.(merged.tour_id);

                return merged;
            });
        },
        [],
    );

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

            openOrderFetchAbortRef.current?.abort();
            const controller = new AbortController();
            openOrderFetchAbortRef.current = controller;
            const fetchId = ++openOrderFetchIdRef.current;

            setLoadingOrderId(orderId);
            setOpenOrder(null);

            try {
                const order = await fetchOrderShow(orderId, controller.signal);
                if (fetchId !== openOrderFetchIdRef.current) {
                    return null;
                }
                setOrdersDetailCache((prev) => ({ ...prev, [orderId]: order }));
                setOpenOrder(order);
                return order;
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return null;
                }
                if (fetchId !== openOrderFetchIdRef.current) {
                    return null;
                }
                toast.error('Could not load order details.');
                return null;
            } finally {
                if (fetchId === openOrderFetchIdRef.current) {
                    setLoadingOrderId(null);
                }
                if (openOrderFetchAbortRef.current === controller) {
                    openOrderFetchAbortRef.current = null;
                }
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

    const submitOpenOrder = useCallback(async () => {
        if (!openOrder) {
            throw new Error('No order is open.');
        }

        const response = await submitOrder(openOrder.id);

        setOpenOrder((prev) => {
            const base = prev
                ? mergeApiOrderUpdate(prev, response.order)
                : response.order;

            return {
                ...base,
                invoices: upsertInvoicesById(base.invoices ?? [], [
                    response.invoice,
                ]),
            };
        });

        return response;
    }, [openOrder]);

    const clearOpenOrderCart = useCallback(async () => {
        if (!openOrder) {
            throw new Error('No order is open.');
        }

        const orderId = openOrder.id;
        const tourId = openOrder.tour_id;
        const response = await clearOrderCart(orderId);

        if (response.order_deleted) {
            setOpenOrder(null);
            setOrdersDetailCache((prev) => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });
            tourInvalidatorRef.current?.(tourId);
        } else {
            void refreshOpenOrder(orderId);
        }

        return response;
    }, [openOrder, refreshOpenOrder]);

    const orderInvoicesForOpenOrder = useMemo((): SubmitInvoice[] => {
        return billingInvoicesForDisplay(openOrder);
    }, [openOrder]);

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
                    setOpenOrder: syncOpenOrder,
                    setExtraVenueItems,
                    applyParentOrderBadgeUpdate,
                    refreshOpenOrder,
                },
                menuItem.tags,
                menuItem,
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
            }

            return result;
        },
        [openOrder, getMenuItemForCategory, applyParentOrderBadgeUpdate, refreshOpenOrder, syncOpenOrder],
    );

    const removeOrderItemFromCart = useCallback(
        async (orderItemId: number): Promise<boolean> => {
            if (!openOrder) {
                toast.error('Open an order before removing line items.');
                return false;
            }

            try {
                await deleteOrderItem(orderItemId);
                setOpenOrder((prev) =>
                    prev ? removeOrderItemFromOrder(prev, orderItemId) : prev,
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

    const commitOrderItemBulkWrite = useCallback(
        async (
            orderItemIds: number[],
            patch: OrderItemBulkPatch,
            successMessage?: string,
        ): Promise<CommitOrderItemBulkWriteResult> => {
            if (!openOrder) {
                toast.error('Open an order before updating line items.');
                return {
                    ok: false,
                    message: 'Open an order before updating line items.',
                };
            }

            const snapshot = openOrder;

            syncOpenOrder((prev) =>
                prev
                    ? patchOrderItemsBulkInOrder(prev, orderItemIds, patch)
                    : prev,
            );

            const result = await runCommitOrderItemBulkWrite({
                orderItemIds,
                patch,
                successMessage,
            });

            if (!result.ok) {
                syncOpenOrder(snapshot);
                return result;
            }

            void refreshOpenOrder(openOrder.id);

            return result;
        },
        [openOrder, refreshOpenOrder, syncOpenOrder],
    );

    const commitOrderItemSingleWrite = useCallback(
        async (
            orderItemId: number,
            patch: OrderItemBulkPatch,
            successMessage?: string,
        ): Promise<CommitOrderItemSingleWriteResult> => {
            if (!openOrder) {
                toast.error('Open an order before updating line items.');
                return {
                    ok: false,
                    message: 'Open an order before updating line items.',
                };
            }

            const snapshot = openOrder;

            syncOpenOrder((prev) =>
                prev
                    ? patchOrderItemsBulkInOrder(prev, [orderItemId], patch)
                    : prev,
            );

            const result = await runCommitOrderItemSingleWrite({
                orderItemId,
                patch,
                order: openOrder,
                successMessage,
            });

            if (!result.ok) {
                syncOpenOrder(snapshot);
                return result;
            }

            syncOpenOrder((prev) =>
                prev ? upsertOrderItem(prev, result.order_item) : prev,
            );
            applyParentOrderBadgeUpdate(result.parent_order_update);
            void refreshOpenOrder(openOrder.id);

            return result;
        },
        [openOrder, refreshOpenOrder, syncOpenOrder, applyParentOrderBadgeUpdate],
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

        const apiDerived = legacyPayload.catalogExtensions.venue_items ?? [];
        const apiItems = mergeApiAndExtraVenueItems(
            apiDerived,
            extraVenueItems,
        );

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
            clearOpenOrderCart,
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
            applyParentOrderBadgeUpdate,
            refreshOpenOrder,
            submitOpenOrder,
            clearOpenOrderCart,
            orderInvoicesForOpenOrder,
            registerTourOrdersInvalidator,
            orderCatalog,
            orderCatalogLoading,
            getMenuItemForCategory,
            createOrderItemsFromForm,
            removeOrderItemFromCart,
            commitOrderItemBulkWrite,
            commitOrderItemSingleWrite,
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
            applyParentOrderBadgeUpdate,
            refreshOpenOrder,
            submitOpenOrder,
            clearOpenOrderCart,
            orderInvoicesForOpenOrder,
            registerTourOrdersInvalidator,
            orderCatalog,
            orderCatalogLoading,
            getMenuItemForCategory,
            createOrderItemsFromForm,
            removeOrderItemFromCart,
            commitOrderItemBulkWrite,
            commitOrderItemSingleWrite,
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
