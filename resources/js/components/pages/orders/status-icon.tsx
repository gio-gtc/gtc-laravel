import {
    CircleCheck,
    ClipboardPlus,
    Image,
    Mic,
    Pause,
    Volume2,
} from 'lucide-react';

interface StatusIconProps {
    status: 'completed' | 'in-progress' | 'pending' | 'paused' | 'edit';
}

function StatusIcon({ status }: StatusIconProps) {
    const getIcon = () => {
        switch (status) {
            case 'completed':
                return (
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500">
                        <CircleCheck className="h-5 w-5 text-white" />
                    </div>
                );
            case 'edit':
                return (
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500">
                        <ClipboardPlus className="h-5 w-5 text-white" />
                    </div>
                );
            case 'in-progress':
                return (
                    <div className="flex items-center gap-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-500">
                            <Mic className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-500">
                            <Volume2 className="h-5 w-5 text-white" />
                        </div>
                    </div>
                );
            case 'paused':
                return (
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500">
                        <Pause className="h-5 w-5 text-white" />
                    </div>
                );
            case 'pending':
                return (
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-500">
                        <Image className="h-5 w-5 text-white" />
                    </div>
                );
            default:
                return null;
        }
    };

    return <div className="flex items-center">{getIcon()}</div>;
}

export default StatusIcon;
