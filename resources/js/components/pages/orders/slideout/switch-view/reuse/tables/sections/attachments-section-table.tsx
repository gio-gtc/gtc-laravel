import { Button } from '@/components/ui/button';
import { DOCIcon, MP4Icon, PDFIcon } from '@/components/ui/icons';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Download, Trash2 } from 'lucide-react';

type AttachmentFileType = 'video' | 'pdf' | 'doc' | 'other';

interface AttachmentRow {
    id: number;
    name: string;
    size: string;
    uploadedBy: string;
    type: AttachmentFileType;
}

const mockAttachments: AttachmentRow[] = [
    {
        id: 1,
        name: 'Audio for AAAAAA.mp4',
        size: '16 MB',
        uploadedBy: 'Billy Bob Thorton',
        type: 'video',
    },
    {
        id: 2,
        name: 'Audio for BBBBBBBBBB.mp4',
        size: '14 MB',
        uploadedBy: 'Billy Bob Thorton',
        type: 'video',
    },
    {
        id: 3,
        name: 'Style Guide For Static Assets.pdf',
        size: '28 MB',
        uploadedBy: 'Billy Bob Thorton',
        type: 'pdf',
    },
    {
        id: 4,
        name: 'Script for Voice Over.docx',
        size: '2 MB',
        uploadedBy: 'Billy Bob Thorton',
        type: 'doc',
    },
    {
        id: 5,
        name: 'Sample Track for Advert.mp4',
        size: '12 MB',
        uploadedBy: 'Billy Bob Thorton',
        type: 'video',
    },
];

function getFileIcon(type: AttachmentFileType) {
    const baseClasses = 'size-[20px] mr-[20px]';
    switch (type) {
        case 'video':
            return (
                <MP4Icon
                    className={cn('text-blue-600', baseClasses)}
                    tagStyles="text-blue-600"
                />
            );
        case 'pdf':
            return (
                <PDFIcon
                    className={cn('text-red-500', baseClasses)}
                    tagStyles="text-red-500"
                />
            );
        case 'doc':
            return (
                <DOCIcon
                    className={cn('text-blue-600', baseClasses)}
                    tagStyles="text-blue-600"
                />
            );
        default:
            return <DOCIcon className={cn('text-gray-500', baseClasses)} />;
    }
}

export default function AttachmentsSection() {
    function handleDownload(_file: AttachmentRow) {
        /* TODO: wire to download handler */
    }

    function handleDelete(_file: AttachmentRow) {
        /* TODO: wire to delete handler */
    }

    return (
        <Table
            layout="dash"
            compactRows
            className="w-full min-w-[825px] table-fixed overflow-x-auto"
        >
            <colgroup>
                <col className="w-[52%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[28%]" />
            </colgroup>
            <TableBody>
                {mockAttachments.map((file) => (
                    <TableRow key={file.id}>
                        <TableCell className="xs-gray-700-weight-500 flex items-center">
                            {getFileIcon(file.type)}
                            <span className="max-w-[90%] truncate">
                                {file.name}
                            </span>
                        </TableCell>
                        <TableCell className="xs-gray-600-weight-400 max-w-[8%] text-center">
                            {file.size}
                        </TableCell>
                        <TableCell className="xs-gray-500-weight-500 max-w-[12%] text-center">
                            <button
                                type="button"
                                className="items-centertext-sm inline-flex cursor-pointer font-medium text-muted-foreground hover:text-sky-600"
                                onClick={() => handleDownload(file)}
                            >
                                Download
                                <Download className="ml-[10px] size-[16px]" />
                            </button>
                        </TableCell>
                        <TableCell className="xs-gray-500-weight-400 max-w-[28%] px-2">
                            <div className="flex items-center justify-between">
                                <span className="mr-[5px] truncate italic">
                                    Uploaded By: {file.uploadedBy}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 hover:text-red-600 has-[>svg]:px-0"
                                    aria-label={`Delete ${file.name}`}
                                    onClick={() => handleDelete(file)}
                                >
                                    <Trash2 className="size-[12px]" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
