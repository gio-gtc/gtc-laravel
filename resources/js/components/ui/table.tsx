import * as React from 'react';

import { cn } from '@/lib/utils';

const table_layouts = {
    boxed: '[&_td:not(:last-child)]:border-r [&_th:not(:last-child)]:border-r',
    dash: cn(
        // TODO: Fix last column (5px to low)
        // 1. Setup the parent cells (relative positioning is required)
        '[&_td]:relative [&_th:not(:last-child)]:relative',
        // 2. REQUIRED: Set content to empty string so the element actually renders
        "[&_td:not(:last-child)]:after:content-[''] [&_th:not(:last-child)]:after:content-['']",
        // 3. Position the line
        '[&_td:not(:last-child)]:after:absolute [&_th:not(:last-child)]:after:absolute',
        '[&_td:not(:last-child)]:after:right-0 [&_th:not(:last-child)]:after:right-0',
        '[&_td:not(:last-child)]:after:top-1/2 [&_th:not(:last-child)]:after:top-1/2',
        '[&_td:not(:last-child)]:after:-translate-y-1/2 [&_th:not(:last-child)]:after:-translate-y-1/2',
        // 4. Dimensions (#% height, 1px width)
        '[&_td:not(:last-child)]:after:h-[35%] [&_th:not(:last-child)]:after:h-[35%]',
        '[&_td:not(:last-child)]:after:w-[1px] [&_th:not(:last-child)]:after:w-[1px]',
        // 5. Coloring & Visibility
        '[&_td:not(:last-child)]:after:bg-border [&_th:not(:last-child)]:after:bg-border',
        // Ensure it sits above any row background colors
        '[&_td:not(:last-child)]:after:z-10 [&_th:not(:last-child)]:after:z-10',
    ),
    none: '',
};
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
    layout?: 'boxed' | 'dash' | 'none';
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
    ({ className, layout = 'boxed', ...props }, ref) => (
        <div className="relative w-full overflow-auto">
            <table
                ref={ref}
                className={cn(
                    'w-full caption-bottom text-sm',
                    table_layouts[layout],
                    className,
                )}
                {...props}
            />
        </div>
    ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
    />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
            className,
        )}
        {...props}
    />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
            className,
        )}
        {...props}
    />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            'h-6 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
            className,
        )}
        {...props}
    />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            'p-1 align-middle [&:has([role=checkbox])]:pr-0',
            className,
        )}
        {...props}
    />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn('mt-4 text-sm text-muted-foreground', className)}
        {...props}
    />
));
TableCaption.displayName = 'TableCaption';

export {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
};
