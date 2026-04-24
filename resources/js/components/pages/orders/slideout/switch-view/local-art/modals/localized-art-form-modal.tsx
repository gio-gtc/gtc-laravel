import {
    SchemaForm,
    type SchemaFormHandle,
} from '@/components/forms/schema-form';
import { orderModalStyles } from '@/components/pages/orders/slideout/switch-view/general-media/modals/shared';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Divider from '@/components/utils/divider';
import type { VenueFormSchemaResponse } from '@/types/forms';
import { useEffect, useRef, useState } from 'react';

interface LocalizedArtFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mockVenueId: number | null | undefined;
    orderId: number | null | undefined;
    tourVenueId: number | null | undefined;
}

type LoadState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; schema: VenueFormSchemaResponse }
    | { status: 'error'; message: string };

/**
 * Modal launched from the Localized Art plus button. Fetches the resolved
 * form schema for the slideout's mock venue and hands it to {@link SchemaForm}
 * with the current order/tour_venue ids attached as an `extraPayload`.
 */
export default function LocalizedArtFormModal({
    isOpen,
    onClose,
    mockVenueId,
    orderId,
    tourVenueId,
}: LocalizedArtFormModalProps) {
    const [load, setLoad] = useState<LoadState>({ status: 'idle' });
    const formRef = useRef<SchemaFormHandle>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setLoad({ status: 'idle' });
            setSubmitting(false);
            return;
        }
        if (!mockVenueId) {
            setLoad({
                status: 'error',
                message: 'This venue does not have a localized art form configured.',
            });
            return;
        }

        const controller = new AbortController();
        setLoad({ status: 'loading' });
        const schemaUrl = `/venue-forms/${mockVenueId}/schema?${new URLSearchParams({ omit_file_fields: '1' })}`;
        fetch(schemaUrl, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(
                        res.status === 404
                            ? 'This venue does not have a localized art form configured.'
                            : `Failed to load form (${res.status}).`,
                    );
                }
                const schema = (await res.json()) as VenueFormSchemaResponse;
                setLoad({ status: 'ready', schema });
            })
            .catch((err: unknown) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setLoad({
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Failed to load form.',
                });
            });

        return () => controller.abort();
    }, [isOpen, mockVenueId]);

    const handlePrimary = () => {
        if (load.status !== 'ready') return;
        formRef.current?.submit();
    };

    const primaryDisabled = load.status !== 'ready' || submitting;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="gap-3 sm:max-w-[920px]">
                <DialogHeader>
                    <DialogTitle className={orderModalStyles.dialogTitle}>
                        Add Localized Art
                    </DialogTitle>
                </DialogHeader>

                <Divider />

                {load.status === 'loading' ? (
                    <FormSkeleton />
                ) : load.status === 'error' ? (
                    <p className="text-destructive text-sm" role="alert">
                        {load.message}
                    </p>
                ) : load.status === 'ready' ? (
                    <SchemaForm
                        ref={formRef}
                        {...load.schema}
                        hideSubmit
                        separateBlocksWithDivider
                        extraPayload={{
                            omit_file_fields: true,
                            order_id: orderId ?? null,
                            tour_venue_id: tourVenueId ?? null,
                        }}
                        onSuccess={() => {
                            setSubmitting(false);
                            onClose();
                        }}
                        onError={() => setSubmitting(false)}
                    />
                ) : null}

                <Divider />

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className={orderModalStyles.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={orderModalStyles.primaryButton}
                        onClick={() => {
                            setSubmitting(true);
                            handlePrimary();
                        }}
                        disabled={primaryDisabled}
                    >
                        {submitting ? 'Adding…' : 'Add to Order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FormSkeleton() {
    return (
        <div className="space-y-3" aria-busy="true">
            <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-24 animate-pulse rounded bg-gray-100" />
            <div className="h-24 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-1/4 animate-pulse rounded bg-gray-200" />
            <div className="h-24 animate-pulse rounded bg-gray-100" />
        </div>
    );
}
