import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Download, FileText, FileVideo, Trash2 } from 'lucide-react';

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
    switch (type) {
        case 'video':
            return <FileVideo className="size-3 text-sky-500" />;
        case 'pdf':
            return <FileText className="size-3 text-red-500" />;
        case 'doc':
            return <FileText className="size-3 text-blue-500" />;
        default:
            return <FileText className="size-3 text-gray-500" />;
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
        <Table layout="dash">
            <TableBody>
                {mockAttachments.map((file) => (
                    <TableRow key={file.id}>
                        <TableCell className="flex items-center gap-1 font-medium">
                            {getFileIcon(file.type)} {file.name}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                            {file.size}
                        </TableCell>
                        <TableCell className="text-center">
                            <button
                                type="button"
                                className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-muted-foreground hover:text-sky-600"
                                onClick={() => handleDownload(file)}
                            >
                                Download
                                <Download className="size-3" />
                            </button>
                        </TableCell>
                        <TableCell className="flex items-center gap-1 text-muted-foreground">
                            <span className="italic">
                                Uploaded By: {file.uploadedBy}
                            </span>
                            <button
                                type="button"
                                className="inline-flex cursor-pointer hover:text-red-600"
                                aria-label={`Delete ${file.name}`}
                                onClick={() => handleDelete(file)}
                            >
                                <Trash2 className="size-3" />
                            </button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
