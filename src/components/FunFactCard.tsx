import { Lightbulb, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FunFactCardProps {
  funFact: string | null;
  sourceUrl: string | null;
  isLoading: boolean;
  label?: string;
  sourceLabel?: string;
}

export function FunFactCard({ 
  funFact, 
  sourceUrl, 
  isLoading,
  label = 'Fun Fact',
  sourceLabel = 'Source: Wikipedia'
}: FunFactCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border-cyan-200/50 dark:border-cyan-800/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900/50">
              <Lightbulb className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20 bg-cyan-200/50" />
              <Skeleton className="h-4 w-full bg-cyan-200/50" />
              <Skeleton className="h-4 w-3/4 bg-cyan-200/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!funFact) return null;

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border-cyan-200/50 dark:border-cyan-800/50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900/50 shrink-0">
            <Lightbulb className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-1.5">
              {label}
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {funFact}
            </p>
            {sourceUrl && (
              <a 
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {sourceLabel}
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}