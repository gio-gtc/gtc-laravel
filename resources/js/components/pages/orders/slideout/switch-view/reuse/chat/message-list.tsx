import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { groupMessagesByDate } from '@/lib/chat-utils';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { Message } from '@/types/chat';
import { generateHTML } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    differenceInMinutes,
    format,
    formatDistanceToNow,
    isToday,
    isYesterday,
} from 'date-fns';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

interface Props {
    messages: Message[];
    currentUserId: number;
    currentUser: User;
    users: User[];
    onEditMessage?: (id: string, content: any) => void;
    onDeleteMessage?: (id: string) => void;
}

function getMessageContentText(content: any): string {
    if (typeof content === 'string') return content;
    if (content?.type === 'doc') {
        const blocks = content.content ?? [];
        const parts: string[] = [];
        blocks.forEach((block: any, blockIndex: number) => {
            const inner = block?.content ?? [];
            inner.forEach((node: any) => {
                if (node.type === 'text' && node.text) parts.push(node.text);
                else if (node.type === 'hardBreak') parts.push('\n');
            });
            if (blockIndex < blocks.length - 1) parts.push('\n');
        });
        return parts.join('') === '' ? '(Empty)' : parts.join('');
    }
    return 'Unsupported content';
}

function getMessageContentHTML(content: any): string | null {
    if (typeof content === 'string') return null;
    if (content?.type !== 'doc') return null;
    try {
        const html = generateHTML(content, [StarterKit]);
        const trimmed = html.replace(/<[^>]+>/g, '').trim();
        return trimmed === '' ? null : html;
    } catch {
        return null;
    }
}

