import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";

import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  Car,
  RefreshCw,
  MessageCircle,
  Loader2,
  XCircle,
  UserCheck,
  Phone,
  Search,
  Compass,
  CalendarDays,
  Download,
  Trash2,
  Wallet,
  ShieldCheck,
  X,
  Plus,
  Mail,
  History,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Banknote
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, parseISO, isSameDay } from "date-fns";
import { el } from "date-fns/locale";
import { RevenueStats } from "@/components/admin/RevenueStats";
import { TourRequestsAdmin } from "@/components/admin/TourRequestsAdmin";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { SettingsManagement } from "@/components/admin/SettingsManagement";
import { BookingsCalendar } from "@/components/admin/BookingsCalendar";
import { SharedToursManagement } from "@/components/admin/SharedToursManagement";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  booking_id: string;
  pickup: string;
  dropoff: string;
  pickup_detail?: string | null;
  dropoff_detail?: string | null;
  date: string;
  time: string;
  passengers: string;
  vehicle_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_notes?: string | null;
  status: string;
  driver_name: string | null;
  driver_phone: string | null;
  driver_id: string | null;
  payment_status: string | null;
  payment_type: string | null;
  payment_amount: number | null;
  total_amount: number | null;
  paid_at: string | null;
  created_at: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string | null;
  is_active: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [tourRequests, setTourRequests] = useState<any[]>([]);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [driverForm, setDriverForm] = useState({ name: '', phone: '' });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history' | 'shared-tours' | 'tours' | 'stats' | 'users' | 'settings' | 'guide'>('stats');
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleTabChange = (tab: 'pending' | 'confirmed' | 'history' | 'shared-tours' | 'tours' | 'stats' | 'users' | 'settings' | 'guide') => {
    setActiveTab(tab);
    if (tab === 'pending') setFilter('pending');
    else if (tab === 'confirmed' || tab === 'history' || tab === 'shared-tours') setFilter('confirmed');
  };

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1320, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (e) { console.log('Audio error:', e); }
  }, []);

  useEffect(() => {
    if (location.state?.tab) {
      const tab = location.state.tab;
      setActiveTab(tab);
      if (tab === 'pending') setFilter('pending');
      else if (tab === 'confirmed') setFilter('confirmed');
    }
  }, [location.state]);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/admin/auth'); return; }
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).eq('role', 'admin').maybeSingle();
      if (!roleData) { navigate('/'); return; }
      setIsAdmin(true);
      fetchBookings();
      fetchDrivers();
      fetchTourRequests();
    };
    checkAdminAndFetch();

    if (location.state && (location.state as any).tab) {
      setActiveTab((location.state as any).tab);
    }
    
    const channel = supabase.channel('bookings-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchBookings())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tour_requests' }, () => fetchTourRequests())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchBookings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (!error) setBookings(data || []);
    setIsLoading(false);
  };

  const fetchDrivers = async () => {
    const { data } = await supabase.from('drivers').select('*').eq('is_active', true).order('name');
    if (data) setDrivers(data);
  };

  const fetchTourRequests = async () => {
    const { data } = await supabase.from('tour_requests').select('*').order('created_at', { ascending: false });
    if (data) setTourRequests(data);
  };

  const handleUpdateStatus = async (booking: Booking, status: string) => {
    const { error } = await supabase.from('bookings').update({ 
      status, 
      confirmed_at: status === 'confirmed' ? new Date().toISOString() : null 
    }).eq('id', booking.id);
    
    if (!error) {
      toast({ 
        title: status === 'confirmed' ? "Επιβεβαιώθηκε" : "Ενημερώθηκε", 
        description: "Η κράτηση ενημερώθηκε επιτυχώς" 
      });

      // Send automated email notification
      if (status === 'confirmed') {
        try {
          await supabase.functions.invoke('send-confirmation-email', {
            body: {
              customerName: booking.customer_name,
              customerEmail: booking.customer_email,
              bookingId: booking.booking_id,
              pickup: booking.pickup,
              dropoff: booking.dropoff,
              date: booking.date,
              time: booking.time,
              passengers: booking.passengers,
              vehicleType: booking.vehicle_type,
              // Add extra fields if they exist in the booking object
              childSeat: (booking as any).child_seat,
              extraStop: (booking as any).extra_stop,
              meetGreet: (booking as any).meet_greet,
              tripHubUrl: `${window.location.origin}/trip-hub?id=${booking.id}`
            }
          });
          toast({ title: "Email Στάλθηκε", description: "Ο πελάτης ενημερώθηκε για την επιβεβαίωση." });
        } catch (emailErr) {
          console.error("Error sending confirmation email:", emailErr);
          toast({ title: "Σφάλμα Email", description: "Η κράτηση επιβεβαιώθηκε αλλά το email δεν στάλθηκε.", variant: "destructive" });
        }
      } else if (status === 'cancelled') {
        try {
          await supabase.functions.invoke('send-cancellation-email', {
            body: {
              customerName: booking.customer_name,
              customerEmail: booking.customer_email,
              bookingId: booking.booking_id,
              pickup: booking.pickup,
              dropoff: booking.dropoff,
              date: booking.date,
              time: booking.time
            }
          });
          toast({ title: "Email Στάλθηκε", description: "Ο πελάτης ενημερώθηκε για την ακύρωση." });
        } catch (emailErr) {
          console.error("Error sending cancellation email:", emailErr);
          toast({ title: "Σφάλμα Email", description: "Η κράτηση ακυρώθηκε αλλά το email δεν στάλθηκε.", variant: "destructive" });
        }
      }

      fetchBookings();
    }
  };
  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε οριστικά αυτή την κράτηση; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.')) return;
    
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (!error) {
      toast({ title: "Διαγράφηκε", description: "Η κράτηση διαγράφηκε επιτυχώς" });
      fetchBookings();
    } else {
      toast({ title: "Σφάλμα", description: "Αποτυχία διαγραφής", variant: "destructive" });
    }
  };

  const handleMarkAsPaid = async (bookingId: string, paymentType: string) => {
    const { error } = await supabase.from('bookings').update({
      payment_status: 'paid',
      payment_type: paymentType,
      paid_at: new Date().toISOString(),
    }).eq('id', bookingId);
    if (!error) {
      toast({ title: "Πληρώθηκε ✓", description: `Η πληρωμή μέσω ${paymentType} καταγράφηκε.` });
      fetchBookings();
    } else {
      toast({ title: "Σφάλμα", description: "Αποτυχία ενημέρωσης πληρωμής", variant: "destructive" });
    }
  };

  const handleEditDriver = (booking: Booking) => {
    setEditingDriverId(booking.id);
    setSelectedDriverId(booking.driver_id);
    setDriverForm({ name: booking.driver_name || '', phone: booking.driver_phone || '' });
  };

  const handleSaveDriver = async (bookingId: string) => {
    const { error } = await supabase.from('bookings').update({ 
      driver_id: selectedDriverId, 
      driver_name: driverForm.name, 
      driver_phone: driverForm.phone 
    }).eq('id', bookingId);
    if (!error) {
      toast({ title: "Αποθηκεύτηκε", description: "Στοιχεία οδηγού ενημερώθηκαν" });
      setEditingDriverId(null);
      fetchBookings();
    }
  };

  const filteredBookings = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return bookings.filter(booking => {
      const matchesFilter = filter === 'all' || booking.status === filter;
      const matchesSearch = !searchQuery || 
        booking.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.dropoff.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date filtering logic for confirmed/history tabs
      if (activeTab === 'confirmed') {
        return matchesFilter && matchesSearch && booking.date >= today;
      }
      if (activeTab === 'history') {
        return matchesFilter && matchesSearch && booking.date < today;
      }
      
      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, searchQuery, activeTab]);

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  if (!isAdmin && !isLoading) return null;

  return (
    <AdminLayout
      title={
        activeTab === 'stats' ? "Σύνοψη Dashboard" : 
        activeTab === 'pending' ? "Εκκρεμείς Κρατήσεις" : 
        activeTab === 'confirmed' ? "Επιβεβαιωμένες" : 
        activeTab === 'shared-tours' ? "Συμμετοχές" :
        activeTab === 'tours' ? "Αιτήματα Εκδρομών" : 
        activeTab === 'users' ? "Διαχείριση Χρηστών" : 
        activeTab === 'settings' ? "Ρυθμίσεις Συστήματος" : 
        activeTab === 'guide' ? "Οδηγός Χρήσης" :
        "Ιστορικό Κρατήσεων"
      }
      subtitle={
        activeTab === 'stats' ? "Δείτε τα έσοδα και τις επιδόσεις." : 
        activeTab === 'settings' ? "Διαμόρφωση κλειδιών και παραμέτρων." :
        activeTab === 'users' ? "Διαχείριση πρόσβασης και ρόλων." :
        activeTab === 'guide' ? "Μάθετε πώς να χρησιμοποιείτε το σύστημα." :
        "Διαχειριστείτε τις κινήσεις της ημέρας."
      }
      actions={
        activeTab !== 'settings' && activeTab !== 'users' && activeTab !== 'stats' && activeTab !== 'guide' && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchBookings} className="h-11 rounded-xl shadow-sm gap-2 font-bold px-6 border-slate-200">
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Ανανέωση
            </Button>
            <Button onClick={() => setShowCalendar(true)} className="h-11 rounded-xl bg-slate-900 text-white shadow-xl gap-2 font-bold px-6">
              <CalendarDays className="w-4 h-4" />
              Ημερολόγιο
            </Button>
          </div>
        )
      }
    >
      <SEOHead title="Admin Dashboard | LIV Tours" description="Admin management dashboard" noindex={true} />

      {/* Sub-tabs for Booking Management - Only show in relevant tabs */}
      {['confirmed', 'pending', 'shared-tours', 'tours', 'history'].includes(activeTab) && (
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tabs - Scrollable on mobile */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
            {['confirmed', 'pending', 'shared-tours', 'tours', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as any)}
                className={cn(
                  "px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all relative capitalize whitespace-nowrap",
                  activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab === 'confirmed' ? 'Επιβεβ.' : tab === 'pending' ? 'Αναμονή' : tab === 'shared-tours' ? 'Συμμετοχές' : tab === 'tours' ? 'Αιτήματα' : 'Ιστορικό'}
                {tab === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input
                placeholder="Αναζήτηση..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 w-full md:w-64 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' ? (
        <RevenueStats bookings={bookings} tourRequests={tourRequests} />
      ) : activeTab === 'shared-tours' ? (
        <SharedToursManagement bookings={bookings} />
      ) : activeTab === 'tours' ? (
        <TourRequestsAdmin requests={tourRequests} onRefresh={fetchTourRequests} />
      ) : activeTab === 'users' ? (
        <UsersManagement />
      ) : activeTab === 'settings' ? (
        <SettingsManagement />
      ) : activeTab === 'guide' ? (
        <AdminGuide onNavigate={handleTabChange} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredBookings.length === 0 ? (
            <Card className="col-span-full p-20 text-center border-dashed border-2 bg-transparent flex flex-col items-center gap-4 border-slate-100">
              <Calendar className="w-12 h-12 text-slate-200" />
              <p className="text-slate-400 font-bold">Δεν βρέθηκαν κρατήσεις</p>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card 
                key={booking.id}
                className={cn(
                  "group rounded-[32px] border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 relative",
                  booking.status === 'pending' ? "border-l-[6px] border-l-amber-400" : "border-l-[6px] border-l-emerald-400"
                )}
              >
                <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                  <div className="flex justify-between items-start gap-2">
                      <div className="flex justify-between items-start gap-2 w-full">
                        <div className="min-w-0">
                          <div className={cn(
                            "mb-2 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider inline-flex items-center gap-1.5 whitespace-nowrap",
                            booking.status === 'pending' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          )}>
                            {booking.status === 'pending' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {booking.status === 'pending' ? 'Αναμονή' : 'Επιβεβαιωμένη'}
                          </div>
                          <h4 className="font-black text-slate-900 text-xs sm:text-sm tracking-tight truncate pr-2">{booking.booking_id}</h4>
                        </div>
                        {booking.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBooking(booking.id);
                            }}
                            className="h-8 w-8 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 -mt-1 -mr-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    <div className="text-right shrink-0">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Payment</p>
                       <p className="text-sm font-black text-slate-900">€{booking.total_amount || booking.payment_amount || '—'}</p>
                       <div className={cn(
                          "mt-1 text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md inline-block",
                          booking.payment_status === 'paid' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                       )}>
                          {booking.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                       </div>
                       {booking.payment_type && (
                         <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">via {booking.payment_type}</p>
                       )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-[20px] p-3 sm:p-4 border border-slate-100/50 space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm border border-slate-100 shrink-0">
                         <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date & Time</p>
                         <p className="text-xs sm:text-sm font-black text-slate-800 leading-none truncate">{booking.date} • <span className="text-blue-500">{booking.time}</span></p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3">
                       <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 shrink-0">
                         <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-[11px] sm:text-xs font-black text-slate-800 truncate mb-0.5">{booking.pickup}</p>
                         <p className="text-[10px] font-bold text-slate-400 truncate">→ {booking.dropoff}</p>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                       <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                          {booking.customer_name?.substring(0, 2).toUpperCase()}
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-[11px] font-black text-slate-900 truncate leading-tight uppercase mb-0.5">{booking.customer_name}</p>
                          <a href={`mailto:${booking.customer_email}`} className="text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1 mb-1">
                             <Mail className="w-3 h-3" />
                             {booking.customer_email}
                          </a>
                          <div className="flex gap-2">
                             <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 bg-white border border-slate-100 rounded-md">
                                {booking.passengers} pax
                             </span>
                             <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 bg-white border border-slate-100 rounded-md uppercase">
                                {booking.vehicle_type}
                             </span>
                          </div>
                       </div>
                       <Popover>
                         <PopoverTrigger asChild>
                            <button className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shrink-0">
                               <Phone className="w-5 h-5" />
                            </button>
                         </PopoverTrigger>
                         <PopoverContent className="w-64 p-4 bg-white border border-slate-100 shadow-2xl rounded-2xl z-[100]" align="end">
                            <div className="flex flex-col gap-3">
                               <div className="space-y-1 text-center">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Phone Number</p>
                                 <p className="text-base font-black text-slate-900 tracking-tight">{booking.customer_phone}</p>
                               </div>
                               <div className="flex flex-col gap-2 pt-1">
                                  <a 
                                    href={`tel:${booking.customer_phone}`} 
                                    className="flex items-center justify-center gap-2 h-11 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                  >
                                     <Phone className="w-3.5 h-3.5" />
                                     Call Now
                                  </a>
                                  <a 
                                    href={`https://wa.me/${booking.customer_phone?.replace(/\D/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 h-11 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                                  >
                                     <MessageCircle className="w-3.5 h-3.5" />
                                     WhatsApp
                                  </a>
                               </div>
                            </div>
                         </PopoverContent>
                       </Popover>
                    </div>

                    {(booking.pickup_detail || booking.dropoff_detail) && (
                      <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                         <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Route Details</p>
                         <div className="space-y-1">
                            {booking.pickup_detail && (
                               <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5 capitalize">
                                  <span className="text-blue-500 text-[11px]">↑</span> {booking.pickup_detail}
                               </p>
                            )}
                            {booking.dropoff_detail && (
                               <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5 capitalize">
                                  <span className="text-orange-500 text-[11px]">↓</span> {booking.dropoff_detail}
                               </p>
                            )}
                         </div>
                      </div>
                    )}

                    {booking.customer_notes && (
                      <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/30">
                         <div className="flex items-center gap-1.5 mb-1 text-amber-600">
                           <History className="w-3 h-3" />
                           <p className="text-[9px] font-black uppercase tracking-widest">Special Requests</p>
                         </div>
                         <p className="text-[10px] font-medium text-slate-600 italic">"{booking.customer_notes}"</p>
                      </div>
                    )}

                    <div className="flex gap-2 border-t border-slate-50 pt-4">
                      {booking.status === 'pending' ? (
                        <>
                          <Button
                            onClick={() => handleUpdateStatus(booking, 'confirmed')}
                            className="flex-1 rounded-xl sm:rounded-2xl h-11 sm:h-12 font-black text-[10px] sm:text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-emerald-600 shadow-xl transition-all"
                          >
                            Accept
                          </Button>
                          <button
                            onClick={() => {
                              if (window.confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτή την κράτηση;')) {
                                handleUpdateStatus(booking, 'cancelled');
                              }
                            }}
                            className="flex-1 rounded-xl sm:rounded-2xl h-11 sm:h-12 font-black text-[10px] sm:text-xs uppercase tracking-widest border border-red-300 text-red-600 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm transition-all"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditDriver(booking)}
                              variant="outline"
                              className="flex-1 rounded-xl sm:rounded-2xl h-10 sm:h-11 text-[10px] sm:text-xs font-black border-slate-100 hover:bg-slate-50 transition-all truncate px-2"
                            >
                              {booking.driver_name || "Αναθέστε Οδηγό"}
                            </Button>
                            <Button
                              variant="ghost" 
                              onClick={() => {
                                window.open(`https://wa.me/${booking.customer_phone?.replace(/\D/g, '')}`, '_blank');
                              }}
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-0 shrink-0"
                            >
                               <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                          </div>
                          {booking.payment_status !== 'paid' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleMarkAsPaid(booking.id, 'cash')}
                                className="flex-1 h-9 text-[9px] font-black uppercase tracking-wider rounded-xl border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all flex items-center justify-center gap-1"
                              >
                                <Banknote className="w-3 h-3" />
                                Cash
                              </button>
                              <button
                                onClick={() => handleMarkAsPaid(booking.id, 'card')}
                                className="flex-1 h-9 text-[9px] font-black uppercase tracking-wider rounded-xl border border-blue-200 text-blue-700 bg-white hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all flex items-center justify-center gap-1"
                              >
                                <CreditCard className="w-3 h-3" />
                                Card
                              </button>
                              <button
                                onClick={() => handleMarkAsPaid(booking.id, 'transfer')}
                                className="flex-1 h-9 text-[9px] font-black uppercase tracking-wider rounded-xl border border-purple-200 text-purple-700 bg-white hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all flex items-center justify-center gap-1"
                              >
                                <Wallet className="w-3 h-3" />
                                Wire
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {showCalendar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCalendar(false)} />
           <div className="relative w-full max-w-6xl h-full bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Ημερολόγιο</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCalendar(false)} className="h-12 w-12 rounded-2xl">
                  <X className="w-6 h-6" />
                </Button>
             </div>
             <div className="flex-1 overflow-auto p-4 sm:p-8">
                <BookingsCalendar bookings={bookings} tourRequests={tourRequests} onClose={() => setShowCalendar(false)} />
             </div>
           </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
