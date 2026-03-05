import { LucideIcon } from 'lucide-react';
import { Button } from '../button';

interface NavOptionButtonProps {
    onClick: () => void;
    icon: LucideIcon;
}

function NavOptionButton({ onClick, icon: Icon }: NavOptionButtonProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-[24px] w-[24px] text-gray-400"
            onClick={onClick}
        >
            <Icon className="size-4" />
        </Button>
    );
}

export default NavOptionButton;
