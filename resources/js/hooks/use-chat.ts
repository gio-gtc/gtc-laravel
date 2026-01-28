import { supabase } from '@/lib/supabase'; // Your initialized client
import { Message } from '@/types/chat';
import { useCallback, useEffect, useState } from 'react';

export function useChat(channelId: string, currentUserId: number) {
    const [messages, setMessages] = useState<Message[]>([]);

    // 1. Fetch Initial Data (Like a Controller Index method)
    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('channel_id', channelId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data as Message[]);
        };
        fetchMessages();

        // 2. Realtime Subscription (The "Listener")
        const channel = supabase
            .channel(`chat:${channelId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMessage = payload.new as Message;

                    setMessages((prev) => {
                        const last = prev[prev.length - 1];
                        if (
                            last &&
                            last.sender_id === newMessage.sender_id &&
                            last.status === 'sending'
                        ) {
                            const updated = [...prev];
                            updated[updated.length - 1] = {
                                ...newMessage,
                                status: 'sent',
                            };
                            return updated;
                        }

                        if (prev.find((m) => m.id === newMessage.id))
                            return prev;
                        return [
                            ...prev,
                            {
                                ...newMessage,
                                status: 'sent',
                            },
                        ];
                    });
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [channelId, currentUserId]);

    // 3. Send Message (The "Store" method with Optimistic UI)
    const sendMessage = useCallback(
        async (content: any) => {
            const tempId = crypto.randomUUID();

            // A. Optimistic Update (Immediate Feedback)
            const optimisticMessage: Message = {
                id: tempId,
                content,
                sender_id: currentUserId,
                created_at: new Date().toISOString(),
                status: 'sending',
                type: 'text',
            };

            setMessages((prev) => [...prev, optimisticMessage]);

            // B. Actual Server Request
            const { error } = await supabase.from('messages').insert({
                content,
                sender_id: currentUserId,
                channel_id: channelId,
            });

            // C. Reconcile State
            if (error) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === tempId ? { ...m, status: 'error' } : m,
                    ),
                );
            }
        },
        [channelId, currentUserId],
    );

    return { messages, sendMessage };
}
