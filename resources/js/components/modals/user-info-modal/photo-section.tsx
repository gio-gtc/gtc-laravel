import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/ui/user-avatar';
import type { User } from '@/types';
import { Camera } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

interface UserInfoPhotoSectionProps {
    user: User;
    photoLabel: string;
    photoUploadTitle: string;
    photoPreviewUrl: string | null;
    setPhotoPreviewUrl: Dispatch<SetStateAction<string | null>>;
}

export function UserInfoPhotoSection({
    user,
    photoLabel,
    photoUploadTitle,
    photoPreviewUrl,
    setPhotoPreviewUrl,
}: UserInfoPhotoSectionProps) {
    return (
        <div className="space-y-4">
            <span className="inline-block text-center">
                <Label className="xs-gray-400-weight-400">{photoLabel}</Label>

                <div className="relative w-fit">
                    <UserAvatar
                        user={user}
                        imageOverride={photoPreviewUrl}
                        className="size-[88px] rounded-full border border-gray-100 p-0.5"
                    />

                    <label
                        htmlFor="photo"
                        className="absolute right-0 bottom-0 inline-flex cursor-pointer items-center justify-center rounded-full border bg-background p-1 text-gray-500 shadow-sm hover:bg-muted"
                        title={photoUploadTitle}
                    >
                        <Camera className="size-3" />
                    </label>

                    <input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                            const file = e.currentTarget.files?.[0];
                            if (!file) return;

                            setPhotoPreviewUrl((prev) => {
                                if (prev) {
                                    URL.revokeObjectURL(prev);
                                }
                                return URL.createObjectURL(file);
                            });
                        }}
                    />
                </div>
            </span>
        </div>
    );
}