function InlineMessageEditor({
    content,
    onSave,
    onCancel,
}: {
    content: any;
    onSave: (content: any) => void;
    onCancel: () => void;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Message',
                emptyEditorClass:
                    'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left',
            }),
        ],
        content: content ?? undefined,
        editorProps: {
            attributes: {
                class: 'prose prose-sm w-full max-w-none focus:outline-none min-h-[40px] max-h-[120px] overflow-y-auto px-3 py-2 text-gray-900 rounded-xl border',
            },
            handleKeyDown: (_, event) => {
                if (event.key === 'Escape') {
                    onCancel();
                    return true;
                }
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (!editor?.isEmpty) onSave(editor.getJSON());
                    return true;
                }
                return false;
            },
        },
    });

    useEffect(() => {
        if (editor && content) editor.commands.setContent(content);
    }, [editor, content]);

    const handleSave = useCallback(() => {
        if (editor && !editor.isEmpty) onSave(editor.getJSON());
    }, [editor, onSave]);

    return (
        <div className="flex w-full justify-end gap-2 px-4 pb-4">
            <div className="flex max-w-[85%] flex-col gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-2">
                <EditorContent editor={editor} />
                <div className="flex justify-end gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Helper function to format message timestamp
function formatMessageTimestamp(date: Date): string {
    const now = new Date();
    const minutesDiff = differenceInMinutes(now, date);

    // Less than 1 minute: "Just now"
    if (minutesDiff < 1) {
        return 'Just now';
    }

    // Less than 1 hour: Use relative time
    if (minutesDiff < 60) {
        return formatDistanceToNow(date, { addSuffix: true });
    }

    // Today: "Today {time}"
    if (isToday(date)) {
        return `Today ${format(date, 'h:mm a')}`;
    }

    // Yesterday: "Yesterday {time}"
    if (isYesterday(date)) {
        return `Yesterday ${format(date, 'h:mm a')}`;
    }

    // Older: Day name + time (e.g., "Thursday 11:41am")
    return format(date, 'EEEE h:mm a');
}

export default function MessageList({
    messages,
    currentUserId,
    currentUser,
    users,
    onEditMessage,
    onDeleteMessage,
}: Props) {
    const getInitials = useInitials();
    const [editingMessageId, setEditingMessageId] = useState<string | null>(
        null,
    );
    const [openMenuMessageId, setOpenMenuMessageId] = useState<string | null>(
        null,
    );
    const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<
        string | null
    >(null);

    // Create user lookup map
    const userMap = useMemo(() => {
        const map = new Map<number, User>();
        users.forEach((user) => {
            map.set(user.id, user);
        });
        return map;
    }, [users]);

    const grouped = useMemo(() => groupMessagesByDate(messages), [messages]);

    const flattenedData = useMemo(() => {
        const flat: (string | Message)[] = [];
        grouped.forEach(([date, msgs]) => {
            flat.push(date); // The Header String
            flat.push(...msgs); // The Message Objects
        });
        return flat;
    }, [grouped]);

    return (
        <div className="h-full">
            <Virtuoso
                data={flattenedData}
                initialTopMostItemIndex={flattenedData.length - 1} // Scroll to bottom
                followOutput={'auto'} // Stick to bottom on new messages
                itemContent={(index, item) => {
                    // CASE 1: Render Date Header
                    if (typeof item === 'string') {
                        return (
                            <div className="flex items-center px-4 py-6">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="mx-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    {item}
                                </span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>
                        );
                    }

                    // CASE 2: Render Message Bubble
                    const isMe = item.sender_id === currentUserId;
                    const sender = isMe
                        ? currentUser
                        : userMap.get(item.sender_id);
                    const senderName = isMe
                        ? 'You'
                        : sender?.name || 'Unknown User';
                    const timestamp = formatMessageTimestamp(
                        new Date(item.created_at),
                    );
                    const canEditDelete =
                        isMe &&
                        item.status !== 'deleted' &&
                        onEditMessage &&
                        onDeleteMessage;

                    if (item.status === 'deleted') {
                        return (
                            <div className="flex w-full gap-2 px-4 pb-4">
                                <div
                                    className={cn(
                                        'flex w-full',
                                        isMe ? 'justify-end' : 'justify-start',
                                    )}
                                >
                                    <div className="max-w-[85%] rounded-2xl px-4 py-2 text-sm text-gray-400 italic">
                                        Message deleted
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (isMe && editingMessageId === item.id && onEditMessage) {
                        return (
                            <InlineMessageEditor
                                key={item.id}
                                content={item.content}
                                onSave={(content) => {
                                    onEditMessage(item.id, content);
                                    setEditingMessageId(null);
                                }}
                                onCancel={() => setEditingMessageId(null)}
                            />
                        );
                    }

                    const htmlContent = getMessageContentHTML(item.content);
                    const contentRender = getMessageContentText(item.content);

                    const bubbleDiv = (
                        <div
                            className={cn(
                                'rounded-2xl px-4 py-2 text-sm shadow-sm',
                                isMe
                                    ? 'rounded-br-none border border-gray-200 bg-white text-gray-900'
                                    : 'rounded-tl-none bg-gray-100 text-gray-900',
                                item.status === 'sending' && 'opacity-70',
                                canEditDelete && 'cursor-pointer',
                            )}
                        >
                            {htmlContent ? (
                                <div
                                    className="prose prose-sm max-w-none leading-relaxed [&_p]:my-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                                    dangerouslySetInnerHTML={{
                                        __html: htmlContent,
                                    }}
                                />
                            ) : (
                                <div className="leading-relaxed whitespace-pre-wrap">
                                    {contentRender}
                                </div>
                            )}
                        </div>
                    );

                    const bubbleWithEdited = (
                        <div
                            className={cn('flex flex-col', isMe && 'items-end')}
                        >
                            {bubbleDiv}
                            {item.status === 'edited' && (
                                <span className="mt-0.5 text-xs text-muted-foreground italic">
                                    edited
                                </span>
                            )}
                        </div>
                    );

                    return (
                        <div className="group flex w-full gap-2 px-4 pb-4">
                            <div
                                className={cn(
                                    'flex gap-2 pb-1',
                                    isMe ? 'justify-end' : 'justify-start',
                                )}
                            >
                                {!isMe && sender && (
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={sender.avatar || undefined}
                                            alt={senderName}
                                        />
                                        <AvatarFallback className="rounded-full bg-neutral-200 text-[10px] text-black">
                                            {getInitials(senderName)}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>

                            <div
                                className={cn(
                                    'flex w-full',
                                    isMe ? 'justify-end' : 'justify-start',
                                )}
                            >
                                <div className="max-w-[85%]">
                                    <div className="flex justify-between gap-2 pb-1 text-xs text-gray-600">
                                        <span className="font-medium">
                                            {senderName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="text-gray-500">
                                                {timestamp}
                                            </span>
                                            {isMe &&
                                                (item.status === 'sent' ||
                                                    item.status ===
                                                        'edited') && (
                                                    <Check className="h-3 w-3 text-red-500" />
                                                )}
                                            {item.status === 'sending' && (
                                                <span className="text-gray-400">
                                                    • sending...
                                                </span>
                                            )}
                                            {item.status === 'error' && (
                                                <span className="text-red-500">
                                                    • failed
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    {canEditDelete ? (
                                        <DropdownMenu
                                            open={openMenuMessageId === item.id}
                                            onOpenChange={(open) =>
                                                !open &&
                                                setOpenMenuMessageId(null)
                                            }
                                        >
                                            <DropdownMenuTrigger asChild>
                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onDoubleClick={(e) => {
                                                        e.preventDefault();
                                                        setOpenMenuMessageId(
                                                            item.id,
                                                        );
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === 'Enter' ||
                                                            e.key === ' '
                                                        ) {
                                                            e.preventDefault();
                                                            setOpenMenuMessageId(
                                                                item.id,
                                                            );
                                                        }
                                                    }}
                                                    className="select-none"
                                                >
                                                    {bubbleWithEdited}
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                sideOffset={
                                                    item.status === 'edited'
                                                        ? -20
                                                        : 0
                                                }
                                            >
                                                <div className="flex flex-row items-center gap-1">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditingMessageId(
                                                                item.id,
                                                            );
                                                            setOpenMenuMessageId(
                                                                null,
                                                            );
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => {
                                                            setDeleteConfirmMessageId(
                                                                item.id,
                                                            );
                                                            setOpenMenuMessageId(
                                                                null,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </DropdownMenuItem>
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        bubbleWithEdited
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }}
            />
            <Dialog
                open={deleteConfirmMessageId !== null}
                onOpenChange={(open) =>
                    !open && setDeleteConfirmMessageId(null)
                }
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete message</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this message?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmMessageId(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-brand-gtc-red hover:bg-brand-gtc-red/90"
                            onClick={() => {
                                if (deleteConfirmMessageId && onDeleteMessage) {
                                    onDeleteMessage(deleteConfirmMessageId);
                                    setDeleteConfirmMessageId(null);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
