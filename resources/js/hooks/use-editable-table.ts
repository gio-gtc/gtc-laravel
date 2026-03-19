import {
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';

interface UseEditableTableOptions<T> {
    data: T[];
    onChange?: (updatedData: T[]) => void;
    getId: (item: T) => number | string;
}

interface UseEditableTableReturn<T> {
    editingCell: {
        itemId: number | string;
        field: string;
        /** Disambiguates the same row id rendered in multiple tables (e.g. venue media). */
        scope?: string;
    } | null;
    localData: T[];
    handleDoubleClick: (
        itemId: number | string,
        field: string,
        scope?: string,
    ) => void;
    handleCellChange: (
        itemId: number | string,
        field: string,
        value: string | number,
    ) => void;
    handleCellBlur: () => void;
    handleCellKeyDown: (
        e: KeyboardEvent<HTMLInputElement>,
        itemId: number | string,
        field: string,
        scope?: string,
    ) => void;
    isEditing: (
        itemId: number | string,
        field: string,
        scope?: string,
    ) => boolean;
    addItem: (item: T) => void;
    removeItem: (itemId: number | string) => void;
    startEditing: (
        itemId: number | string,
        field: string,
        scope?: string,
    ) => void;
}

export function useEditableTable<T extends object>({
    data,
    onChange,
    getId,
}: UseEditableTableOptions<T>): UseEditableTableReturn<T> {
    // State for tracking which cell is being edited
    const [editingCell, setEditingCell] = useState<{
        itemId: number | string;
        field: string;
        scope?: string;
    } | null>(null);

    // State to store original value when editing starts (for Escape key)
    const [originalValue, setOriginalValue] = useState<string | number | null>(
        null,
    );

    // State for local data (editable copy)
    const [localData, setLocalData] = useState<T[]>(data);

    // Ref to track latest data for onChange callbacks
    const localDataRef = useRef<T[]>(data);

    // Update local data when source data changes
    useEffect(() => {
        setLocalData(data);
        localDataRef.current = data;
    }, [data]);

    // Handle double-click to start editing
    const handleDoubleClick = (
        itemId: number | string,
        field: string,
        scope?: string,
    ) => {
        const item = localDataRef.current.find((i) => getId(i) === itemId);
        if (item) {
            setOriginalValue(
                (item[field as keyof T] as string | number) || null,
            );
            setEditingCell({ itemId, field, scope });
        }
    };

    // Handle cell value change
    const handleCellChange = (
        itemId: number | string,
        field: string,
        value: string | number,
    ) => {
        setLocalData((prev) => {
            const updated = prev.map((item) =>
                getId(item) === itemId
                    ? { ...item, [field]: value }
                    : item,
            );
            localDataRef.current = updated;
            return updated;
        });
    };

    // Handle cell blur (save changes)
    const handleCellBlur = () => {
        setEditingCell(null);
        setOriginalValue(null);
        // Notify parent of changes if callback provided
        if (onChange) {
            onChange(localDataRef.current);
        }
    };

    // Handle keyboard events
    const handleCellKeyDown = (
        e: KeyboardEvent<HTMLInputElement>,
        itemId: number | string,
        field: string,
        _scope?: string,
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setEditingCell(null);
            setOriginalValue(null);
            // Notify parent of changes if callback provided
            if (onChange) {
                onChange(localDataRef.current);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            // Revert to original value
            if (originalValue !== null) {
                handleCellChange(itemId, field, originalValue);
            }
            setEditingCell(null);
            setOriginalValue(null);
        }
    };

    // Check if a cell is currently being edited
    const isEditing = (
        itemId: number | string,
        field: string,
        scope?: string,
    ): boolean => {
        return (
            editingCell?.itemId === itemId &&
            editingCell?.field === field &&
            editingCell?.scope === scope
        );
    };

    // Add a new item to the table
    const addItem = (item: T) => {
        setLocalData((prev) => {
            const updated = [...prev, item];
            localDataRef.current = updated;
            return updated;
        });
    };

    // Remove an item from the table
    const removeItem = (itemId: number | string) => {
        setLocalData((prev) => {
            const updated = prev.filter((i) => getId(i) !== itemId);
            localDataRef.current = updated;
            return updated;
        });
        if (editingCell?.itemId === itemId) {
            setEditingCell(null);
            setOriginalValue(null);
        }
    };

    // Programmatically start editing a cell (uses ref to support immediate use after addItem)
    const startEditing = (
        itemId: number | string,
        field: string,
        scope?: string,
    ) => {
        const item = localDataRef.current.find((i) => getId(i) === itemId);
        const value = item
            ? ((item[field as keyof T] as string | number) ?? null)
            : null;
        setOriginalValue(value);
        setEditingCell({ itemId, field, scope });
    };

    return {
        editingCell,
        localData,
        handleDoubleClick,
        handleCellChange,
        handleCellBlur,
        handleCellKeyDown,
        isEditing,
        addItem,
        removeItem,
        startEditing,
    };
}
