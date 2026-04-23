import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { FileDescriptor } from '@/types/forms';
import { File as FileIcon, Upload, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

interface SingleProps {
    multiple?: false;
    value: FileDescriptor | null;
    onChange: (next: FileDescriptor | null) => void;
    uploadAction: string;
    scope: string;
    accept?: string;
    maxSizeMb?: number;
}

interface MultiProps {
    multiple: true;
    value: FileDescriptor[];
    onChange: (next: FileDescriptor[]) => void;
    uploadAction: string;
    scope: string;
    accept?: string;
    maxSizeMb?: number;
}

type FileUploaderProps = SingleProps | MultiProps;

interface UploadState {
    progress: number;
    error?: string;
    abort?: () => void;
}

/**
 * Uploads files to {@link \App\Http\Controllers\UploadController::store} and
 * stores the returned descriptor in form state. {@link ItemCatalogGuard}
 * verifies paths at submission time.
 */
export function FileUploader(props: FileUploaderProps) {
    const { uploadAction, scope, accept, maxSizeMb } = props;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [state, setState] = useState<UploadState>({ progress: 0 });

    const existingFiles = useMemo<FileDescriptor[]>(() => {
        if (props.multiple) return props.value ?? [];
        return props.value ? [props.value] : [];
    }, [props]);

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) return;
            const list = Array.from(files);
            if (!props.multiple && list.length > 1) {
                list.length = 1;
            }
            for (const file of list) {
                if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
                    setState({ progress: 0, error: `${file.name} exceeds ${maxSizeMb} MB` });
                    continue;
                }
                try {
                    const descriptor = await uploadOne(uploadAction, scope, file, (p) => setState({ progress: p }));
                    if (props.multiple) {
                        props.onChange([...(props.value ?? []), descriptor]);
                    } else {
                        props.onChange(descriptor);
                    }
                } catch (e) {
                    const msg = e instanceof Error ? e.message : 'Upload failed';
                    setState({ progress: 0, error: msg });
                }
            }
            setState({ progress: 0 });
        },
        [maxSizeMb, props, scope, uploadAction],
    );

    const removeFile = useCallback(
        (index: number) => {
            if (props.multiple) {
                props.onChange(props.value.filter((_, i) => i !== index));
            } else {
                props.onChange(null);
            }
        },
        [props],
    );

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                >
                    <Upload className="mr-1 h-4 w-4" /> Choose file{props.multiple ? 's' : ''}
                </Button>
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={props.multiple ?? false}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                {state.progress > 0 && state.progress < 100 ? (
                    <Progress className="h-2 w-40" value={state.progress} />
                ) : null}
            </div>

            {state.error ? <p className="text-destructive text-xs">{state.error}</p> : null}

            {existingFiles.length > 0 ? (
                <ul className="space-y-1">
                    {existingFiles.map((fd, idx) => (
                        <li
                            key={fd.path + idx}
                            className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1 text-sm"
                        >
                            <FileIcon className="h-4 w-4" />
                            <span className="flex-1 truncate">{fd.name ?? fd.path}</span>
                            <span className="text-muted-foreground text-xs">
                                {Math.ceil(fd.size / 1024)} KB
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(idx)}
                                aria-label="Remove file"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}

function uploadOne(
    action: string,
    scope: string,
    file: File,
    onProgress: (p: number) => void,
): Promise<FileDescriptor> {
    return new Promise<FileDescriptor>((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('scope', scope);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', action);
        const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
        if (meta?.content) xhr.setRequestHeader('X-CSRF-TOKEN', meta.content);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const body = JSON.parse(xhr.responseText) as FileDescriptor;
                    resolve(body);
                } catch {
                    reject(new Error('Invalid upload response'));
                }
            } else {
                reject(new Error(`Upload failed (${xhr.status})`));
            }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
    });
}
