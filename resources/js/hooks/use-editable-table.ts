import { useEffect, useRef, useState } from 'react';

interface UseEditableTableOptions<T> {
    data: T[];
    onChange?: (updatedData: T[]) => void;
    getId: (item: T) => number | string;
}

interface UseEditableTableReturn<T> {
    editingCell: { itemId: number | string; field: string } | null;
    localData: T[];
    handleDoubleClick: (
        itemId: number | string,
        field: string,
    ) => void;
    handleCellChange: (
        itemId: number | string,
        field: string,
        value: string | number,
    ) => void;
    handleCellBlur: () => void;
    handleCellKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement>,
        itemId: number | string,
        field: string,
    ) => void;
    isEditing: (itemId: number | string, field: string) => boolean;
}

export function useEditableTable<T extends Record<string, unknown>>({
    data,
    onChange,
    getId,
}: UseEditableTableOptions<T>): UseEditableTableReturn<T> {
    // State for tracking which cell is being edited
    const [editingCell, setEditingCell] = useState<{
        itemId: number | string;
        field: string;
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
    ) => {
        const item = localData.find((i) => getId(i) === itemId);
        if (item) {
            setOriginalValue(
                (item[field as keyof T] as string | number) || null,
            );
            setEditingCell({ itemId, field });
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
        e: React.KeyboardEvent<HTMLInputElement>,
        itemId: number | string,
        field: string,
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
    ): boolean => {
        return (
            editingCell?.itemId === itemId && editingCell?.field === field
        );
    };

    return {
        editingCell,
        localData,
        handleDoubleClick,
        handleCellChange,
        handleCellBlur,
        handleCellKeyDown,
        isEditing,
    };
}
