import { groupMessagesByDate } from '@/lib/chat-utils';
import { Message } from '@/types/chat';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

// Simple helper to merge class names (if you don't have 'cn' from shadcn yet)
function cn(...classes: (string | undefined | boolean)[]) {
    return classes.filter(Boolean).join(' ');
}

interface Props {
    messages: Message[];
    currentUserId: number;
}

export default function MessageList({ messages, currentUserId }: Props) {
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
            style={{ height: '100%' }}
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

                // Parse Content: If it's JSON (Tiptap), extract text, otherwise print string
                // Ideally, you'd use Tiptap's generateHTML here, but for now we fallback:
                let contentRender = 'Unsupported content';
                if (typeof item.content === 'string') {
                    contentRender = item.content;
                } else if (item.content?.type === 'doc') {
                    // Simple fallback for JSON content if you don't have a renderer yet
                    contentRender =
                        item.content.content?.[0]?.content?.[0]?.text ||
                        '(Empty)';
                }

                return (
                    <div
                        className={cn(
                            'mb-4 flex w-full px-4',
                            isMe ? 'justify-end' : 'justify-start',
                        )}
                    >
                        <div
                            className={cn(
                                'max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm',
                                isMe
                                    ? 'rounded-br-none bg-blue-600 text-white'
                                    : 'rounded-bl-none border border-gray-200 bg-white text-gray-900',
                                item.status === 'sending' && 'opacity-70',
                            )}
                        >
                            <div className="leading-relaxed whitespace-pre-wrap">
                                {contentRender}
                            </div>

                            <div
                                className={cn(
                                    'mt-1 flex items-center gap-1 text-[10px]',
                                    isMe
                                        ? 'justify-end text-blue-200'
                                        : 'justify-start text-gray-400',
                                )}
                            >
                                {format(new Date(item.created_at), 'h:mm a')}
                                {item.status === 'sending' && (
                                    <span>• sending...</span>
                                )}
                                {item.status === 'error' && (
                                    <span className="text-red-300">
                                        • failed
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );
}
