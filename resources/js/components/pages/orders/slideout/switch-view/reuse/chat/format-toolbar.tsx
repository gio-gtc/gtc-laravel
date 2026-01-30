import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
    Bold,
    Code,
    HelpCircle,
    Italic,
    List,
    ListOrdered,
    type LucideIcon,
} from 'lucide-react';

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
}

export default function FormatToolbar({ editor, visible }: FormatToolbarProps) {
    if (!editor) return;
    const focus = editor.chain().focus();
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

    return (
        <Collapsible open={visible}>
            <CollapsibleContent
                className="grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-200 ease-out data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=open]:grid-rows-[1fr]"
                forceMount
            >
                <div className="flex min-h-0 items-center gap-0.5 border-b border-gray-200/80 bg-gray-50/80 px-1 py-1">
                    <RichTextButton
                        title="Bold (Ctrl+B)"
                        active={isBold}
                        run={focus.toggleBold().run}
                        icon={Bold}
                    />

                    <RichTextButton
                        title="Italic (Ctrl+I)"
                        active={isItalic}
                        run={focus.toggleItalic().run}
                        icon={Italic}
                    />

                    <RichTextButton
                        title="Code (Ctrl+E)"
                        active={isCode}
                        run={focus.toggleCode().run}
                        icon={Code}
                    />

                    <RichTextButton
                        title="Bullet list (Ctrl+Shift+8)"
                        active={isBulletList}
                        run={focus.toggleBulletList().run}
                        icon={List}
                    />

                    <RichTextButton
                        title="Numbered list (Ctrl+Shift+7)"
                        active={isOrderedList}
                        run={focus.toggleOrderedList().run}
                        icon={ListOrdered}
                    />

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
                                <p className="mb-2 text-xs font-medium text-gray-400">
                                    Keyboard shortcuts
                                </p>
                                <ul className="space-y-1.5 text-sm">
                                    {SHORTCUTS.map(({ label, keys }) => (
                                        <li
                                            key={label}
                                            className="flex justify-between gap-4 text-gray-200"
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
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

function RichTextButton({
    title,
    active,
    run,
    icon: Icon,
}: {
    title: string;
    active: boolean | null;
    run: () => boolean;
    icon: LucideIcon;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                'size-7 shrink-0',
                active && 'bg-gray-200 text-gray-900',
            )}
            onClick={() => run()}
            title={title}
        >
            <Icon className="size-3.5" />
        </Button>
    );
}
