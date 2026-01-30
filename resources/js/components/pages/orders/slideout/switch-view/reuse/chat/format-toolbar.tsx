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

type Chain = ReturnType<Editor['chain']>;

export default function FormatToolbar({ editor, visible }: FormatToolbarProps) {
    if (!editor) return;
    const runChain = (fn: (c: Chain) => Chain) => () =>
        fn(editor.chain().focus()).run();

    return (
        <Collapsible open={visible}>
            <CollapsibleContent
                className="grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-200 ease-out data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=open]:grid-rows-[1fr]"
                forceMount
            >
                <div className="flex min-h-0 items-center gap-0.5 border-b border-gray-200/80 bg-gray-50/80 px-1 py-1">
                    <RichTextButton
                        title="Bold (Ctrl+B)"
                        editor={editor}
                        activeName={'bold'}
                        run={runChain((c) => c.toggleBold())}
                        icon={Bold}
                    />

                    <RichTextButton
                        title="Italic (Ctrl+I)"
                        editor={editor}
                        activeName={'italic'}
                        run={runChain((c) => c.toggleItalic())}
                        icon={Italic}
                    />

                    <RichTextButton
                        title="Code (Ctrl+E)"
                        editor={editor}
                        activeName={'code'}
                        run={runChain((c) => c.toggleCode())}
                        icon={Code}
                    />

                    <RichTextButton
                        title="Bullet list (Ctrl+Shift+8)"
                        editor={editor}
                        activeName={'bulletList'}
                        run={runChain((c) => c.toggleBulletList())}
                        icon={List}
                    />

                    <RichTextButton
                        title="Numbered list (Ctrl+Shift+7)"
                        editor={editor}
                        activeName={'orderedList'}
                        run={runChain((c) => c.toggleOrderedList())}
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
    editor,
    run,
    icon: Icon,
    activeName,
}: {
    title: string;
    editor: Editor | null;
    activeName: string;
    run: () => boolean;
    icon: LucideIcon;
}) {
    const isActive = useEditorState({
        editor,
        selector: (ctx) =>
            ctx.editor ? ctx.editor.isActive(activeName) : false,
        equalityFn: (a, b) => a === b,
    });

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                'size-7 shrink-0',
                isActive && 'bg-gray-200 text-gray-900',
            )}
            onClick={run}
            title={title}
        >
            <Icon className="size-3.5" />
        </Button>
    );
}
