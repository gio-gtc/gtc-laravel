import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Divider from '@/components/utils/divider';
import { ModalFooterActions } from '@/components/utils/modal-footer-actions';
import type { LocalizedArtNote } from '@/types';
import { orderModalStyles } from '../../general-media/modals/shared';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    notes: LocalizedArtNote[];
    rowId?: string | number;
}

export default function NotesModal({
    isOpen,
    onClose,
    notes,
}: NotesModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="grid-rows-[auto_1fr_auto] gap-2 sm:h-full sm:max-h-[600px] sm:w-full sm:max-w-[600px]">
                <div>
                    <DialogHeader className="pb-2">
                        <DialogTitle className="md-black-weight-600">
                            Notes
                        </DialogTitle>
                    </DialogHeader>

                    <Divider />
                </div>

                <div className="flex min-h-0 flex-col gap-2">
                    <div className="flex-1 overflow-y-auto rounded-lg border px-2.5 py-1">
                        {notes.length > 0 ? (
                            <div className="space-y-4 py-1">
                                {notes.map((note, index) => (
                                    <div key={index} className="space-y-1">
                                        <p className="xs-gray-500-weight-400">
                                            {note.text}
                                        </p>
                                        <Divider />
                                        <p className="xs-gray-300-weight-400 text-center italic">
                                            Saved on {note.savedAt}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No notes yet.
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Add Note"
                            className={orderModalStyles.input}
                        />

                        <Button
                            className={orderModalStyles.input}
                            onClick={onClose}
                        >
                            Submit
                        </Button>
                    </div>
                </div>

                <div>
                    <Divider />

                    <ModalFooterActions
                        onCancel={onClose}
                        confirmLabel="Save"
                        cancelClassName={orderModalStyles.cancelButton}
                        confirmClassName={orderModalStyles.primaryButton}
                        confirmType="button"
                        onConfirm={onClose}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
