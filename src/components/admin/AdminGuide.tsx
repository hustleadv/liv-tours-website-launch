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
  Sparkles
} from "lucide-react";

interface AdminGuideProps {
  onNavigate?: (tab: any) => void;
}

export const AdminGuide = ({ onNavigate }: AdminGuideProps) => {
  const sections = [
    {
      title: "Διαχείριση Κρατήσεων (Transfers)",
      icon: Car,
      color: "text-blue-500",
      bg: "bg-blue-50",
      targetTab: "pending",
      steps: [
        "Οι νέες κρατήσεις εμφανίζονται στην καρτέλα 'Αναμονή' με κίτρινο χρώμα.",
        "Πατήστε 'Accept' για να επιβεβαιώσετε. Ο πελάτης θα λάβει αυτόματα email επιβεβαίωσης.",
        "Πατήστε 'Decline' για ακύρωση. Θα σταλεί αυτόματα email ενημέρωσης στον πελάτη.",
        "Χρησιμοποιήστε το κουμπί του τηλεφώνου για άμεση κλήση ή WhatsApp με τον πελάτη."
      ]
    },
    {
      title: "Αιτήματα Εκδρομών (Tours)",
      icon: Compass,
      color: "text-amber-500",
      bg: "bg-amber-50",
      targetTab: "tours",
      steps: [
        "Τα αιτήματα για tours εμφανίζονται στην καρτέλα 'Αιτήματα'.",
        "Ορίστε την 'Τελική Τιμή' και πατήστε 'Αποστολή Τιμής'. Ο πελάτης θα λάβει email με σύνδεσμο πληρωμής.",
        "Μόλις ο πελάτης πληρώσει την προκαταβολή, η κράτηση μεταφέρεται αυτόματα στις επιβεβαιωμένες."
      ]
    },
    {
      title: "Πληρωμές & Οδηγοί",
      icon: CreditCard,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      targetTab: "confirmed",
      steps: [
        "Για κάθε επιβεβαιωμένη κράτηση, μπορείτε να αναθέσετε οδηγό πατώντας στο όνομα του οδηγού.",
        "Όταν λάβετε τα χρήματα (Μετρητά ή Κάρτα), πατήστε το αντίστοιχο κουμπί (Cash/Card) για να μαρκαριστεί ως 'PAID'.",
        "Οι πληρωμές μέσω Stripe (Deposit) ενημερώνονται αυτόματα από το σύστημα."
      ]
    },
    {
      title: "Livy - AI Assistant",
      icon: Sparkles,
      color: "text-purple-500",
      bg: "bg-purple-50",
      targetTab: "settings",
      steps: [
        "Η Livy είναι η AI βοηθός που απαντάει σε ερωτήσεις πελατών στην ιστοσελίδα.",
        "Χρησιμοποιεί τις πληροφορίες από το 'Tours Management' για να προτείνει εκδρομές.",
        "Μπορεί να αναδημιουργήσει κείμενα για τις εκδρομές σας (AI Regenerate) με πιο ελκυστικό ύφος.",
        "Στα settings μπορείτε να ρυθμίσετε τα API κλειδιά που χρησιμοποιεί η Livy."
      ]
    },
    {
      title: "Ειδοποιήσεις & Αναζήτηση",
      icon: Bell,
      color: "text-rose-500",
      bg: "bg-rose-50",
      targetTab: "pending",
      steps: [
        "Το 'Κουδούνι' στο πάνω μέρος δείχνει σε πραγματικό χρόνο πόσες εκκρεμείς κρατήσεις υπάρχουν.",
        "Χρησιμοποιήστε την 'Αναζήτηση' στο Dashboard για να βρείτε κρατήσεις βάσει ID, Τοποθεσίας ή Ονόματος.",
        "Το 'Ημερολόγιο' προσφέρει μια μηνιαία προβολή όλων των προγραμματισμένων δρομολογίων."
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="bg-slate-900 rounded-[40px] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-[28px] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl shrink-0">
               <BookOpen className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="text-center md:text-left">
               <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 uppercase italic">Οδηγός Χρήσης</h2>
               <p className="text-slate-400 font-medium max-w-2xl leading-relaxed italic">
                 Καλώς ήρθατε στο κέντρο ελέγχου της LIV Tours. Πατήστε σε οποιαδήποτε ενότητα για να μεταβείτε στην αντίστοιχη λειτουργία.
               </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {sections.map((section, idx) => (
           <Card 
             key={idx} 
             onClick={() => onNavigate && onNavigate(section.targetTab)}
             className="group p-8 rounded-[36px] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 bg-white overflow-hidden relative cursor-pointer hover:border-emerald-200 active:scale-95"
           >
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 transition-transform duration-700 group-hover:scale-110 -mr-8 -mt-8", section.bg)} />
              
              <div className="flex items-center gap-4 mb-8">
                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform", section.bg, section.color)}>
                    <section.icon className="w-7 h-7" />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{section.title}</h3>
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       Μετάβαση <ChevronRight className="w-3 h-3" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 {section.steps.map((step, sIdx) => (
                   <div key={sIdx} className="flex gap-4 group/step">
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 border border-slate-100 group-hover/step:bg-slate-900 group-hover/step:text-white transition-colors">
                         {sIdx + 1}
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed group-hover/step:text-slate-900 transition-colors">{step}</p>
                   </div>
                 ))}
              </div>
           </Card>
         ))}
      </div>

      {/* Quick Tips Footer */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
               <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Χρειάζεστε βοήθεια;</h4>
               <p className="text-xs font-bold text-emerald-600">Η τεχνική υποστήριξη είναι πάντα διαθέσιμη.</p>
            </div>
         </div>
         <a href="tel:+306941521850">
            <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black hover:bg-emerald-600 tracking-widest uppercase text-xs transition-all shadow-xl">
               Επικοινωνία με Support
            </Button>
         </a>
      </div>
    </div>
  );
};

// Simple helper for class merging if not already globally available in context
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
