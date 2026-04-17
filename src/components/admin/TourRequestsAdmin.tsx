import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Mail, 
  Send, 
  CheckCircle2, 
  Loader2,
  Euro,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  X,
  Ban,
  Sparkles,
  Phone,
  AlertTriangle,
  Search,
  User,
  Car,
  Trash2,
  RotateCcw
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, isSameDay } from "date-fns";
import { el } from "date-fns/locale";
import { cn } from "@/lib/utils";

// --- Helper Utilities ---
const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  if (cleaned.length === 10 && (cleaned.startsWith('69') || cleaned.startsWith('2'))) {
    return `+30${cleaned}`;
  }
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

const getConflictWarning = (driverId: string, date: string, time: string, allBookings: any[], allTours: TourRequest[]) => {
  const checkTime = (bTime: string) => {
    try {
      if (!bTime) return false;
      const [h1, m1] = time.split(':').map(Number);
      const [h2, m2] = bTime.split(':').map(Number);
      const diffMinutes = Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
      return diffMinutes < 120; // 2 hour buffer
    } catch { return false; }
  };

  const bookingConflict = allBookings.find(b => 
    b.driver_id === driverId && 
    b.date === date && 
    checkTime(b.time)
  );
  
  if (bookingConflict) return `⚠️ Conflict: Booking ${bookingConflict.booking_id} at ${bookingConflict.time}`;

  const tourConflict = allTours.find(t => 
    t.driver_id === driverId && 
    (t.preferred_date === date) && 
    t.preferred_time && checkTime(t.preferred_time)
  );

  if (tourConflict) return `⚠️ Conflict: Tour at ${tourConflict.preferred_time}`;
  
  return null;
};
// -------------------------

interface TourRequest {
  id: string;
  request_id: string;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  itinerary_title: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  group_size: string | null;
  duration: string | null;
  pickup_area: string | null;
  tour_vibe: string | null;
  notes: string | null;
  addons: string[] | null;
  estimated_total: number | null;
  final_price: number | null;
  status: string;
  payment_status: string;
  created_at: string;
  price_sent_at: string | null;
  price_confirmed_at: string | null;
  admin_notes: string | null;
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  driver_language: string | null;
  driver_message_sent: boolean | null;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  language: string | null;
  is_active: boolean;
}

interface TourRequestsAdminProps {
  requests: TourRequest[];
  onRefresh: () => void;
}

interface EditFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  itinerary_title: string;
  preferred_date: string;
  preferred_time: string;
  group_size: string;
  duration: string;
  pickup_area: string;
  notes: string;
  admin_notes: string;
  estimated_total: string;
}

