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
  Legend
} from "recharts";
import { TrendingUp, Euro, CreditCard, Banknote, ChevronUp, ChevronDown, Car, Compass, ChevronRight, Clock, UserCheck } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { el } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface RevenueBooking {
  id: string;
  status: string;
  payment_status: string | null;
  payment_amount: number | null;
  paid_at: string | null;
  created_at: string;
  date: string;
  driver_id: string | null;
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

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // === TRANSFERS ===
    const paidTransfers = bookings.filter(b => 
      b.status === 'confirmed' && 
      (b.payment_status === 'paid' || b.payment_status === 'cash_collected' || b.payment_amount)
    );

    const transfersTotal = paidTransfers.reduce((sum, b) => 
      sum + (b.payment_amount || 0), 0
    );

    const transfersThisMonth = paidTransfers.filter(b => {
      try {
        const paidDate = b.paid_at ? parseISO(b.paid_at) : parseISO(b.created_at);
        return isWithinInterval(paidDate, { start: monthStart, end: monthEnd });
      } catch {
        return false;
      }
    });
    const transfersMonthRevenue = transfersThisMonth.reduce((sum, b) => 
      sum + (b.payment_amount || 0), 0
    );

    const transfersLast7Days = paidTransfers.filter(b => {
      try {
        const paidDate = b.paid_at ? parseISO(b.paid_at) : parseISO(b.created_at);
        return paidDate >= sevenDaysAgo;
      } catch {
        return false;
      }
    });
    const transfers7DaysRevenue = transfersLast7Days.reduce((sum, b) => 
      sum + (b.payment_amount || 0), 0
    );

    // === TOURS ===
    const paidTours = tourRequests.filter(t => 
      (t.status === 'confirmed' || t.status === 'price_confirmed') && 
      (t.payment_status === 'paid' || t.payment_status === 'deposit_paid')
    );

    const toursTotal = paidTours.reduce((sum, t) => 
      sum + (t.deposit_amount || t.final_price || 0), 0
    );

    const toursThisMonth = paidTours.filter(t => {
      try {
        const paidDate = t.paid_at ? parseISO(t.paid_at) : parseISO(t.created_at);
        return isWithinInterval(paidDate, { start: monthStart, end: monthEnd });
      } catch {
        return false;
      }
    });
    const toursMonthRevenue = toursThisMonth.reduce((sum, t) => 
      sum + (t.deposit_amount || t.final_price || 0), 0
    );

    const toursLast7Days = paidTours.filter(t => {
      try {
        const paidDate = t.paid_at ? parseISO(t.paid_at) : parseISO(t.created_at);
        return paidDate >= sevenDaysAgo;
      } catch {
        return false;
      }
    });
    const tours7DaysRevenue = toursLast7Days.reduce((sum, t) => 
      sum + (t.deposit_amount || t.final_price || 0), 0
    );

    // === TOTALS ===
    const totalRevenue = transfersTotal + toursTotal;
    const thisMonthRevenue = transfersMonthRevenue + toursMonthRevenue;
    const last7DaysRevenue = transfers7DaysRevenue + tours7DaysRevenue;

    // Card vs Cash breakdown (only for transfers)
    const cardPayments = paidTransfers.filter(b => b.payment_status === 'paid');
    const cashPayments = paidTransfers.filter(b => b.payment_status === 'cash_collected');
    
    const cardRevenue = cardPayments.reduce((sum, b) => 
      sum + (b.payment_amount || 0), 0
    );
    const cashRevenue = cashPayments.reduce((sum, b) => 
      sum + (b.payment_amount || 0), 0
    );

    // Daily revenue for last 7 days (for chart) - combined
    const dailyRevenue: { day: string; transfers: number; tours: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTransfers = paidTransfers.filter(b => {
        try {
          const paidDate = b.paid_at ? parseISO(b.paid_at) : parseISO(b.created_at);
          return isWithinInterval(paidDate, { start: dayStart, end: dayEnd });
        } catch {
          return false;
        }
      });

      const dayTours = paidTours.filter(t => {
        try {
          const paidDate = t.paid_at ? parseISO(t.paid_at) : parseISO(t.created_at);
          return isWithinInterval(paidDate, { start: dayStart, end: dayEnd });
        } catch {
          return false;
        }
      });

      const transfersRev = dayTransfers.reduce((sum, b) => sum + (b.payment_amount || 0), 0);
      const toursRev = dayTours.reduce((sum, t) => sum + (t.deposit_amount || t.final_price || 0), 0);

      dailyRevenue.push({
        day: format(date, 'EEE', { locale: el }),
        transfers: transfersRev,
        tours: toursRev,
        total: transfersRev + toursRev
      });
    }

    return {
      // Totals
      totalRevenue,
      thisMonthRevenue,
      last7DaysRevenue,
      // Transfers
      transfersTotal,
      transfersMonthRevenue,
      transfers7DaysRevenue,
      transfersCount: paidTransfers.length,
      // Tours
      toursTotal,
      toursMonthRevenue,
      tours7DaysRevenue,
      toursCount: paidTours.length,
      // Payment methods
      cardRevenue,
      cashRevenue,
      // Chart data
      dailyRevenue
    };
  }, [bookings, tourRequests]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // SOS Calculations
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 bg-slate-900 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden group/sos">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-sky-500/5 pointer-events-none" />
        
        <div className="p-4 flex flex-col items-center justify-center text-center relative z-10">
          <div className="relative">
            <div className={cn("w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-500/20", sosData.todayArrivals > 0 && "animate-pulse")}>
              <Car className="w-6 h-6" />
            </div>
            {sosData.todayArrivals > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full" />}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Αφίξεις Σήμερα</p>
          <h4 className="text-2xl font-black text-white">{sosData.todayArrivals}</h4>
        </div>

        <div className="p-4 flex flex-col items-center justify-center text-center relative z-10 border-l border-slate-800/50">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Εκκρεμείς Μεταφορές</p>
          <h4 className="text-2xl font-black text-white">{sosData.pendingTransfers}</h4>
        </div>

        <div className="p-4 flex flex-col items-center justify-center text-center relative z-10 border-l border-slate-800/50">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Νέα Αιτήματα Εκδρομών</p>
          <h4 className="text-2xl font-black text-white">{sosData.pendingTours}</h4>
        </div>

        <div className="p-4 flex flex-col items-center justify-center text-center relative z-10 border-l border-slate-800/50">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Χωρίς Οδηγό</p>
          <h4 className="text-2xl font-black text-white">{sosData.unassignedDrivers}</h4>
        </div>
      </div>      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Euro className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Συνολικά Έσοδα</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
            <span className="text-slate-400">από τον προηγούμενο μήνα</span>
          </div>
        </Card>

        {/* This Month */}
        <Card className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Αυτό τον Μήνα</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.thisMonthRevenue)}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{stats.transfersCount + stats.toursCount}</span>
            <span className="text-slate-400">συνολικές κρατήσεις</span>
          </div>
        </Card>

        {/* Transfers */}
        <Card className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Μεταφορές</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.transfersMonthRevenue)}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{stats.transfersCount}</span>
            <span className="text-slate-400">ολοκληρωμένα δρομολόγια</span>
          </div>
        </Card>

        {/* Tours */}
        <Card className="p-6 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Εκδρομές</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(stats.toursMonthRevenue)}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">{stats.toursCount}</span>
            <span className="text-slate-400">ενεργά αιτήματα</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 p-8 bg-white border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase flex items-center gap-2">
                Ανάπτυξη Εσόδων
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-xs font-medium text-slate-400">Ημερήσια έσοδα τελευταίων 7 ημερών</p>
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
                  barSize={40}
                />
                <Bar 
                  dataKey="tours" 
                  stackId="a"
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods & Platforms */}
        <div className="space-y-8">
          <Card className="p-8 bg-white border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase mb-6 flex items-center gap-2">
              Τρόποι Πληρωμής
              <div className="h-1 w-4 rounded-full bg-emerald-500/20" />
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between group hover:bg-emerald-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Μετρητά</p>
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
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Κάρτα</p>
                    <p className="text-lg font-black text-purple-900 leading-none">{formatCurrency(stats.cardRevenue)}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-slate-900 text-white border-none shadow-xl shadow-slate-200 shadow-md transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 blur-2xl" />
            
            <h3 className="text-xs font-black text-slate-400 tracking-tight leading-tight uppercase mb-6 flex items-center gap-2 relative z-10">
              Πλατφόρμες
              <div className="h-1 w-4 rounded-full bg-emerald-400" />
            </h3>
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">LIV Website</span>
                  <span className="text-xs font-black text-emerald-400">85%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Manual</span>
                  <span className="text-xs font-black text-sky-400">15%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[15%] bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

};
