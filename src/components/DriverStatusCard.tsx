import { Phone, MessageCircle, UserCheck, Bell, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface DriverStatusCardProps {
  driverAssigned: boolean;
  driverName?: string | null;
  driverPhone?: string | null;
  driverLanguage?: string | null;
  driverMessageSent?: boolean;
  className?: string;
}

const LANGUAGE_FLAGS: Record<string, { flag: string; label: string }> = {
  en: { flag: '🇬🇧', label: 'English' },
  gr: { flag: '🇬🇷', label: 'Greek' },
  de: { flag: '🇩🇪', label: 'German' },
  fr: { flag: '🇫🇷', label: 'French' },
  it: { flag: '🇮🇹', label: 'Italian' },
  ru: { flag: '🇷🇺', label: 'Russian' },
};

const DriverStatusCard = ({
  driverAssigned,
  driverName,
  driverPhone,
  driverLanguage,
  driverMessageSent,
  className = ''
}: DriverStatusCardProps) => {
  const { language } = useLanguage();
  
  // Get first name only
  const driverFirstName = driverName?.split(' ')[0] || null;
  
  // Get language info
  const langInfo = driverLanguage ? LANGUAGE_FLAGS[driverLanguage] || LANGUAGE_FLAGS['en'] : null;

  return (
    <div className={`rounded-2xl overflow-hidden border border-border bg-card shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            {language === 'gr' ? 'Κατάσταση Οδηγού' : 'Driver Status'}
          </h3>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            <span className="text-[9px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Status Items */}
        <div className="space-y-3">
          {/* Driver Assigned Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                driverAssigned 
                  ? 'bg-green-100 dark:bg-green-500/20' 
                  : 'bg-muted'
              }`}>
                <UserCheck className={`w-4 h-4 ${
                  driverAssigned ? 'text-green-600' : 'text-muted-foreground'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {language === 'gr' ? 'Ανάθεση οδηγού' : 'Driver assigned'}
                </p>
                {driverAssigned && driverFirstName && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {driverFirstName}
                    {langInfo && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-[10px]">
                        {langInfo.flag} {langInfo.label}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              driverAssigned 
                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' 
                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
            }`}>
              {driverAssigned ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  {language === 'gr' ? 'Ναι' : 'Yes'}
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  {language === 'gr' ? 'Αναμονή' : 'Pending'}
                </>
              )}
            </div>
          </div>

          {/* Driver Message Sent Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                driverMessageSent 
                  ? 'bg-green-100 dark:bg-green-500/20' 
                  : 'bg-muted'
              }`}>
                <Bell className={`w-4 h-4 ${
                  driverMessageSent ? 'text-green-600' : 'text-muted-foreground'
                }`} />
              </div>
              <p className="text-sm font-medium text-foreground">
                {language === 'gr' ? 'Ειδοποίηση στον οδηγό' : 'Driver notified'}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              driverMessageSent 
                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {driverMessageSent ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  {language === 'gr' ? 'Εστάλη' : 'Sent'}
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  {language === 'gr' ? 'Αναμονή' : 'Pending'}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Buttons - Only enabled when driver assigned */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">
            {driverAssigned 
              ? (language === 'gr' ? 'Επικοινωνήστε με τον οδηγό σας:' : 'Contact your driver:')
              : (language === 'gr' ? 'Τα κουμπιά επικοινωνίας θα ενεργοποιηθούν όταν ανατεθεί οδηγός.' : 'Contact buttons will be enabled when a driver is assigned.')}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={!driverAssigned || !driverPhone}
              onClick={() => driverPhone && window.open(`tel:${driverPhone}`, '_self')}
            >
              <Phone className="w-4 h-4 mr-2" />
              {language === 'gr' ? 'Κλήση' : 'Call'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!driverAssigned || !driverPhone}
              onClick={() => driverPhone && window.open(`https://wa.me/${driverPhone.replace(/\D/g, '')}`, '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverStatusCard;
