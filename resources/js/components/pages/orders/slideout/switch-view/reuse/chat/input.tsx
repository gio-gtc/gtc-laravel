import { Button } from '@/components/ui/button';
import {
    CHAT_EDITOR_CLASS,
    chatEditorBaseExtensions,
    createChatEditorKeyDown,
} from '@/lib/chat-editor';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { Paperclip, Type } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FormatToolbar from './format-toolbar';

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
    const [toolbarOpen, setToolbarOpen] = useState(false);

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
                submitOnEnterWhen: (view) => {
                    const state = (
                        view as {
                            state: {
                                selection: {
                                    $from: {
                                        depth: number;
                                        node: (d: number) => {
                                            type: { name: string };
                                        };
                                    };
                                };
                            };
                        }
                    )?.state;
                    if (!state) return true;
                    const $from = state.selection.$from;
                    for (let d = $from.depth; d > 0; d--) {
                        const name = $from.node(d).type.name;
                        if (name === 'bulletList' || name === 'orderedList')
                            return false;
                    }
                    return true;
                },
            }),
        },
    });

    const canSubmit = useEditorState({
        editor,
        selector: (ctx) => hasMeaningfulContent(ctx.editor),
        equalityFn: (a, b) => a === b,
    });

    const isBulletList = useEditorState({
        editor,
        selector: (ctx) =>
            ctx.editor ? ctx.editor.isActive('bulletList') : false,
        equalityFn: (a, b) => a === b,
    });
    const isOrderedList = useEditorState({
        editor,
        selector: (ctx) =>
            ctx.editor ? ctx.editor.isActive('orderedList') : false,
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
                <FormatToolbar editor={editor} visible={toolbarOpen} />
                {(isBulletList || isOrderedList) && (
                    <div className="border-b border-gray-200/60 px-2 py-1.5 text-xs text-gray-500">
                        {isOrderedList ? 'Numbered list' : 'Bullet list'}
                    </div>
                )}
                <EditorContent editor={editor} className="pt-0 pb-7" />

                <div className="absolute right-1 bottom-1 flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0 text-gray-500 hover:bg-gray-500/80"
                        onClick={() => setToolbarOpen((v) => !v)}
                        title={
                            toolbarOpen ? 'Hide formatting' : 'Show formatting'
                        }
                    >
                        <Type className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-gray-500 hover:bg-gray-500/80"
                        onClick={handleAttachClick}
                    >
                        <Paperclip className="size-3.5" />
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
