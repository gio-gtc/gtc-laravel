import InvoiceOrOrderModal from '@/components/globals/navigation/invoice-or-order-modal';
import OrganizationModal from '@/components/globals/navigation/organization-modal';
import TourModal from '@/components/globals/navigation/tour-modal';
import UserInfoModal from '@/components/modals/user-info-modal';
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
import { useState } from 'react';

export const CreateBtn = () => {
    const { isMobile, state } = useSidebar();
    const notCollapsedOrMobile = state !== 'collapsed' || isMobile;
    const hiddenString = notCollapsedOrMobile ? '' : 'hidden';
    const hiddenBackhground = notCollapsedOrMobile ? 'bg-input' : '';
    const [isOrganizationModalOpen, setIsOrganizationModalOpen] =
        useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isTourModalOpen, setIsTourModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    return (
        <>
            <Tooltip>
                <Menubar>
                    <MenubarMenu>
                        <TooltipTrigger asChild>
                            <MenubarTrigger
                                className={`flex max-w-[100px] cursor-pointer gap-1.5 rounded-4xl p-2 align-middle ${hiddenBackhground}`}
                            >
                                <div className="flex items-center justify-center rounded-full bg-brand-gtc-red">
                                    <Plus
                                        style={{
                                            width: 'calc(var(--spacing) * 4)',
                                            height: 'calc(var(--spacing) * 4)',
                                        }}
                                    />
                                </div>
                                <span className={`text-sm ${hiddenString}`}>
                                    Create
                                </span>
                            </MenubarTrigger>
                        </TooltipTrigger>
                        <CreateDropdown
                            onOrganizationClick={() =>
                                setIsOrganizationModalOpen(true)
                            }
                            onContactClick={() => setIsContactModalOpen(true)}
                            onTourClick={() => setIsTourModalOpen(true)}
                            onOrderClick={() => setIsOrderModalOpen(true)}
                            onInvoiceClick={() => setIsInvoiceModalOpen(true)}
                        />
                    </MenubarMenu>
                </Menubar>
                <TooltipContent
                    side="right"
                    align="center"
                    hidden={notCollapsedOrMobile}
                    children={<span>Create</span>}
                />
            </Tooltip>
            <OrganizationModal
                isOpen={isOrganizationModalOpen}
                onClose={() => setIsOrganizationModalOpen(false)}
            />
            <UserInfoModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                mode="create"
            />
            <TourModal
                isOpen={isTourModalOpen}
                onClose={() => setIsTourModalOpen(false)}
            />
            <InvoiceOrOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                title="Create Order"
            />
            <InvoiceOrOrderModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                title="Create Invoice"
            />
        </>
    );
};

const CreateDropdown = ({
    onOrganizationClick,
    onContactClick,
    onTourClick,
    onOrderClick,
    onInvoiceClick,
}: {
    onOrganizationClick: () => void;
    onContactClick: () => void;
    onTourClick: () => void;
    onOrderClick: () => void;
    onInvoiceClick: () => void;
}) => {
    return (
        <MenubarContent>
            <MenubarItem onClick={onOrganizationClick}>
                Organization
            </MenubarItem>
            <MenubarItem onClick={onContactClick}>Contact</MenubarItem>
            <MenubarItem onClick={onTourClick}>Tour</MenubarItem>
            <MenubarItem onClick={onOrderClick}>Order</MenubarItem>
            <MenubarItem onClick={onInvoiceClick}>Invoice</MenubarItem>
        </MenubarContent>
    );
};
