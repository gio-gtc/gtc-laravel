import type { MouseEvent } from 'react';

const IGNORE_SELECTOR =
    'button, a, input, textarea, select, [role="menuitem"]';

export function toggleRowSelectionOnRowClick(
    e: MouseEvent<HTMLTableRowElement>,
    rowId: string | number,
    onRowSelectToggle?: (rowId: string | number) => void,
    /** When true (e.g. cancelled / revision rows), clicks do not toggle selection */
    rowSelectDisabled?: boolean,
): void {
    if (!onRowSelectToggle || rowSelectDisabled) return;
    const t = e.target as HTMLElement;
    if (t.closest(IGNORE_SELECTOR)) return;
    onRowSelectToggle(rowId);
}
