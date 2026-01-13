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
import { useState } from 'react';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OrderModal({ isOpen, onClose }: OrderModalProps) {
    const [tour, setTour] = useState('');
    const [venue, setVenue] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Connect to backend when ready
        console.log('Order form submitted', { tour, venue });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Order</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="tour">
                                Tour <span className="text-destructive">*</span>
                            </Label>
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
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="venue">
                                Venue{' '}
                                <span className="text-destructive">*</span>
                            </Label>
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
                    </div>
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
