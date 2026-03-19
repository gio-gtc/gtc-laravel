import {
    invoicesData,
    orderData,
    venueItemsData,
} from '@/components/mockdata';
import {
    getAssignedUsersForVenueItem,
    venueItemsMediaTableRow,
    venueItemsStaticTableRow,
} from '@/components/utils/venue-items';
import { Button } from '@/components/ui/button';
import {
    type Invoice,
    type MediaTableRow,
    type StaticAssetsTableRow,
    type Tour,
    type TourVenue,
    type Venue,
    type VenueItemsMediaRow,
    type VenueItemsStaticRow,
} from '@/types';
import { useEditableTable } from '@/hooks/use-editable-table';
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
    venueItem: { orderVenue: TourVenue; venue: Venue | null } | null;
    onOpenAttachModal?: (context?: {
        rowId: string | number;
        isci: string;
    }) => void;
}

const defaultPreviewIcons = [
    <PlayIcon key="p1" className="h-4 w-4" />,
    <Link key="p2" className="h-4 w-4" />,
];

function GeneralMediaView({
    order,
    venueItem,
    onOpenAttachModal,
}: GeneralMediaViewProps) {
    const [revisionModalOpen, setRevisionModalOpen] = useState(false);
    const [revisionRequestRow, setRevisionRequestRow] =
        useState<MediaTableRow | null>(null);
    const [statusFilter, setStatusFilter] = useState<MediaStatusFilter>([]);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const venueMediaWithCallbacks = useMemo(() => {
        if (!venueItem) return [];
        return venueItemsData
            .filter(
                (r): r is VenueItemsMediaRow =>
                    r.type === 'media' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map((row) => {
                const mediaRow = venueItemsMediaTableRow(
                    row,
                    getAssignedUsersForVenueItem(row.id),
                );
                return {
                    ...mediaRow,
                    previewIcons:
                        row.previewIcons.length > 0
                            ? row.previewIcons
                            : defaultPreviewIcons,
                    deliverables: row.deliverables
                        ? {
                              ...row.deliverables,
                              onReject: () => {
                                  setRevisionRequestRow(mediaRow);
                                  setRevisionModalOpen(true);
                              },
                          }
                        : undefined,
                };
            });
    }, [venueItem]);

    const venueStaticAssetsWithCallbacks = useMemo(() => {
        if (!venueItem) return [];
        return venueItemsData
            .filter(
                (r): r is VenueItemsStaticRow =>
                    r.type === 'static' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map((row) => {
                const staticRow = venueItemsStaticTableRow(
                    row,
                    getAssignedUsersForVenueItem(row.id),
                );
                return {
                    ...staticRow,
                    deliverables: row.deliverables
                        ? {
                              ...row.deliverables,
                              onReject: () => {
                                  setRevisionModalOpen(true);
                              },
                          }
                        : undefined,
                };
            });
    }, [venueItem]);

    const {
        localData: localMediaRows,
        handleDoubleClick: handleMediaCellDoubleClick,
        handleCellChange: handleMediaCellChange,
        handleCellBlur: handleMediaCellBlur,
        handleCellKeyDown: handleMediaCellKeyDown,
        isEditing: isMediaCellEditing,
    } = useEditableTable<MediaTableRow>({
        data: venueMediaWithCallbacks,
        getId: (r) => r.id,
    });

    const {
        localData: localStaticRows,
        handleDoubleClick: handleStaticCellDoubleClick,
        handleCellChange: handleStaticCellChange,
        handleCellBlur: handleStaticCellBlur,
        handleCellKeyDown: handleStaticCellKeyDown,
        isEditing: isStaticCellEditing,
    } = useEditableTable<StaticAssetsTableRow>({
        data: venueStaticAssetsWithCallbacks,
        getId: (r) => r.id,
    });

    const [audioModalOpen, setAudioModalOpen] = useState(false);
    const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
    const [keyArtModalOpen, setKeyArtModalOpen] = useState(false);
    const [socialVideoModalOpen, setSocialVideoModalOpen] = useState(false);
    const [videoPlayerModalOpen, setVideoPlayerModalOpen] = useState(false);
    const [videoPreviewRow, setVideoPreviewRow] =
        useState<MediaTableRow | null>(null);
    const [audioPlaceholderMode, setAudioPlaceholderMode] = useState(false);

    const billingInvoices = useMemo((): Invoice[] => {
        if (!order || !venueItem || venueItem.venue == null) return [];
        return invoicesData.filter(
            (inv) =>
                !inv.isDeleted &&
                inv.tour === order.name &&
                inv.venue_id === venueItem.venue!.id,
        );
    }, [order, venueItem]);

    const venueOrders = useMemo(() => {
        if (!venueItem) return [];
        return orderData.filter(
            (o) => o.tour_venue_id === venueItem.orderVenue.id,
        );
    }, [venueItem]);

    const orders = venueItem ? venueOrders : [];

    const sharedMediaCellEditing = {
        onCellChange: handleMediaCellChange,
        onCellDoubleClick: handleMediaCellDoubleClick,
        onCellBlur: handleMediaCellBlur,
        onCellKeyDown: handleMediaCellKeyDown,
        isCellEditing: isMediaCellEditing,
    };

    const filteredMediaData = useMemo(
        () =>
            filterAndSortRows(
                localMediaRows,
                orders,
                statusFilter,
                sortDirection,
            ),
        [
            localMediaRows,
            orders,
            statusFilter,
            sortDirection,
        ],
    );

    const filteredStaticAssetsData = useMemo(
        () =>
            filterAndSortRows(
                localStaticRows,
                orders,
                statusFilter,
                sortDirection,
            ),
        [
            localStaticRows,
            orders,
            statusFilter,
            sortDirection,
        ],
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
                    cellEditing={sharedMediaCellEditing}
                    editScope="broadcast"
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
                    cellEditing={sharedMediaCellEditing}
                    editScope="social"
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
                    cellEditing={sharedMediaCellEditing}
                    editScope="audio"
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
                    cellEditing={{
                        onCellChange: handleStaticCellChange,
                        onCellDoubleClick: handleStaticCellDoubleClick,
                        onCellBlur: handleStaticCellBlur,
                        onCellKeyDown: handleStaticCellKeyDown,
                        isCellEditing: isStaticCellEditing,
                    }}
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
                isUSOrder={
                    venueItem?.venue
                        ? venueItem.venue.country_id === 1
                        : true
                }
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
