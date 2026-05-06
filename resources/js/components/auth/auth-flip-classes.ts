/** Shared Tailwind classes for auth flip cards (video layout). */

export const authFlipInputClass =
    'border-white/25 !text-white focus-visible:border-white/40 focus-visible:ring-white/20';

/** Full-height panel inside the flip face (signup). No backdrop-filter: breaks 3D backface culling. */
export const authFlipSignupCardClass =
    'flex flex-col rounded-2xl border border-white/20 bg-black/45 px-6 py-8 shadow-2xl [-webkit-backface-visibility:hidden] [backface-visibility:hidden]';

/** Intrinsic-height panel; parent wraps with flex center (login). */
export const authFlipLoginCardClass =
    'flex h-auto w-full shrink-0 flex-col rounded-2xl border border-white/20 bg-black/45 px-6 py-8 shadow-2xl [-webkit-backface-visibility:hidden] [backface-visibility:hidden]';

export const authFlipFaceShellClass =
    'absolute inset-0 [-webkit-backface-visibility:hidden] [backface-visibility:hidden]';

export const authFlipLinkButtonClass =
    'font-inherit text-left cursor-pointer border-0 bg-transparent p-0 text-sm text-white/90 underline decoration-white/50 decoration-from-font underline-offset-4 hover:text-white hover:decoration-white';
