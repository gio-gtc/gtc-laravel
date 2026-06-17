import {
    isCancelledStatusId,
    isClientReviewStatusId,
    isOutForDeliveryStatusId,
    isRevisionRequestStatusId,
    isStillInCartStatusId,
    orderItemStatusLabelToId,
} from '@/lib/orders/order-item-statuses';
import { isGtcAdminUser } from '@/lib/user-roles';
import { isGtcStaffUser, isExternalClientUser } from '@/lib/user-organisation';
import type { MediaTableRow, User } from '@/types';

type WritableRow = Pick<MediaTableRow, 'status' | 'status_id'>;

function rowStatusId(row: WritableRow): number | undefined {
    if (typeof row.status_id === 'number') {
        return row.status_id;
    }
    if (!row.status) {
        return undefined;
    }
    return orderItemStatusLabelToId(row.status);
}

function isInactivePipelineRow(statusId: number | undefined): boolean {
    return (
        isCancelledStatusId(statusId) || isRevisionRequestStatusId(statusId)
    );
}

/** GTC staff may edit line items; cancelled/revision rows require admin override. */
export function canEditOrderLineItem(
    user: User,
    row: WritableRow,
    roles: readonly string[] = [],
): boolean {
    const statusId = rowStatusId(row);
    if (isInactivePipelineRow(statusId) && !isGtcAdminUser(roles)) {
        return false;
    }
    if (isGtcStaffUser(user)) {
        return true;
    }
    return isStillInCartStatusId(statusId);
}

/** Staff inline status changes; cancelled/revision rows require admin override. */
export function canEditOrderLineItemStatus(
    user: User,
    row: WritableRow,
    roles: readonly string[] = [],
): boolean {
    if (!isGtcStaffUser(user)) {
        return false;
    }
    const statusId = rowStatusId(row);
    if (isInactivePipelineRow(statusId)) {
        return isGtcAdminUser(roles);
    }
    return true;
}

function isRevisionEligibleStatusId(statusId: number | undefined): boolean {
    return (
        isClientReviewStatusId(statusId) ||
        isOutForDeliveryStatusId(statusId)
    );
}

/** Deliverables approve — external client or Admin/Super Admin while Client Review. */
export function canApproveOrderItemDeliverable(
    user: User,
    row: WritableRow,
    roles: readonly string[] = [],
): boolean {
    if (!isClientReviewStatusId(rowStatusId(row))) {
        return false;
    }
    return isExternalClientUser(user) || isGtcAdminUser(roles);
}

/** Deliverables revise — external client or Admin/Super Admin while Client Review or Out For Delivery. */
export function canInitiateOrderItemRevision(
    user: User,
    row: WritableRow,
    roles: readonly string[] = [],
): boolean {
    if (!isRevisionEligibleStatusId(rowStatusId(row))) {
        return false;
    }
    return isExternalClientUser(user) || isGtcAdminUser(roles);
}

/** @deprecated Use canInitiateOrderItemRevision */
export function canRequestRevision(
    user: User,
    row: WritableRow,
    roles: readonly string[] = [],
): boolean {
    return canInitiateOrderItemRevision(user, row, roles);
}

/** Admin / Super Admin override for cancelled and revision-request row edits. */
export function canStaffOverrideInactiveRowEdits(
    roles: readonly string[],
): boolean {
    return isGtcAdminUser(roles);
}

export function isOrderLineItemEditDisabled(
    row: WritableRow,
    user: User,
    roles: readonly string[] = [],
): boolean {
    return !canEditOrderLineItem(user, row, roles);
}

export function canEditOrderItemAssignees(
    user: User,
    row: Pick<MediaTableRow, 'status' | 'status_id'>,
    roles: readonly string[] = [],
): boolean {
    if (!isGtcStaffUser(user)) {
        return false;
    }
    const statusId = rowStatusId(row);
    if (isInactivePipelineRow(statusId)) {
        return isGtcAdminUser(roles);
    }
    return true;
}

export type BulkSelectionWritableResult =
    | { ok: true }
    | { ok: false; message: string };

/** Pre-check before bulk-update; cancelled/revision rows require admin override. */
export function assertBulkSelectionWritable(
    rows: readonly WritableRow[],
    user: User,
    roles: readonly string[] = [],
): BulkSelectionWritableResult {
    if (
        !isGtcAdminUser(roles) &&
        rows.some((row) => isInactivePipelineRow(rowStatusId(row)))
    ) {
        return {
            ok: false,
            message:
                'Cannot bulk-edit cancelled or revision-requested line items. Deselect those rows or sign in as an admin.',
        };
    }

    if (
        !isGtcStaffUser(user) &&
        rows.some((row) => !isStillInCartStatusId(rowStatusId(row)))
    ) {
        return {
            ok: false,
            message: 'You can only edit line items that are still in cart.',
        };
    }

    return { ok: true };
}
