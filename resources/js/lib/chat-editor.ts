import type { AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const baseClass =
    'prose prose-sm w-full max-w-none focus:outline-none min-h-[40px] overflow-y-auto text-gray-900';

export const chatEditorBaseExtensions: AnyExtension[] = [StarterKit];

const listStyles =
    '[&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5 [&_ul]:my-1 [&_ul_li]:list-item [&_ul_li]:min-h-[1.25em] [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-5 [&_ol]:my-1 [&_ol_li]:list-item [&_ol_li]:min-h-[1.25em] [&_li]:my-0.5';

export const CHAT_EDITOR_CLASS = {
    input: `${baseClass} ${listStyles} max-h-[150px] px-3 pt-2 pb-10`,
    inline: `${baseClass} ${listStyles} max-h-[120px] px-3 py-2 rounded-xl border`,
} as const;

export interface ChatEditorKeyDownOptions {
    /** Called when Enter is pressed (without Shift). Receives the editor view (e.g. for form.requestSubmit()). */
    onEnter?: (view: unknown) => void;
    onEscape?: () => void;
    /** When provided, Enter only triggers onEnter when this returns true (e.g. when not in a list). When false, TipTap handles Enter (e.g. new list item). */
    submitOnEnterWhen?: (view: unknown) => boolean;
}

export function createChatEditorKeyDown(
    options: ChatEditorKeyDownOptions,
): (view: unknown, event: KeyboardEvent) => boolean {
    const { onEnter, onEscape, submitOnEnterWhen } = options;
    return (view, event) => {
        if (event.key === 'Escape' && onEscape) {
            onEscape();
            return true;
        }
        if (event.key === 'Enter' && !event.shiftKey && onEnter) {
            if (submitOnEnterWhen && !submitOnEnterWhen(view)) {
                return false;
            }
            event.preventDefault();
            onEnter(view);
            return true;
        }
        return false;
    };
}
