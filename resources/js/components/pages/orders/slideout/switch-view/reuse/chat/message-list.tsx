import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { groupMessagesByDate } from '@/lib/chat-utils';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { Message } from '@/types/chat';
import {
    differenceInMinutes,
    format,
    formatDistanceToNow,
    isToday,
    isYesterday,
} from 'date-fns';
import { Check } from 'lucide-react';
import { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

interface Props {
    messages: Message[];
    currentUserId: number;
    currentUser: User;
    users: User[];
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
}: Props) {
    const getInitials = useInitials();

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
                const sender = isMe ? currentUser : userMap.get(item.sender_id);
                const senderName = isMe
                    ? 'You'
                    : sender?.name || 'Unknown User';
                const timestamp = formatMessageTimestamp(
                    new Date(item.created_at),
                );

                // otherwise print string.
                let contentRender = 'Unsupported content';
                if (typeof item.content === 'string') {
                    contentRender = item.content;
                } else if (item.content?.type === 'doc') {
                    const blocks = item.content.content ?? [];
                    const parts: string[] = [];

                    blocks.forEach((block: any, blockIndex: number) => {
                        const inner = block?.content ?? [];
                        inner.forEach((node: any) => {
                            if (node.type === 'text' && node.text) {
                                parts.push(node.text);
                            } else if (node.type === 'hardBreak') {
                                parts.push('\n');
                            }
                        });
                        // Add an extra line break between paragraphs
                        if (blockIndex < blocks.length - 1) {
                            parts.push('\n');
                        }
                    });

                    contentRender =
                        parts.join('') === '' ? '(Empty)' : parts.join('');
                }

                return (
                    <div className="mb-4 flex w-full gap-2 px-4">
                        {/* Sender Avatar */}
                        <div
                            className={cn(
                                'mb-1 flex gap-2',
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

                        {/* Name & Message bubble */}
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
                                    <span className="flex gap-1">
                                        <span className="text-gray-500">
                                            {timestamp}
                                        </span>
                                        {isMe && item.status === 'sent' && (
                                            <Check className="h-3 w-3 text-red-500" />
                                        )}
                                    </span>
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
                                </div>
                                <div
                                    className={cn(
                                        'rounded-2xl px-4 py-2 text-sm shadow-sm',
                                        isMe
                                            ? 'rounded-br-none border border-gray-200 bg-white text-gray-900'
                                            : 'rounded-tl-none bg-gray-100 text-gray-900',
                                        item.status === 'sending' &&
                                            'opacity-70',
                                    )}
                                >
                                    <div className="leading-relaxed whitespace-pre-wrap">
                                        {contentRender}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );
}
