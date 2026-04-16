import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Save, 
  Loader2, 
  CreditCard, 
  BarChart3,
  Lock,
  Eye,
  EyeOff,
  Database,
  ArrowRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const SettingsManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  
  const [settings, setSettings] = useState({
    stripe_publishable_key: "",
    stripe_secret_key: "",
    google_analytics_id: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('*')
        .maybeSingle();
      if (data) {
        const d = data as any;
        setSettings({
          stripe_publishable_key: d.stripe_publishable_key || "",
          stripe_secret_key: d.stripe_secret_key || "",
          google_analytics_id: d.google_analytics_id || "",
        });
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: existing } = await supabase.from('site_settings' as any).select('id').maybeSingle();
      let error;
      if (existing) {
        ({ error } = await supabase.from('site_settings' as any).update(settings).eq('id', (existing as any).id));
      } else {
        ({ error } = await supabase.from('site_settings' as any).insert([settings]));
      }
      if (error) throw error;
      toast({ title: "Επιτυχία", description: "Οι ρυθμίσεις αποθηκεύτηκαν" });
      fetchSettings();
    } catch (error: any) {
      toast({ title: "Σφάλμα", description: "Δεν ήταν δυνατή η αποθήκευση", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const sqlSnippet = `CREATE TABLE IF NOT EXISTS public.site_settings (
    id SERIAL PRIMARY KEY,
    stripe_publishable_key TEXT,
    stripe_secret_key TEXT,
    google_analytics_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can do everything on site_settings" 
ON public.site_settings FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));`;

  return (
    <Card className="rounded-[32px] border-slate-100 overflow-hidden shadow-sm bg-white animate-fade-in relative">
      {isLoading ? (
        <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
      ) : (
        <Tabs defaultValue="stripe" className="w-full">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
             <TabsList className="bg-slate-100/50 rounded-2xl h-11 p-1">
                <TabsTrigger value="stripe" className="rounded-xl px-6 font-black text-[10px] uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-sm">
                   <CreditCard className="w-3.5 h-3.5 mr-2" /> Stripe
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-xl px-6 font-black text-[10px] uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-sm">
                   <BarChart3 className="w-3.5 h-3.5 mr-2" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="database" className="rounded-xl px-6 font-black text-[10px] uppercase data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-sm">
                   <Database className="w-3.5 h-3.5 mr-2" /> Database
                </TabsTrigger>
             </TabsList>
             <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="h-11 px-8 rounded-xl bg-slate-900 text-white font-black shadow-lg shadow-slate-200/50 hover:bg-emerald-600 transition-all"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                Αποθήκευση
              </Button>
          </div>

          <div className="p-8">
             <TabsContent value="stripe" className="mt-0 space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-1 border border-slate-100 rounded-[28px] p-6 bg-slate-50/50">
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-2">Υπηρεσία Πληρωμών</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6">Συνδέστε το Stripe για την επεξεργασία των καρτών και των κρατήσεων.</p>
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px]">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         LIVE MODE
                      </div>
                   </div>
                   <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-4">
                         <Label className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Publishable Key</Label>
                         <Input 
                            value={settings.stripe_publishable_key}
                            onChange={(e) => setSettings(p => ({...p, stripe_publishable_key: e.target.value}))}
                            placeholder="pk_live_..."
                            className="h-14 rounded-2xl bg-white border-slate-100 font-mono text-sm px-5"
                         />
                      </div>
                      <div className="space-y-4">
                         <Label className="font-black text-slate-500 uppercase tracking-widest text-[10px] flex justify-between">
                            Secret Key
                            <button onClick={() => setShowSecret(!showSecret)} className="text-blue-500">
                               {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                         </Label>
                         <Input 
                            type={showSecret ? "text" : "password"}
                            value={settings.stripe_secret_key}
                            onChange={(e) => setSettings(p => ({...p, stripe_secret_key: e.target.value}))}
                            placeholder="sk_live_..."
                            className="h-14 rounded-2xl bg-white border-slate-100 font-mono text-sm px-5"
                         />
                      </div>
                   </div>
                </div>
             </TabsContent>

             <TabsContent value="analytics" className="mt-0 space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-1 border border-slate-100 rounded-[28px] p-6 bg-slate-50/50">
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-2">Στατιστικά</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6">Παρακολουθήστε την επισκεψιμότητα και τις κρατήσεις σας σε πραγματικό χρόνο.</p>
                      <a href="https://analytics.google.com" target="_blank" className="flex items-center gap-2 text-blue-600 font-black text-[10px] hover:underline">
                         Ανοίξτε το GA4 <ArrowRight className="w-3 h-3" />
                      </a>
                   </div>
                   <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-4">
                         <Label className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Measurement ID (G-XXXX)</Label>
                         <Input 
                            value={settings.google_analytics_id}
                            onChange={(e) => setSettings(p => ({...p, google_analytics_id: e.target.value}))}
                            placeholder="G-..."
                            className="h-14 rounded-2xl bg-white border-slate-100 font-mono text-sm px-5"
                         />
                      </div>
                   </div>
                </div>
             </TabsContent>

             <TabsContent value="database" className="mt-0 space-y-6 animate-in fade-in duration-500">
                <div className="space-y-4">
                   <Label className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Database Schema (SQL Editor)</Label>
                   <div className="relative">
                      <pre className="p-8 bg-slate-900 text-slate-100 rounded-[24px] overflow-x-auto text-[11px] leading-relaxed font-mono border border-slate-800 shadow-inner">
                        <code>{sqlSnippet}</code>
                      </pre>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-4 right-4 h-8 text-[11px] font-black rounded-lg bg-white/10 hover:bg-white/20 text-white border-none"
                        onClick={() => {
                          navigator.clipboard.writeText(sqlSnippet);
                          toast({ title: "Αντιγράφηκε!" });
                        }}
                      >
                        Copy SQL
                      </Button>
                   </div>
                </div>
             </TabsContent>
          </div>
        </Tabs>
      )}
    </Card>
  );
};
