import { MediaTableRow } from '@/types';
import { Eye, Link } from 'lucide-react';
import Filters from './filters';
import MediaTable from './media-table';

function GeneralMediaView() {
    // Example data - replace with actual data from props/state
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
        <div className="space-y-4">
            <Filters />
            <MediaTable
                title="Broadcast & Streaming Video"
                data={exampleData}
                defaultOpen={true}
            />
        </div>
    );
}

export default GeneralMediaView;
