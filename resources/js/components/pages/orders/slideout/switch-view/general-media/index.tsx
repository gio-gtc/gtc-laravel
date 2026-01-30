import { invoicesData } from '@/components/mockdata';
import { Button } from '@/components/ui/button';
import {
    type Invoice,
    type MediaTableRow,
    type Tour,
    type TourVenue,
    type Venue,
} from '@/types';
import { Eye, Link } from 'lucide-react';
import { useMemo } from 'react';
import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import MediaTable from '../reuse/media-table';
import SectionContainers from '../reuse/section-containers';
import BillingSection from './billing-section';
import Filters from './filters';

interface GeneralMediaViewProps {
    order: Tour | null;
    venueItem: { orderVenue: TourVenue; venue: Venue } | null;
}

function GeneralMediaView({ order, venueItem }: GeneralMediaViewProps) {
    const exampleData: MediaTableRow[] = [
        {
            id: 1,
            isci: 'GTC1818843',
            cutName: 'Generic Presale',
            duration: ':45',
            dueDate: '1/15/25',
            assigned: null,
            status: 'Still in Cart',
            previewIcons: [],
            deliverables: undefined,
        },
        {
            id: 2,
            isci: 'GTC1818847',
            cutName: 'Generic Coming soon',
            duration: ':30',
            dueDate: '1/15/25',
            assigned: null,
            status: 'Client Review',
            previewIcons: [
                <Eye key="eye" className="h-4 w-4" />,
                <Link key="link" className="h-4 w-4" />,
            ],
            deliverables: {
                onReject: () => console.log('Reject clicked'),
                onApprove: () => console.log('Approve clicked'),
            },
        },
    ];

    const billingInvoices = useMemo((): Invoice[] => {
        if (!order || !venueItem) return [];
        return invoicesData.filter(
            (inv) =>
                !inv.isDeleted &&
                inv.tour === order.name &&
                inv.venue === venueItem.venue.name,
        );
    }, [order, venueItem]);

    return (
        <>
            {/* Media tables */}
            <div className="slide-out-container space-y-4">
                <Filters />
                <MediaTable
                    title="Broadcast & Streaming Video"
                    data={exampleData}
                />
                <MediaTable title="Social Video" data={exampleData} />
                <MediaTable title="Audio" data={exampleData} />
                <MediaTable
                    title="Key Art & Static Assets"
                    data={exampleData}
                />
            </div>

            {/* Submit Order Buttons */}
            <div className="flex justify-center gap-1 rounded-lg bg-neutral-100 p-1">
                <Button className="cursor-pointer bg-white text-gray-700 hover:bg-gray-200">
                    Cancel
                </Button>
                <Button className="cursor-pointer bg-brand-gtc-red hover:bg-brand-gtc-red/70">
                    Submit Order
                </Button>
            </div>

            {/* Billing Section */}
            <SectionContainers title="Billing Invoices">
                <BillingSection billingInvoices={billingInvoices} />
            </SectionContainers>

            {/* Attachments Section */}
            <SectionContainers title="Attachments">
                <AttachmentsSection />
            </SectionContainers>

            {/* Chat Section */}
            <SectionContainers title="Comments">
                <ChatBox />
            </SectionContainers>
        </>
    );
}

export default GeneralMediaView;
