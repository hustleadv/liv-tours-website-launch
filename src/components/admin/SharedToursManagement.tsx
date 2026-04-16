import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { el } from "date-fns/locale";

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
  payment_status: string | null;
  total_amount: number | null;
  booking_type?: string;
}

interface SharedToursManagementProps {
  bookings: Booking[];
}

export const SharedToursManagement = ({ bookings }: SharedToursManagementProps) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Group bookings by Date and Tour Name (pickup/dropoff)
  // For shared tours, the "tour title" is often stored in dropoff or we check booking_type
  const events = useMemo(() => {
    const sharedBookings = bookings.filter(b => b.booking_type === 'shared');
    
    const grouped: Record<string, {
      date: string;
      tourTitle: string;
      bookings: Booking[];
      totalPax: number;
    }> = {};

    sharedBookings.forEach(b => {
      // Create a unique key for the event: Date + Tour (Using dropoff as proxy for title if not elsewhere)
      // Actually, in SharedTourBooking it sets dropoff to tourTitle in the payment call but "Shared Tour Return" in DB?
      // Wait, let's look at pickup. Usually for shared it's a specific meeting point.
      const eventKey = `${b.date}_shared`; 
      
      if (!grouped[eventKey]) {
        grouped[eventKey] = {
          date: b.date,
          tourTitle: "Shared Tour", // We can refine this if we have the actual tour name
          bookings: [],
          totalPax: 0
        };
      }
      
      grouped[eventKey].bookings.push(b);
      grouped[eventKey].totalPax += parseInt(b.passengers || "0");
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [bookings]);

  if (events.length === 0) {
    return (
      <Card className="p-20 text-center border-dashed border-2 bg-transparent flex flex-col items-center gap-4 border-slate-100">
        <Users className="w-12 h-12 text-slate-200" />
        <p className="text-slate-400 font-bold">Δεν βρέθηκαν συμμετοχές σε Shared Tours</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {events.map((event) => {
          const eventId = `${event.date}`;
          const isExpanded = expandedEventId === eventId;
          const capacity = 20; // Default minivan capacity
          const occupancyPercent = (event.totalPax / capacity) * 100;
          const isUrgent = event.totalPax < 6; // Mark as urgent if low participation

          return (
            <Card 
              key={eventId}
              className={cn(
                "rounded-[32px] border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-500",
                isUrgent ? "border-l-[6px] border-l-amber-400" : "border-l-[6px] border-l-emerald-400"
              )}
            >
              <div 
                className="p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpandedEventId(isExpanded ? null : eventId)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border shrink-0",
                      isUrgent ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{event.tourTitle}</h3>
                      <p className="text-sm font-bold text-slate-500">{event.date} • Wednesday Schedule</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Occupancy</p>
                       <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-slate-900">{event.totalPax} / {capacity}</span>
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                                className={cn("h-full transition-all duration-1000", isUrgent ? "bg-amber-500" : "bg-emerald-500")}
                                style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                             />
                          </div>
                       </div>
                    </div>
                    <div className="p-2 rounded-full bg-slate-100 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {isUrgent && (
                  <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100 text-[10px] font-bold uppercase tracking-wider w-fit">
                    <AlertTriangle className="w-3 h-3" />
                    Low Participation Warning
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-slate-50 bg-slate-50/30 p-6 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Confirmed Participants</h4>
                  <div className="grid gap-3">
                    {event.bookings.map((booking) => (
                      <div 
                        key={booking.id}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                              {booking.customer_name.substring(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900 uppercase">{booking.customer_name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {booking.passengers} pax
                                 </span>
                                 <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {booking.pickup}
                                 </span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           <div className="text-right mr-4">
                              <Badge className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                booking.payment_status === 'paid' ? "bg-emerald-500" : "bg-slate-200"
                              )}>
                                {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                              </Badge>
                           </div>
                           <a 
                             href={`tel:${booking.customer_phone}`} 
                             className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                           >
                             <Phone className="w-4 h-4" />
                           </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                           <Users className="w-5 h-5 text-lime" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Action Required</p>
                           <p className="text-sm font-bold">Assign Driver for this Event</p>
                        </div>
                     </div>
                     <button className="px-5 py-2.5 rounded-xl bg-lime text-slate-900 font-black text-xs uppercase hover:bg-white transition-all">
                        Select Driver
                     </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
