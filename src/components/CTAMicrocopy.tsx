import { useLanguage } from '@/contexts/LanguageContext';

interface CTAMicrocopyProps {
  type: 'quote' | 'confirm' | 'whatsapp' | 'custom';
  customText?: string;
  className?: string;
}

const CTAMicrocopy = ({ type, customText, className = '' }: CTAMicrocopyProps) => {
  const { t } = useLanguage();
  
  const microcopyTexts: Record<string, string> = {
    quote: t.microcopy.instantConfirmation,
    confirm: t.microcopy.noHiddenFees,
    whatsapp: t.microcopy.fastestWay,
  };

  const text = type === 'custom' ? customText : microcopyTexts[type];
  
  if (!text) return null;
  
  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      {text}
    </p>
  );
};

export default CTAMicrocopy;
