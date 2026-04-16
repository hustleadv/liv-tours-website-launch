import { useState } from "react";
import { ArrowRight, X, ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, Clock, Users, Car } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BookingData, generateBookingId, saveBooking, detectAirportRoute, detectPortRoute } from "@/lib/booking";
import { trackEvent } from "@/lib/tracking";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface ReturnTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalBooking: BookingData;
}

const ReturnTripModal = ({ isOpen, onClose, originalBooking }: ReturnTripModalProps) => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);

  const handleSubmit = () => {
    if (!date || !time) return;

    setIsSubmitting(true);
    trackEvent('booking_return_trip_submit');

    // Create return trip booking
    const returnBooking: BookingData = {
      bookingId: generateBookingId(),
      pickup: originalBooking.dropoff, // Swap
      dropoff: originalBooking.pickup, // Swap
      date: format(date, 'dd MMM yyyy'),
      time: time,
      passengers: originalBooking.passengers,
      luggage: originalBooking.luggage,
      vehicleType: originalBooking.vehicleType,
      childSeat: originalBooking.childSeat,
      extraStop: originalBooking.extraStop,
      meetGreet: originalBooking.meetGreet,
      customerName: originalBooking.customerName,
      customerEmail: originalBooking.customerEmail,
      customerPhone: originalBooking.customerPhone,
      isAirportRoute: detectAirportRoute(originalBooking.dropoff, originalBooking.pickup),
      isPortRoute: detectPortRoute(originalBooking.dropoff, originalBooking.pickup),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    saveBooking(returnBooking);
    
    toast({
      title: "Κράτηση επιστροφής καταχωρήθηκε ✅",
      description: "Θα λάβετε επιβεβαίωση μέσω WhatsApp σύντομα.",
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      navigate('/booking/confirmed');
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-accent" />
            Book Return Trip
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Route Preview (swapped) */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                <div className="w-0.5 h-8 bg-gradient-to-b from-accent to-primary" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-medium text-foreground">{originalBooking.dropoff}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="font-medium text-foreground">{originalBooking.pickup}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prefilled Info */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{originalBooking.passengers} passengers</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span>{originalBooking.vehicleType}</span>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Return Date</Label>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-1.5 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd MMM") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      if (d) setDatePopoverOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(d) => d < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-sm font-medium">Time</Label>
              <Popover open={timePopoverOpen} onOpenChange={setTimePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-1.5 justify-start text-left font-normal",
                      !time && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {time || "Select time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 pointer-events-auto" align="start">
                    <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                      {Array.from({ length: 24 }, (_, h) => 
                        [0, 15, 30, 45].map(m => {
                          const timeSlot = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                          return (
                            <Button
                              key={timeSlot}
                              variant={time === timeSlot ? "default" : "ghost"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => {
                                setTime(timeSlot);
                                setTimePopoverOpen(false);
                              }}
                            >
                              {timeSlot}
                            </Button>
                          );
                        })
                      ).flat()}
                    </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="hero" 
              onClick={handleSubmit} 
              disabled={!date || !time || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Booking..." : "Confirm Return"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnTripModal;
