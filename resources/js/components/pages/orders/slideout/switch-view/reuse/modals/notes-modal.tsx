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
import { formatUtcAsLocalDateTime } from '@/helper-functions/format-time';
import type { OrderItemNote, User } from '@/types';
import { orderModalStyles } from '../../general-media/modals/shared';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    notes: OrderItemNote[];
    users: User[];
    rowId?: string | number;
}

function resolveAuthorName(userId: number, users: User[]): string {
    const user = users.find((u) => u.id === userId);
    if (!user) return 'Unknown';
    const first = user.first_name?.trim();
    const last = user.last_name?.trim();
    const full = [first, last].filter(Boolean).join(' ').trim();
    return full || user.name || user.email || 'Unknown';
}

export default function NotesModal({
    isOpen,
    onClose,
    notes,
    users,
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
                                {notes.map((note) => (
                                    <div key={note.id} className="space-y-1">
                                        <p className="xs-gray-500-weight-400">
                                            {note.message}
                                        </p>
                                        <Divider />
                                        <p className="xs-gray-300-weight-400 text-center italic">
                                            Saved on{' '}
                                            {formatUtcAsLocalDateTime(
                                                note.created_date,
                                            )}{' '}
                                            by{' '}
                                            {resolveAuthorName(
                                                note.user_id,
                                                users,
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500"></p>
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
