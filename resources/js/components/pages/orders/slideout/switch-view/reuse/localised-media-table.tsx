import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import type { LocalizedArtTableProps } from '@/types';
import { ChevronDown, ChevronRight, Paperclip, Plus } from 'lucide-react';
import { useState } from 'react';

export default function LocalizedArtTable({
    title,
    data,
    defaultOpen = true,
    onAdd,
}: LocalizedArtTableProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const getInitials = useInitials();

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="space-y-2">
                {/* Collapsible Header */}
                <div className="flex items-center gap-2">
                    <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 text-left hover:opacity-80">
                            {isOpen ? (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                            )}
                            <span className="font-semibold text-gray-700">
                                {title}
                            </span>
                        </button>
                    </CollapsibleTrigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-4.5 cursor-pointer rounded-full border border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
                        onClick={
                            onAdd || (() => console.log('Add button clicked'))
                        }
                    >
                        <Plus className="size-3" />
                    </Button>
                </div>

                {/* Table */}
                <CollapsibleContent>
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="h-9 px-3 font-semibold text-gray-700">
                                        Description
                                    </TableHead>
                                    <TableHead className="h-9 px-3 font-semibold text-gray-700">
                                        W
                                    </TableHead>
                                    <TableHead className="h-9 px-3 font-semibold text-gray-700">
                                        H
                                    </TableHead>
                                    <TableHead className="h-9 px-3 font-semibold text-gray-700">
                                        CTA
                                    </TableHead>
                                    <TableHead className="h-9 px-3 font-semibold text-gray-700">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="h-9 px-3 font-semibold text-gray-700">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="h-9 px-3 font-semibold text-gray-700">
                                        Notes
                                    </TableHead>
                                    <TableHead className="h-9 px-3 font-semibold text-gray-700">
                                        Download
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length > 0 ? (
                                    data.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                {row.description}
                                            </TableCell>
                                            <TableCell>{row.width}</TableCell>
                                            <TableCell>{row.height}</TableCell>
                                            <TableCell>{row.cta}</TableCell>
                                            <TableCell>{row.dueDate}</TableCell>
                                            <TableCell>
                                                {row.assigned ? (
                                                    <Avatar className="size-6 overflow-hidden rounded-full">
                                                        <AvatarImage
                                                            src={
                                                                row.assigned
                                                                    .avatar ||
                                                                undefined
                                                            }
                                                            alt={
                                                                row.assigned
                                                                    .name
                                                            }
                                                        />
                                                        <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                            {getInitials(
                                                                row.assigned
                                                                    .name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-5 cursor-pointer rounded-full border border-gray-300 text-gray-400 hover:border-gray-400"
                                                    onClick={() =>
                                                        console.log(
                                                            'Notes clicked',
                                                            row.id,
                                                        )
                                                    }
                                                >
                                                    <Plus className="size-3.5" />
                                                </Button>
                                            </TableCell>

                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-5 cursor-pointer rounded-full text-gray-400 hover:border-gray-400"
                                                    onClick={() =>
                                                        console.log(
                                                            'Download clicked',
                                                            row.id,
                                                        )
                                                    }
                                                >
                                                    <Paperclip className="size-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="h-24 text-center"
                                        >
                                            No data available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
