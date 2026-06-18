/**
 * Smoke tests for inline-edit no-op helpers.
 * Run: npx tsx scripts/validate-inline-edit-noop.ts
 */
import {
    assigneeIdSetFingerprint,
    isInlineDurationUnchanged,
    isInlineStatusUnchanged,
    rowAssigneesUnchanged,
} from '../resources/js/lib/orders/inline-edit-noop.ts';

function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

assert(
    isInlineDurationUnchanged('30', '30'),
    'duration wire strings equal',
);
assert(
    isInlineDurationUnchanged('30', String(30)),
    'duration wire vs numeric string',
);
assert(
    !isInlineDurationUnchanged('30', '15'),
    'duration changed',
);
assert(
    isInlineStatusUnchanged('In Production', 'In Production'),
    'status unchanged',
);
assert(
    !isInlineStatusUnchanged('In Production', 'Unassigned'),
    'status changed',
);
assert(
    assigneeIdSetFingerprint([2, 1]) === assigneeIdSetFingerprint([1, 2]),
    'assignee fingerprint order independent',
);
assert(
    rowAssigneesUnchanged(
        [{ id: 1 }, { id: 2 }],
        [2, 1],
    ),
    'row assignees unchanged',
);
assert(
    !rowAssigneesUnchanged([{ id: 1 }], [1, 2]),
    'row assignees changed',
);

console.log('inline-edit-noop: ok');
