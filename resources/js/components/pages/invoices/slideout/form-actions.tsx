import { Button } from '@/components/ui/button';

interface InvoiceFormActionsProps {
    onCancel: () => void;
    onSave?: () => void;
    saveDisabled?: boolean;
}

export default function InvoiceFormActions({
    onCancel,
    onSave,
    saveDisabled = false,
}: InvoiceFormActionsProps) {
    return (
        <div className="flex flex-col justify-end gap-2 sm:flex-row">
            <Button variant="outline" onClick={onCancel}>
                Cancel
            </Button>
            <Button
                variant="outline"
                onClick={onSave}
                disabled={saveDisabled}
            >
                Save Changes
            </Button>
        </div>
    );
}
