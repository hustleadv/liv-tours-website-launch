import { useMemo, useEffect, useState } from "react";
import { Crown, Sparkles, Gift, Star, TrendingUp } from "lucide-react";
import { getBookingHistory } from "@/lib/booking";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Confetti from "./Confetti";

interface LoyaltyBadgeProps {
  variant?: "inline" | "card" | "banner" | "progress";
  className?: string;
  customerEmail?: string;
  showLevelUpConfetti?: boolean;
}

export function LoyaltyBadge({ variant = "inline", className, customerEmail, showLevelUpConfetti = true }: LoyaltyBadgeProps) {
  const { language } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const loyaltyStatus = useMemo(() => {
    const history = getBookingHistory();
    
    // If customerEmail provided, filter by that email
    const relevantBookings = customerEmail 
      ? history.filter(b => b.customerEmail?.toLowerCase() === customerEmail.toLowerCase())
      : history;
    
    const count = relevantBookings.length;
    
    if (count >= 5) {
      return {
        level: "vip",
        label: language === "gr" ? "VIP Πελάτης" : "VIP Customer",
        discount: "10%",
        icon: Crown,
        color: "from-emerald-500 to-teal-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        textColor: "text-emerald-700 dark:text-emerald-300",
      };
    } else if (count >= 3) {
      return {
        level: "loyal",
        label: language === "gr" ? "Πιστός Πελάτης" : "Loyal Customer",
        discount: "5%",
        icon: Star,
        color: "from-olive to-olive/80",
        bgColor: "bg-olive/10",
        borderColor: "border-olive/30",
        textColor: "text-olive",
      };
    } else if (count >= 2) {
      return {
        level: "returning",
        label: language === "gr" ? "Επιστρέφεις!" : "Welcome Back!",
        discount: null,
        icon: Sparkles,
        color: "from-primary to-primary/80",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/20",
        textColor: "text-primary",
      };
    }
    
    return null;
  }, [customerEmail, language]);
  
  // Check for level up and show confetti
  useEffect(() => {
    if (!showLevelUpConfetti || !loyaltyStatus) return;
    
    const storageKey = customerEmail 
      ? `loyalty_level_${customerEmail.toLowerCase()}` 
      : 'loyalty_level_global';
    
    const previousLevel = localStorage.getItem(storageKey);
    const currentLevel = loyaltyStatus.level;
    
    // Level hierarchy for comparison
    const levelOrder = { returning: 1, loyal: 2, vip: 3 };
    const prevOrder = previousLevel ? levelOrder[previousLevel as keyof typeof levelOrder] || 0 : 0;
    const currOrder = currentLevel ? levelOrder[currentLevel as keyof typeof levelOrder] || 0 : 0;
    
    // If we leveled up, show confetti
    if (currOrder > prevOrder && prevOrder > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    
    // Save current level
    if (currentLevel) {
      localStorage.setItem(storageKey, currentLevel);
    }
  }, [loyaltyStatus, customerEmail, showLevelUpConfetti]);
  
  // Progress variant - show even without loyalty status
  if (variant === "progress") {
    const history = getBookingHistory();
    const relevantBookings = customerEmail 
      ? history.filter(b => b.customerEmail?.toLowerCase() === customerEmail.toLowerCase())
      : history;
    const count = relevantBookings.length;
    
    // Calculate next level
    let nextLevel: { name: string; required: number; discount: string } | null = null;
    let progressPercent = 0;
    
    if (count < 2) {
      nextLevel = { name: language === "gr" ? "Επιστρέφεις!" : "Returning", required: 2, discount: "" };
      progressPercent = (count / 2) * 100;
    } else if (count < 3) {
      nextLevel = { name: language === "gr" ? "Πιστός Πελάτης" : "Loyal Customer", required: 3, discount: "5%" };
      progressPercent = ((count - 2) / (3 - 2)) * 100;
    } else if (count < 5) {
      nextLevel = { name: language === "gr" ? "VIP Πελάτης" : "VIP Customer", required: 5, discount: "10%" };
      progressPercent = ((count - 3) / (5 - 3)) * 100;
    }
    
    if (!nextLevel) {
      // Already VIP - show full progress
      return (
        <>
          {showConfetti && <Confetti />}
          <div className={cn(
            "rounded-xl border p-4",
            "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
            className
          )}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-400">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {language === "gr" ? "VIP Πελάτης" : "VIP Customer"}
                </span>
                <p className="text-xs text-muted-foreground">
                  {language === "gr" ? "Μέγιστο επίπεδο!" : "Maximum level!"}
                </p>
              </div>
            </div>
            <Progress value={100} className="h-2 bg-emerald-100 dark:bg-emerald-900" />
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 text-center">
              {language === "gr" 
                ? `${count} κρατήσεις • 10% έκπτωση για πάντα!`
                : `${count} bookings • 10% discount forever!`}
            </p>
          </div>
        </>
      );
    }
    
    const remaining = nextLevel.required - count;
    
    return (
      <>
        {showConfetti && <Confetti />}
        <div className={cn(
          "rounded-xl border p-4",
          loyaltyStatus ? loyaltyStatus.bgColor : "bg-muted/30",
          loyaltyStatus ? loyaltyStatus.borderColor : "border-border",
          className
        )}>
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
              loyaltyStatus ? loyaltyStatus.color : "from-primary/50 to-primary/30"
            )}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={cn("font-semibold text-sm", loyaltyStatus?.textColor || "text-foreground")}>
                  {language === "gr" ? "Επόμενο επίπεδο:" : "Next level:"}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {count}/{nextLevel.required}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {nextLevel.name} {nextLevel.discount && `(${nextLevel.discount} ${language === "gr" ? "έκπτωση" : "off"})`}
              </p>
            </div>
          </div>
          
          <Progress 
            value={progressPercent} 
            className={cn(
              "h-2",
              count >= 3 ? "bg-olive/20" : count >= 2 ? "bg-primary/20" : "bg-muted"
            )} 
          />
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {remaining === 1 
              ? (language === "gr" ? "Ακόμα 1 κράτηση!" : "Just 1 more booking!")
              : (language === "gr" 
                  ? `Ακόμα ${remaining} κρατήσεις`
                  : `${remaining} more bookings to go`)}
          </p>
        </div>
      </>
    );
  }
  
  if (!loyaltyStatus) return null;
  
  const Icon = loyaltyStatus.icon;
  
  if (variant === "inline") {
    return (
      <>
        {showConfetti && <Confetti />}
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          loyaltyStatus.bgColor,
          loyaltyStatus.textColor,
          className
        )}>
          <Icon className="w-3.5 h-3.5" />
          {loyaltyStatus.label}
          {loyaltyStatus.discount && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/50 dark:bg-black/20 rounded text-[10px] font-bold">
              -{loyaltyStatus.discount}
            </span>
          )}
        </span>
      </>
    );
  }
  
  if (variant === "banner") {
    return (
      <>
        {showConfetti && <Confetti />}
        <div className={cn(
          "relative overflow-hidden rounded-xl border p-4",
          loyaltyStatus.bgColor,
          loyaltyStatus.borderColor,
          className
        )}>
          <div className={cn(
            "absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2",
            loyaltyStatus.color
          )} />
          
          <div className="relative flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
              loyaltyStatus.color
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("font-semibold", loyaltyStatus.textColor)}>
                  {loyaltyStatus.label}
                </span>
                {loyaltyStatus.discount && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r text-white",
                    loyaltyStatus.color
                  )}>
                    -{loyaltyStatus.discount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {loyaltyStatus.discount 
                  ? (language === "gr" 
                      ? `Απόλαυσε ${loyaltyStatus.discount} έκπτωση στην επόμενη κράτηση!`
                      : `Enjoy ${loyaltyStatus.discount} off your next booking!`)
                  : (language === "gr"
                      ? "Χαιρόμαστε που σε ξαναβλέπουμε!"
                      : "Great to see you again!")}
              </p>
            </div>
            
            <Gift className={cn("w-5 h-5 opacity-50", loyaltyStatus.textColor)} />
          </div>
        </div>
      </>
    );
  }
  
  // Card variant
  return (
    <>
      {showConfetti && <Confetti />}
      <div className={cn(
        "rounded-xl border p-4 text-center",
        loyaltyStatus.bgColor,
        loyaltyStatus.borderColor,
        className
      )}>
        <div className={cn(
          "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-gradient-to-br",
          loyaltyStatus.color
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h4 className={cn("font-semibold", loyaltyStatus.textColor)}>
          {loyaltyStatus.label}
        </h4>
        {loyaltyStatus.discount && (
          <p className="text-sm text-muted-foreground mt-1">
            {language === "gr" 
              ? `${loyaltyStatus.discount} έκπτωση`
              : `${loyaltyStatus.discount} discount`}
          </p>
        )}
      </div>
    </>
  );
}

export function useLoyaltyStatus(customerEmail?: string) {
  return useMemo(() => {
    const history = getBookingHistory();
    const relevantBookings = customerEmail 
      ? history.filter(b => b.customerEmail?.toLowerCase() === customerEmail.toLowerCase())
      : history;
    
    const count = relevantBookings.length;
    
    if (count >= 5) return { level: "vip", discount: 0.10, count };
    if (count >= 3) return { level: "loyal", discount: 0.05, count };
    if (count >= 2) return { level: "returning", discount: 0, count };
    return { level: null, discount: 0, count };
  }, [customerEmail]);
}
