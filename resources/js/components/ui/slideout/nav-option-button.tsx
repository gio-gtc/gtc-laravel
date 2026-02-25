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
            className="h-6 w-6"
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}

export default NavOptionButton;
