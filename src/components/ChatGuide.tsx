import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatGuideProps {
  className?: string;
}

const getDefaultQuickReplies = (t: any) => [
  t.chat.quickTransferPrices,
  t.chat.quickHowToBook,
  t.chat.quickPopularTours,
  t.chat.quickAirportTransfer,
  t.chat.quickBestBeaches,
];

// Generate contextual quick replies based on assistant's last message
const getContextualReplies = (lastMessage: string, t: any): string[] => {
  const lowerMsg = lastMessage.toLowerCase();
  
  // PRIORITY 1: When AI asks for clarification about transfer vs tour
  if (
    (lowerMsg.includes("clarify") || lowerMsg.includes("διευκρίνι") || lowerMsg.includes("préciser") || lowerMsg.includes("klären")) &&
    (lowerMsg.includes("transfer") || lowerMsg.includes("tour") || lowerMsg.includes("μεταφορ") || lowerMsg.includes("εκδρομ"))
  ) {
    return [t.chat.iWantTransfer, t.chat.iWantTour, t.chat.justBrowsing];
  }
  
  // PRIORITY 2: When AI asks "transfer or tour?" or similar
  if (
    (lowerMsg.includes("transfer or") || lowerMsg.includes("tour or") || lowerMsg.includes("ή μεταφορά") || lowerMsg.includes("ή εκδρομή")) ||
    (lowerMsg.includes("interested in a transfer") || lowerMsg.includes("interested in a tour"))
  ) {
    return [t.chat.iWantTransfer, t.chat.iWantTour];
  }
  
  // PRIORITY 3: When AI asks for destination/where to go
  if (
    (lowerMsg.includes("where would you like to go") || lowerMsg.includes("where to go") || lowerMsg.includes("destination") || 
     lowerMsg.includes("πού θέλετε") || lowerMsg.includes("προορισμ") || lowerMsg.includes("où aller") || lowerMsg.includes("wohin"))
  ) {
    return [t.chat.balosLagoon, t.chat.elafonisi, t.chat.chaniaOldTown, t.chat.knossosPalace];
  }
  
  // PRIORITY 4: Tour Vibes / What the user is "hoping for"
  if (
    (lowerMsg.includes("hoping for") || lowerMsg.includes("looking for") || lowerMsg.includes("tell me what") || 
     lowerMsg.includes("expecting") || lowerMsg.includes("τι ψάχνετε") || lowerMsg.includes("τι αναζητάτε") ||
     lowerMsg.includes("vibe") || lowerMsg.includes("energy") || lowerMsg.includes("romantic") || 
     lowerMsg.includes("relaxing") || lowerMsg.includes("adventure") || lowerMsg.includes("family"))
  ) {
    return [t.chat.tourRelaxing, t.chat.tourRomantic, t.chat.tourAdventure, t.chat.tourFamilyFriendly];
  }

  // PRIORITY 5: When AI asks specifically about the date
  if (
    (lowerMsg.includes("provide") && lowerMsg.includes("date")) ||
    (lowerMsg.includes("what date") || lowerMsg.includes("which date") || lowerMsg.includes("ποια ημερομηνία") || 
     lowerMsg.includes("quel jour") || lowerMsg.includes("welches datum"))
  ) {
    return [t.chat.dateSpecific, t.chat.dateFlexible];
  }
  
  // Booking flow - group size questions
  if (lowerMsg.includes("πόσα άτομα") || lowerMsg.includes("how many people") || lowerMsg.includes("group size") || 
      lowerMsg.includes("number of") || lowerMsg.includes("wie viele") || lowerMsg.includes("combien de personnes") ||
      lowerMsg.includes("quante persone")) {
    return [t.chat.groupSmall, t.chat.groupMedium, t.chat.groupLarge, t.chat.groupXL];
  }
  
  // Booking flow - general date questions (not already handled above)
  if ((lowerMsg.includes("ημερομηνία") || lowerMsg.includes("πότε") || lowerMsg.includes("datum") || lowerMsg.includes("quand")) &&
      !lowerMsg.includes("provide") && !lowerMsg.includes("what date")) {
    return [t.chat.dateTomorrow, t.chat.dateWeekend, t.chat.dateNextWeek, t.chat.dateSpecific];
  }
  
  // Contact info questions
  if (lowerMsg.includes("email") || lowerMsg.includes("επικοινωνία") || lowerMsg.includes("contact") || lowerMsg.includes("kontakt")) {
    return [t.chat.willShareEmail, t.chat.askFirst];
  }
  if (lowerMsg.includes("όνομα") || lowerMsg.includes("your name") || lowerMsg.includes("nom") || lowerMsg.includes("ihren namen")) {
    return [t.chat.willShareName];
  }
  if (lowerMsg.includes("τηλέφωνο") || lowerMsg.includes("phone") || lowerMsg.includes("telefon") || lowerMsg.includes("téléphone")) {
    return [t.chat.willSharePhone, t.chat.noPhone];
  }
  
  // Time questions
  if (lowerMsg.includes("ώρα") || lowerMsg.includes("what time") || lowerMsg.includes("pickup time") || 
      lowerMsg.includes("παραλαβ") || lowerMsg.includes("uhrzeit") || lowerMsg.includes("quelle heure")) {
    return [t.chat.timeMorning, t.chat.timeNoon, t.chat.timeAfternoon, t.chat.timeEvening];
  }
  
  // Pickup location questions
  if (lowerMsg.includes("pickup") || lowerMsg.includes("σημείο") || lowerMsg.includes("ξενοδοχείο") || 
      lowerMsg.includes("hotel") || lowerMsg.includes("hôtel") || lowerMsg.includes("where are you staying")) {
    return [t.chat.pickupHotel, t.chat.pickupAirport, t.chat.pickupPort, t.chat.pickupOther];
  }
  
  // Vehicle type questions
  if (lowerMsg.includes("vehicle") || lowerMsg.includes("όχημα") || lowerMsg.includes("αυτοκίνητο") || 
      lowerMsg.includes("fahrzeug") || lowerMsg.includes("véhicule") || lowerMsg.includes("veicolo")) {
    return [t.chat.vehicleSedan, t.chat.vehicleMinivan, t.chat.vehicleMinibus];
  }
  
  // Confirmation questions / Yes-No prompts
  if (
    lowerMsg.includes("σωστά") || lowerMsg.includes("confirm") || lowerMsg.includes("επιβεβαίω") || 
    lowerMsg.includes("proceed") || lowerMsg.includes("bestätigen") || lowerMsg.includes("confirmer") ||
    lowerMsg.includes("is this correct") || lowerMsg.includes("εντάξει") || lowerMsg.includes("shall i") ||
    lowerMsg.includes("would you like") || lowerMsg.includes("θέλετε") || lowerMsg.includes("να το κάνω") ||
    lowerMsg.includes("do you want") || lowerMsg.includes("θα θέλατε") || lowerMsg.includes("ok?")
  ) {
    // If it's a "do you want me to do that", offer simple Yes/No/Edit
    if (lowerMsg.includes("do that") || lowerMsg.includes("do it") || lowerMsg.includes("να το κάνω")) {
      return [t.chat.confirmYes, t.chat.confirmCancel];
    }
    return [t.chat.confirmYes, t.chat.confirmEdit, t.chat.confirmCancel];
  }
  
  // Tour preferences
  if (lowerMsg.includes("τύπο εκδρομής") || lowerMsg.includes("type of tour") || lowerMsg.includes("what kind of tour") ||
      lowerMsg.includes("προτίμηση") || lowerMsg.includes("tour-typ") || lowerMsg.includes("type d'excursion")) {
    return [t.chat.tourBeaches, t.chat.tourCulture, t.chat.tourFoodWine, t.chat.tourAdventure, t.chat.tourRelaxing, t.chat.tourRomantic, t.chat.tourFamilyFriendly];
  }
  
  // Specific destination mentions - offer related options
  if (lowerMsg.includes("balos") || lowerMsg.includes("μπάλος")) {
    return [t.chat.bookTour + " Balos", t.chat.howMuchCost, t.chat.moreInfo];
  }
  if (lowerMsg.includes("elafonisi") || lowerMsg.includes("ελαφονήσι")) {
    return [t.chat.bookTour + " Elafonisi", t.chat.howMuchCost, t.chat.moreInfo];
  }
  if (lowerMsg.includes("samaria") || lowerMsg.includes("σαμαριά")) {
    return [t.chat.bookTour + " Samaria", t.chat.howMuchCost, t.chat.moreInfo];
  }
  if (lowerMsg.includes("knossos") || lowerMsg.includes("κνωσό") || lowerMsg.includes("κνωσσό")) {
    return [t.chat.bookTour + " Knossos", t.chat.howMuchCost, t.chat.moreInfo];
  }
  
  // Beach recommendations
  if (lowerMsg.includes("beach") || lowerMsg.includes("παραλί") || lowerMsg.includes("παραλιε") || 
      lowerMsg.includes("strand") || lowerMsg.includes("plage") || lowerMsg.includes("spiaggia")) {
    // If it's a general question about beaches, offer vibes if they haven't picked one
    if (lowerMsg.includes("propose") || lowerMsg.includes("suggest") || lowerMsg.includes("perfect") || lowerMsg.includes("ideal")) {
      return [t.chat.tourRelaxing, t.chat.tourRomantic, t.chat.tourAdventure, t.chat.tourFamilyFriendly];
    }
    return [t.chat.balosLagoon, t.chat.elafonisi, t.chat.falassarna, t.chat.seitanLimania];
  }
  
  // Cultural/historical sites
  if (lowerMsg.includes("αρχαί") || lowerMsg.includes("ancient") || lowerMsg.includes("μουσεί") || 
      lowerMsg.includes("museum") || lowerMsg.includes("ιστορ") || lowerMsg.includes("antik") || 
      lowerMsg.includes("musée") || lowerMsg.includes("storia")) {
    return [t.chat.knossosPalace, t.chat.heraklionMuseum, t.chat.spinalonga, t.chat.chaniaOldTown];
  }
  
  // Food & wine
  if (lowerMsg.includes("φαγητ") || lowerMsg.includes("food") || lowerMsg.includes("κρασ") || 
      lowerMsg.includes("wine") || lowerMsg.includes("εστιατ") || lowerMsg.includes("essen") || 
      lowerMsg.includes("wein") || lowerMsg.includes("gastronomie") || lowerMsg.includes("vin") ||
      lowerMsg.includes("cibo") || lowerMsg.includes("vino")) {
    return [t.chat.wineTastingTour, t.chat.villageFood, t.chat.oliveOilTasting];
  }
  
  // Nature & hiking
  if (lowerMsg.includes("πεζοπορ") || lowerMsg.includes("hiking") || lowerMsg.includes("φύση") || 
      lowerMsg.includes("nature") || lowerMsg.includes("wandern") || lowerMsg.includes("randonnée") ||
      lowerMsg.includes("escursion")) {
    return [t.chat.samariaGorge, t.chat.imbrosGorge, t.chat.lakeKournas];
  }
  
  // Family activities
  if (lowerMsg.includes("παιδ") || lowerMsg.includes("οικογέν") || lowerMsg.includes("family") || 
      lowerMsg.includes("kids") || lowerMsg.includes("children") || lowerMsg.includes("familie") || 
      lowerMsg.includes("enfants") || lowerMsg.includes("bambini")) {
    return [t.chat.elafonisiFamily, t.chat.lakeKournasPedalo, t.chat.aquariumTour];
  }
  
  // Airport/port transfers
  if (lowerMsg.includes("αεροδρόμι") || lowerMsg.includes("airport") || lowerMsg.includes("flughafen") || 
      lowerMsg.includes("aéroport") || lowerMsg.includes("aeroporto")) {
    return [t.chat.chaniaAirport, t.chat.heraklionAirport, t.chat.transferPrices];
  }
  if (lowerMsg.includes("λιμάν") || lowerMsg.includes("port") || lowerMsg.includes("ferry") || 
      lowerMsg.includes("hafen") || lowerMsg.includes("fähre") || lowerMsg.includes("porto")) {
    return [t.chat.soudaPort, t.chat.heraklionPort, t.chat.transferPrices];
  }
  
  // Transfer prices - show popular routes
  if (lowerMsg.includes("τιμ") || lowerMsg.includes("κόστ") || lowerMsg.includes("price") || 
      lowerMsg.includes("cost") || lowerMsg.includes("how much") || lowerMsg.includes("πόσο") || 
      lowerMsg.includes("preis") || lowerMsg.includes("kosten") || lowerMsg.includes("prix") || 
      lowerMsg.includes("combien") || lowerMsg.includes("quanto costa")) {
    return [
      t.chat.routeChaniaAirportToCity,
      t.chat.routeHeraklionAirportToCity,
      t.chat.routeOtherRoute
    ];
  }
  
  // General help / greeting
  if (lowerMsg.includes("πώς μπορώ να βοηθήσω") || lowerMsg.includes("how can i help") || 
      lowerMsg.includes("γεια") || lowerMsg.includes("hello") || lowerMsg.includes("hi there") || 
      lowerMsg.includes("hallo") || lowerMsg.includes("bonjour") || lowerMsg.includes("ciao")) {
    return [t.chat.quickTransferPrices, t.chat.bookTransfer, t.chat.viewTours, t.chat.haveQuestion];
  }
  
  // Recommendations
  if (lowerMsg.includes("προτείν") || lowerMsg.includes("recommend") || lowerMsg.includes("suggest") || 
      lowerMsg.includes("best") || lowerMsg.includes("καλύτερ") || lowerMsg.includes("empfehlen") || 
      lowerMsg.includes("recommander") || lowerMsg.includes("consiglio")) {
    return [t.chat.bestBeaches, t.chat.mustSeeAttractions, t.chat.authenticFood];
  }
  
  // Asking about areas/regions
  if (lowerMsg.includes("περιοχ") || lowerMsg.includes("area") || lowerMsg.includes("region") || 
      lowerMsg.includes("μέν") || lowerMsg.includes("stay") || lowerMsg.includes("gebiet") || 
      lowerMsg.includes("région") || lowerMsg.includes("zona")) {
    return [t.chat.chania, t.chat.rethymno, t.chat.heraklion, t.chat.agiosNikolaos];
  }
  
  // Confusion / Specialized Events / Human handoff detection
  if (
    lowerMsg.includes("don't understand") || lowerMsg.includes("δεν καταλαβαίνω") || 
    lowerMsg.includes("confused") || lowerMsg.includes("μπερδεύτηκα") ||
    lowerMsg.includes("wedding") || lowerMsg.includes("γάμοσ") || lowerMsg.includes("γάμο") ||
    lowerMsg.includes("special event") || lowerMsg.includes("εκδήλωση") ||
    lowerMsg.includes("human") || lowerMsg.includes("άνθρωπο") || lowerMsg.includes("representative") ||
    lowerMsg.includes("υπάλληλο") || lowerMsg.includes("speak to") || lowerMsg.includes("talk to") ||
    lowerMsg.includes("help") && lowerMsg.includes("please")
  ) {
    return [t.chat.contactSupport, t.chat.bookTransfer, t.chat.viewTours];
  }
  
  return [];
};

