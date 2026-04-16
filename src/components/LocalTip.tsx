import { useState } from "react";
import { Lightbulb, Loader2, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocalTip } from "@/hooks/useLocalTip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface LocalTipProps {
  destination?: string;
  pickupLocation?: string;
  // New AI-powered props
  locationId?: string;
  locationName?: string;
  lat?: number;
  lon?: number;
  locationType?: 'beach' | 'airport' | 'port' | 'city' | 'resort' | 'attraction' | 'general';
  isAdmin?: boolean;
  useAI?: boolean;
  compact?: boolean;
  variant?: 'default' | 'hero';
}

// Static tips for backward compatibility
const getStaticTip = (destination: string, pickup?: string): string | null => {
  const dest = destination.toLowerCase();
  const pick = (pickup || '').toLowerCase();
  
  if (dest.includes('balos')) return 'Arrive before 10am to avoid crowds.';
  if (dest.includes('elafonisi')) return 'Pink sand is most visible early morning.';
  if (dest.includes('old town') || dest.includes('chania')) return 'Parking is limited—your driver drops you at your door.';
  if (dest.includes('elounda')) return 'Book a boat to Spinalonga Island—just 15 min away.';
  if (pick.includes('port') || dest.includes('port')) return 'Ferry schedules change seasonally—double-check times.';
  if (dest.includes('kissamos')) return 'Balos boat leaves at 10am—arrive 30 min early.';
  
  return null;
};

const LocalTip = ({ 
  destination, 
  pickupLocation,
  locationId,
  locationName,
  lat,
  lon,
  locationType = 'general',
  isAdmin = false,
  useAI = false,
  compact = false,
  variant = 'default',
}: LocalTipProps) => {
  
  // Use AI-powered tips if enabled
  if (useAI && locationId && locationName) {
    return (
      <AILocalTip
        locationId={locationId}
        locationName={locationName}
        lat={lat}
        lon={lon}
        locationType={locationType}
        isAdmin={isAdmin}
        compact={compact}
        variant={variant}
      />
    );
  }

  // Fallback to static tips
  const tip = destination ? getStaticTip(destination, pickupLocation) : null;
  if (!tip) return null;
  
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lightbulb className="w-3 h-3 text-amber-500" />
        <span className="truncate">{tip}</span>
      </div>
    );
  }
  
  return (
    <div className="inline-flex items-start gap-2 px-4 py-3 bg-accent/10 rounded-xl text-sm">
      <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
      <p className="text-foreground">
        <span className="font-medium text-accent">Local tip:</span> {tip}
      </p>
    </div>
  );
};

