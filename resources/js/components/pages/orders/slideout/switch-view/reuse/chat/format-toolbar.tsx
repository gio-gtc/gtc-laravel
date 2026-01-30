import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
    Bold,
    CheckSquare,
    HelpCircle,
    Italic,
    Link,
    List,
    ListOrdered,
    type LucideIcon,
    Minus,
    Quote,
    Strikethrough,
    Underline,
    Unlink,
} from 'lucide-react';

const SHORTCUTS = [
    // TODO: Test all het keys to see if they evebn work
    { label: 'Send message', keys: 'Cmd+Enter (Ctrl+Enter)' },
    { label: 'New line (same block)', keys: 'Shift+Enter' },
    { label: 'New block', keys: 'Enter' },
    { label: 'Bold', keys: 'Cmd+B' },
    { label: 'Italic', keys: 'Cmd+I' },
    { label: 'Strikethrough', keys: 'Cmd+Shift+S' },
    { label: 'Underline', keys: 'Cmd+U' },
    { label: 'Bullet list', keys: 'Cmd+Shift+8' },
    { label: 'Numbered list', keys: 'Cmd+Shift+7' },
    { label: 'Task list', keys: 'Cmd+Shift+9' },
    { label: 'Blockquote', keys: 'Cmd+Shift+B' },
] as const;

const HEADING_OPTIONS = [
    { label: 'Paragraph', level: null as number | null },
    { label: 'Heading 1', level: 1 },
    { label: 'Heading 2', level: 2 },
    { label: 'Heading 3', level: 3 },
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
                    <HeadingDropdown editor={editor} />

                    <RichTextButton
                        title="Bold (Cmd+B)"
                        editor={editor}
                        activeName={'bold'}
                        run={runChain((c) => c.toggleBold())}
                        icon={Bold}
                    />

                    <RichTextButton
                        title="Italic (Cmd+I)"
                        editor={editor}
                        activeName={'italic'}
                        run={runChain((c) => c.toggleItalic())}
                        icon={Italic}
                    />

                    <RichTextButton
                        title="Strikethrough (Cmd+Shift+S)"
                        editor={editor}
                        activeName={'strike'}
                        run={runChain((c) => c.toggleStrike())}
                        icon={Strikethrough}
                    />

                    <RichTextButton
                        title="Underline (Cmd+U)"
                        editor={editor}
                        activeName={'underline'}
                        run={runChain((c) => c.toggleUnderline())}
                        icon={Underline}
                    />

                    <RichTextButton
                        title="Task list (Cmd+Shift+9)"
                        editor={editor}
                        activeName={'taskList'}
                        run={runChain((c) => c.toggleTaskList())}
                        icon={CheckSquare}
                    />

                    <RichTextButton
                        title="Numbered list (Cmd+Shift+7)"
                        editor={editor}
                        activeName={'orderedList'}
                        run={runChain((c) => c.toggleOrderedList())}
                        icon={ListOrdered}
                    />

                    <RichTextButton
                        title="Bullet list (Cmd+Shift+8)"
                        editor={editor}
                        activeName={'bulletList'}
                        run={runChain((c) => c.toggleBulletList())}
                        icon={List}
                    />

                    <RichTextButton
                        title="Blockquote (Cmd+Shift+B)"
                        editor={editor}
                        activeName={'blockquote'}
                        run={runChain((c) => c.toggleBlockquote())}
                        icon={Quote}
                    />

                    <RichTextButton
                        title="Horizontal rule"
                        editor={editor}
                        activeName={'horizontalRule'}
                        run={runChain((c) => c.setHorizontalRule())}
                        icon={Minus}
                    />

                    <LinkButton editor={editor} runChain={runChain} />

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

function HeadingDropdown({ editor }: { editor: Editor }) {
    const currentBlock = useEditorState({
        editor,
        selector: (ctx) => {
            if (!ctx.editor) return { label: 'Paragraph', level: null };
            for (let level = 3; level >= 1; level--) {
                if (ctx.editor.isActive('heading', { level }))
                    return {
                        label: `Heading ${level}`,
                        level,
                    };
            }
            return { label: 'Paragraph', level: null };
        },
        equalityFn: (a, b) =>
            a.label === (b?.label ?? null) && a.level === (b?.level ?? null),
    });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 min-w-0 px-2 text-xs text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    title="Block type"
                >
                    {currentBlock.label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {HEADING_OPTIONS.map(({ label, level }) => (
                    <DropdownMenuItem
                        key={label}
                        onSelect={() => {
                            if (level === null) {
                                editor.chain().focus().setParagraph().run();
                            } else {
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({
                                        level: level as 1 | 2 | 3 | 4 | 5 | 6,
                                    })
                                    .run();
                            }
                        }}
                    >
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function LinkButton({
    editor,
    runChain,
}: {
    editor: Editor;
    runChain: (fn: (c: Chain) => Chain) => () => boolean;
}) {
    const isLink = useEditorState({
        editor,
        selector: (ctx) => (ctx.editor ? ctx.editor.isActive('link') : false),
        equalityFn: (a, b) => a === b,
    });

    if (isLink) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                title="Remove link"
                onClick={() => runChain((c) => c.unsetLink())()}
            >
                <Unlink className="size-3.5" />
            </Button>
        );
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            title="Add link"
            onClick={() => {
                const url =
                    window.prompt('Enter URL:', 'https://')?.trim() || '';
                if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                }
            }}
        >
            <Link className="size-3.5" />
        </Button>
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
