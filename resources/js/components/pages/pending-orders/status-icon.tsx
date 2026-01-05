import { Check, ClipboardPlus, Mic, Pause, Speaker } from 'lucide-react';

interface StatusIconProps {
    status: 'completed' | 'in-progress' | 'pending' | 'paused' | 'edit';
}

function StatusIcon({ status }: StatusIconProps) {
    const getIcon = () => {
        switch (status) {
            case 'completed':
                return (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                        <Check className="h-4 w-4 text-white" />
                    </div>
                );
            case 'edit':
                return (
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-green-500">
                        <ClipboardPlus className="h-4 w-4 text-white" />
                    </div>
                );
            case 'in-progress':
                return (
                    <div className="flex items-center gap-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-yellow-500">
                            <Mic className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-yellow-500">
                            <Speaker className="h-4 w-4 text-white" />
                        </div>
                    </div>
                );
            case 'paused':
                return (
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-red-500">
                        <Pause className="h-4 w-4 text-white" />
                    </div>
                );
            case 'pending':
                return (
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-400">
                        <Pause className="h-4 w-4 text-white" />
                    </div>
                );
            default:
                return null;
        }
    };

    return <div className="flex items-center">{getIcon()}</div>;
}

export default StatusIcon;
