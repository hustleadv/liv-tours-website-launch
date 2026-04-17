import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2, Users, LogIn, UserPlus, KeyRound, ArrowLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "liv_admin_remember";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Sign up is disabled for security. Admin must be created via Supabase dashboard.
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mouse tracking for interactive background
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200 });
  
  // Parallax transform
  const rotateX = useTransform(smoothY, [-500, 500], [5, -5]);
  const rotateY = useTransform(smoothX, [-500, 500], [-5, 5]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    mouseX.set(clientX - windowWidth / 2);
    mouseY.set(clientY - windowHeight / 2);
  }, [mouseX, mouseY]);

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
      if (session) navigate('/livy-hq');
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/livy-hq');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/livy-hq/reset-password`,
        });
        if (error) throw error;
        setResetEmailSent(true);
        toast({ title: "EMAIL ΕΣΤΑΛΗ! ✓", description: "Ελέγξτε το inbox σας για τον σύνδεσμο επαναφοράς κωδικού." });
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/livy-hq` },
        });
        if (error) throw error;
        toast({
          title: "ΕΠΙΤΥΧΗΣ ΕΓΓΡΑΦΗ! ✓",
          description: "Ο λογαριασμός σας δημιουργήθηκε. Επικοινωνήστε με τον διαχειριστή για ενεργοποίηση admin δικαιωμάτων.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (rememberMe) localStorage.setItem(STORAGE_KEY, JSON.stringify({ email })); else localStorage.removeItem(STORAGE_KEY);
        navigate('/livy-hq');
      }
    } catch (error: any) {
      toast({
        title: "ΣΦΑΛΜΑ",
        description: error.message || "ΚΑΤΙ ΠΗΓΕ ΣΤΡΑΒΑ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden font-manrope selection:bg-emerald-500/30"
      onMouseMove={handleMouseMove}
    >
      <SEOHead title="Admin Login | LIV Tours" description="Admin login page" noindex={true} />

      {/* Luxury Ambient Audio */}
      <audio 
        ref={audioRef}
        src="https://www.chosic.com/wp-content/uploads/2021/04/Warm-Atmospheric-Ambient.mp3"
        loop
      />

      {/* Floating Interactive Particles */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-500/40 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            style={{
              x: useTransform(smoothX, [-1000, 1000], [Math.random() * 150, Math.random() * -150]),
            }}
          />
        ))}
      </div>

      {/* Interactive Cursor Glow */}
      <motion.div 
        className="fixed z-[2] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none hidden lg:block"
        style={{ 
          x: useTransform(smoothX, (v) => v + window.innerWidth / 2 - 400),
          y: useTransform(smoothY, (v) => v + window.innerHeight / 2 - 400),
        }}
      />

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <motion.div 
          className="w-full max-w-md"
          style={{ rotateX, rotateY }}
        >
          {/* Header */}
          <motion.div 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 uppercase tracking-tight italic font-playfair drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              LIV ADMIN
            </h1>
            <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[9px] sm:text-[10px] md:text-xs">
              PREMIUM CONTROL SYSTEM
            </p>
          </motion.div>

          {/* Card */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/[0.06] backdrop-blur-3xl border border-white/10 rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity duration-1000" />
            
              {/* Toggle Tabs - DISABLED for security. Admin users should be managed via Supabase panel. */}
              {false && (
                <div className="flex border-b border-white/5 relative">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={cn(
                    "flex-1 py-7 px-4 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all relative z-10",
                    !isSignUp ? "text-white" : "text-slate-500 hover:text-white"
                  )}
                >
                  <LogIn className="w-4 h-4" />
                  ΣΥΝΔΕΣΗ
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={cn(
                    "flex-1 py-7 px-4 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all relative z-10",
                    isSignUp ? "text-white" : "text-slate-500 hover:text-white"
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  ΕΓΓΡΑΦΗ
                </button>
                <motion.div 
                  className="absolute bottom-0 h-[4px] bg-emerald-500 rounded-full"
                  initial={false}
                  animate={{ x: isSignUp ? '100%' : '0%', width: '50%' }}
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
                />
              </div>
            )}

            {isForgotPassword && (
              <div className="border-b border-white/5 p-7">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setResetEmailSent(false); }}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ΠΙΣΩ ΣΤΗ ΣΥΝΔΕΣΗ
                </button>
              </div>
            )}

            <div className="p-6 sm:p-10 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10">
                <AnimatePresence mode="wait">
                  {isForgotPassword ? (
                    <motion.div 
                      key="forgot"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="space-y-10"
                    >
                      {resetEmailSent ? (
                        <div className="text-center py-6">
                          <div className="w-24 h-24 mx-auto mb-10 rounded-[32px] bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-2xl shadow-emerald-500/20">
                            <Mail className="w-10 h-10 text-emerald-400" />
                          </div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Email Sent</h3>
                          <p className="text-slate-400 text-sm leading-relaxed mb-12 px-2">
                            Στείλαμε οδηγίες επαναφοράς στο <span className="text-emerald-400 font-black">{email}</span>
                          </p>
                          <Button
                            type="button"
                            onClick={() => { setIsForgotPassword(false); setResetEmailSent(false); }}
                            className="w-full h-16 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all border-none shadow-xl"
                          >
                            ΕΠΙΣΤΡΟΦΗ
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="text-center mb-10">
                             <h3 className="text-2xl font-black text-white uppercase tracking-tight italic font-playfair">ΕΠΑΝΑΦΟΡΑ ΚΩΔΙΚΟΥ</h3>
                             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.35em] mt-4">
                                ENTER YOUR EMAIL TO RESET
                             </p>
                          </div>

                          <div className="space-y-4">
                             <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">EMAIL ADDRESS</Label>
                             <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-500" />
                                <Input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="admin@livtours.gr"
                                  className="h-16 pl-14 bg-white/[0.04] border-white/5 rounded-2xl text-white placeholder:text-slate-700 focus:bg-white/[0.1] transition-all border-none focus:ring-1 focus:ring-emerald-500/50 text-base"
                                  required
                                />
                             </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 bg-emerald-500 text-white font-black uppercase tracking-[0.25em] rounded-2xl shadow-[0_20px_50px_-15px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all border-none text-[11px]"
                          >
                            {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : "ΑΠΟΣΤΟΛΗ ΣΥΝΔΕΣΜΟΥ"}
                          </Button>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="login"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="space-y-10"
                    >
                      {isSignUp && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[28px] p-5 mb-8 ring-1 ring-emerald-500/10 backdrop-blur-md">
                           <div className="flex gap-4">
                              <Users className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-[10px] font-black text-slate-300 leading-relaxed uppercase tracking-[0.2em]">
                                Δημιουργήστε λογαριασμό. Ο διαχειριστής θα ενεργοποιήσει τα δικαιώματά σας μετά την εγγραφή.
                              </p>
                           </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">EMAIL ADDRESS</Label>
                        <div className="relative group">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-500" />
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@livtours.gr"
                            className="h-16 pl-14 bg-white/[0.04] border-white/5 rounded-2xl text-white placeholder:text-slate-700 focus:bg-white/[0.1] transition-all border-none focus:ring-1 focus:ring-emerald-500/50 text-base"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                           <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">PASSWORD</Label>
                           {!isSignUp && (
                             <button
                               type="button"
                               onClick={() => setIsForgotPassword(true)}
                               className="text-[11px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-300 transition-all underline underline-offset-8 decoration-emerald-500/40"
                             >
                               ΞΕΧΑΣΑ ΤΟΝ ΚΩΔΙΚΟ
                             </button>
                           )}
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-500" />
                          <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-16 pl-14 bg-white/[0.04] border-white/5 rounded-2xl text-white placeholder:text-slate-700 focus:bg-white/[0.1] transition-all border-none focus:ring-1 focus:ring-emerald-500/50 text-base"
                            required
                          />
                        </div>
                      </div>

                      {!isSignUp && (
                        <div className="flex items-center gap-3 px-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked === true)}
                            className="w-6 h-6 border-white/10 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none rounded-xl"
                          />
                          <Label 
                            htmlFor="remember" 
                            className="text-[11px] font-black text-slate-500 cursor-pointer uppercase tracking-widest"
                          >
                            ΑΠΟΘΗΚΕΥΣΗ EMAIL
                          </Label>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 sm:h-18 py-6 mb-2 bg-emerald-500 text-white font-black uppercase tracking-[0.25em] rounded-2xl shadow-[0_25px_60px_-15px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all duration-300 border-none text-[11px] sm:text-[13px] group"
                      >
                        {isLoading ? (
                          <Loader2 className="w-7 h-7 animate-spin" />
                        ) : (
                          <div className="flex items-center justify-center gap-4">
                             <span>{isSignUp ? "ΔΗΜΙΟΥΡΓΙΑ ΛΟΓΑΡΙΑΣΜΟΥ" : "ΕΙΣΟΔΟΣ ΣΤΟ PANEL"}</span>
                             <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>

          {/* Footer Branding */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center space-y-6"
          >
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">
              © {new Date().getFullYear()} LIV Tours • AUTHORIZED ACCESS ONLY
            </p>
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/5">
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.6em] transition-colors hover:text-slate-400 cursor-default">
                POWERED BY <span className="text-slate-500">HUSTLELABS</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Floating Audio Toggle */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 z-[100]"
      >
        <button
          onClick={toggleMusic}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 group relative",
            isPlaying ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]" : "bg-white/5 text-slate-500 hover:text-white border border-white/5"
          )}
        >
          {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          
          {/* Status Label (Hover) */}
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isPlaying ? "MUTE AMBIENCE" : "PLAY AMBIENCE"}
          </span>

          {/* Luxury Pulse Ring */}
          {isPlaying && (
            <motion.div 
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-emerald-500/30 -z-10"
            />
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default AdminAuth;
