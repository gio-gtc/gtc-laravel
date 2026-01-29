import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
    onSend: (content: any) => void; // Accepts JSON or String
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Message',
                emptyEditorClass:
                    'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none',
            }),
        ],
        editorProps: {
            // Tailwind classes for the editor area
            attributes: {
                class: 'prose prose-sm w-full max-w-none focus:outline-none min-h-[40px] max-h-[150px] overflow-y-auto px-3 pt-2 pb-10 text-gray-900',
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

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Handle file attachment (for now just log, can be extended later)
            console.log('Files selected:', files);
            // Reset the input so the same file can be selected again
            e.target.value = '';
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 bg-transparent px-4 pt-3 pb-4"
        >
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Input box container */}
            <div className="relative rounded-xl bg-gray-50 shadow-sm transition-all focus-within:shadow-md">
                <EditorContent editor={editor} />

                {/* Bottom right icons: Paper clip and Send */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
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
                        disabled={disabled || editor?.isEmpty}
                        className="h-auto px-3 py-1 text-sm font-medium text-brand-gtc-red hover:bg-brand-gtc-red/10 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Send
                    </Button>
                </div>
            </div>
        </form>
    );
}
