import { MessageCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWhatsAppLink, trackEvent } from "@/lib/tracking";
import { useQuote } from "@/contexts/QuoteContext";
import { useLanguage } from "@/contexts/LanguageContext";

const MobileBottomCTA = () => {
  const { quoteData } = useQuote();
  const { t } = useLanguage();

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', {
      pickup: quoteData?.pickup,
      dropoff: quoteData?.dropoff,
      source: 'mobile_sticky'
    });
  };

  const extras: string[] = [];
  if (quoteData?.childSeat && quoteData.childSeat > 0) extras.push(`Child seat ×${quoteData.childSeat}`);
  if (quoteData?.extraStop) extras.push('Extra stop');
  if (quoteData?.meetGreet) extras.push('Meet & Greet');

  const whatsappLink = generateWhatsAppLink(
    quoteData?.pickup && quoteData?.dropoff
      ? {
          pickup: quoteData.pickup,
          dropoff: quoteData.dropoff,
          date: quoteData.date,
          time: quoteData.time,
          passengers: quoteData.passengers,
          luggage: quoteData.luggage,
          vehicleType: quoteData.vehicleType,
          extras,
        }
      : undefined
  );

  const scrollToQuote = () => {
    const quoteSection = document.getElementById('quote-section');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="region"
      aria-label="Quick actions"
    >
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 max-w-full overflow-hidden">
        <Button 
          variant="hero" 
          size="lg" 
          className="flex-1 min-w-0 gap-1.5 sm:gap-2 text-sm sm:text-base h-12 sm:h-14 px-3 sm:px-4 active:scale-[0.98] transition-transform touch-manipulation"
          onClick={scrollToQuote}
          data-tracking-id="mobile-get-quote"
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />
          <span className="truncate font-semibold">{t.cta.getQuote}</span>
        </Button>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0"
          onClick={handleWhatsAppClick}
        >
          <Button 
            variant="whatsapp" 
            size="lg" 
            className="w-full gap-1.5 sm:gap-2 text-sm sm:text-base h-12 sm:h-14 px-3 sm:px-4 active:scale-[0.98] transition-transform touch-manipulation"
            data-tracking-id="mobile-whatsapp"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate font-semibold">{t.cta.whatsApp}</span>
          </Button>
        </a>
      </div>
    </div>
  );
};

export default MobileBottomCTA;