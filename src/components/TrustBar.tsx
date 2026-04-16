import { ShieldCheck, Clock, Plane, Baby, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface TrustItem {
  icon: LucideIcon;
  title: string;
  shortTitle: string;
  description: string;
}

interface TrustBarProps {
  items?: TrustItem[];
}

const TrustBar = ({ items }: TrustBarProps) => {
  const { language } = useLanguage();
  
  const defaultItems: TrustItem[] = [
    {
      icon: ShieldCheck,
      title: language === 'gr' ? "Σταθερές Τιμές" : "Fixed Prices",
      shortTitle: language === 'gr' ? "Τιμή" : "Fixed",
      description: language === 'gr' ? "Χωρίς κρυφές χρεώσεις" : "No hidden fees",
    },
    {
      icon: Plane,
      title: language === 'gr' ? "Παρακολούθηση Πτήσης" : "Flight Tracking",
      shortTitle: language === 'gr' ? "Πτήση" : "Flights",
      description: language === 'gr' ? "Προσαρμογή για καθυστερήσεις" : "We adjust for delays",
    },
    {
      icon: Clock,
      title: language === 'gr' ? "Δωρεάν Ακύρωση" : "Free Cancellation",
      shortTitle: language === 'gr' ? "Ακύρωση" : "Cancel",
      description: language === 'gr' ? "Έως 24ω πριν" : "Up to 24h before",
    },
    {
      icon: Baby,
      title: language === 'gr' ? "Παιδικά Καθίσματα" : "Child Seats",
      shortTitle: language === 'gr' ? "Παιδιά" : "Kids",
      description: language === 'gr' ? "Κατόπιν αιτήματος" : "On request",
    },
  ];

  const trustItems = items || defaultItems;

  return (
    <section className="bg-card py-4 sm:py-5 lg:py-6 border-y border-border" aria-label="Trust indicators">
      <div className="container-wide">
        {/* Mobile: 2x2 Grid for alignment */}
        <ul className="grid grid-cols-4 gap-2 sm:hidden list-none" role="list">
          {trustItems.map((item) => (
            <li
              key={item.title}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <div className="p-2 rounded-lg bg-olive/10" aria-hidden="true">
                <item.icon className="w-4 h-4 text-olive" />
              </div>
              <span className="text-[10px] font-medium text-primary leading-tight">{item.shortTitle}</span>
              <span className="sr-only">{item.description}</span>
            </li>
          ))}
        </ul>

        {/* Tablet: 2-column compact grid */}
        <ul className="hidden sm:grid lg:hidden grid-cols-2 gap-x-6 gap-y-3 list-none" role="list">
          {trustItems.map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-2.5"
            >
              <div className="p-2 rounded-lg bg-olive/10 flex-shrink-0" aria-hidden="true">
                <item.icon className="w-4 h-4 text-olive" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-primary text-sm leading-tight">{item.title}</p>
                <p className="text-muted-foreground text-xs">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Desktop: horizontal layout */}
        <ul className="hidden lg:flex items-center justify-between gap-4 list-none" role="list">
          {trustItems.map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-olive/10 flex-shrink-0" aria-hidden="true">
                <item.icon className="w-5 h-5 text-olive" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-primary text-sm leading-tight">{item.title}</p>
                <p className="text-muted-foreground text-xs">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default TrustBar;
