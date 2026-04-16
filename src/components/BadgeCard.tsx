import React from 'react';
import { Lock, Check, Lightbulb } from 'lucide-react';
import { Badge } from '@/data/badges';
import { cn } from '@/lib/utils';

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  showLocalTip?: boolean;
  compact?: boolean;
  featured?: boolean;
  progress?: number;
}

export function BadgeCard({ 
  badge, 
  isUnlocked, 
  showLocalTip = false,
  compact = false,
  featured = false,
  progress = 0,
}: BadgeCardProps) {
  if (compact) {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
        isUnlocked 
          ? "bg-accent/20 text-accent border border-accent/30"
          : "bg-muted text-muted-foreground border border-border"
      )}>
        <span className="text-base">{badge.icon}</span>
        <span className="font-medium">{badge.title}</span>
        {isUnlocked && <Check className="w-3.5 h-3.5" />}
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border p-4 transition-all",
      isUnlocked 
        ? "bg-card border-accent/30 shadow-sm" 
        : "bg-muted/30 border-border",
      featured && "ring-2 ring-accent/50 ring-offset-2 ring-offset-background"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
          isUnlocked ? "bg-accent/20" : "bg-muted"
        )}>
          {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-semibold text-sm",
              isUnlocked ? "text-foreground" : "text-muted-foreground"
            )}>
              {badge.title}
            </h3>
            {isUnlocked && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent/20 rounded text-xs text-accent font-medium">
                <Check className="w-3 h-3" />
              </span>
            )}
          </div>
          
          <p className={cn(
            "text-xs",
            isUnlocked ? "text-muted-foreground" : "text-muted-foreground/70"
          )}>
            {badge.description}
          </p>
          
          {/* Progress bar for featured locked badges */}
          {featured && !isUnlocked && progress > 0 && (
            <div className="mt-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent/50 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Local Tip - shown when unlocked and requested */}
      {isUnlocked && showLocalTip && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-start gap-2 p-3 bg-olive/10 rounded-xl">
            <Lightbulb className="w-4 h-4 text-olive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground leading-relaxed">
              {badge.localTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
