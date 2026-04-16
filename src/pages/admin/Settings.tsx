import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Save, 
  Loader2, 
  CreditCard, 
  BarChart3,
  Lock,
  Eye,
  EyeOff,
  Database
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  
  const [settings, setSettings] = useState({
    stripe_publishable_key: "",
    stripe_secret_key: "",
    google_analytics_id: "",
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/auth');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // We always look for the row with id: 1
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching settings:', error);
        // Table might not exist yet or permission denied
        if (error.code === 'PGRST116' || (error.message && error.message.includes('relation "site_settings" does not exist'))) {
          // This is expected if table is not created yet
          console.log('Site settings table not found or empty');
        } else if (error.code === '42501') {
          toast({
            title: "Πρόβλημα Πρόσβασης",
            description: "Δεν έχετε δικαιώματα ανάγνωσης των ρυθμίσεων (RLS).",
            variant: "destructive",
          });
        }
      } else if (data) {
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
      // Use upsert to handle both insert and update in one call
      // We always target the first row (id: 1) to ensure single settings object
      const { error } = await supabase
        .from('site_settings' as any)
        .upsert({ 
          id: 1, 
          ...settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: "Επιτυχία",
        description: "Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς",
      });
      
      // Refresh settings
      fetchSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      
      let errorMessage = error.message || "Δεν ήταν δυνατή η αποθήκευση";
      
      // Provide more helpful info for common errors
      if (error.code === '42P01' || (errorMessage && errorMessage.includes('relation "site_settings" does not exist'))) {
        errorMessage = "Ο πίνακας 'site_settings' λείπει από τη βάση. Παρακαλώ τρέξτε το SQL στην καρτέλα 'Database SQL'.";
      } else if (error.code === '42501') {
        errorMessage = "Δεν έχετε δικαιώματα εγγραφής (RLS Policy). Βεβαιωθείτε ότι είστε Admin στη Supabase.";
      } else if (error.code === '23505') {
        errorMessage = "Υπάρχει ήδη μια εγγραφή. Δοκιμάστε να ανανεώσετε τη σελίδα.";
      }

      toast({
        title: "Σφάλμα",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sqlSnippet = `-- 1. Create the site_settings table with a single-row constraint
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    stripe_publishable_key TEXT,
    stripe_secret_key TEXT,
    google_analytics_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- 2. Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policy if it exists and create a new one
DROP POLICY IF EXISTS "Admins can do everything on site_settings" ON public.site_settings;

CREATE POLICY "Admins can do everything on site_settings" 
ON public.site_settings 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Initial insert (optional)
INSERT INTO public.site_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- 5. Grant permissions to authenticated users
GRANT ALL ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
`;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SEOHead
        title="Ρυθμίσεις | LIV Tours Admin"
        description="System configuration"
        noindex={true}
      />

      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <h1 className="font-semibold text-primary uppercase tracking-tight">Ρυθμίσεις Συστήματος</h1>
            </div>
          </div>
          <Button
            variant="hero"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Αποθήκευση
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <Tabs defaultValue="stripe" className="w-full">
            <div className="px-6 pt-6 border-b border-border bg-muted/20">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-200/50 dark:bg-slate-800/50">
                <TabsTrigger value="stripe" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Stripe
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Google Analytics
                </TabsTrigger>
                <TabsTrigger value="database" className="gap-2">
                  <Database className="w-4 h-4" />
                  Database SQL
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              {isLoading ? (
                <div className="py-20 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-accent" />
                </div>
              ) : (
                <>
                  <TabsContent value="stripe" className="mt-0 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                        <CreditCard className="w-5 h-5" />
                        Ρυθμίσεις Stripe
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Εισάγετε τα κλειδιά της Stripe για την επεξεργασία πληρωμών.
                      </p>
                    </div>

                    <div className="grid gap-6 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="publishable-key">Stripe Publishable Key</Label>
                        <Input
                          id="publishable-key"
                          placeholder="pk_live_..."
                          value={settings.stripe_publishable_key}
                          onChange={(e) => setSettings(prev => ({ ...prev, stripe_publishable_key: e.target.value }))}
                          className="font-mono text-sm h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secret-key">Stripe Secret Key</Label>
                        <div className="relative">
                          <Input
                            id="secret-key"
                            type={showSecret ? "text" : "password"}
                            placeholder="sk_live_..."
                            value={settings.stripe_secret_key}
                            onChange={(e) => setSettings(prev => ({ ...prev, stripe_secret_key: e.target.value }))}
                            className="font-mono text-sm h-11 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex items-start gap-2 mt-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200/50">
                          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>
                            To Stripe Secret Key είναι εμπιστευτικό. Μην το κοινοποιείτε ποτέ.
                            Θα χρησιμοποιηθεί από τις Supabase Edge Functions για τη δημιουργία πληρωμών.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                        <BarChart3 className="w-5 h-5" />
                        Google Analytics (GA4)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Συνδέστε το Google Analytics 4 εισάγοντας το Measurement ID.
                      </p>
                    </div>

                    <div className="grid gap-6 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="ga-id">Measurement ID (G-XXXXX)</Label>
                        <Input
                          id="ga-id"
                          placeholder="G-..."
                          value={settings.google_analytics_id}
                          onChange={(e) => setSettings(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                          className="font-mono text-sm h-11"
                        />
                      </div>
                      
                      <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Πώς λειτουργεί:</strong> Όταν ορίσετε το ID, το σύστημα θα φορτώσει αυτόματα το σενάριο (script) της Google σε όλες τις σελίδες και θα αρχίσει την καταγραφή των γεγονότων (events) που έχουν ήδη ρυθμιστεί στον κώδικα (όπως κρατήσεις, κλικ στο WhatsApp κ.λπ.).
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="database" className="mt-0 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                        <Database className="w-5 h-5" />
                        Προετοιμασία Βάσης Δεδομένων
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Αν η σελίδα εμφανίζει σφάλμα, βεβαιωθείτε ότι έχετε δημιουργήσει τον πίνακα <code>site_settings</code> στη Supabase.
                      </p>
                    </div>

                    <div className="relative group">
                      <pre className="p-6 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[13px] leading-relaxed font-mono border border-slate-800 shadow-inner">
                        <code>{sqlSnippet}</code>
                      </pre>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-4 right-4 h-8 text-[11px]"
                        onClick={() => {
                          navigator.clipboard.writeText(sqlSnippet);
                          toast({ title: "Αντιγράφηκε!" });
                        }}
                      >
                        Αντιγραφή SQL
                      </Button>
                    </div>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>

        <div className="mt-8 flex items-center justify-between px-4">
          <p className="text-xs text-muted-foreground">
            LIV Tours Admin Panel • Settings v1.0
          </p>
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1 text-xs text-green-500">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Database Connected
             </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
