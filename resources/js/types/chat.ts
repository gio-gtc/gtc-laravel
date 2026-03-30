// Think of this as your Eloquent Model
export type MessageKind = 'text' | 'system' | 'revision_request';

/** Stored in metadata for revision_request messages (client review modal). */
export interface RevisionRequestMetadata {
    tableName?: string;
    isci?: string;
}

export interface SendMessageOptions {
    message_type?: MessageKind;
    metadata?: Record<string, unknown>;
}

export interface Message {
    id: string; // UUID
    content: any; // JSON for Tiptap, or string
    sender_id: number; // Matches Laravel User ID
    created_at: string; // ISO String
    status: 'sending' | 'sent' | 'edited' | 'deleted' | 'error'; // Optimistic UI + DB states
    /** Matches Supabase column message_type; omit or 'text' for normal chat. */
    message_type?: MessageKind;
    /** JSON from Supabase; revision_request uses RevisionRequestMetadata shape. */
    metadata?: Record<string, unknown>;
}

// The shape of a User (mirrors Laravel User)
export interface User {
    id: number;
    name: string;
    avatar_url?: string;
}
