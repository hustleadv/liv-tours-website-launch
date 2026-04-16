import { useEffect, useMemo } from 'react';
import { MapPin, Navigation, MessageCircle, Apple, Ship, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/tracking';
import { useLanguage } from '@/contexts/LanguageContext';

// Meeting point images
import heraklionAirportImg from '@/assets/meetingpoint-airport-heraklion.jpg';
import chaniaAirportImg from '@/assets/meetingpoint-airport-new.webp';
import portImg from '@/assets/meetingpoint-port.jpg';

interface MeetingPointProps {
  type: 'airport' | 'port';
  locationName: string;
  className?: string;
  variant?: 'full' | 'compact';
}

// Meeting point coordinates
const MEETING_POINT_COORDS: Record<string, { lat: number; lng: number; name: string; ferryScheduleUrl?: string }> = {
  heraklion_airport: {
    lat: 35.3397,
    lng: 25.1803,
    name: 'Heraklion Airport (HER) Arrivals Exit',
  },
  chania_airport: {
    lat: 35.5317,
    lng: 24.1497,
    name: 'Chania Airport (CHQ) Arrivals Exit',
  },
  souda_port: {
    lat: 35.4894,
    lng: 24.0756,
    name: 'Souda Port Main Exit',
    ferryScheduleUrl: 'https://www.ferries.gr/souda-ferry/',
  },
  heraklion_port: {
    lat: 35.3426,
    lng: 25.1365,
    name: 'Heraklion Port Terminal',
    ferryScheduleUrl: 'https://www.ferries.gr/heraklion-ferry/',
  },
  kissamos_port: {
    lat: 35.4938,
    lng: 23.6579,
    name: 'Kissamos Port',
    ferryScheduleUrl: 'https://www.ferries.gr/kissamos-ferry/',
  },
};

const getMeetingPointCoords = (type: 'airport' | 'port', locationName: string) => {
  const locationLower = locationName.toLowerCase();
  
  if (type === 'port') {
    if (locationLower.includes('souda') || locationLower.includes('σούδα')) return MEETING_POINT_COORDS.souda_port;
    if (locationLower.includes('kissamos') || locationLower.includes('κίσσαμος')) return MEETING_POINT_COORDS.kissamos_port;
    if (locationLower.includes('heraklion') || locationLower.includes('ηράκλειο')) {
      return MEETING_POINT_COORDS.heraklion_port;
    }
    return MEETING_POINT_COORDS.souda_port; // Default
  }
  
  if (locationLower.includes('heraklion') || locationLower.includes('ηράκλειο')) {
    return MEETING_POINT_COORDS.heraklion_airport;
  }
  return MEETING_POINT_COORDS.chania_airport; // Default to Chania
};

const MeetingPoint = ({ type, locationName, className = '', variant = 'full' }: MeetingPointProps) => {
  const { language } = useLanguage();
  
  // Detect iOS device
  const isIOS = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }, []);
  
  // Determine which image to use based on location
  const getMeetingPointImage = () => {
    if (type === 'port') return portImg;
    const locationLower = locationName.toLowerCase();
    if (locationLower.includes('heraklion') || locationLower.includes('ηράκλειο')) {
      return heraklionAirportImg;
    }
    return chaniaAirportImg; // Default to Chania for other airports
  };

  const meetingPointImage = getMeetingPointImage();
  const coords = getMeetingPointCoords(type, locationName);
  
  useEffect(() => {
    trackEvent('meetingpoint_view', { type, location: locationName });
  }, [type, locationName]);

  const getGoogleMapsUrl = () => 
    `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  
  const getAppleMapsUrl = () => 
    `https://maps.apple.com/?q=${encodeURIComponent(coords.name)}&ll=${coords.lat},${coords.lng}`;

  const handleMapsClick = () => {
    trackEvent('meetingpoint_maps_click', { type, location: locationName, platform: 'google' });
    window.open(getGoogleMapsUrl(), '_blank');
  };

  const handleAppleMapsClick = () => {
    trackEvent('meetingpoint_maps_click', { type, location: locationName, platform: 'apple' });
    window.open(getAppleMapsUrl(), '_blank');
  };

  const handleWhatsAppClick = () => {
    trackEvent('meetingpoint_whatsapp_click', { type, location: locationName });
    window.open('https://wa.me/306944363525?text=Hi!%20I%20have%20a%20question%20about%20my%20pickup.', '_blank');
  };

  const handleFerryScheduleClick = () => {
    if (coords.ferryScheduleUrl) {
      trackEvent('meetingpoint_ferry_schedule_click', { location: locationName });
      window.open(coords.ferryScheduleUrl, '_blank');
    }
  };

  const isAirport = type === 'airport';
  const isPort = type === 'port';
  const title = language === 'gr' 
    ? (isAirport ? 'Σημείο Συνάντησης Αεροδρομίου' : 'Σημείο Συνάντησης Λιμανιού')
    : (isAirport ? 'Airport Meeting Point' : 'Port Meeting Point');

  const steps = isAirport
    ? [
        {
          title: language === 'gr' ? 'Προσγείωση & Τηλέφωνο' : 'Land & Phone On',
          description: language === 'gr' 
            ? 'Απενεργοποιήστε τη λειτουργία πτήσης. Ο οδηγός σας θα σας στείλει μήνυμα στο WhatsApp.'
            : 'Turn off airplane mode. Your driver will message you on WhatsApp.',
        },
        {
          title: language === 'gr' ? 'Παραλαβή Αποσκευών' : 'Collect Luggage',
          description: language === 'gr'
            ? 'Πηγαίνετε στην παραλαβή αποσκευών. Ο οδηγός παρακολουθεί την πτήση σας.'
            : 'Head to baggage claim. Your driver tracks your flight—no rush.',
        },
        {
          title: language === 'gr' ? 'Έξοδος Αφίξεων' : 'Arrivals Exit',
          description: language === 'gr'
            ? 'Συναντήστε τον οδηγό σας στην έξοδο με πινακίδα με το όνομά σας.'
            : 'Meet your driver at the exit with a sign showing your name.',
        },
      ]
    : [
        {
          title: language === 'gr' ? 'Αποβίβαση' : 'Disembark',
          description: language === 'gr'
            ? 'Βγείτε από το πλοίο και ακολουθήστε τις πινακίδες προς την έξοδο.'
            : 'Exit the ferry and follow signs to the main exit.',
        },
        {
          title: language === 'gr' ? 'Κύρια Έξοδος' : 'Main Exit',
          description: language === 'gr'
            ? 'Ο οδηγός σας θα περιμένει στην κύρια έξοδο του λιμανιού.'
            : 'Your driver will be waiting at the main port exit.',
        },
        {
          title: language === 'gr' ? 'Πινακίδα Ονόματος' : 'Name Sign',
          description: language === 'gr'
            ? 'Αναζητήστε πινακίδα με το όνομά σας. Επικοινωνήστε μέσω WhatsApp αν χρειαστεί.'
            : 'Look for a sign with your name. Contact via WhatsApp if needed.',
        },
      ];

  if (variant === 'compact') {
    return (
      <div className={`glass-card p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{locationName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20 mb-3">
          <MessageCircle className="w-4 h-4 text-accent flex-shrink-0" />
          <p className="text-xs text-foreground">
            {language === 'gr' 
              ? 'Ο οδηγός σας θα σας στείλει μήνυμα στο WhatsApp.'
              : 'Your driver will message you on WhatsApp.'}
          </p>
        </div>

        {isIOS ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleAppleMapsClick}
          >
            <Apple className="w-4 h-4" />
            {language === 'gr' ? 'Apple Maps' : 'Apple Maps'}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleMapsClick}
          >
            <Navigation className="w-4 h-4" />
            {language === 'gr' ? 'Google Maps' : 'Google Maps'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      {/* Header with actual image */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={meetingPointImage} 
          alt={`${locationName} meeting point`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-card/90 backdrop-blur-sm shadow-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{locationName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* 3-Step Guide */}
        <div className="space-y-4 mb-5">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-1" />
                )}
              </div>
              <div className="pb-1">
                <p className="font-medium text-foreground text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Microcopy */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            {language === 'gr' 
              ? 'Ο οδηγός σας θα σας στείλει μήνυμα στο WhatsApp.'
              : 'Your driver will message you on WhatsApp.'}
          </p>
        </div>

        {/* Ferry Schedule Link - Only for Ports */}
        {isPort && coords.ferryScheduleUrl && (
          <div 
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 mb-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
            onClick={handleFerryScheduleClick}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Ship className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                {language === 'gr' ? 'Πρόγραμμα Πλοίων' : 'Ferry Schedule'}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {language === 'gr' ? 'Δες ώρες αναχώρησης και άφιξης' : 'View departure and arrival times'}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="default" 
            className="gap-1.5 text-sm px-2"
            onClick={handleMapsClick}
          >
            <Navigation className="w-4 h-4" />
            Google
          </Button>
          {isIOS && (
            <Button 
              variant="outline" 
              size="default" 
              className="gap-1.5 text-sm px-2"
              onClick={handleAppleMapsClick}
            >
              <Apple className="w-4 h-4" />
              Apple
            </Button>
          )}
          <Button 
            variant="whatsapp" 
            size="default" 
            className={`gap-1.5 text-sm px-2 ${!isIOS ? 'col-span-2' : ''}`}
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingPoint;