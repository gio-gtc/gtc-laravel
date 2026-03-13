import { invoicesData, orderData } from '@/components/mockdata';
import { Button } from '@/components/ui/button';
import {
    type Invoice,
    type MediaTableRow,
    type StaticAssetsTableRow,
    type Tour,
    type TourVenue,
    type Venue,
} from '@/types';
import { Link, PlayIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import MediaTable from '../reuse/dynamic-media-table';
import SectionContainers from '../reuse/section-containers';
import StaticAssetsMediaTable from '../reuse/static-assets-media-table';
import BillingSection from './billing-section';
import Filters, {
    filterAndSortRows,
    type MediaStatusFilter,
    type SortDirection,
} from './filters';
import AddAudioModal from './modals/add-audio-modal';
import AddBroadcastStreamingModal from './modals/add-broadcast-streaming-modal';
import AddKeyArtStaticAssetsModal from './modals/add-key-art-static-assets-modal';
import AddSocialVideoModal from './modals/add-social-video-modal';
import RevisionRequestModal from './modals/revision-request-modal';
import VideoPlayerModal from './modals/video-player-modal';

interface GeneralMediaViewProps {
    order: Tour | null;
    venueItem: { orderVenue: TourVenue; venue: Venue } | null;
    onOpenAttachModal?: (context?: {
        rowId: string | number;
        isci: string;
    }) => void;
}

function GeneralMediaView({
    order,
    venueItem,
    onOpenAttachModal,
}: GeneralMediaViewProps) {
    const mockUser = useMemo(
        () => ({
            id: 1,
            name: 'Jane Doe',
            email: 'jane@example.com',
            email_verified_at: null as string | null,
            company_id: 1,
            created_at: '',
            updated_at: '',
        }),
        [],
    );

    const [revisionModalOpen, setRevisionModalOpen] = useState(false);
    const [revisionRequestRow, setRevisionRequestRow] =
        useState<MediaTableRow | null>(null);
    const [statusFilter, setStatusFilter] = useState<MediaStatusFilter>([]);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const baseExampleData = useMemo(
        (): MediaTableRow[] => [
            {
                id: 1,
                isci: 'GTC1818843',
                cutName: 'Generic Presale',
                duration: ':45',
                dueDate: '1/15/25',
                assigned: null,
                status: 'Still in Cart',
                previewIcons: [
                    <PlayIcon key="e1" className="h-4 w-4" />,
                    <Link key="l1" className="h-4 w-4" />,
                ],
                deliverables: {
                    onReject: () => {},
                    onApprove: () => {},
                },
            },
            {
                id: 2,
                isci: 'GTC1818847',
                cutName: 'Generic Coming soon',
                duration: ':30',
                dueDate: '1/15/25',
                assigned: mockUser,
                status: 'Client Review',
                previewIcons: [
                    <PlayIcon key="e2" className="h-4 w-4" />,
                    <Link key="l2" className="h-4 w-4" />,
                ],
                deliverables: {
                    onReject: () => {},
                    onApprove: () => {},
                },
            },
            {
                id: 3,
                isci: 'GTC1818848',
                cutName: 'Generic Teaser',
                duration: ':15',
                dueDate: '1/18/25',
                assigned: mockUser,
                status: 'In Production',
                previewIcons: [
                    <PlayIcon key="e3" className="h-4 w-4" />,
                    <Link key="l3" className="h-4 w-4" />,
                ],
                deliverables: {
                    onReject: () => {},
                    onApprove: () => {},
                },
            },
            {
                id: 4,
                isci: 'GTC1818849',
                cutName: 'Generic Final',
                duration: ':60',
                dueDate: '1/20/25',
                assigned: mockUser,
                status: 'Out for Delivery',
                previewIcons: [
                    <PlayIcon key="e4" className="h-4 w-4" />,
                    <Link key="l4" className="h-4 w-4" />,
                ],
                deliverables: {
                    onReject: () => {},
                    onApprove: () => {},
                },
            },
            {
                id: 5,
                isci: 'GTC1818850',
                cutName: 'Generic Dropped',
                duration: ':30',
                dueDate: '1/22/25',
                assigned: null,
                status: 'Cancelled',
                previewIcons: [],
                deliverables: undefined,
            },
            {
                id: 6,
                isci: 'GTC1818851',
                cutName: 'Generic Revise',
                duration: ':45',
                dueDate: '1/25/25',
                assigned: mockUser,
                status: 'Revision Requested',
                previewIcons: [
                    <PlayIcon key="e6" className="h-4 w-4" />,
                    <Link key="l6" className="h-4 w-4" />,
                ],
                deliverables: {
                    onReject: () => {},
                    onApprove: () => {},
                },
            },
            {
                id: 7,
                isci: 'GTC1818852',
                cutName: 'Generic Unassigned',
                duration: ':20',
                dueDate: '1/28/25',
                assigned: null,
                status: 'Unassigned',
                previewIcons: [],
                deliverables: undefined,
            },
        ],
        [mockUser],
    );

    const exampleData = useMemo(
        () =>
            baseExampleData.map((row) => ({
                ...row,
                deliverables: row.deliverables
                    ? {
                          ...row.deliverables,
                          onReject: () => {
                              setRevisionRequestRow(row);
                              setRevisionModalOpen(true);
                          },
                      }
                    : undefined,
            })),
        [baseExampleData],
    );

    const staticAssetsMockUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        email_verified_at: null as string | null,
        company_id: 1,
        created_at: '',
        updated_at: '',
    };

    const baseStaticAssetsData = useMemo(
        (): StaticAssetsTableRow[] => [
            {
                id: 1,
                cutName: 'Key Art – Still in Cart',
                width: 1400,
                height: 400,
                dueDate: '1/15/25',
                assigned: null,
                status: 'Still in Cart',
            },
            {
                id: 2,
                cutName: 'Key Art – Client Review',
                width: 1400,
                height: 400,
                dueDate: '1/15/25',
                assigned: staticAssetsMockUser,
                status: 'Client Review',
                deliverables: { onReject: () => {}, onApprove: () => {} },
            },
            {
                id: 3,
                cutName: 'Key Art – In Production',
                width: 1400,
                height: 400,
                dueDate: '1/18/25',
                assigned: staticAssetsMockUser,
                status: 'In Production',
            },
            {
                id: 4,
                cutName: 'Key Art – Out for Delivery',
                width: 1400,
                height: 400,
                dueDate: '1/20/25',
                assigned: staticAssetsMockUser,
                status: 'Out for Delivery',
                deliverables: { onReject: () => {}, onApprove: () => {} },
            },
            {
                id: 5,
                cutName: 'Key Art – Cancelled',
                width: 1400,
                height: 400,
                dueDate: '1/22/25',
                assigned: null,
                status: 'Cancelled',
            },
            {
                id: 6,
                cutName: 'Key Art – Revision Requested',
                width: 1400,
                height: 400,
                dueDate: '1/25/25',
                assigned: staticAssetsMockUser,
                status: 'Revision Requested',
            },
            {
                id: 7,
                cutName: 'Socials & Web Banners – Unassigned',
                width: 1400,
                height: 400,
                dueDate: '1/28/25',
                assigned: null,
                status: 'Unassigned',
            },
        ],
        [staticAssetsMockUser],
    );

    const staticAssetsExampleData = useMemo(
        () =>
            baseStaticAssetsData.map((row) => ({
                ...row,
                deliverables: row.deliverables
                    ? {
                          ...row.deliverables,
                          onReject: () => {
                              setRevisionModalOpen(true);
                          },
                      }
                    : undefined,
            })),
        [baseStaticAssetsData],
    );

    const [audioModalOpen, setAudioModalOpen] = useState(false);
    const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
    const [keyArtModalOpen, setKeyArtModalOpen] = useState(false);
    const [socialVideoModalOpen, setSocialVideoModalOpen] = useState(false);
    const [videoPlayerModalOpen, setVideoPlayerModalOpen] = useState(false);
    const [videoPreviewRow, setVideoPreviewRow] =
        useState<MediaTableRow | null>(null);
    const [audioPlaceholderMode, setAudioPlaceholderMode] = useState(false);

    const billingInvoices = useMemo((): Invoice[] => {
        if (!order || !venueItem) return [];
        return invoicesData.filter(
            (inv) =>
                !inv.isDeleted &&
                inv.tour === order.name &&
                inv.venue_id === venueItem.venue.id,
        );
    }, [order, venueItem]);

    const venueOrders = useMemo(() => {
        if (!venueItem) return [];
        return orderData.filter(
            (o) => o.tour_venue_id === venueItem.orderVenue.id,
        );
    }, [venueItem]);

    const filteredMediaData = useMemo(
        () =>
            filterAndSortRows(
                exampleData,
                venueOrders,
                statusFilter,
                sortDirection,
            ),
        [exampleData, venueOrders, statusFilter, sortDirection],
    );

    const filteredStaticAssetsData = useMemo(
        () =>
            filterAndSortRows(
                staticAssetsExampleData,
                venueOrders,
                statusFilter,
                sortDirection,
            ),
        [staticAssetsExampleData, venueOrders, statusFilter, sortDirection],
    );

    return (
        <>
            {/* Media tables */}
            <div className="slide-out-container space-y-4">
                <Filters
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    sortDirection={sortDirection}
                    onSortDirectionChange={setSortDirection}
                />
                <MediaTable
                    title="Broadcast & Streaming Video"
                    data={filteredMediaData}
                    onAdd={() => setBroadcastModalOpen(true)}
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onPreviewClick={(row, iconIndex) => {
                        if (iconIndex === 0) {
                            setVideoPreviewRow(row);
                            setAudioPlaceholderMode(false);
                            setVideoPlayerModalOpen(true);
                        }
                    }}
                />
                <MediaTable
                    title="Social Video"
                    data={filteredMediaData}
                    onAdd={() => setSocialVideoModalOpen(true)}
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onPreviewClick={(row, iconIndex) => {
                        if (iconIndex === 0) {
                            setVideoPreviewRow(row);
                            setAudioPlaceholderMode(false);
                            setVideoPlayerModalOpen(true);
                        }
                    }}
                />
                <MediaTable
                    title="Audio"
                    data={filteredMediaData}
                    onAdd={() => setAudioModalOpen(true)}
                    previewVariant="audio"
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onPreviewClick={(row, iconIndex) => {
                        if (iconIndex === 0) {
                            setVideoPreviewRow(row);
                            setAudioPlaceholderMode(true);
                            setVideoPlayerModalOpen(true);
                        }
                    }}
                />
                <StaticAssetsMediaTable
                    title="Key Art & Static Assets"
                    data={filteredStaticAssetsData}
                    onAdd={() => setKeyArtModalOpen(true)}
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

            <AddBroadcastStreamingModal
                isOpen={broadcastModalOpen}
                onClose={() => setBroadcastModalOpen(false)}
            />
            <AddSocialVideoModal
                isOpen={socialVideoModalOpen}
                onClose={() => setSocialVideoModalOpen(false)}
            />
            <AddAudioModal
                isOpen={audioModalOpen}
                onClose={() => setAudioModalOpen(false)}
            />
            <AddKeyArtStaticAssetsModal
                isOpen={keyArtModalOpen}
                onClose={() => setKeyArtModalOpen(false)}
            />
            <RevisionRequestModal
                isOpen={revisionModalOpen}
                onClose={() => {
                    setRevisionModalOpen(false);
                    setRevisionRequestRow(null);
                }}
                onSubmit={() => {}}
            />
            <VideoPlayerModal
                isOpen={videoPlayerModalOpen}
                onClose={() => {
                    setVideoPlayerModalOpen(false);
                    setVideoPreviewRow(null);
                    setAudioPlaceholderMode(false);
                }}
                videoSrc={videoPreviewRow?.previewVideoUrl ?? undefined}
                useAudioPlaceholder={audioPlaceholderMode}
                label={
                    videoPreviewRow
                        ? `${videoPreviewRow.isci} – ${videoPreviewRow.cutName}`
                        : undefined
                }
            />
        </>
    );
}

export default GeneralMediaView;
