import { Message } from '@/types/chat';
import {
    differenceInMinutes,
    format,
    formatDistanceToNow,
    isToday,
    isYesterday,
} from 'date-fns';

/** Recursively extract plain text from a TipTap node (paragraph, listItem, bulletList, etc.). */
function nodeToText(node: any): string {
    if (!node) return '';
    if (node.type === 'text' && node.text) return node.text;
    if (node.type === 'hardBreak') return '\n';
    const children = node.content ?? [];
    if (node.type === 'bulletList' || node.type === 'orderedList') {
        return children.map((child: any) => nodeToText(child)).join('\n');
    }
    if (node.type === 'listItem') {
        return children.map((child: any) => nodeToText(child)).join('');
    }
    if (
        node.type === 'paragraph' ||
        node.type === 'heading' ||
        node.type === 'codeBlock'
    ) {
        return children.map((child: any) => nodeToText(child)).join('');
    }
    return children.map((child: any) => nodeToText(child)).join('');
}

/** Build minimal TipTap JSON (one paragraph) for `sendMessage` / Supabase `content`. */
export function plainTextToChatDoc(text: string) {
    return {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
                content: [{ type: 'text', text }],
            },
        ],
    };
}

/** TipTap JSON doc or string → plain text for display. */
export function messageContentToText(content: any): string {
    if (typeof content === 'string') return content;
    if (content?.type === 'doc') {
        const blocks = content.content ?? [];
        const parts: string[] = [];
        blocks.forEach((block: any, blockIndex: number) => {
            parts.push(nodeToText(block));
            if (blockIndex < blocks.length - 1) parts.push('\n');
        });
        const result = parts.join('').trim();
        const out = result === '' ? '(Empty)' : result;
        return out;
    }
    return 'Unsupported content';
}

/** Format message timestamp: "Just now", "5 min ago", "Today 2:30 pm", etc. */
export function formatMessageTimestamp(date: Date): string {
    const now = new Date();
    const minutesDiff = differenceInMinutes(now, date);

    if (minutesDiff < 1) return 'Just now';
    if (minutesDiff < 60) return formatDistanceToNow(date, { addSuffix: true });
    if (isToday(date)) return `Today ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
    return format(date, 'EEEE h:mm a');
}

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
