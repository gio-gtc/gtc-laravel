import { useState } from 'react';

export type SortingState = Array<{ id: string; desc: boolean }>;

/**
 * Hook for managing table sorting state
 * @returns Tuple of [sorting state, setSorting function]
 */
export function useTableSorting() {
    const [sorting, setSorting] = useState<SortingState>([]);
    return [sorting, setSorting] as const;
}
