import { useState, useEffect, forwardRef } from "react";
import { Share, Smartphone, X, Apple, Chrome, MoreHorizontal, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackEvent } from "@/lib/tracking";

interface SaveTripHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveTripHubModal = forwardRef<HTMLDivElement, SaveTripHubModalProps>(({ isOpen, onClose }, ref) => {
  const { language } = useLanguage();
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
    
    if (isOpen) {
      trackEvent('save_trip_hub_modal_open' as any);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-accent" />
            {language === 'gr' ? 'Αποθήκευση Trip Hub' : 'Save Trip Hub'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            {language === 'gr' 
              ? 'Προσθέστε το Trip Hub στην αρχική σας οθόνη για γρήγορη πρόσβαση.' 
              : 'Add Trip Hub to your home screen for quick access.'}
          </p>

          {isIOS ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                <Apple className="w-4 h-4" />
                iPhone / iPad
              </h4>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>
                    {language === 'gr' 
                      ? 'Πατήστε το κουμπί Share' 
                      : 'Tap the Share button'}
                    <Share className="inline w-4 h-4 mx-1 text-muted-foreground" />
                    {language === 'gr' ? 'στο Safari' : 'in Safari'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>
                    {language === 'gr' 
                      ? 'Κάντε scroll και πατήστε' 
                      : 'Scroll down and tap'}
                    <span className="font-medium mx-1">"Add to Home Screen"</span>
                    <PlusSquare className="inline w-4 h-4 text-muted-foreground" />
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>
                    {language === 'gr' ? 'Πατήστε' : 'Tap'} 
                    <span className="font-medium mx-1">"Add"</span>
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                <Chrome className="w-4 h-4" />
                Android
              </h4>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>
                    {language === 'gr' 
                      ? 'Πατήστε το μενού' 
                      : 'Tap the menu'}
                    <MoreHorizontal className="inline w-4 h-4 mx-1 text-muted-foreground" />
                    {language === 'gr' ? 'στο Chrome' : 'in Chrome'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>
                    {language === 'gr' ? 'Επιλέξτε' : 'Select'}
                    <span className="font-medium mx-1">"Add to Home screen"</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>
                    {language === 'gr' ? 'Πατήστε' : 'Tap'} 
                    <span className="font-medium mx-1">"Add"</span>
                  </span>
                </li>
              </ol>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {language === 'gr' 
                ? 'Η εφαρμογή θα εμφανιστεί στην αρχική σας οθόνη ως LIV Tours.' 
                : 'The app will appear on your home screen as LIV Tours.'}
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">
          {language === 'gr' ? 'Κλείσιμο' : 'Got it'}
        </Button>
      </DialogContent>
    </Dialog>
  );
});

SaveTripHubModal.displayName = 'SaveTripHubModal';

export default SaveTripHubModal;
