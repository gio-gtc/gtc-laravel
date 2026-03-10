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
import { UserAvatar } from '@/components/ui/user-avatar';
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
                        onClick={onAdd ?? undefined}
                    >
                        <Plus className="size-3" />
                    </Button>
                </div>

                {/* Table */}
                <CollapsibleContent>
                    <div className="rounded-lg border">
                        <Table compactRows>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="xs-gray-500-weight-600 text-center">
                                        Description
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 text-center">
                                        W
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 text-center">
                                        H
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 text-center">
                                        CTA
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 text-center">
                                        Due Date
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 text-center">
                                        Assigned
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 text-center">
                                        Notes
                                    </TableHead>
                                    <TableHead className="xs-gray-500-weight-600 text-center">
                                        Download
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length > 0 ? (
                                    data.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="xs-gray-500-weight-600"
                                        >
                                            <TableCell>
                                                {row.description}
                                            </TableCell>
                                            <TableCell>{row.width}</TableCell>
                                            <TableCell>{row.height}</TableCell>
                                            <TableCell>{row.cta}</TableCell>
                                            <TableCell>{row.dueDate}</TableCell>
                                            <TableCell>
                                                {row.assigned && (
                                                    <UserAvatar
                                                        user={row.assigned}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-[20px] cursor-pointer rounded-full border-2 border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white"
                                                    onClick={() => {}}
                                                >
                                                    <Plus
                                                        className="size-[16px]"
                                                        strokeWidth={3}
                                                    />
                                                </Button>
                                            </TableCell>

                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-[18px] cursor-pointer rounded-full text-gray-400 hover:border-gray-400"
                                                    onClick={() => {}}
                                                >
                                                    <Paperclip className="size-[14px]" />
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
