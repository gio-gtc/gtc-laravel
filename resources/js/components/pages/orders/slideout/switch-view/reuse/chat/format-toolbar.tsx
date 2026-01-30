import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
    Bold,
    Code,
    HelpCircle,
    Italic,
    List,
    ListOrdered,
    Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SHORTCUTS = [
    { label: 'Bold', keys: 'Ctrl+B' },
    { label: 'Italic', keys: 'Ctrl+I' },
    { label: 'Code', keys: 'Ctrl+E' },
    { label: 'Bullet list', keys: 'Ctrl+Shift+8' },
    { label: 'Numbered list', keys: 'Ctrl+Shift+7' },
] as const;

interface FormatToolbarProps {
    editor: Editor | null;
    visible: boolean;
    onToggleVisible: () => void;
}

export default function FormatToolbar({
    editor,
    visible,
    onToggleVisible,
}: FormatToolbarProps) {
    const isBold = useEditorState({
        editor,
        selector: (ctx) => (ctx.editor ? ctx.editor.isActive('bold') : false),
        equalityFn: (a, b) => a === b,
    });
    const isItalic = useEditorState({
        editor,
        selector: (ctx) => (ctx.editor ? ctx.editor.isActive('italic') : false),
        equalityFn: (a, b) => a === b,
    });
    const isCode = useEditorState({
        editor,
        selector: (ctx) => (ctx.editor ? ctx.editor.isActive('code') : false),
        equalityFn: (a, b) => a === b,
    });
    const isBulletList = useEditorState({
        editor,
        selector: (ctx) => (ctx.editor ? ctx.editor.isActive('bulletList') : false),
        equalityFn: (a, b) => a === b,
    });
    const isOrderedList = useEditorState({
        editor,
        selector: (ctx) => (ctx.editor ? ctx.editor.isActive('orderedList') : false),
        equalityFn: (a, b) => a === b,
    });

    return (
        <div className="flex items-center gap-0.5 border-b border-gray-200/80 bg-gray-50/80 px-1 py-1">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                    'size-7 shrink-0',
                    visible
                        ? 'text-gray-600 hover:bg-gray-200'
                        : 'text-gray-500 hover:bg-gray-200',
                )}
                onClick={onToggleVisible}
                title={visible ? 'Hide formatting' : 'Show formatting'}
                aria-label={visible ? 'Hide formatting' : 'Show formatting'}
            >
                <Type className="size-3.5" />
            </Button>

            {visible && editor && (
                <>
                    <div className="mx-0.5 h-4 w-px bg-gray-200" aria-hidden />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'size-7 shrink-0',
                            isBold && 'bg-gray-200 text-gray-900',
                        )}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        title="Bold (Ctrl+B)"
                        aria-pressed={isBold}
                    >
                        <Bold className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'size-7 shrink-0',
                            isItalic && 'bg-gray-200 text-gray-900',
                        )}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        title="Italic (Ctrl+I)"
                        aria-pressed={isItalic}
                    >
                        <Italic className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'size-7 shrink-0',
                            isCode && 'bg-gray-200 text-gray-900',
                        )}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        title="Code (Ctrl+E)"
                        aria-pressed={isCode}
                    >
                        <Code className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'size-7 shrink-0',
                            isBulletList && 'bg-gray-200 text-gray-900',
                        )}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="Bullet list (Ctrl+Shift+8)"
                        aria-pressed={isBulletList}
                    >
                        <List className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'size-7 shrink-0',
                            isOrderedList && 'bg-gray-200 text-gray-900',
                        )}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        title="Numbered list (Ctrl+Shift+7)"
                        aria-pressed={isOrderedList}
                    >
                        <ListOrdered className="size-3.5" />
                    </Button>
                    <div className="mx-0.5 h-4 w-px bg-gray-200" aria-hidden />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 shrink-0 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                title="Formatting shortcuts"
                                aria-label="Formatting shortcuts"
                            >
                                <HelpCircle className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <div className="px-2 py-2">
                                <p className="mb-2 text-xs font-medium text-gray-500">
                                    Keyboard shortcuts
                                </p>
                                <ul className="space-y-1.5 text-sm">
                                    {SHORTCUTS.map(({ label, keys }) => (
                                        <li
                                            key={label}
                                            className="flex justify-between gap-4 text-gray-700"
                                        >
                                            <span>{label}</span>
                                            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
                                                {keys}
                                            </kbd>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}
        </div>
    );
}
