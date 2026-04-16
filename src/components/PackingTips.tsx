import { useState, useEffect, useRef, forwardRef } from 'react';
import { Loader2, Luggage, Sparkles, AlertCircle, ChevronDown, ChevronUp, Shirt, Footprints, Glasses, Waves, Shield, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyForecast } from '@/lib/weather';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface PackingTip {
  category: string;
  tip: string;
  icon: string;
}

interface PackingTipsProps {
  forecast: DailyForecast | null;
  location: string;
  className?: string;
  variant?: 'default' | 'hero';
}

const CATEGORY_CONFIG: Record<string, { 
  icon: typeof Shirt; 
  emoji: string;
  labelEn: string; 
  labelGr: string; 
  color: string;
}> = {
  clothing: { icon: Shirt, emoji: '👕', labelEn: 'Clothing', labelGr: 'Ρούχα', color: 'text-blue-500' },
  footwear: { icon: Footprints, emoji: '👟', labelEn: 'Footwear', labelGr: 'Υποδήματα', color: 'text-amber-600' },
  accessories: { icon: Glasses, emoji: '🕶️', labelEn: 'Accessories', labelGr: 'Αξεσουάρ', color: 'text-purple-500' },
  swimming: { icon: Waves, emoji: '🏊', labelEn: 'Swimming', labelGr: 'Κολύμπι', color: 'text-cyan-500' },
  protection: { icon: Shield, emoji: '🧴', labelEn: 'Protection', labelGr: 'Προστασία', color: 'text-green-500' },
  essentials: { icon: Briefcase, emoji: '🎒', labelEn: 'Essentials', labelGr: 'Απαραίτητα', color: 'text-orange-500' },
};

const PackingTips = forwardRef<HTMLDivElement, PackingTipsProps>(({ forecast, location, className = '', variant = 'default' }, ref) => {
  const [tips, setTips] = useState<PackingTip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { language } = useLanguage();
  const lastGeneratedDate = useRef<string | null>(null);
  
  const isHero = variant === 'hero';

  const generateTips = async () => {
    if (!forecast) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('packing-tips', {
        body: {
          weather: {
            location,
            date: forecast.date,
            tempMax: forecast.tempMax,
            tempMin: forecast.tempMin,
            weatherCode: forecast.weatherCode,
            precipitationProbability: forecast.precipitationProbability,
            windSpeed: forecast.windSpeed,
          },
          language: language === 'gr' ? 'gr' : 'en',
        },
        // Some projects issue ES256 user JWTs which the backend function gateway may reject.
        // Using the publishable key as a bearer token keeps this call public and reliable.
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate tips');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.tips && Array.isArray(data.tips)) {
        setTips(data.tips);
        setHasGenerated(true);
        setIsMinimized(false);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error generating packing tips:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate packing tips');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when date/forecast changes
  useEffect(() => {
    if (forecast && forecast.date && forecast.date !== lastGeneratedDate.current) {
      lastGeneratedDate.current = forecast.date;
      generateTips();
    }
  }, [forecast?.date]);

  // Group tips by category
  const groupedTips = tips.reduce((acc, tip) => {
    const cat = tip.category || 'essentials';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tip);
    return acc;
  }, {} as Record<string, PackingTip[]>);

  const categoryOrder = ['clothing', 'footwear', 'accessories', 'swimming', 'protection', 'essentials'];
  const sortedCategories = categoryOrder.filter(cat => groupedTips[cat]?.length > 0);

  if (!forecast) {
    return null;
  }

  return (
    <div ref={ref} className={`${isHero ? 'bg-white/10 border border-white/20' : 'glass-card'} p-3 sm:p-4 rounded-xl ${className}`}>
      <div 
        className={`flex items-center gap-2 sm:gap-3 ${hasGenerated && !loading ? 'cursor-pointer' : ''}`}
        onClick={() => hasGenerated && !loading && setIsMinimized(!isMinimized)}
      >
        <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${isHero ? 'bg-accent/20' : 'bg-accent/10'}`}>
          <Luggage className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className={`text-sm sm:text-base font-semibold ${isHero ? 'text-white' : 'text-primary'}`}>
            {language === 'gr' ? 'Τι να Πάρεις' : 'Packing Tips'}
          </h3>
          <p className={`text-xs sm:text-sm truncate ${isHero ? 'text-white/70' : 'text-muted-foreground'}`}>
            {isMinimized && hasGenerated
              ? (language === 'gr' ? `${tips.length} συμβουλές` : `${tips.length} tips`)
              : (language === 'gr' ? 'Βάσει καιρού' : 'Based on weather')}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {hasGenerated && !loading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className={`p-1 sm:p-1.5 rounded-lg transition-colors ${isHero ? 'hover:bg-white/10' : 'hover:bg-muted'}`}
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? (
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isHero ? 'text-white/70' : 'text-muted-foreground'}`} />
              ) : (
                <ChevronUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isHero ? 'text-white/70' : 'text-muted-foreground'}`} />
              )}
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="mt-4">
          {!hasGenerated && !loading && (
            <div className="text-center py-6">
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {categoryOrder.map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  const Icon = config.icon;
                  return (
                    <div 
                      key={cat}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${isHero ? 'bg-white/10 text-white/70' : 'bg-muted/50 text-muted-foreground'}`}
                    >
                      <Icon className={`w-3 h-3 ${config.color}`} />
                      <span>{language === 'gr' ? config.labelGr : config.labelEn}</span>
                    </div>
                  );
                })}
              </div>
              <p className={`text-sm ${isHero ? 'text-white/60' : 'text-muted-foreground'}`}>
                {language === 'gr' 
                  ? 'Επέλεξε ημερομηνία για να δημιουργηθούν αυτόματα'
                  : 'Select a date to auto-generate tips'}
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className={`text-sm ${isHero ? 'text-white/70' : 'text-muted-foreground'}`}>
                {language === 'gr' ? 'Δημιουργία συμβουλών...' : 'Generating tips...'}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'gr' ? 'Αποτυχία δημιουργίας' : 'Failed to generate tips'}
                </p>
                <p className="text-xs opacity-80">{error}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={generateTips}
                className="ml-auto"
              >
                {language === 'gr' ? 'Δοκίμασε ξανά' : 'Retry'}
              </Button>
            </div>
          )}

          {hasGenerated && tips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tips.map((item, index) => {
                const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.essentials;
                return (
                  <div 
                    key={index}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                      isHero 
                        ? 'bg-white/10 text-white/90' 
                        : 'bg-muted/50 text-foreground'
                    }`}
                  >
                    <span className="text-xs">{config.emoji}</span>
                    <span>{item.tip}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PackingTips.displayName = 'PackingTips';

export default PackingTips;