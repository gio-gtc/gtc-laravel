import { useChat } from '@/hooks/use-chat';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import type { User } from '@/types';
import { SharedData } from '@/types';
import type { Message, SendMessageOptions } from '@/types/chat';
import { usePage } from '@inertiajs/react';
import ChatInput from './input';
import MessageList from './message-list';

export interface ChatThreadProps {
    messages: Message[];
    sendMessage: (
        content: unknown,
        options?: SendMessageOptions,
    ) => void | Promise<void>;
    editMessage: (id: string, content: unknown) => void | Promise<void>;
    deleteMessage: (id: string) => void | Promise<void>;
    currentUserId: number;
    users: User[];
}

export function ChatThread({
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    currentUserId,
    users,
}: ChatThreadProps) {
    return (
        <div className="flex h-[calc(100vh-75px)] flex-col">
            <div className="flex-1 overflow-hidden">
                <MessageList
                    messages={messages}
                    currentUserId={currentUserId}
                    users={users}
                    onEditMessage={editMessage}
                    onDeleteMessage={deleteMessage}
                />
            </div>

            <ChatInput onSend={sendMessage} />
        </div>
    );
}

interface ChatBoxProps {
    channelId?: string;
}

/** Default connected chat: own `useChat` subscription (e.g. local-art, or standalone). */
export default function ChatBox({ channelId = 'general' }: ChatBoxProps) {
    const { auth } = usePage<SharedData>().props;
    const usersWithFallback = useUsersWithFallback();
    const { messages, sendMessage, editMessage, deleteMessage } = useChat(
        channelId,
        auth.user.id,
    );

    return (
        <ChatThread
            messages={messages}
            sendMessage={sendMessage}
            editMessage={editMessage}
            deleteMessage={deleteMessage}
            currentUserId={auth.user.id}
            users={usersWithFallback}
        />
    );
}
