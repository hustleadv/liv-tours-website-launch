import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  Shield, 
  ShieldOff, 
  Loader2, 
  Users, 
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  isAdmin: boolean;
}

export const UsersManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-admin-users');
      if (error) throw error;
      setUsers(data?.users || []);
    } catch (error: any) {
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η φόρτωση των χρηστών",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentIsAdmin: boolean) => {
    setUpdatingUserId(userId);
    try {
      if (currentIsAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        if (error) throw error;
        toast({ title: "Επιτυχία", description: "Τα δικαιώματα admin αφαιρέθηκαν" });
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
        toast({ title: "Επιτυχία", description: "Τα δικαιώματα admin προστέθηκαν" });
      }
      await fetchUsers();
    } catch (error: any) {
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η ενημέρωση",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Σύνολο', value: users.length, color: 'text-slate-900' },
          { label: 'Admins', value: users.filter(u => u.isAdmin).length, color: 'text-emerald-600' },
          { label: 'Απλοί', value: users.filter(u => !u.isAdmin).length, color: 'text-slate-400' },
          { label: 'Ενεργοί', value: users.filter(u => u.last_sign_in_at).length, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <Card className="rounded-[32px] border-slate-100 overflow-hidden shadow-sm bg-white">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
           <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Όλοι οι Χρήστες</h2>
              <p className="text-xs text-slate-400 font-bold">Διαχειριστείτε την ομάδα σας</p>
           </div>
           <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={isLoading} className="rounded-xl font-bold">
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Ανανέωση
           </Button>
        </div>

        {isLoading ? (
           <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
        ) : (
           <div className="divide-y divide-slate-50">
              {users.map(user => (
                <div key={user.id} className="p-6 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                         <Mail className="w-6 h-6" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-slate-900 text-sm tracking-tight">{user.email}</span>
                            {user.isAdmin && <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-100">Admin</span>}
                         </div>
                         <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(user.created_at)}</span>
                            {user.last_sign_in_at && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Online</span>}
                         </div>
                      </div>
                   </div>
                   <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdminRole(user.id, user.isAdmin)}
                      disabled={updatingUserId === user.id}
                      className={cn(
                        "rounded-xl h-10 font-bold px-6",
                        user.isAdmin ? "text-red-500 border-red-100 hover:bg-red-50" : "text-emerald-500 border-emerald-100 hover:bg-emerald-50"
                      )}
                    >
                      {updatingUserId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.isAdmin ? "Αφαίρεση Admin" : "Ορισμός Admin"}
                   </Button>
                </div>
              ))}
           </div>
        )}
      </Card>
    </div>
  );
};
