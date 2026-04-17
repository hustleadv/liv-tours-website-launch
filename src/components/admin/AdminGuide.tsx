import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Phone, 
  CreditCard, 
  Car, 
  Compass, 
  Bell,
  Search,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Brain,
  Bot,
  Zap
} from "lucide-react";

interface AdminGuideProps {
  onNavigate?: (tab: any) => void;
}

export const AdminGuide = ({ onNavigate }: AdminGuideProps) => {
  const mainGuideSections = [
    {
      title: "ΣΥΣΤΗΜΑ ΚΡΑΤΗΣΕΩΝ (Transfers)",
      icon: Car,
      color: "text-blue-500",
      bg: "bg-blue-50",
      targetTab: "pending",
      details: "Η καρδιά της LIV Tours. Διαχειριστείτε τις μεταφορές από και προς τα αεροδρόμια Χανίων (CHQ) και Ηρακλείου (HER).",
      steps: [
        "Status 'Αναμονή': Κρατήσεις που περιμένουν επιβεβαίωση. Κάθε νέα κράτηση στέλνει ειδοποίηση.",
        "Status 'Επιβεβαιωμένη': Κρατήσεις έτοιμες για εκτέλεση. Ο πελάτης έχει λάβει ήδη το email επιβεβαίωσης.",
        "Ανάθεση Οδηγού: Κρίσιμο βήμα για τον σωστό προγραμματισμό. Ο οδηγός βλέπει τις λεπτομέρειες στο δικό του panel (αν χρησιμοποιείται).",
        "Οικονομικά: Μαρκάρετε ως 'Paid' μόνο όταν έχετε λάβει τα χρήματα. Χρησιμοποιήστε τα κουμπιά Cash/Card για σωστή στατιστική καταγραφή."
      ]
    },
    {
      title: "CUSTOM ΕΚΔΡΟΜΕΣ (Tours)",
      icon: Compass,
      color: "text-amber-500",
      bg: "bg-amber-50",
      targetTab: "tours",
      details: "Διαχείριση αιτημάτων για ιδιωτικές και εξατομικευμένες εκδρομές στην Κρήτη.",
      steps: [
        "Αιτήματα: Εδώ έρχονται οι φόρμες ενδιαφέροντος από το Tour Builder.",
        "Προσφορά Τιμής: Αφού υπολογίσετε το κόστος, εισάγετε το ποσό και στείλτε την προσφορά. Ο πελάτης λαμβάνει email με σύνδεσμο για πληρωμή προκαταβολής.",
        "Συμμετοχές (Shared): Διαχείριση των εβδομαδιαίων ομαδικών tours (π.χ. Ελαφονήσι). Παρακολουθήστε τη διαθεσιμότητα θέσεων."
      ]
    },
    {
      title: "LIVY: Η AI CONCIERGE ΣΑΣ",
      icon: Zap,
      color: "text-purple-500",
      bg: "bg-purple-50",
      targetTab: "stats",
      details: "Η Livy δεν είναι απλά ένα chatbot. Είναι η ψηφιακή εκπρόσωπος της LIV Tours.",
      steps: [
        "Ταυτότητα: Επαγγελματίας, φιλική, γνώστης της Κρήτης. Μιλάει πολλές γλώσσες (Ελληνικά, Αγγλικά κ.α.).",
        "Λειτουργία: Απαντάει σε ερωτήσεις για υπηρεσίες, τιμές, και προορισμούς 24/7.",
        "Lead Generation: Κατευθύνει τους χρήστες προς την κράτηση ή τη φόρμα επικοινωνίας.",
        "AI Regenerate (CMS): Στο διαχειριστικό περιεχομένου, μπορεί να ξαναγράψει τις περιγραφές των tours για να γίνουν πιο ελκυστικές (Persuasive writing)."
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero Welcome & Project Identity */}
      <div className="bg-slate-950 rounded-[48px] p-8 sm:p-16 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl shrink-0 rotate-3">
               <BookOpen className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="text-center md:text-left flex-1">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase italic">ΟΔΗΓΟΣ ΧΡΗΣΗΣ</h2>
                  <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">VERSION 2.0</span>
               </div>
               <p className="text-slate-400 font-medium max-w-3xl leading-relaxed italic text-lg opacity-80 mb-6">
                 Το project LIV Tours είναι ένα ολοκληρωμένο οικοσύστημα πολυτελών μεταφορών και εκδρομών στην Κρήτη. Συνδυάζει την παραδοσιακή φιλοξενία με την τεχνολογία αιχμής.
               </p>
               <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">REAL-TIME BOOKINGS</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">LIVY AI INTEGRATED</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">SECURE PAYMENTS</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {mainGuideSections.map((section, idx) => (
           <Card 
             key={idx} 
             onClick={() => onNavigate && onNavigate(section.targetTab)}
             className="group p-10 rounded-[44px] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-700 bg-white overflow-hidden relative cursor-pointer hover:-translate-y-2 active:scale-95"
           >
              <div className={cn("absolute top-0 right-0 w-48 h-48 rounded-bl-full opacity-5 transition-transform duration-1000 group-hover:scale-125 -mr-12 -mt-12", section.bg)} />
              
              <div className="flex items-center gap-5 mb-10">
                 <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500", section.bg, section.color)}>
                    <section.icon className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{section.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-all">
                       ΠΡΟΒΟΛΗ <ChevronRight className="w-4 h-4" />
                    </div>
                 </div>
              </div>

              <div className="mb-10">
                 <p className="text-slate-500 font-medium leading-relaxed">{section.details}</p>
              </div>

              <div className="space-y-5">
                 {section.steps.map((step, sIdx) => (
                   <div key={sIdx} className="flex gap-4 group/step">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-400 shrink-0 border border-slate-100 group-hover/step:bg-slate-900 group-hover/step:text-white transition-all shadow-sm">
                         {sIdx + 1}
                      </div>
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed group-hover/step:text-slate-900 transition-colors">{step}</p>
                   </div>
                 ))}
              </div>
           </Card>
         ))}
      </div>

      {/* Detailed Operational Guide Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
         <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
               <Calendar className="w-6 h-6 text-emerald-500" />
               DAILY OPS & WORKFLOW
            </h3>
            <div className="space-y-4">
               {[
                 { q: "Πώς ξέρω αν ήρθε νέα κράτηση;", a: "Το σύστημα στέλνει άμεσα ειδοποιήσεις. Επίσης, το εικονίδιο του κουδουνιού στο Dashboard ανανεώνεται σε πραγματικό χρόνο με τον αριθμό των νέων κρατήσεων."},
                 { q: "Πληρωμές μέσω Stripe", a: "Όταν ένας πελάτης πληρώνει 'Deposit' online, η κράτηση μαρκάρεται αυτόματα ως 'Confirmed' και η πληρωμή ως 'Paid'. Δεν χρειάζεται δική σας ενέργεια."},
                 { q: "Διαχείριση Χρηστών & Οδηγών", a: "Στην καρτέλα 'Χρήστες', μπορείτε να προσθέσετε συνεργάτες. Υπάρχουν δύο ρόλοι: Admin (πλήρης πρόσβαση) και Driver (περιορισμένη πρόσβαση - βλέπει μόνο τις δικές του κρατήσεις)."},
                 { q: "Analytics & Στατιστικά", a: "Χρησιμοποιήστε την καρτέλα 'Στατιστικά' για να δείτε τα μηνιαία σας έσοδα, τις πιο δημοφιλείς διαδρομές και την απόδοση του στόλου σας."}
               ].map((item, i) => (
                 <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">{item.q}</p>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed">{item.a}</p>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
               <Bot className="w-6 h-6 text-purple-500" />
               LIVY PERSONALITY & STRATEGY
            </h3>
            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 rounded-[44px] text-white shadow-2xl relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
               <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 mb-8 shadow-xl">
                     <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-3xl font-black mb-6 italic">Meet Livy</h4>
                  <div className="space-y-6">
                     <p className="font-bold text-lg text-white/90 leading-relaxed">
                       "Η Livy είναι η τέλεια οικοδέσποινα. Διακριτική αλλά αποτελεσματική, στοχεύει πάντα στην εξαιρετική εξυπηρέτηση του πελάτη."
                     </p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
                           <p className="text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">Tone of Voice</p>
                           <p className="text-xs font-black text-white">Sophisticated, Friendly, Local Expert</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
                           <p className="text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">Languages</p>
                           <p className="text-xs font-black text-white">Multilingual Chameleon</p>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-200 mb-3">Core Strategy</p>
                        <ul className="space-y-2">
                           {["Μετατροπή συζήτησης σε κράτηση", "Μείωση φόρτου εργασίας του admin", "Προσωποποιημένες προτάσεις tours"].map((li, i) => (
                             <li key={i} className="flex items-center gap-2 text-xs font-bold">
                               <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                               {li}
                             </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>
            </Card>
         </div>
      </div>

      {/* Quick Tips Footer */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-[48px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 mt-8 shadow-inner">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[30px] bg-emerald-500 text-white flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] shrink-0">
               <HelpCircle className="w-10 h-10" />
            </div>
            <div>
               <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl mb-1">ΧΡΕΙΑΖΕΣΤΕ ΒΟΗΘΕΙΑ;</h4>
               <p className="font-bold text-emerald-600 leading-relaxed">
                 Η τεχνική υποστήριξη είναι διαθέσιμη στο <span className="underline">+30 694 152 1850</span> για να διασφαλίσει την ομαλή λειτουργία της επιχείρησής σας.
               </p>
            </div>
         </div>
         <a href="tel:+306941521850" className="w-full md:w-auto">
            <Button className="h-16 px-12 rounded-[24px] bg-slate-900 text-white font-black hover:bg-emerald-600 tracking-[0.2em] uppercase text-sm transition-all shadow-2xl hover:scale-105 active:scale-95 w-full">
               Επικοινωνία με Support
            </Button>
         </a>
      </div>
    </div>
  );
};

// ... (remaining imports and helpers)

// Simple helper for class merging if not already globally available in context
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
