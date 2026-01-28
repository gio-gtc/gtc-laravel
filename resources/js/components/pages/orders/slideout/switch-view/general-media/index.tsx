import { Button } from '@/components/ui/button';
import { MediaTableRow } from '@/types';
import { Eye, Link } from 'lucide-react';
import Filters from './filters';
import MediaTable from './media-table';

function GeneralMediaView() {
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
            assigned: null, // Replace with actual User object when available
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

    return (
        <>
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
            <div className="flex justify-center gap-1 rounded-lg bg-neutral-100 p-1">
                <Button className="cursor-pointer bg-white text-gray-700 hover:bg-gray-200">
                    Cancel
                </Button>
                <Button className="cursor-pointer bg-brand-gtc-red hover:bg-brand-gtc-red/70">
                    Submit Order
                </Button>
            </div>
            <div className="slide-out-container space-y-4">Test</div>
        </>
    );
}

export default GeneralMediaView;