const getStatusBadge = (status: string, priceConfirmedAt: string | null, priceSentAt: string | null) => {
  if (priceConfirmedAt) {
    return (
      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm uppercase">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        ΕΠΙΒΕΒΑΙΩΜΕΝΗ
      </Badge>
    );
  }
  if (priceSentAt) {
    return (
      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm animate-pulse uppercase">
        <Clock className="w-3 h-3 mr-1" />
        ΑΝΑΜΟΝΗ
      </Badge>
    );
  }
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-sm">
          <Sparkles className="w-3 h-3 mr-1" />
          ΝΕΟ
        </Badge>
      );
    case "price_inquiry":
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-sm animate-pulse">
          <Euro className="w-3 h-3 mr-1" />
          ΑΙΤΗΜΑ ΤΙΜΗΣ
        </Badge>
      );
    case "awaiting_confirmation":
      return (
        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm">
          <Clock className="w-3 h-3 mr-1" />
          ΑΝΑΜΟΝΗ
        </Badge>
      );
    case "price_confirmed":
      return (
        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          ΕΠΙΒΕΒΑΙΩΜΕΝΗ
        </Badge>
      );
    case "confirmed":
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          ΟΛΟΚΛΗΡΩΜΕΝΟ
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-sm">
          <Ban className="w-3 h-3 mr-1" />
          ΑΚΥΡΩΜΕΝΟ
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const TourRequestsAdmin = ({ requests, onRefresh }: TourRequestsAdminProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [messageInputs, setMessageInputs] = useState<Record<string, string>>({});
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [savingEdit, setSavingEdit] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState<TourRequest | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState<TourRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [focusPriceId, setFocusPriceId] = useState<string | null>(null);
  
  // Driver assignment state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assigningDriverIds, setAssigningDriverIds] = useState<Set<string>>(new Set());

  // Fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) {
        console.error("Error fetching drivers:", error);
      } else {
        setDrivers(data || []);
      }
    };
    fetchDrivers();
  }, []);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Date filter
      if (selectedDate && request.preferred_date) {
        try {
          // Parse preferred_date (format: DD/MM/YYYY or YYYY-MM-DD or text like "15 Ιανουαρίου 2025")
          let requestDate: Date | null = null;
          
          if (request.preferred_date.includes('/')) {
            const [day, month, year] = request.preferred_date.split('/');
            requestDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else if (request.preferred_date.includes('-')) {
            requestDate = parseISO(request.preferred_date);
          }
          
          if (requestDate && !isSameDay(requestDate, selectedDate)) {
            return false;
          }
        } catch {
          // If we can't parse the date, skip this filter
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = request.customer_name?.toLowerCase().includes(query);
        const matchesEmail = request.customer_email?.toLowerCase().includes(query);
        const matchesPhone = request.customer_phone?.toLowerCase().includes(query);
        const matchesTitle = request.itinerary_title?.toLowerCase().includes(query);
        const matchesId = request.request_id?.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesPhone || matchesTitle || matchesId;
      }

      return true;
    });
  }, [requests, selectedDate, searchQuery]);

  const handleCancelRequest = async () => {
    if (!cancellingRequest) return;

    setIsCancelling(true);
    try {
      const { error } = await supabase.functions.invoke("send-tour-cancellation", {
        body: {
          tourRequestId: cancellingRequest.id,
          cancellationReason: cancellationReason || undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Ακύρωση επιτυχής",
        description: "Ο πελάτης ενημερώθηκε μέσω email",
      });

      setCancellingRequest(null);
      setCancellationReason("");
      onRefresh();
    } catch (err) {
      console.error("Error cancelling request:", err);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ακύρωσης αιτήματος",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!deletingRequest) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("tour_requests")
        .delete()
        .eq("id", deletingRequest.id);

      if (error) throw error;

      toast({
        title: "Διαγράφηκε",
        description: `Το αίτημα ${deletingRequest.request_id} διαγράφηκε`,
      });

      setDeletingRequest(null);
      onRefresh();
    } catch (err) {
      console.error("Error deleting request:", err);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία διαγραφής αιτήματος",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = (request: TourRequest) => {
    setEditingId(request.id);
    setEditForm({
      customer_name: request.customer_name || "",
      customer_email: request.customer_email,
      customer_phone: request.customer_phone || "",
      itinerary_title: request.itinerary_title || "",
      preferred_date: request.preferred_date || "",
      preferred_time: request.preferred_time || "",
      group_size: request.group_size || "",
      duration: request.duration || "",
      pickup_area: request.pickup_area || "",
      notes: request.notes || "",
      admin_notes: request.admin_notes || "",
      estimated_total: request.estimated_total ? String(request.estimated_total) : "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async (requestId: string) => {
    if (!editForm) return;

    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("tour_requests")
        .update({
          customer_name: editForm.customer_name || null,
          customer_email: editForm.customer_email,
          customer_phone: editForm.customer_phone || null,
          itinerary_title: editForm.itinerary_title || null,
          preferred_date: editForm.preferred_date || null,
          preferred_time: editForm.preferred_time || null,
          group_size: editForm.group_size || null,
          duration: editForm.duration || null,
          pickup_area: editForm.pickup_area || null,
          notes: editForm.notes || null,
          admin_notes: editForm.admin_notes || null,
          estimated_total: editForm.estimated_total ? parseFloat(editForm.estimated_total) : null,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Επιτυχία!",
        description: "Οι αλλαγές αποθηκεύτηκαν",
      });

      cancelEditing();
      onRefresh();
    } catch (err) {
      console.error("Error saving edit:", err);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποθήκευσης",
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const generateWhatsAppPriceMessage = (request: TourRequest, price: number, adminMessage?: string) => {
    const depositAmount = Math.round(price * 0.30);
    const origin = window.location.origin;
    
    let message = `🌴 *LIV Tours - Προσφορά Τιμής*\n\n`;
    message += `Γεια σας ${request.customer_name || ""}!\n\n`;
    message += `Ευχαριστούμε για το ενδιαφέρον σας για την εκδρομή μας.\n\n`;
    
    if (request.itinerary_title) {
      message += `📍 *Εκδρομή:* ${request.itinerary_title}\n`;
    }
    if (request.preferred_date) {
      message += `📅 *Ημερομηνία:* ${request.preferred_date}\n`;
    }
    if (request.group_size) {
      message += `👥 *Άτομα:* ${request.group_size}\n`;
    }
    if (request.duration) {
      message += `⏱️ *Διάρκεια:* ${request.duration}\n`;
    }
    
    message += `\n💰 *Τελική Τιμή: €${price}*\n`;
    message += `💳 Προκαταβολή: €${depositAmount} (30%)\n\n`;
    
    if (adminMessage) {
      message += `📝 *Σημείωση:* ${adminMessage}\n\n`;
    }
    
    message += `✅ *Για την ολοκλήρωση της κράτησής σας, παρακαλούμε απαντήστε σε αυτό το μήνυμα* επιβεβαιώνοντας ότι αποδέχεστε την τιμή.\n\n`;
    message += `Σας έχουμε στείλει επίσης email με link για να επιβεβαιώσετε την κράτησή σας.\n\n`;
    message += `Για οποιαδήποτε απορία είμαστε στη διάθεσή σας! 🙂`;
    
    return message;
  };

  const handleSendPriceQuote = async (request: TourRequest) => {
    const price = parseFloat(priceInputs[request.id] || String(request.final_price || ""));
    
    if (!price || price <= 0) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ εισάγετε έγκυρη τιμή",
        variant: "destructive",
      });
      return;
    }

    setSendingIds(prev => new Set(prev).add(request.id));

    try {
      const { error } = await supabase.functions.invoke("send-tour-price-quote", {
        body: {
          tourRequestId: request.id,
          finalPrice: price,
          adminMessage: messageInputs[request.id] || undefined,
        },
      });

      if (error) throw error;

      // ✅ Update status to awaiting_confirmation + save final_price
      await supabase
        .from("tour_requests")
        .update({
          status: "awaiting_confirmation",
          final_price: price,
          price_sent_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      toast({
        title: "Επιτυχία!",
        description: `Η προσφορά τιμής €${price} στάλθηκε στο email του πελάτη`,
      });

      // Open WhatsApp with pre-filled message if customer has phone
      if (request.customer_phone) {
        const whatsappMessage = generateWhatsAppPriceMessage(request, price, messageInputs[request.id]);
        const phoneNumber = formatPhoneNumber(request.customer_phone);
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        
        toast({
          title: "WhatsApp",
          description: "Ανοίγει το WhatsApp για αποστολή στον πελάτη...",
        });
      } else {
        toast({
          title: "Προσοχή",
          description: "Ο πελάτης δεν έχει καταχωρημένο τηλέφωνο για WhatsApp",
          variant: "destructive",
        });
      }

      onRefresh();
    } catch (err) {
      console.error("Error sending price quote:", err);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποστολής προσφοράς",
        variant: "destructive",
      });
    } finally {
      setSendingIds(prev => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    }
  };

  // ✅ New: Mark a tour request as fully confirmed (customer paid/accepted)
  const handleConfirmRequest = async (request: TourRequest) => {
    const { error } = await supabase
      .from("tour_requests")
      .update({
        status: "confirmed",
        price_confirmed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (!error) {
      toast({ title: "Επιβεβαιώθηκε!", description: "Το αίτημα εκδρομής επιβεβαιώθηκε." });
      onRefresh();
    } else {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    }
  };

  const generateDriverWhatsAppMessage = (request: TourRequest, driverName: string) => {
    let message = `🚗 *Νέα Ανάθεση Εκδρομής - LIV Tours*\n\n`;
    message += `Γεια σου ${driverName}!\n\n`;
    message += `Σου έχει ανατεθεί μια νέα εκδρομή:\n\n`;
    
    message += `📋 *ID:* ${request.request_id}\n`;
    if (request.itinerary_title) {
      message += `📍 *Εκδρομή:* ${request.itinerary_title}\n`;
    }
    if (request.preferred_date) {
      message += `📅 *Ημερομηνία:* ${request.preferred_date}\n`;
    }
    if (request.preferred_time) {
      message += `⏰ *Ώρα:* ${request.preferred_time}\n`;
    }
    if (request.group_size) {
      message += `👥 *Άτομα:* ${request.group_size}\n`;
    }
    if (request.duration) {
      message += `⏱️ *Διάρκεια:* ${request.duration}\n`;
    }
    if (request.pickup_area) {
      message += `📌 *Παραλαβή:* ${request.pickup_area}\n`;
    }
    
    message += `\n👤 *Πελάτης:* ${request.customer_name || 'Δεν δόθηκε'}\n`;
    if (request.customer_phone) {
      message += `📞 *Τηλέφωνο:* ${request.customer_phone}\n`;
    }
    
    if (request.final_price) {
      message += `\n💰 *Τιμή:* €${request.final_price}\n`;
    }
    
    if (request.notes) {
      message += `\n📝 *Σημειώσεις:* ${request.notes}\n`;
    }
    
    message += `\n✅ Επιβεβαίωσε τη λήψη του μηνύματος!`;
    
    return message;
  };

  const handleAssignDriver = async (requestId: string, driverId: string) => {
    setAssigningDriverIds(prev => new Set(prev).add(requestId));
    
    try {
      const driver = drivers.find(d => d.id === driverId);
      if (!driver) throw new Error("Driver not found");
      
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error("Request not found");

      if (getConflictWarning(driverId, request.preferred_date || '', request.preferred_time || '', [], requests)) {
        if (!window.confirm("Ο οδηγός έχει ήδη δρομολόγιο κοντά σε αυτή την ώρα. Συνέχεια;")) {
          setAssigningDriverIds(prev => {
            const next = new Set(prev);
            next.delete(requestId);
            return next;
          });
          return;
        }
      }

      const { error } = await supabase
        .from("tour_requests")
        .update({
          driver_id: driverId,
          driver_name: driver.name,
          driver_phone: driver.phone,
          driver_language: driver.language,
          driver_message_sent: true,
          driver_message_sent_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      // Open WhatsApp with pre-filled message for driver
      const whatsappMessage = generateDriverWhatsAppMessage(request, driver.name);
      const driverPhone = formatPhoneNumber(driver.phone);
      const whatsappUrl = `https://wa.me/${driverPhone.replace(/\+/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: "Επιτυχία!",
        description: `Ο οδηγός ${driver.name} ανατέθηκε - ανοίγει WhatsApp...`,
      });

      onRefresh();
    } catch (err) {
      console.error("Error assigning driver:", err);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ανάθεσης οδηγού",
        variant: "destructive",
      });
    } finally {
      setAssigningDriverIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleRemoveDriver = async (requestId: string) => {
    setAssigningDriverIds(prev => new Set(prev).add(requestId));
    
    try {
      const { error } = await supabase
        .from("tour_requests")
        .update({
          driver_id: null,
          driver_name: null,
          driver_phone: null,
          driver_language: null,
          driver_message_sent: false,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Επιτυχία",
        description: "Ο οδηγός αφαιρέθηκε",
      });

      onRefresh();
    } catch (err) {
      console.error("Error removing driver:", err);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αφαίρεσης οδηγού",
        variant: "destructive",
      });
    } finally {
      setAssigningDriverIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const getLanguageFlag = (lang: string | null) => {
    switch (lang) {
      case 'en': return '🇬🇧';
      case 'gr': return '🇬🇷';
      case 'de': return '🇩🇪';
      case 'fr': return '🇫🇷';
      default: return '🌍';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Δεν υπάρχουν αιτήματα εκδρομών
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Date Filter - Mobile optimized */}
      <div className="flex flex-col gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Αναζήτηση..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 text-base touch-manipulation"
            style={{ fontSize: '16px' }}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 touch-manipulation"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Date Picker Row */}
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 h-12 justify-start text-left font-normal text-base touch-manipulation",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-5 w-5" />
                {selectedDate ? (
                  format(selectedDate, "d MMM yyyy", { locale: el })
                ) : (
                  <span>Επιλογή ημέρας</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                locale={el}
              />
            </PopoverContent>
          </Popover>

          {/* Clear Date Button */}
          {selectedDate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 touch-manipulation"
              onClick={() => setSelectedDate(undefined)}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      {(searchQuery || selectedDate) && (
        <p className="text-sm text-muted-foreground">
          {filteredRequests.length} αποτελέσματα
          {selectedDate && ` για ${format(selectedDate, "d MMM yyyy", { locale: el })}`}
        </p>
      )}

      {/* Requests list */}
      <div className="space-y-3 sm:space-y-4">
      {filteredRequests.map((request) => {
        const isExpanded = expandedId === request.id;
        const isEditing = editingId === request.id;
        const isSending = sendingIds.has(request.id);
        const hasPriceBeenSent = !!request.price_sent_at;
        const isPriceConfirmed = !!request.price_confirmed_at;
        const isCancelled = request.status === "cancelled";

        const isPriceInquiry = request.status === "price_inquiry" || request.tour_vibe === "price_inquiry";

        return (
          <Card 
            key={request.id} 
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${
              isCancelled 
                ? "border-l-red-500 opacity-60" 
                : isPriceConfirmed 
                  ? "border-l-emerald-500" 
                  : hasPriceBeenSent 
                    ? "border-l-amber-500" 
                    : isPriceInquiry
                      ? "border-l-yellow-500"
                      : "border-l-blue-500"
            }`}
          >
            {/* Header - Always visible */}
            <button
              onClick={() => !isEditing && setExpandedId(isExpanded ? null : request.id)}
              className="w-full p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-muted/30 transition-colors text-left"
            >
              {/* Mobile: Top row with badge and price */}
              <div className="flex items-center justify-between sm:hidden">
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(request.status, request.price_confirmed_at, request.price_sent_at)}
                  {request.notes?.includes("[Booked via Chat]") && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Badge>
                  )}
                  {request.notes?.includes("[Price Inquiry via Chat]") && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 text-xs">
                      <Euro className="w-3 h-3 mr-1" />
                      Quote
                    </Badge>
                  )}
                </div>
                {request.final_price && (
                  <div className="text-right">
                    <p className="font-bold text-lg text-emerald-600">€{request.final_price}</p>
                  </div>
                )}
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Desktop badge row */}
                <div className="hidden sm:flex items-center gap-2 mb-1.5">
                  {getStatusBadge(request.status, request.price_confirmed_at, request.price_sent_at)}
                  {request.notes?.includes("[Booked via Chat]") && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Badge>
                  )}
                  {request.notes?.includes("[Price Inquiry via Chat]") && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 text-xs">
                      <Euro className="w-3 h-3 mr-1" />
                      Quote
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">
                    #{request.request_id}
                  </span>
                </div>
                
                <p className="font-semibold text-foreground truncate text-base sm:text-lg">
                  {request.customer_name || request.customer_email}
                </p>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {request.itinerary_title || "Custom Tour"}
                  </p>
                  {request.preferred_date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {request.preferred_date}
                    </span>
                  )}
                  {request.group_size && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {request.group_size}
                    </span>
                  )}
                </div>

                {/* Mobile: Request ID */}
                <span className="sm:hidden text-xs text-muted-foreground font-mono mt-1 block">
                  #{request.request_id}
                </span>
              </div>
              
              {/* Desktop: Price and chevron */}
              <div className="hidden sm:flex items-center gap-4">
                {request.final_price && (
                  <div className="text-right bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Τελική τιμή</p>
                    <p className="font-bold text-xl text-emerald-600 dark:text-emerald-400">€{request.final_price}</p>
                  </div>
                )}
                <div className={`p-2 rounded-full transition-colors ${isExpanded ? "bg-primary/10" : "bg-muted/50"}`}>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Mobile: Chevron */}
              <div className="sm:hidden flex justify-center">
                <div className={`p-1.5 rounded-full ${isExpanded ? "bg-primary/10" : ""}`}>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </button>

            {/* Quick Reply Button for Price Inquiries - shown when collapsed */}
            {isPriceInquiry && !isExpanded && !isPriceConfirmed && !isCancelled && (
              <div className="px-3 sm:px-4 pb-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(request.id);
                    setFocusPriceId(request.id);
                  }}
                  size="sm"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                >
                  <Euro className="w-4 h-4 mr-2" />
                  Γρήγορη Απάντηση Τιμής
                </Button>
              </div>
            )}

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-3 sm:px-4 pb-4 border-t border-border pt-4 space-y-4 animate-fade-in">
                {/* Action Buttons - Quick Accept/Decline - Touch optimized */}
                {!isEditing && request.status !== "cancelled" && (
                  <div className="flex flex-col gap-3 p-1">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          if (request.final_price || priceInputs[request.id]) {
                            handleSendPriceQuote(request);
                          } else {
                            // If no price, focus price input
                            setFocusPriceId(request.id);
                            toast({
                              title: "Ορίστε τιμή",
                              description: "Παρακαλώ ορίστε την τελική τιμή πριν την αποδοχή.",
                            });
                          }
                        }}
                        className="flex-[2] h-14 text-lg font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none transition-all touch-manipulation uppercase tracking-wider"
                      >
                        <CheckCircle2 className="w-6 h-6 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCancellingRequest(request)}
                        className="flex-1 h-14 text-lg font-black border-red-200 text-red-600 hover:bg-red-50 transition-all touch-manipulation uppercase tracking-wider"
                      >
                        <Ban className="w-6 h-6 mr-2" />
                        Decline
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(request)}
                        className="flex-1 h-10 text-xs font-bold text-muted-foreground hover:text-primary transition-all"
                      >
                        <Pencil className="w-4 h-4 mr-1.5" />
                        Επεξεργασία
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingRequest(request)}
                        className="flex-1 h-10 text-xs font-bold text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Διαγραφή
                      </Button>
                    </div>
                  </div>
                )}

                {/* Edit Mode */}
                {isEditing && editForm ? (
                  <div className="space-y-4 border border-primary/20 rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Επεξεργασία Αιτήματος</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          disabled={savingEdit}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Ακύρωση
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveEdit(request.id)}
                          disabled={savingEdit}
                        >
                          {savingEdit ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-1" />
                          )}
                          Αποθήκευση
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Όνομα</label>
                        <Input
                          value={editForm.customer_name}
                          onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                          placeholder="Όνομα πελάτη"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Email</label>
                        <Input
                          type="email"
                          value={editForm.customer_email}
                          onChange={(e) => setEditForm({ ...editForm, customer_email: e.target.value })}
                          placeholder="Email"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Τηλέφωνο</label>
                        <Input
                          value={editForm.customer_phone}
                          onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                          placeholder="Τηλέφωνο"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Τίτλος Tour</label>
                        <Input
                          value={editForm.itinerary_title}
                          onChange={(e) => setEditForm({ ...editForm, itinerary_title: e.target.value })}
                          placeholder="Τίτλος εκδρομής"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Ημερομηνία</label>
                        <Input
                          value={editForm.preferred_date}
                          onChange={(e) => setEditForm({ ...editForm, preferred_date: e.target.value })}
                          placeholder="πχ. 15 Ιουλίου 2025"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Ώρα</label>
                        <Input
                          value={editForm.preferred_time}
                          onChange={(e) => setEditForm({ ...editForm, preferred_time: e.target.value })}
                          placeholder="πχ. 09:00"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Μέγεθος ομάδας</label>
                        <Input
                          value={editForm.group_size}
                          onChange={(e) => setEditForm({ ...editForm, group_size: e.target.value })}
                          placeholder="πχ. 4"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Διάρκεια</label>
                        <Input
                          value={editForm.duration}
                          onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                          placeholder="πχ. Full day"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-muted-foreground">Περιοχή παραλαβής</label>
                        <Input
                          value={editForm.pickup_area}
                          onChange={(e) => setEditForm({ ...editForm, pickup_area: e.target.value })}
                          placeholder="Περιοχή παραλαβής"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Εκτιμώμενη τιμή (€)</label>
                        <Input
                          type="number"
                          value={editForm.estimated_total}
                          onChange={(e) => setEditForm({ ...editForm, estimated_total: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Σημειώσεις πελάτη</label>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={2}
                        placeholder="Σημειώσεις από τον πελάτη"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Σημειώσεις διαχειριστή (εσωτερικές)</label>
                      <Textarea
                        value={editForm.admin_notes}
                        onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                        rows={2}
                        placeholder="Εσωτερικές σημειώσεις..."
                        className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Tour Details - View Mode */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm bg-muted/30 rounded-xl p-3 sm:p-4">
                      {request.preferred_date && (
                        <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 shadow-sm">
                          <Calendar className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{request.preferred_date}</span>
                        </div>
                      )}
                      {request.preferred_time && (
                        <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 shadow-sm">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{request.preferred_time}</span>
                        </div>
                      )}
                      {request.group_size && (
                        <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 shadow-sm">
                          <Users className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{request.group_size} άτομα</span>
                        </div>
                      )}
                      {request.duration && (
                        <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 shadow-sm">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{request.duration}</span>
                        </div>
                      )}
                      {request.pickup_area && (
                        <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 shadow-sm col-span-2">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{request.pickup_area}</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-3 sm:p-4 space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Επικοινωνία</h4>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <a 
                          href={`mailto:${request.customer_email}`} 
                          className="flex items-center gap-2 text-sm bg-background hover:bg-primary/5 rounded-lg px-3 py-2 transition-colors shadow-sm"
                        >
                          <Mail className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-primary truncate">{request.customer_email}</span>
                        </a>
                        {request.customer_phone && (
                          <div className="flex flex-wrap gap-2">
                            <a 
                              href={`tel:${request.customer_phone}`} 
                              className="flex items-center gap-2 text-sm bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-3 py-2 transition-colors shadow-sm"
                            >
                              <Phone className="w-4 h-4 shrink-0" />
                              <span>{request.customer_phone}</span>
                            </a>
                            <a 
                              href={`https://wa.me/${request.customer_phone.replace(/\D/g, "")}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-10 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors shadow-sm"
                            >
                              <MessageCircle className="w-4 h-4 text-green-600 shrink-0" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-3">
                      {/* Customer Notes */}
                      {request.notes && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-3 sm:p-4">
                          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">Σημειώσεις πελάτη</p>
                          <p className="text-sm text-amber-800 dark:text-amber-200">{request.notes}</p>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {request.admin_notes && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-3 sm:p-4">
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Εσωτερικές σημειώσεις</p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">{request.admin_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Addons */}
                    {request.addons && request.addons.length > 0 && (
                      <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Extras</p>
                      <div className="flex flex-wrap gap-1.5">
                        {request.addons.map((addon) => (
                          <Badge key={addon} variant="secondary" className="text-xs px-2.5 py-1">
                            {addon}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    )}

                    {/* Estimated vs Final Price */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl">
                      {request.estimated_total && (
                        <div className="bg-background rounded-lg px-4 py-2 shadow-sm">
                          <p className="text-xs text-muted-foreground">Εκτιμώμενη</p>
                          <p className="font-semibold text-lg">€{request.estimated_total}</p>
                        </div>
                      )}
                      {request.final_price && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-4 py-2 shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">Τελική</p>
                          <p className="font-bold text-xl text-emerald-600 dark:text-emerald-400">€{request.final_price}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Price Quote Form - Only show if not editing and not confirmed */}
                {!isEditing && !isPriceConfirmed && request.status !== "cancelled" && (
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 sm:p-5 space-y-4 bg-primary/5">
                    <h4 className="font-semibold flex items-center gap-2 text-primary">
                      <Euro className="w-5 h-5" />
                      {hasPriceBeenSent ? "Αποστολή νέας τιμής" : "Ορισμός τελικής τιμής"}
                    </h4>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-medium">€</span>
                        <Input
                          type="number"
                          placeholder={request.estimated_total ? String(request.estimated_total) : "0"}
                          value={priceInputs[request.id] || ""}
                          onChange={(e) => setPriceInputs(prev => ({ ...prev, [request.id]: e.target.value }))}
                          className="pl-8 text-lg font-semibold h-12"
                          autoFocus={focusPriceId === request.id}
                          ref={(el) => {
                            if (focusPriceId === request.id && el) {
                              el.focus();
                              setFocusPriceId(null);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <Textarea
                      placeholder="Προαιρετικό μήνυμα στον πελάτη..."
                      value={messageInputs[request.id] || ""}
                      onChange={(e) => setMessageInputs(prev => ({ ...prev, [request.id]: e.target.value }))}
                      rows={2}
                      className="resize-none"
                    />

                    <Button
                      onClick={() => handleSendPriceQuote(request)}
                      disabled={isSending || !priceInputs[request.id]}
                      className="w-full h-12 text-base"
                      variant="hero"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Αποστολή...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Αποστολή Προσφοράς
                        </>
                      )}
                    </Button>

                    {hasPriceBeenSent && (
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        Τελευταία αποστολή: {format(new Date(request.price_sent_at!), "dd MMM yyyy, HH:mm", { locale: el })}
                      </p>
                    )}
                  </div>
                )}

                {/* Confirmed State + Driver Assignment */}
                {isPriceConfirmed && (
                  <div className="space-y-4">
                    {/* Confirmation message */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl p-4 sm:p-5 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200 text-lg">
                        Ο πελάτης αποδέχτηκε την τιμή!
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                        {format(new Date(request.price_confirmed_at!), "dd MMM yyyy, HH:mm", { locale: el })}
                      </p>
                    </div>

                    {/* Driver Assignment Section */}
                    <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 sm:p-5 space-y-4 bg-blue-50/50 dark:bg-blue-950/20">
                      <h4 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Car className="w-5 h-5" />
                        Ανάθεση Οδηγού
                      </h4>
                      
                      {request.driver_name ? (
                        // Driver is assigned
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-background rounded-lg p-3 border">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {request.driver_name}
                                <span className="text-lg">{getLanguageFlag(request.driver_language)}</span>
                              </p>
                              {request.driver_phone && (
                                <p className="text-sm text-muted-foreground">{request.driver_phone}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            {request.driver_phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-initial"
                                onClick={() => window.open(`https://wa.me/${request.driver_phone?.replace(/\D/g, '')}`, '_blank')}
                              >
                                <MessageCircle className="w-4 h-4 mr-1 text-green-600" />
                                WhatsApp
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive flex-1 sm:flex-initial"
                              onClick={() => handleRemoveDriver(request.id)}
                              disabled={assigningDriverIds.has(request.id)}
                            >
                              {assigningDriverIds.has(request.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="w-4 h-4 mr-1" />
                                  Αφαίρεση
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // No driver assigned - show dropdown
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Select
                            onValueChange={(value) => handleAssignDriver(request.id, value)}
                            disabled={assigningDriverIds.has(request.id)}
                          >
                            <SelectTrigger className="w-full sm:w-[280px] h-12 bg-background">
                              <SelectValue placeholder="Επιλέξτε οδηγό..." />
                            </SelectTrigger>
                            <SelectContent className="bg-background border shadow-lg z-50">
                              {drivers.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  Δεν υπάρχουν διαθέσιμοι οδηγοί
                                </SelectItem>
                              ) : (
                                drivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    <span className="flex items-center gap-2">
                                      <span className="text-lg">{getLanguageFlag(driver.language)}</span>
                                      <span>{driver.name}</span>
                                      <span className="text-muted-foreground text-xs">({driver.phone})</span>
                                    </span>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          
                          {assigningDriverIds.has(request.id) && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Ανάθεση...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {request.driver_message_sent && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Ο οδηγός έχει ενημερωθεί
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancelled State */}
                {request.status === "cancelled" && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200/50 dark:border-red-800/50 rounded-xl p-4 sm:p-5 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-3">
                        <Ban className="w-6 h-6 text-red-600" />
                      </div>
                      <p className="font-semibold text-red-800 dark:text-red-200 text-lg">
                        Το αίτημα έχει ακυρωθεί
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingRequest(request)}
                      className="w-full h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Οριστική Διαγραφή
                    </Button>
                  </div>
                )}

                {/* Created At */}
                <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
                  Αίτημα: {format(new Date(request.created_at), "dd MMM yyyy, HH:mm", { locale: el })}
                </p>
              </div>
            )}
          </Card>
        );
      })}

      </div>

      {/* Cancellation Dialog */}
      <AlertDialog open={!!cancellingRequest} onOpenChange={(open) => !open && setCancellingRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Ακύρωση Αιτήματος Εκδρομής
            </AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτό το αίτημα; Ο πελάτης θα ενημερωθεί αυτόματα μέσω email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {cancellingRequest && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p><strong>Πελάτης:</strong> {cancellingRequest.customer_name || cancellingRequest.customer_email}</p>
              <p><strong>Εκδρομή:</strong> {cancellingRequest.itinerary_title || "Custom Tour"}</p>
              {cancellingRequest.preferred_date && <p><strong>Ημερομηνία:</strong> {cancellingRequest.preferred_date}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Αιτία ακύρωσης (προαιρετικά)</label>
            <Textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Πληκτρολογήστε την αιτία ακύρωσης..."
              rows={2}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Άκυρο</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRequest}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ακύρωση...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Ακύρωση Αιτήματος
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingRequest} onOpenChange={(open) => !open && setDeletingRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Διαγραφή Αιτήματος Εκδρομής
            </AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε οριστικά αυτό το αίτημα; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {deletingRequest && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p><strong>ID:</strong> {deletingRequest.request_id}</p>
              <p><strong>Πελάτης:</strong> {deletingRequest.customer_name || deletingRequest.customer_email}</p>
              <p><strong>Εκδρομή:</strong> {deletingRequest.itinerary_title || "Custom Tour"}</p>
              {deletingRequest.preferred_date && <p><strong>Ημερομηνία:</strong> {deletingRequest.preferred_date}</p>}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Άκυρο</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Διαγραφή...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Διαγραφή Οριστικά
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};