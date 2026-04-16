import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Car, 
  Plus, 
  Trash2, 
  Phone, 
  UserCheck, 
  UserX, 
  Loader2, 
  Search,
  RefreshCw,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Truck
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string | null;
  is_active: boolean;
  created_at: string;
}

const DriversAdmin = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: "", phone: "", vehicle_type: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/admin/auth'); return; }
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) { navigate('/'); return; }
      setIsAdmin(true);
      fetchDrivers();
    };
    checkAuth();
  }, [navigate]);

  const fetchDrivers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: "Σφάλμα", description: "Δεν ήταν δυνατή η φόρτωση των οδηγών", variant: "destructive" });
    } else {
      setDrivers(data || []);
    }
    setIsLoading(false);
  };

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.phone) {
      toast({ title: "Σφάλμα", description: "Συμπληρώστε όνομα και τηλέφωνο", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from('drivers')
      .insert({
        name: newDriver.name,
        phone: newDriver.phone,
        vehicle_type: newDriver.vehicle_type || null,
        is_active: true
      });

    if (error) {
      toast({ title: "Σφάλμα", description: "Αποτυχία προσθήκης οδηγού", variant: "destructive" });
    } else {
      toast({ title: "Επιτυχία", description: "Ο οδηγός προστέθηκε" });
      setNewDriver({ name: "", phone: "", vehicle_type: "" });
      setShowAddModal(false);
      fetchDrivers();
    }
    setIsSaving(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('drivers')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: "Σφάλμα", description: "Αποτυχία ενημέρωσης", variant: "destructive" });
    } else {
      toast({ title: !currentStatus ? "Ενεργοποιήθηκε" : "Απενεργοποιήθηκε", description: "Η κατάσταση ενημερώθηκε" });
      fetchDrivers();
    }
  };

  const deleteDriver = async (id: string) => {
    if (!window.confirm("Σίγουρα θέλετε να διαγράψετε αυτόν τον οδηγό;")) return;

    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Σφάλμα", description: "Αποτυχία διαγραφής", variant: "destructive" });
    } else {
      toast({ title: "Διαγράφηκε", description: "Ο οδηγός αφαιρέθηκε" });
      fetchDrivers();
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.phone.includes(searchQuery)
  );

  if (!isAdmin && !isLoading) return null;

  return (
    <AdminLayout
      title="Διαχείριση Οδηγών"
      subtitle="Προσθέστε και διαχειριστείτε τους οδηγούς του στόλου σας."
      actions={
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={fetchDrivers} className="h-11 rounded-xl shadow-sm gap-2 font-bold px-6 border-slate-200">
             <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
             Ανανέωση
           </Button>
           <Button onClick={() => setShowAddModal(true)} className="h-11 rounded-xl bg-slate-900 text-white shadow-xl gap-2 font-bold px-6">
             <Plus className="w-4 h-4" />
             Προσθήκη Οδηγού
           </Button>
        </div>
      }
    >
      <SEOHead title="Διαχείριση Οδηγών | LIV Tours Admin" description="Manage fleet drivers" noindex={true} />

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            placeholder="Αναζήτηση οδηγού (Όνομα, Τηλέφωνο)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 w-full bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 transition-all font-medium"
          />
        </div>
      </div>

      {/* Driver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-400">
             <Loader2 className="w-10 h-10 animate-spin" />
             <p className="font-bold">Φόρτωση οδηγών...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <Card className="col-span-full p-20 text-center border-dashed border-2 bg-transparent flex flex-col items-center gap-4 border-slate-100">
            <Car className="w-12 h-12 text-slate-200" />
            <p className="text-slate-400 font-bold">Δεν βρέθηκαν οδηγοί</p>
          </Card>
        ) : (
          filteredDrivers.map((driver) => (
            <Card 
              key={driver.id}
              className={cn(
                "group rounded-[32px] border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 relative",
                driver.is_active ? "border-l-[6px] border-l-emerald-400" : "border-l-[6px] border-l-slate-300 contrast-75 grayscale"
              )}
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner group-hover:scale-105 transition-transform">
                        <User className="w-7 h-7" />
                     </div>
                     <div>
                       <h4 className="font-black text-slate-900 text-lg tracking-tight mb-1">{driver.name}</h4>
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                            driver.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}>
                            {driver.is_active ? "Ενεργός" : "Ανενεργός"}
                          </div>
                          {driver.vehicle_type && (
                            <div className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                               {driver.vehicle_type}
                            </div>
                          )}
                       </div>
                     </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-600">
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                     </div>
                     <span className="text-sm font-bold">{driver.phone}</span>
                  </div>
                  {driver.vehicle_type && (
                    <div className="flex items-center gap-3 text-slate-600">
                       <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                       </div>
                       <span className="text-sm font-bold">Όχημα: {driver.vehicle_type}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-xl h-11 font-black text-xs gap-2 border-slate-100 hover:bg-slate-50"
                    onClick={() => toggleStatus(driver.id, driver.is_active)}
                  >
                    {driver.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    {driver.is_active ? "Απενεργ." : "Ενεργ."}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-11 h-11 p-0 rounded-xl border-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                    onClick={() => deleteDriver(driver.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
           <div className="relative w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl p-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-6">Νέος Οδηγός</h3>
              <div className="space-y-6">
                <div>
                   <Label className="font-bold text-slate-700 mb-2 block">Ονοματεπώνυμο</Label>
                   <Input 
                    value={newDriver.name} 
                    onChange={e => setNewDriver({...newDriver, name: e.target.value})}
                    placeholder="π.χ. Γιάννης Παπαδόπουλος"
                    className="h-12 rounded-xl border-slate-200"
                   />
                </div>
                <div>
                   <Label className="font-bold text-slate-700 mb-2 block">Τηλέφωνο (WhatsApp)</Label>
                   <Input 
                    value={newDriver.phone} 
                    onChange={e => setNewDriver({...newDriver, phone: e.target.value})}
                    placeholder="π.χ. +30 69..."
                    className="h-12 rounded-xl border-slate-200"
                   />
                </div>
                <div>
                   <Label className="font-bold text-slate-700 mb-2 block">Τύπος Οχήματος (π.χ. Van, Sedan)</Label>
                   <Input 
                    value={newDriver.vehicle_type} 
                    onChange={e => setNewDriver({...newDriver, vehicle_type: e.target.value})}
                    placeholder="Optional"
                    className="h-12 rounded-xl border-slate-200"
                   />
                </div>
                
                <div className="flex gap-3 pt-6">
                   <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1 h-14 rounded-2xl font-black">Άκυρο</Button>
                   <Button 
                    onClick={handleAddDriver} 
                    disabled={isSaving}
                    className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-200"
                   >
                     {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Προσθήκη"}
                   </Button>
                </div>
              </div>
           </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DriversAdmin;
