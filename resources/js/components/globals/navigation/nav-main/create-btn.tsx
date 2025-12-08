import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from '@/components/ui/menubar';
import { useSidebar } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

export const CreateBtn = () => {
    const { isMobile, state } = useSidebar();
    const notCollapsedOrMobile = state !== 'collapsed' || isMobile;
    const hiddenClasses = notCollapsedOrMobile ? '' : 'hidden';

    return (
        <Tooltip>
            <Menubar>
                <MenubarMenu>
                    <TooltipTrigger asChild>
                        <MenubarTrigger className="mt-6 flex max-w-[100px] cursor-pointer gap-1.5 rounded-4xl bg-input p-2 align-middle">
                            <div className="flex items-center justify-center rounded-full bg-gtc-red">
                                <Plus
                                    style={{
                                        width: 'calc(var(--spacing) * 4)',
                                        height: 'calc(var(--spacing) * 4)',
                                    }}
                                />
                            </div>
                            <span className={`text-sm ${hiddenClasses}`}>
                                Create
                            </span>
                        </MenubarTrigger>
                    </TooltipTrigger>
                    <CreateDropdown />
                </MenubarMenu>
            </Menubar>
            <TooltipContent
                side="right"
                align="center"
                hidden={notCollapsedOrMobile}
                children={<span>Create</span>}
            />
        </Tooltip>
    );
};

const CreateDropdown = () => {
    return (
        <MenubarContent>
            <MenubarItem>Organization</MenubarItem>
            <MenubarItem>Contact</MenubarItem>
            <MenubarItem>Tour</MenubarItem>
        </MenubarContent>
    );
};
