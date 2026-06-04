import { fetchOrderShow } from '@/lib/orders/orders-api-client';
import { type SharedData } from '@/types';
import { type OrderListFlashPayload } from '@/types/inertia-pages';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

type SyncHandlers = {
    revealTourOrder: (tourId: number, orderId: number) => void;
};

/**
 * After create/submit redirects, expand the tour group and refresh its orders
 * so the new or updated row appears without a full page reload.
 */
export function useOrdersPageFlashSync({ revealTourOrder }: SyncHandlers) {
    const page = usePage<SharedData & { flash?: OrderListFlashPayload }>();
    const processedCreatedRef = useRef<number | null>(null);
    const processedSubmittedRef = useRef<number | null>(null);

    useEffect(() => {
        const created = page.props.flash?.created_order;
        if (!created?.id || !created.tour_id) {
            return;
        }
        if (processedCreatedRef.current === created.id) {
            return;
        }
        processedCreatedRef.current = created.id;
        revealTourOrder(created.tour_id, created.id);
    }, [page.props.flash?.created_order, revealTourOrder]);

    useEffect(() => {
        const submitted = page.props.flash?.submitted_order;
        if (!submitted?.id) {
            return;
        }
        if (processedSubmittedRef.current === submitted.id) {
            return;
        }
        processedSubmittedRef.current = submitted.id;

        const tourId = submitted.tour_id;
        if (tourId != null && tourId > 0) {
            revealTourOrder(tourId, submitted.id);
            return;
        }

        let cancelled = false;
        void (async () => {
            try {
                const order = await fetchOrderShow(submitted.id);
                if (cancelled || !order?.tour_id) {
                    return;
                }
                revealTourOrder(order.tour_id, submitted.id);
            } catch {
                // List refresh is best-effort; slideout may still refresh separately.
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [page.props.flash?.submitted_order, revealTourOrder]);
}
