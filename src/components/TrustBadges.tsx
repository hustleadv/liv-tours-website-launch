import { 
  ShieldCheck, 
  Plane, 
  Clock, 
  Baby, 
  MapPin, 
  CreditCard, 
  Headphones,
  Star,
  Car,
  Compass,
  Users,
  Sparkles
} from 'lucide-react';
import { trackEvent } from '@/lib/tracking';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export type BadgeContext = 'home' | 'airport' | 'tour' | 'transfer' | 'fleet' | 'route';

interface BadgeConfig {
  icon: typeof ShieldCheck;
  titleKey: keyof typeof import('@/i18n/translations/en').en.trust;
  descriptionKey: string;
  contexts: BadgeContext[];
}

const badgeConfigs: BadgeConfig[] = [
  {
    icon: ShieldCheck,
    titleKey: 'licensedDrivers',
    descriptionKey: 'Fully insured',
    contexts: ['home', 'airport', 'transfer', 'fleet', 'tour', 'route'],
  },
  {
    icon: Star,
    titleKey: 'fixedPrice',
    descriptionKey: 'No hidden fees',
    contexts: ['home', 'airport', 'transfer', 'route'],
  },
  {
    icon: Plane,
    titleKey: 'flightMonitoring',
    descriptionKey: 'We adjust for delays',
    contexts: ['home', 'airport', 'route'],
  },
  {
    icon: MapPin,
    titleKey: 'meetAndGreet',
    descriptionKey: 'Name sign at arrivals',
    contexts: ['airport', 'route'],
  },
  {
    icon: Clock,
    titleKey: 'freeCancellation',
    descriptionKey: 'Up to 24h before',
    contexts: ['home', 'airport', 'transfer', 'tour', 'route'],
  },
  {
    icon: Baby,
    titleKey: 'childSeats',
    descriptionKey: 'Free on request',
    contexts: ['home', 'airport', 'transfer', 'fleet', 'route'],
  },
  {
    icon: Headphones,
    titleKey: 'support247',
    descriptionKey: 'Always available',
    contexts: ['home', 'transfer', 'tour'],
  },
  {
    icon: CreditCard,
    titleKey: 'noHiddenFees',
    descriptionKey: 'Cash or card',
    contexts: ['transfer', 'airport'],
  },
  {
    icon: Compass,
    titleKey: 'localTips',
    descriptionKey: 'Hidden gems & tips',
    contexts: ['tour'],
  },
  {
    icon: Users,
    titleKey: 'privateDriver',
    descriptionKey: 'Just your group',
    contexts: ['tour'],
  },
  {
    icon: Sparkles,
    titleKey: 'flexibleStops',
    descriptionKey: 'Your pace, your way',
    contexts: ['tour'],
  },
  {
    icon: Car,
    titleKey: 'cleanVehicles',
    descriptionKey: 'Mercedes-Benz',
    contexts: ['fleet', 'home'],
  },
];

interface TrustBadgesProps {
  context?: BadgeContext;
  limit?: number;
  variant?: 'grid' | 'inline' | 'compact';
  className?: string;
}

const TrustBadges = ({ 
  context = 'home', 
  limit,
  variant = 'grid',
  className = ''
}: TrustBadgesProps) => {
  const { t } = useLanguage();
  
  const filteredBadges = badgeConfigs.filter(badge => badge.contexts.includes(context));
  const displayBadges = limit ? filteredBadges.slice(0, limit) : filteredBadges;

  useEffect(() => {
    trackEvent('trust_badge_view', { context });
  }, [context]);

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-4 ${className}`}>
        {displayBadges.map((badge) => (
          <div key={badge.titleKey} className="flex items-center gap-2">
            <badge.icon className="w-4 h-4 text-olive" />
            <span className="text-sm text-foreground">{t.trust[badge.titleKey]}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {displayBadges.map((badge) => (
          <div 
            key={badge.titleKey} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-olive/5 rounded-full"
          >
            <badge.icon className="w-3.5 h-3.5 text-olive" />
            <span className="text-xs font-medium text-foreground">{t.trust[badge.titleKey]}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {displayBadges.map((badge) => (
        <div 
          key={badge.titleKey} 
          className="glass-card p-4 flex items-start gap-3 hover-lift"
        >
          <div className="p-2 rounded-xl bg-olive/10 flex-shrink-0">
            <badge.icon className="w-5 h-5 text-olive" />
          </div>
          <div>
            <p className="font-semibold text-primary text-sm">{t.trust[badge.titleKey]}</p>
            <p className="text-xs text-muted-foreground">{badge.descriptionKey}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
