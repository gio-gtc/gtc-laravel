import { Message } from '@/types/chat';
import { format, isToday, isYesterday } from 'date-fns';

// Helper to group messages for the UI
export function groupMessagesByDate(messages: Message[]) {
    const groups: Record<string, Message[]> = {};

    messages.forEach((msg) => {
        const date = new Date(msg.created_at);
        let key = format(date, 'yyyy-MM-dd');

        // Human readable headers
        if (isToday(date)) key = 'Today';
        else if (isYesterday(date)) key = 'Yesterday';
        else key = format(date, 'MMMM d, yyyy');

        if (!groups[key]) groups[key] = [];
        groups[key].push(msg);
    });

    // Returns array: [['Today', [msgs]], ['Yesterday', [msgs]]]
    return Object.entries(groups);
}
