import { ReactNode, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronRight, 
  Compass,
  X,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

interface Notification {
  id: string;
  type: 'booking' | 'tour';
  title: string;
  subtitle: string;
  time: string;
  isNew: boolean;
}

const AdminLayout = ({ children, title, subtitle, actions }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch recent pending bookings + tour requests as notifications
  const fetchNotifications = async () => {
    const notifs: Notification[] = [];

    // Pending bookings (last 10)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, booking_id, customer_name, pickup, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    (bookings || []).forEach(b => {
      notifs.push({
        id: b.id,
        type: 'booking',
        title: b.customer_name || b.booking_id,
        subtitle: b.pickup,
        time: b.created_at,
        isNew: true,
      });
    });

    // Pending tour requests (last 5)
    const { data: tours } = await supabase
      .from('tour_requests')
      .select('id, request_id, customer_name, itinerary_title, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    (tours || []).forEach(t => {
      notifs.push({
        id: t.id,
        type: 'tour',
        title: t.customer_name || t.request_id,
        subtitle: t.itinerary_title || 'Αίτημα εκδρομής',
        time: t.created_at,
        isNew: true,
      });
    });

    // Sort by time desc
    notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setNotifications(notifs.slice(0, 8));
    setUnreadCount(notifs.length);
  };

  useEffect(() => {
    fetchNotifications();

    // Realtime subscribe
    const channel = supabase.channel('admin-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, fetchNotifications)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tour_requests' }, fetchNotifications)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Μόλις τώρα';
      if (diffMins < 60) return `${diffMins}' πριν`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}ω πριν`;
      return format(date, 'dd/MM');
    } catch { return ''; }
  };

  // Derive breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(p => p !== '' && p !== 'admin');
  
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-full flex-shrink-0 z-50">
        <AdminSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-12 w-12 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all active:scale-95 shadow-sm">
                  <Menu className="w-6 h-6 text-slate-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-72">
                <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Breadcrumbs (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="hover:text-emerald-500 cursor-pointer transition-colors" onClick={() => navigate('/admin')}>Admin</span>
              {pathParts.map((part, index) => (
                <div key={part} className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  <span className={cn(
                    "capitalize transition-colors",
                    index === pathParts.length - 1 ? "text-slate-800 font-bold" : "hover:text-emerald-500 cursor-pointer"
                  )}>
                    {part.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl transition-all focus-within:ring-2 focus-within:ring-emerald-400 group">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                placeholder="Αναζήτηση..." 
                className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 w-32 md:w-64 text-slate-700 focus:outline-none"
              />
            </div>

            {/* View Website Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 h-11 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 border border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span className="hidden md:inline">Ιστοσελίδα</span>
            </a>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(v => !v);
                  setUnreadCount(0);
                }}
                className="h-11 w-11 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all relative shadow-sm"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white ring-2 ring-emerald-400/20 shadow-lg animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden animate-fade-in">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Ειδοποιήσεις</p>
                      <p className="text-[10px] text-slate-400 font-medium">Εκκρεμείς κρατήσεις & αιτήματα</p>
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-400">Όλα εντάξει!</p>
                        <p className="text-[10px] text-slate-300">Δεν υπάρχουν εκκρεμή αιτήματα</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/admin', { 
                              state: { tab: notif.type === 'booking' ? 'pending' : 'tours' } 
                            });
                          }}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                            notif.type === 'booking' ? "bg-amber-50" : "bg-blue-50"
                          )}>
                            {notif.type === 'booking' 
                              ? <Clock className="w-4 h-4 text-amber-500" />
                              : <Sparkles className="w-4 h-4 text-blue-500" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">{notif.title}</p>
                            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {notif.subtitle}
                            </p>
                          </div>
                          <span className="text-[9px] font-bold text-slate-300 shrink-0 mt-1">
                            {formatRelativeTime(notif.time)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="border-t border-slate-50 p-2">
                      <button
                        onClick={() => { setShowNotifications(false); navigate('/admin', { state: { tab: 'pending' } }); }}
                        className="w-full py-2 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      >
                        Δες όλες τις εκκρεμείς →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="h-8 w-px bg-slate-100 hidden sm:block" />
            
            <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                L
              </div>
              <span className="text-sm font-bold text-slate-700 hidden sm:block pr-2">LIV Admin</span>
            </div>
          </div>
        </header>

        {/* Page Header (Internal) */}
        <div className="px-6 sm:px-8 py-8 bg-white border-b border-slate-50 shadow-sm relative overflow-hidden group/header">
           {/* Abstract Decoration */}
           <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-emerald-100/10 rounded-full blur-3xl pointer-events-none group-hover/header:bg-emerald-100/20 transition-all duration-1000" />
           <div className="absolute bottom-[-20%] left-[20%] w-48 h-48 bg-sky-100/10 rounded-full blur-2xl pointer-events-none" />

           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5 min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase group-hover/header:translate-x-1 transition-transform inline-flex items-center gap-3">
                {title}
                <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 animate-pulse" />
              </h2>
              {subtitle && <p className="text-sm font-medium text-slate-500 tracking-tight max-w-2xl leading-relaxed">{subtitle}</p>}
            </div>
            
            {actions && (
              <div className="flex items-center gap-3 animate-fade-in shrink-0">
                {actions}
              </div>
            )}
           </div>
        </div>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-slate-50/50 relative">
          <div className="container-admin max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