const STORAGE_KEY = "liv-chat-history";

const ChatGuide = ({ className }: ChatGuideProps) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Handle auto-scrolling
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tour-guide-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
        messages: newMessages,
        context: {
          pathname: window.location.pathname,
          title: document.title
        }
      }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t.chat.errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        aria-label="Open chat assistant"
        aria-expanded="false"
        className={cn(
          "fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-50 h-11 w-11 rounded-full shadow-lg",
          "bg-background/60 backdrop-blur-md text-foreground",
          "hover:shadow-xl hover:bg-background/80",
          "transition-all duration-300 hover:scale-110",
          "border border-border/50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        size="icon"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
      aria-describedby="chat-description"
      className={cn(
        "fixed z-50 rounded-2xl shadow-2xl",
        "bg-card/95 backdrop-blur-xl border border-white/20 overflow-hidden",
        "animate-in slide-in-from-bottom-4 duration-300",
        "flex flex-col",
        // Mobile: full width with margins, proper height
        "bottom-2 left-2 right-2 max-h-[85vh]",
        // Tablet and up: fixed size, positioned right
        "sm:bottom-24 sm:left-auto sm:right-6 sm:w-[400px] sm:max-h-[75vh]",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 bg-primary text-primary-foreground shrink-0 border-b border-white/10 relative overflow-hidden">
        {/* Subtle decorative background element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-white/20 overflow-hidden bg-white/10">
                <img 
                  src="/livy-avatar.png" 
                  alt="Livy" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to Icon if image fails
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    const icon = document.createElement('div');
                    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle opacity-80"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
                    e.currentTarget.parentElement?.appendChild(icon.firstChild!);
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-primary rounded-full" />
            </div>
            <div>
              <div id="chat-title" className="font-bold text-lg leading-tight">{t.chat.title}</div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/10"
                onClick={() => {
                  if (confirm("Clear your conversation history?")) {
                    setMessages([]);
                    localStorage.removeItem(STORAGE_KEY);
                  }
                }}
                aria-label={t.chat.clearHistory}
                title={t.chat.clearHistory}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-white/10"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 overscroll-contain bg-background/30"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-4 bg-muted/30 rounded-2xl border border-border/50 p-6 mx-2 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-base tracking-tight">{t.chat.greeting}</p>
              <p className="mt-2 mb-6 text-sm text-muted-foreground leading-relaxed px-2">
                {t.chat.greetingSubtitle}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {getDefaultQuickReplies(t).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => sendMessage(), 0);
                    }}
                    className="px-4 py-2 text-xs bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary rounded-xl transition-all hover:scale-105 active:scale-95 font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full border border-border overflow-hidden bg-muted shrink-0 mt-1 shadow-sm">
                  <img src="/livy-avatar.png" alt="Livy" className="h-full w-full object-cover" />
                </div>
              )}
              
              <div
                className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                    : "bg-muted text-foreground prose prose-sm prose-p:my-1 prose-ul:my-2 prose-li:my-1 max-w-[85%] rounded-tl-none border border-border/50"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="overflow-hidden break-words">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="h-8 w-8 rounded-full border border-border overflow-hidden bg-muted shrink-0 mt-1 shadow-sm">
                <img src="/livy-avatar.png" alt="Livy" className="h-full w-full object-cover" />
              </div>
              <div className="bg-muted text-foreground p-4 rounded-2xl rounded-tl-none border border-border/50 shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Livy {language === 'gr' ? 'γράφει...' : 'is typing...'}</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          
          {/* Contextual quick replies after assistant message */}
          {messages.length > 0 && !isLoading && messages[messages.length - 1]?.role === "assistant" && (
            (() => {
              const contextReplies = getContextualReplies(messages[messages.length - 1].content, t);
              if (contextReplies.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-2 mt-4 ml-11">
                  {contextReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => {
                        if (reply === t.chat.contactSupport) {
                          window.open("https://wa.me/306944363525", "_blank");
                          return;
                        }
                        setInput(reply);
                        setTimeout(() => sendMessage(), 0);
                      }}
                      className="px-3.5 py-2 text-xs bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary rounded-xl transition-all hover:scale-105 active:scale-95 font-medium shadow-sm"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-4 bg-muted/30 border-t border-border/50 shrink-0">
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">{t.chat.placeholder}</label>
          <div className="relative flex-1 group">
            <Input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chat.placeholder}
              disabled={isLoading}
              className="pr-12 bg-background border-border/50 focus-visible:ring-primary h-11 rounded-xl shadow-inner transition-all group-hover:border-primary/30"
              aria-describedby="chat-input-description"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-30"
              aria-label={isLoading ? "Sending message..." : "Send message"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
              ) : (
                <Send className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
          <span id="chat-input-description" className="sr-only">Type your message and press Enter or click Send</span>
        </div>
      </form>
    </div>
  );
};

export default ChatGuide;
