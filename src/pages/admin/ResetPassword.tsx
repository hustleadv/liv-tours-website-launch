import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Lock, Loader2, Shield, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if we have access token in URL (Supabase redirects with hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      // Session will be set automatically by Supabase
      supabase.auth.getSession();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Σφάλμα",
        description: "Οι κωδικοί δεν ταιριάζουν",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Σφάλμα",
        description: "Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Επιτυχία! ✓",
        description: "Ο κωδικός σας άλλαξε επιτυχώς.",
      });

      // Redirect to admin after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Κάτι πήγε στραβά",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      <SEOHead
        title="Επαναφορά Κωδικού | LIV Tours Admin"
        description="Reset your password"
        noindex={true}
      />

      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)/0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Νέος Κωδικός
            </h1>
            <p className="text-muted-foreground text-sm">
              Εισάγετε τον νέο σας κωδικό πρόσβασης
            </p>
          </div>

          {/* Card */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-xl overflow-hidden">
            {isSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ο κωδικός άλλαξε!</h3>
                <p className="text-sm text-muted-foreground">
                  Θα μεταφερθείτε στο διαχειριστικό panel...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Νέος κωδικός
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-12 bg-background/50"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Τουλάχιστον 6 χαρακτήρες
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Επιβεβαίωση κωδικού
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-12 bg-background/50"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Αλλαγή κωδικού
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} LIV Tours • Διαχειριστικό Panel
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
