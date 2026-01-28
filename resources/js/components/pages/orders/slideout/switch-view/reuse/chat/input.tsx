import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface ChatInputProps {
    onSend: (content: any) => void; // Accepts JSON or String
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Type a message...',
                emptyEditorClass:
                    'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none',
            }),
        ],
        editorProps: {
            // Tailwind classes for the editor area
            attributes: {
                class: 'prose prose-sm w-full max-w-none focus:outline-none min-h-[40px] max-h-[150px] overflow-y-auto px-3 py-2 text-gray-900',
            },
            // Handle "Enter" to send
            handleKeyDown: (view, event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    // We need a slight delay or external trigger to avoid race conditions usually,
                    // but calling a handler directly works well here.
                    const form = view.dom.closest('form');
                    if (form) form.requestSubmit();
                    return true;
                }
                return false;
            },
        },
    });

    // Reset editor when disabled state changes (e.g., after send)
    useEffect(() => {
        if (!disabled && editor) {
            editor.commands.focus();
        }
        if (disabled && editor) {
            editor.commands.clearContent();
        }
    }, [disabled, editor]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editor || editor.isEmpty) return;

        // Send the JSON content (Rich Text)
        onSend(editor.getJSON());

        editor.commands.clearContent();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t bg-white p-4"
        >
            <div className="flex-1 rounded-lg border bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
                <EditorContent editor={editor} />
            </div>

            <button
                type="submit"
                disabled={disabled || editor?.isEmpty}
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
                Send
            </button>
        </form>
    );
}
