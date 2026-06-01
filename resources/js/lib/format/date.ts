/** Short month + day for table cells (e.g. "Jun 15"). */
export function formatShortUsDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}
