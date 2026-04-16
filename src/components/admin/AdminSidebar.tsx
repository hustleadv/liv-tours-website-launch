import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  MessageCircle, 
  Star, 
  Euro, 
  Users, 
  Settings, 
  Car,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Compass,
  MapPin,
  RefreshCw,
  BarChart3,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar = ({ onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      label: "Επισκόπηση", 
      icon: BarChart3, 
      path: "/admin",
      state: { tab: 'stats' },
      id: 'stats'
    },
    { 
      label: "Κρατήσεις", 
      icon: LayoutDashboard, 
      path: "/admin",
      state: { tab: 'pending' },
      id: 'dashboard'
    },
    { 
      label: "Εκδρομές", 
      icon: Compass, 
      path: "/admin/tours",
      id: 'tours'
    },
    { 
      label: "Τιμές", 
      icon: Euro, 
      path: "/admin/paste-prices",
      id: 'prices'
    },
    { 
      label: "Χρήστες", 
      icon: Users, 
      path: "/admin",
      state: { tab: 'users' },
      id: 'users'
    },
    { 
      label: "Οδηγοί", 
      icon: Car, 
      path: "/admin/drivers",
      id: 'drivers'
    },
    { 
      label: "Οδηγός", 
      icon: BookOpen, 
      path: "/admin",
      state: { tab: 'guide' },
      id: 'guide'
    },
    { 
      label: "Ρυθμίσεις", 
      icon: Settings, 
      path: "/admin",
      state: { tab: 'settings' },
      id: 'settings'
    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/auth');
    toast({
      title: "Αποσύνδεση",
      description: "Αποσυνδεθήκατε με επιτυχία",
    });
  };

  const isActive = (item: any) => {
    if (location.pathname !== item.path) return false;
    // If it's a dashboard tab, check strictly for matching state tab
    if (item.path === '/admin' && item.state?.tab) {
      const currentTab = location.state?.tab || 'stats'; // Dashboard defaults to 'stats'
      return currentTab === item.state.tab;
    }
    // For other paths, pathname match is enough
    return true;
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-300 border-r border-slate-800">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-white font-black tracking-tight text-lg">LIV ADMIN</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Premium Control</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path, { state: item.state });
                if (onClose) onClose();
              }}
              className={cn(
                "group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative overflow-hidden",
                active 
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10" 
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-sky-400" />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
              )} />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform duration-300",
                active ? "translate-x-0 opacity-100" : "translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              )} />
            </button>
          );
        })}
      </div>

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span>Αποσύνδεση</span>
        </button>
        
        <div className="mt-4 flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
            AD
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Administrator</p>
            <p className="text-[10px] text-slate-500 truncate">LIV Tours Crete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
