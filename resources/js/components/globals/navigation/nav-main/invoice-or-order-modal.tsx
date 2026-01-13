import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Divider from '@/components/utils/divider';
import { useState } from 'react';

interface TourVenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

export default function InvoiceOrOrderModal({
    isOpen,
    onClose,
    title,
}: TourVenueModalProps) {
    const [tour, setTour] = useState('');
    const [venue, setVenue] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Connect to backend when ready
        console.log(`${title} form submitted`, { tour, venue });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <Divider />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label htmlFor="tour" className="sm:flex-1">
                            Tour <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex-1">
                            <Input
                                id="tour"
                                name="tour"
                                placeholder="Enter Tour"
                                value={tour}
                                onChange={(e) => setTour(e.target.value)}
                                required
                                className="border-gray-300"
                            />
                        </div>
                        <InputError message={undefined} />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Label htmlFor="venue" className="sm:flex-1">
                            Venue <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative flex-1">
                            <Input
                                id="venue"
                                name="venue"
                                placeholder="Enter Venue"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                required
                                className="border-gray-300"
                            />
                        </div>
                        <InputError message={undefined} />
                    </div>

                    <Divider />
                    <DialogFooter className="gap-3 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-brand-gtc-red">
                            Next
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
