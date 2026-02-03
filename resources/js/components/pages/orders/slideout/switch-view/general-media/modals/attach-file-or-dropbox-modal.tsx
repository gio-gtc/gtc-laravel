import { DropBox } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { CloudUpload } from 'lucide-react';
import { useRef, useState } from 'react';
import OrderModalLayout from './order-modal-layout';
import { orderModalStyles } from './shared';

const ACCEPT_TYPES = '.svg,.png,.jpg,.jpeg,.tiff,.tif';

export interface AttachFileModalContext {
    rowId: string | number;
    isci: string;
}

interface AttachFileOrDropboxModalProps {
    isOpen: boolean;
    onClose: () => void;
    context?: AttachFileModalContext | null;
}

export default function AttachFileOrDropboxModal({
    isOpen,
    onClose,
    context,
}: AttachFileOrDropboxModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dropboxUrl, setDropboxUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleAddToOrder = () => {
        onClose();
    };

    const handleDropZoneClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = () => {
        // No upload logic yet; just allow selection for UI
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        // No upload logic yet
    };

    return (
        <OrderModalLayout
            isOpen={isOpen}
            onClose={onClose}
            title="Attach File or Dropbox Link"
            primaryLabel="Add to Order"
            onPrimaryClick={handleAddToOrder}
            maxWidth="2xl"
        >
            <div className="flex flex-col gap-4">
                {/* Drop zone */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_TYPES}
                    className="hidden"
                    onChange={handleFileChange}
                />
                <button
                    type="button"
                    onClick={handleDropZoneClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed py-8 transition-colors ${
                        isDragging
                            ? 'border-brand-gtc-red bg-brand-gtc-red/5'
                            : 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                >
                    <CloudUpload className="h-10 w-10 text-gray-400" />
                    <span>
                        <span className="font-medium text-brand-gtc-red">
                            Click to upload
                        </span>
                        <span className="text-gray-600"> or drag and drop</span>
                    </span>
                    <span className={`text-xs ${orderModalStyles.helper}`}>
                        SVG, PNG, JPG or TIFF
                    </span>
                </button>

                {/* Dropbox link input */}
                <div className="relative">
                    <div className="pointer-events-none absolute top-1/2 left-3 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-gray-500">
                        <DropBox className="h-4 w-4" />
                    </div>
                    <Input
                        type="url"
                        placeholder="https://www.dropbox.com/"
                        value={dropboxUrl}
                        onChange={(e) => setDropboxUrl(e.target.value)}
                        className="pl-9 text-xs"
                    />
                </div>
            </div>
        </OrderModalLayout>
    );
}