// AI-powered component
const AILocalTip = ({
  locationId,
  locationName,
  lat,
  lon,
  locationType,
  isAdmin,
  compact = false,
  variant = 'default',
}: {
  locationId: string;
  locationName: string;
  lat?: number;
  lon?: number;
  locationType: string;
  isAdmin: boolean;
  compact?: boolean;
  variant?: 'default' | 'hero';
}) => {
  const { tip, source, confidence, sourceSummary, isLoading, getAlternatives, setManualTip, refetch } = useLocalTip({
    locationId,
    locationName,
    lat,
    lon,
    locationType: locationType as any,
  });

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [loadingAlts, setLoadingAlts] = useState(false);
  const [customTip, setCustomTip] = useState('');
  const [saving, setSaving] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isMobile = useIsMobile();
  
  const isHero = variant === 'hero';
  
  // On mobile, always show expanded (no minimize)
  const effectiveMinimized = isMobile ? false : isMinimized;

  const handleImproveTip = async () => {
    setShowAdminModal(true);
    setLoadingAlts(true);
    setCustomTip(tip);
    const alts = await getAlternatives();
    setAlternatives(alts);
    setLoadingAlts(false);
  };

  const handleSelect = async (t: string) => {
    setSaving(true);
    await setManualTip(t);
    setSaving(false);
    setShowAdminModal(false);
  };

  // Compact version for cards
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {isLoading ? (
          <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
        ) : (
          <Lightbulb className="w-3 h-3 text-amber-500" />
        )}
        <span className="truncate">{isLoading ? 'Loading...' : tip}</span>
      </div>
    );
  }

  return (
    <>
      <div className={`w-full max-w-full min-w-0 rounded-xl overflow-hidden ${
        isHero 
          ? 'bg-white/10 border border-white/20' 
          : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50'
      }`}>
        <div 
          className={`w-full max-w-full flex items-center gap-3 p-3 sm:p-4 ${!isMobile ? 'cursor-pointer' : ''} ${effectiveMinimized ? '' : 'pb-2 sm:pb-3'}`}
          onClick={() => !isMobile && !isLoading && setIsMinimized(!isMinimized)}
        >
          <div className={`p-1.5 sm:p-2 rounded-full shrink-0 ${isHero ? 'bg-amber-500/20' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
            {isLoading ? (
              <Loader2 className={`h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin ${isHero ? 'text-amber-400' : 'text-amber-600 dark:text-amber-400'}`} />
            ) : (
              <Lightbulb className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isHero ? 'text-amber-400' : 'text-amber-600 dark:text-amber-400'}`} />
            )}
          </div>
          
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${isHero ? 'text-amber-400' : 'text-amber-700 dark:text-amber-400'}`}>
              Local Tip
              {source === 'manual' && (
                <span className={`ml-2 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-medium ${isHero ? 'bg-olive/20 text-olive-light' : 'bg-olive/10 text-olive'}`}>✓ Verified</span>
              )}
            </p>
            {effectiveMinimized && !isLoading && tip && (
              <p className={`text-xs truncate mt-0.5 ${isHero ? 'text-white/60' : 'text-muted-foreground'}`}>
                {tip}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isAdmin && !isLoading && !effectiveMinimized && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); handleImproveTip(); }} 
                className={`h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs ${isHero ? 'text-amber-400 hover:text-amber-300 hover:bg-white/10' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-100/50'}`}
              >
                <Sparkles className="w-3 h-3 mr-0.5 sm:mr-1" />Improve
              </Button>
            )}
            {/* Hide minimize button on mobile */}
            {!isMobile && !isLoading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className={`p-1 sm:p-1.5 rounded-lg transition-colors ${isHero ? 'hover:bg-white/10' : 'hover:bg-amber-100/50'}`}
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isHero ? 'text-white/70' : 'text-amber-600'}`} />
                ) : (
                  <ChevronUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isHero ? 'text-white/70' : 'text-amber-600'}`} />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Expanded content - separate from header */}
        {!effectiveMinimized && !isLoading && tip && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <p className={`text-xs sm:text-sm leading-relaxed break-words ${isHero ? 'text-white/90' : 'text-foreground/90'}`}>
              {tip}
            </p>
          </div>
        )}
        
        {!effectiveMinimized && isLoading && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <p className={`text-xs sm:text-sm ${isHero ? 'text-white/60' : 'text-muted-foreground'}`}>
              Loading tip...
            </p>
          </div>
        )}
      </div>

      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Improve Tip: {locationName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {sourceSummary && <div className="p-3 bg-muted/50 rounded-lg text-xs max-h-24 overflow-y-auto">{sourceSummary}</div>}
            
            {loadingAlts ? (
              <div className="flex items-center gap-2 text-sm p-4"><Loader2 className="w-4 h-4 animate-spin" />Generating...</div>
            ) : (
              <div className="space-y-2">
                {alternatives.map((alt, i) => (
                  <button key={i} onClick={() => handleSelect(alt)} disabled={saving}
                    className="w-full p-3 text-left text-sm bg-card hover:bg-accent/50 rounded-lg border flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-olive flex-shrink-0" /><span>{alt}</span>
                  </button>
                ))}
              </div>
            )}
            
            <div>
              <Textarea value={customTip} onChange={(e) => setCustomTip(e.target.value)} maxLength={120} rows={2} placeholder="Custom tip..." />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">{customTip.length}/120</span>
                <Button size="sm" onClick={() => handleSelect(customTip)} disabled={!customTip.trim() || saving}>
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}Use This
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocalTip;
