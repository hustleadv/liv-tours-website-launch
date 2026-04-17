import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";
import { el } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Car,
  Phone,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  booking_id: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  vehicle_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: string;
  driver_name: string | null;
}

interface TourRequest {
  id: string;
  request_id: string;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  itinerary_title: string | null;
  group_size: string | null;
  status: string;
}

interface BookingsCalendarProps {
  bookings: Booking[];
  tourRequests: TourRequest[];
  onClose: () => void;
}

export const BookingsCalendar = ({ bookings, tourRequests, onClose }: BookingsCalendarProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookings.filter(b => b.date === dateStr);
  };

  const getToursForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return tourRequests.filter(t => t.preferred_date === dateStr);
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
  const selectedDateTours = selectedDate ? getToursForDate(selectedDate) : [];

  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Ημερολόγιο Κρατήσεων
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Σήμερα
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {format(currentWeekStart, "d MMM", { locale: el })} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "d MMM yyyy", { locale: el })}
            </div>
          </div>

          {/* Week Grid */}
          <div className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="grid grid-cols-7 gap-2 min-w-[700px] sm:min-w-0">
            {weekDays.map((day) => {
              const dayBookings = getBookingsForDate(day);
              const dayTours = getToursForDate(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const confirmedCount = dayBookings.filter(b => b.status === 'confirmed').length;
              const pendingCount = dayBookings.filter(b => b.status === 'pending').length;

              return (
                <Card
                  key={day.toISOString()}
                  className={cn(
                    "p-2 cursor-pointer transition-all hover:shadow-md min-h-[120px]",
                    isToday && "ring-2 ring-primary",
                    isSelected && "bg-primary/10"
                  )}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-center mb-2">
                    <div className="text-xs text-muted-foreground uppercase">
                      {format(day, "EEE", { locale: el })}
                    </div>
                    <div className={cn(
                      "text-lg font-bold",
                      isToday && "text-primary"
                    )}>
                      {format(day, "d")}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {confirmedCount > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-green-700 dark:text-green-400">{confirmedCount} επιβ.</span>
                      </div>
                    )}
                    {pendingCount > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-amber-700 dark:text-amber-400">{pendingCount} αναμ.</span>
                      </div>
                    )}
                    {dayTours.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-400">{dayTours.length} εκδρ.</span>
                      </div>
                    )}
                    {dayBookings.length === 0 && dayTours.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center">-</div>
                    )}
                  </div>
                </Card>
              );
            })}
            </div>
          </div>

          {/* Selected Day Details */}
          {selectedDate && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(selectedDate, "EEEE, d MMMM yyyy", { locale: el })}
              </h3>

              {selectedDateBookings.length === 0 && selectedDateTours.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Δεν υπάρχουν κρατήσεις για αυτή την ημέρα
                </p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {/* Transfers */}
                    {selectedDateBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "p-3 rounded-lg border text-sm",
                          booking.status === 'confirmed' 
                            ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                            : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                                {booking.status === 'confirmed' ? 'Επιβεβαιωμένη' : 'Αναμονή'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">#{booking.booking_id}</span>
                            </div>
                            <div className="font-medium truncate">{booking.customer_name}</div>
                            <div className="flex items-center gap-1 text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{booking.time}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{booking.pickup} → {booking.dropoff}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {booking.passengers}
                              </span>
                              <span className="flex items-center gap-1">
                                <Car className="w-3 h-3" /> {booking.vehicle_type}
                              </span>
                            </div>
                            {booking.driver_name && (
                              <div className="flex items-center gap-1 mt-1 text-primary">
                                <Phone className="w-3 h-3" />
                                <span>{booking.driver_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Tours */}
                    {selectedDateTours.map((tour) => (
                      <div
                        key={tour.id}
                        className="p-3 rounded-lg border bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                            Εκδρομή
                          </Badge>
                          <span className="text-xs text-muted-foreground">#{tour.request_id}</span>
                        </div>
                        <div className="font-medium truncate">{tour.customer_name || tour.customer_email}</div>
                        {tour.itinerary_title && (
                          <div className="text-muted-foreground truncate">{tour.itinerary_title}</div>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                          {tour.preferred_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {tour.preferred_time}
                            </span>
                          )}
                          {tour.group_size && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {tour.group_size}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
