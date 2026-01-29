import { Button } from '@/components/ui/button';
import {
    CHAT_EDITOR_CLASS,
    chatEditorBaseExtensions,
    createChatEditorKeyDown,
} from '@/lib/chat-editor';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { Paperclip } from 'lucide-react';
import { useEffect, useRef } from 'react';

function hasMeaningfulContent(
    editor: { getText: () => string } | null,
): boolean {
    const text = editor?.getText()?.trim() ?? '';
    return text.length > 0;
}

interface ChatInputProps {
    onSend: (content: any) => void; // Accepts JSON or String
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            ...chatEditorBaseExtensions,
            Placeholder.configure({
                placeholder: 'Type a message...',
                emptyEditorClass:
                    'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:absolute before:pointer-events-none',
            }),
        ],
        editorProps: {
            attributes: {
                class: CHAT_EDITOR_CLASS.input,
            },
            handleKeyDown: createChatEditorKeyDown({
                onEnter: (view) => {
                    const form = (view as { dom: HTMLElement }).dom.closest(
                        'form',
                    );
                    if (form) form.requestSubmit();
                },
            }),
        },
    });

    const canSubmit = useEditorState({
        editor,
        selector: (ctx) => hasMeaningfulContent(ctx.editor),
        equalityFn: (a, b) => a === b,
    });

    // Reset editor when disabled state changes (e.g., after send)
    useEffect(() => {
        if (disabled && editor) {
            editor.commands.clearContent();
        }
    }, [disabled, editor]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editor || !hasMeaningfulContent(editor)) return;

        onSend(editor.getJSON());
        editor.commands.clearContent();
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            // Stub: extend later for real attachment handling
            e.target.value = '';
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 bg-transparent px-4 pt-3 pb-4"
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="relative rounded-xl bg-gray-50 shadow-sm transition-all focus-within:shadow-md">
                <EditorContent editor={editor} />

                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                        onClick={handleAttachClick}
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                        type="submit"
                        variant="ghost"
                        disabled={disabled || !canSubmit}
                        className="h-auto px-3 py-1 text-sm font-medium text-brand-gtc-red hover:bg-brand-gtc-red disabled:pointer-events-none disabled:opacity-50"
                    >
                        Send
                    </Button>
                </div>
            </div>
        </form>
    );
}
