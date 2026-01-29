import { useChat } from '@/hooks/use-chat';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import ChatInput from './input';
import MessageList from './message-list';

interface Props {
    channelId?: string;
}

export default function ChatIndex({ channelId = 'general' }: Props) {
    const { auth } = usePage<SharedData>().props;
    const usersWithFallback = useUsersWithFallback();
    const { messages, sendMessage, editMessage, deleteMessage } = useChat(
        channelId,
        auth.user.id,
    );

    return (
        <div className="flex h-[calc(100vh-65px)] flex-col">
            <div className="flex-1 overflow-hidden">
                <MessageList
                    messages={messages}
                    currentUserId={auth.user.id}
                    users={usersWithFallback}
                    onEditMessage={editMessage}
                    onDeleteMessage={deleteMessage}
                />
            </div>

            <ChatInput onSend={sendMessage} />
        </div>
    );
}
