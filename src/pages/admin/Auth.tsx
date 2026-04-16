import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2, Users, Shield, LogIn, UserPlus, KeyRound, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const STORAGE_KEY = "liv_admin_remember";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { email: savedEmail } = JSON.parse(saved);
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/admin');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/admin');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error) throw error;
        setResetEmailSent(true);
        toast({
          title: "Email εστάλη! ✓",
          description: "Ελέγξτε το inbox σας για τον σύνδεσμο επαναφοράς κωδικού.",
        });
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        if (error) throw error;
        toast({
          title: "Επιτυχής εγγραφή! ✓",
          description: "Ο λογαριασμός σας δημιουργήθηκε. Επικοινωνήστε με τον διαχειριστή για ενεργοποίηση admin δικαιωμάτων.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Save or clear email based on remember me
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ email }));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = error.message || "Κάτι πήγε στραβά";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Λάθος email ή κωδικός πρόσβασης";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "Αυτό το email χρησιμοποιείται ήδη";
      } else if (error.message?.includes("Password should be")) {
        errorMessage = "Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες";
      }
      
      toast({
        title: "Σφάλμα",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      <SEOHead
        title="Admin Login | LIV Tours"
        description="Admin login page"
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
              LIV Tours Admin
            </h1>
            <p className="text-muted-foreground text-sm">
              Διαχείριση κρατήσεων & εκδρομών
            </p>
          </div>

          {/* Card */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-xl overflow-hidden">
            {/* Toggle Tabs - Hide when forgot password */}
            {!isForgotPassword && (
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                    !isSignUp 
                      ? 'bg-primary/5 text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Σύνδεση
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                    isSignUp 
                      ? 'bg-primary/5 text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Νέος Λογαριασμός
                </button>
              </div>
            )}

            {/* Forgot Password Header */}
            {isForgotPassword && (
              <div className="border-b border-border p-4">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Πίσω στη σύνδεση
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Forgot Password View */}
              {isForgotPassword ? (
                <>
                  {resetEmailSent ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ελέγξτε το email σας</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Στείλαμε σύνδεσμο επαναφοράς κωδικού στο <strong>{email}</strong>
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackToLogin}
                        className="w-full"
                      >
                        Πίσω στη σύνδεση
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <KeyRound className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <h3 className="text-lg font-semibold">Επαναφορά κωδικού</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Εισάγετε το email σας για να λάβετε σύνδεσμο επαναφοράς
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@liv-tours.com"
                            className="pl-10 h-12 bg-background/50"
                            required
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
                            <Mail className="w-4 h-4 mr-2" />
                            Αποστολή συνδέσμου
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {isSignUp && (
                    <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-2">
                      <div className="flex gap-3">
                        <Users className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Εγγραφή Ομάδας
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Δημιουργήστε λογαριασμό για πρόσβαση στο διαχειριστικό panel. 
                            Μετά την εγγραφή, ο διαχειριστής θα ενεργοποιήσει τα δικαιώματά σας.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@liv-tours.com"
                        className="pl-10 h-12 bg-background/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Κωδικός πρόσβασης
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
                    {isSignUp && (
                      <p className="text-xs text-muted-foreground">
                        Τουλάχιστον 6 χαρακτήρες
                      </p>
                    )}
                  </div>

                  {!isSignUp && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                        />
                        <Label 
                          htmlFor="remember" 
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          Αποθήκευση email
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        Ξέχασα τον κωδικό
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isSignUp ? (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Δημιουργία Λογαριασμού
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Σύνδεση
                      </>
                    )}
                  </Button>
                </>
              )}
            </form>
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

export default AdminAuth;
