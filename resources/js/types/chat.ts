// Think of this as your Eloquent Model
export interface Message {
    id: string; // UUID
    content: any; // JSON for Tiptap, or string
    sender_id: number; // Matches Laravel User ID
    created_at: string; // ISO String
    status: 'sending' | 'sent' | 'error'; // Optimistic UI states
    type: 'text' | 'system' | 'revision_request'; // Polymorphic types
}

// The shape of a User (mirrors Laravel User)
export interface User {
    id: number;
    name: string;
    avatar_url?: string;
}
