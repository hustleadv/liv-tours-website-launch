import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { 
  Euro, 
  ChevronUp, 
  ChevronDown, 
  Car, 
  Compass, 
  ChevronRight, 
  Clock, 
  UserCheck,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Banknote
} from "lucide-react";
import { 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO, 
  startOfDay, 
  endOfDay,
  eachDayOfInterval,
  isSameDay
} from "date-fns";
import { el } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface RevenueBooking {
  id: string;
  status: string;
  payment_status: string | null;
  payment_amount: number | null;
  paid_at: string | null;
  created_at: string;
  date: string;
  driver_id: string | null;
  vehicle_type?: string;
}

interface TourRequest {
  id: string;
  status: string;
  payment_status: string;
  final_price: number | null;
  deposit_amount: number | null;
  paid_at: string | null;
  created_at: string;
}

interface RevenueStatsProps {
  bookings: RevenueBooking[];
  tourRequests?: TourRequest[];
}

export const RevenueStats = ({ bookings, tourRequests = [] }: RevenueStatsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const stats = useMemo(() => {
    const range = dateRange?.from && dateRange?.to ? { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) } : null;

    // Filter helper
    const isInRange = (isoString: string) => {
      if (!range) return true;
      try {
        const date = parseISO(isoString);
        return isWithinInterval(date, range);
      } catch { return false; }
    };

    // === TRANSFERS ===
    const paidTransfers = bookings.filter(b => 
      b.status === 'confirmed' && 
      (b.payment_status === 'paid' || b.payment_status === 'cash_collected' || b.payment_amount)
    );

    const transfersInRange = paidTransfers.filter(b => {
      const activeDate = b.paid_at || b.created_at;
      return isInRange(activeDate);
    });

    const transfersRevenue = transfersInRange.reduce((sum, b) => sum + (b.payment_amount || 0), 0);

    // === TOURS ===
    const paidTours = tourRequests.filter(t => 
      (t.status === 'confirmed' || t.status === 'price_confirmed') && 
      (t.payment_status === 'paid' || t.payment_status === 'deposit_paid')
    );

    const toursInRange = paidTours.filter(t => {
      const activeDate = t.paid_at || t.created_at;
      return isInRange(activeDate);
    });

    const toursRevenue = toursInRange.reduce((sum, t) => sum + (t.deposit_amount || t.final_price || 0), 0);

    // === TOTALS ===
    const totalRevenue = transfersRevenue + toursRevenue;

    // Payment methods (InRange)
    const cardRevenue = transfersInRange.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (b.payment_amount || 0), 0);
    const cashRevenue = transfersInRange.filter(b => b.payment_status === 'cash_collected').reduce((sum, b) => sum + (b.payment_amount || 0), 0);

    // Daily revenue for the selected range (for chart)
    const dailyRevenue: { day: string; transfers: number; tours: number; total: number }[] = [];
    
    if (range) {
      const days = eachDayOfInterval(range);
      // If range is large, show fewer points or format differently. For now, daily.
      const displayDays = days.length > 31 ? days.filter((_, i) => i % Math.ceil(days.length / 15) === 0) : days;

      displayDays.forEach(date => {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const dayTransfers = transfersInRange.filter(b => {
          const d = parseISO(b.paid_at || b.created_at);
          return isWithinInterval(d, { start: dayStart, end: dayEnd });
        });

        const dayTours = toursInRange.filter(t => {
          const d = parseISO(t.paid_at || t.created_at);
          return isWithinInterval(d, { start: dayStart, end: dayEnd });
        });

        const tRev = dayTransfers.reduce((sum, b) => sum + (b.payment_amount || 0), 0);
        const rRev = dayTours.reduce((sum, t) => sum + (t.deposit_amount || t.final_price || 0), 0);

        dailyRevenue.push({
          day: format(date, days.length > 7 ? 'dd/MM' : 'EEE', { locale: el }),
          transfers: tRev,
          tours: rRev,
          total: tRev + rRev
        });
      });
    }

    return {
      totalRevenue,
      transfersRevenue,
      toursRevenue,
      transfersCount: transfersInRange.length,
      toursCount: toursInRange.length,
      cardRevenue,
      cashRevenue,
      dailyRevenue
    };
  }, [bookings, tourRequests, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // SOS Calculations (Operational - always based on 'Today' logic)
  const sosData = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayArrivals = bookings.filter(b => b.date === today && b.status === 'confirmed').length;
    const pendingTransfers = bookings.filter(b => b.status === 'pending').length;
    const pendingTours = tourRequests.filter(t => t.status === 'pending').length;
    const unassignedDrivers = bookings.filter(b => b.status === 'confirmed' && !b.driver_id && b.date >= today).length;

    return { todayArrivals, pendingTransfers, pendingTours, unassignedDrivers };
  }, [bookings, tourRequests]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SOS MISSION CONTROL - Premium Quick View */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-2 bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden group/sos">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-sky-500/5 pointer-events-none" />
        
        <div className="p-4 flex flex-col items-center justify-center text-center relative z-10">
          <div className="relative">
            <div className={cn("w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-500/20", sosData.todayArrivals > 0 && "animate-pulse")}>
              <Car className="w-6 h-6" />
            </div>
            {sosData.todayArrivals > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full" />}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ΑΦΙΞΕΙΣ ΣΗΜΕΡΑ</p>
          <h4 className="text-2xl font-black text-white">{sosData.todayArrivals}</h4>
        </div>

        <div className="p-4 flex flex-col items-center justify-center text-center relative z-10 border-l border-slate-800/50">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ΕΚΚΡΕΜΕΙΣ ΜΕΤΑΦΟΡΕΣ</p>
          <h4 className="text-2xl font-black text-white">{sosData.pendingTransfers}</h4>
        </div>

        <div className="p-4 flex flex-col items-center justify-center text-center relative z-10 border-t lg:border-t-0 lg:border-l border-slate-800/50">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ΝΕΑ ΑΙΤΗΜΑΤΑ ΕΚΔΡΟΜΩΝ</p>
          <h4 className="text-2xl font-black text-white">{sosData.pendingTours}</h4>
        </div>

        <div className="p-4 flex flex-col items-center justify-center text-center relative z-10 border-t border-l lg:border-t-0 border-slate-800/50">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ΧΩΡΙΣ ΟΔΗΓΟ</p>
          <h4 className="text-2xl font-black text-white">{sosData.unassignedDrivers}</h4>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">ΦΙΛΤΡΟ ΗΜΕΡΟΜΗΝΙΑΣ</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, 'dd MMM', { locale: el })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: el })}`
                : 'ΕΠΙΛΕΞΤΕ ΠΕΡΙΟΔΟ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}
            className="text-[10px] font-black uppercase tracking-widest h-9 rounded-lg hover:bg-slate-50"
           >
            7 ΗΜΕΡΕΣ
           </Button>
           <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}
            className="text-[10px] font-black uppercase tracking-widest h-9 rounded-lg hover:bg-slate-50"
           >
            ΑΥΤΟΣ Ο ΜΗΝΑΣ
           </Button>
           <div className="h-6 w-px bg-slate-100 mx-2" />
           <Popover>
            <PopoverTrigger asChild>
              <Button className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-slate-900/10">
                <CalendarIcon className="w-4 h-4" />
                ΕΠΙΛΟΓΗ
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden z-[100]" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="p-6 bg-white"
              />
            </PopoverContent>
           </Popover>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total revenue in period */}
        <Card className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Euro className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ΕΣΟΔΑ ΠΕΡΙΟΔΟΥ</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">✓</span>
            <span className="text-slate-400">επιβεβαιωμένα έσοδα</span>
          </div>
        </Card>

        {/* Transfers in period */}
        <Card className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ΜΕΤΑΦΟΡΕΣ</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.transfersRevenue)}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{stats.transfersCount} Trips</span>
            <span className="text-slate-400">στην περίοδο</span>
          </div>
        </Card>

        {/* Tours in period */}
        <Card className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ΕΚΔΡΟΜΕΣ</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.toursRevenue)}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{stats.toursCount} Tours</span>
            <span className="text-slate-400">στην περίοδο</span>
          </div>
        </Card>

        {/* Conversion/Efficiency (Placeholder Logic) */}
        <Card className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ΜΕΣΗ ΤΙΜΗ</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.totalRevenue > 0 ? stats.totalRevenue / (stats.transfersCount + stats.toursCount || 1) : 0)}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">AVG</span>
            <span className="text-slate-400">ανά επιβεβαιωμένη κράτηση</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 p-8 bg-white border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase flex items-center gap-2">
                ΑΝΑΠΤΥΞΗ ΕΣΟΔΩΝ
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-xs font-medium text-slate-400">Ανάλυση εσόδων για την επιλεγμένη περίοδο</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                 <div className="w-2 h-2 rounded-full bg-blue-500" /> Μεταφορές
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                 <div className="w-2 h-2 rounded-full bg-amber-500" /> Εκδρομές
               </div>
            </div>
          </div>
          
          <div className="h-80 relative z-10 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.4)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  tickFormatter={(v) => `€${v}`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #f1f5f9',
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="transfers" 
                  stackId="a"
                  fill="#3b82f6" 
                  radius={[0, 0, 0, 0]}
                  barSize={stats.dailyRevenue.length > 15 ? 15 : 40}
                />
                <Bar 
                  dataKey="tours" 
                  stackId="a"
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  barSize={stats.dailyRevenue.length > 15 ? 15 : 40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods & Platforms */}
        <div className="space-y-8">
          <Card className="p-8 bg-white border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase mb-6 flex items-center gap-2">
              ΤΡΟΠΟΙ ΠΛΗΡΩΜΗΣ
              <div className="h-1 w-4 rounded-full bg-emerald-500/20" />
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between group hover:bg-emerald-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">ΜΕΤΡΗΤΑ</p>
                    <p className="text-lg font-black text-emerald-900 leading-none">{formatCurrency(stats.cashRevenue)}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between group hover:bg-purple-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">ΚΑΡΤΑ</p>
                    <p className="text-lg font-black text-purple-900 leading-none">{formatCurrency(stats.cardRevenue)}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <p className="mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
              ΑΝΑΛΥΣΗ ΜΕΤΑΦΟΡΩΝ ΓΙΑ ΤΗΝ ΠΕΡΙΟΔΟ
            </p>
          </Card>

          <Card className="p-8 bg-slate-900 text-white border-none shadow-xl shadow-slate-200 shadow-md transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 blur-2xl" />
            
            <h3 className="text-xs font-black text-slate-400 tracking-tight leading-tight uppercase mb-6 flex items-center gap-2 relative z-10">
              ΠΛΑΤΦΟΡΜΕΣ
              <div className="h-1 w-4 rounded-full bg-emerald-400" />
            </h3>
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">LIV Website</span>
                  <span className="text-xs font-black text-emerald-400">92%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Direct</span>
                  <span className="text-xs font-black text-sky-400">8%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[8%] bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
