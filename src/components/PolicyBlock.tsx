import { useState, forwardRef } from 'react';
import { 
  Clock, 
  Plane, 
  CreditCard, 
  Receipt, 
  ChevronDown
} from 'lucide-react';
import { trackEvent } from '@/lib/tracking';
import { useLanguage } from '@/contexts/LanguageContext';

export type PolicyType = 'cancellation' | 'flight-delays' | 'pricing' | 'payment';

interface PolicyBlockProps {
  types?: PolicyType[];
  variant?: 'full' | 'compact' | 'inline';
  expandable?: boolean;
  className?: string;
}

const PolicyBlock = forwardRef<HTMLDivElement, PolicyBlockProps>(({ 
  types,
  variant = 'compact',
  expandable = true,
  className = ''
}, ref) => {
  const [expandedId, setExpandedId] = useState<PolicyType | null>(null);
  const { t } = useLanguage();

  const policies = [
    {
      id: 'cancellation' as PolicyType,
      icon: Clock,
      title: t.policies.cancellation.title,
      shortText: t.policies.cancellation.short,
      fullText: t.policies.cancellation.full,
    },
    {
      id: 'flight-delays' as PolicyType,
      icon: Plane,
      title: t.policies.flightDelays.title,
      shortText: t.policies.flightDelays.short,
      fullText: t.policies.flightDelays.full,
    },
    {
      id: 'pricing' as PolicyType,
      icon: Receipt,
      title: t.policies.pricing.title,
      shortText: t.policies.pricing.short,
      fullText: t.policies.pricing.full,
    },
    {
      id: 'payment' as PolicyType,
      icon: CreditCard,
      title: t.policies.payment.title,
      shortText: t.policies.payment.short,
      fullText: t.policies.payment.full,
    },
  ];
  
  const displayPolicies = types 
    ? policies.filter(p => types.includes(p.id))
    : policies;

  const handleToggle = (id: PolicyType) => {
    const newState = expandedId === id ? null : id;
    setExpandedId(newState);
    if (newState) {
      trackEvent('policy_expand_click', { policy: id });
    }
  };

  if (variant === 'inline') {
    return (
      <div ref={ref} className={`flex flex-wrap gap-4 ${className}`}>
        {displayPolicies.map((policy) => (
          <div 
            key={policy.id} 
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <policy.icon className="w-4 h-4 text-olive" />
            <span>{policy.shortText}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div ref={ref} className={`space-y-3 ${className}`}>
        {displayPolicies.map((policy) => (
          <div 
            key={policy.id}
            className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl"
          >
            <div className="p-2 rounded-lg bg-olive/10 flex-shrink-0">
              <policy.icon className="w-4 h-4 text-olive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary text-sm">{policy.title}</p>
              <p className="text-xs text-muted-foreground">{policy.shortText}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Full variant with expandable sections
  return (
    <div ref={ref} className={`space-y-4 ${className}`}>
      <div className="text-center mb-12">
        <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">
          Good to Know
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight mb-6">
          {t.policies.title}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transparent terms you can trust
        </p>
      </div>
      
      {displayPolicies.map((policy) => (
        <div 
          key={policy.id}
          className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/30 hover:border-olive/30 hover:shadow-lg transition-all duration-300"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-olive/[0.02] to-transparent pointer-events-none" />
          
          <button
            onClick={() => expandable && handleToggle(policy.id)}
            className={`relative w-full flex items-center justify-between p-5 text-left ${expandable ? 'cursor-pointer' : ''} transition-colors focus:outline-none focus:ring-2 focus:ring-olive/30 focus:ring-inset`}
            disabled={!expandable}
            aria-expanded={expandedId === policy.id}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-olive/15 to-olive/5 border border-olive/10">
                <policy.icon className="w-5 h-5 text-olive" />
              </div>
              <div>
                <p className="font-semibold text-primary">{policy.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{policy.shortText}</p>
              </div>
            </div>
            {expandable && (
              <div className={`p-2 rounded-full bg-muted/50 transition-transform duration-300 ${expandedId === policy.id ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </button>
          
          {expandedId === policy.id && (
            <div className="px-5 pb-5 pt-0 animate-fade-in">
              <div className="pl-16 pr-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {policy.fullText}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

PolicyBlock.displayName = 'PolicyBlock';

export default PolicyBlock;
