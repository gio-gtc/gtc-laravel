import type { AnyExtension } from '@tiptap/core';
import Emoji from '@tiptap/extension-emoji';
import Typography from '@tiptap/extension-typography';
import StarterKit from '@tiptap/starter-kit';

const baseClass =
    'prose prose-sm w-full max-w-none focus:outline-none min-h-[40px] overflow-y-auto text-gray-900';

export const chatEditorBaseExtensions: AnyExtension[] = [
    StarterKit,
    Typography,
    Emoji.configure({ enableEmoticons: true }),
];

const listStyles =
    '[&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5 [&_ul]:my-1 [&_ul_li]:list-item [&_ul_li]:min-h-[1.25em] [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-5 [&_ol]:my-1 [&_ol_li]:list-item [&_ol_li]:min-h-[1.25em] [&_li]:my-0.5';

const blockStyles =
    '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-700 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_h4]:text-sm [&_h4]:font-medium [&_h5]:text-xs [&_h5]:font-medium [&_h6]:text-xs [&_h6]:font-medium [&_hr]:my-2 [&_hr]:border-gray-200';

export const CHAT_EDITOR_CLASS = {
    input: `${baseClass} ${listStyles} ${blockStyles} max-h-[150px] px-3 pt-2 pb-10`,
    inline: `${baseClass} ${listStyles} ${blockStyles} max-h-[120px] px-3 py-2 rounded-xl border`,
} as const;

export interface ChatEditorKeyDownOptions {
    /** Called when Cmd+Enter or Ctrl+Enter is pressed (e.g. form.requestSubmit()). */
    onSubmit?: (view: unknown) => void;
    onEscape?: () => void;
}

export function createChatEditorKeyDown(
    options: ChatEditorKeyDownOptions,
): (view: unknown, event: KeyboardEvent) => boolean {
    const { onSubmit, onEscape } = options;
    return (view, event) => {
        if (event.key === 'Escape' && onEscape) {
            onEscape();
            return true;
        }
        if (event.key === 'Enter') {
            // Cmd+Enter (Mac) or Ctrl+Enter (Win/Linux) → submit
            if (event.metaKey || event.ctrlKey) {
                if (onSubmit) {
                    event.preventDefault();
                    onSubmit(view);
                    return true;
                }
            }
            // Enter → new block; Shift+Enter → new line in same block (TipTap handles both)
            return false;
        }
        return false;
    };
}
