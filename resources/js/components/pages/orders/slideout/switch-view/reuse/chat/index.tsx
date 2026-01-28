import { useChat } from '@/hooks/use-chat'; // From previous step
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import ChatInput from './input';
import MessageList from './message-list';

interface Props {
    channelId?: string;
}

export default function ChatIndex({ channelId = 'general' }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { messages, sendMessage } = useChat(channelId, auth.user.id);

    // 2. Handle Send
    const handleSend = async (content: any) => {
        await sendMessage(content);
    };

    return (
        <div className="flex h-[calc(100vh-65px)] flex-col">
            <div className="flex-1 overflow-hidden">
                <MessageList messages={messages} currentUserId={auth.user.id} />
            </div>

            <ChatInput onSend={handleSend} />
        </div>
    );
}
