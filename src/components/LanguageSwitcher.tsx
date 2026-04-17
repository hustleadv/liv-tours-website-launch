import { useLanguage } from '@/contexts/LanguageContext';
import { type Language } from '@/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
}

// SVG Flag components for crisp rendering
const FlagGB = () => (
  <svg viewBox="0 0 60 30" className="w-6 h-4 rounded-sm shadow-sm">
    <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
    <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

const FlagGR = () => (
  <svg viewBox="0 0 27 18" className="w-6 h-4 rounded-sm shadow-sm">
    <rect fill="#0D5EAF" width="27" height="18"/>
    <path fill="#FFF" d="M0,2h27v2H0zM0,6h27v2H0zM0,10h27v2H0zM0,14h27v2H0z"/>
    <rect fill="#0D5EAF" width="10" height="10"/>
    <path fill="#FFF" d="M0,4h10v2H0zM4,0h2v10H4z"/>
  </svg>
);

const FlagDE = () => (
  <svg viewBox="0 0 5 3" className="w-6 h-4 rounded-sm shadow-sm">
    <rect width="5" height="3" y="0" fill="#000"/>
    <rect width="5" height="2" y="1" fill="#D00"/>
    <rect width="5" height="1" y="2" fill="#FFCE00"/>
  </svg>
);

const FlagFR = () => (
  <svg viewBox="0 0 3 2" className="w-6 h-4 rounded-sm shadow-sm">
    <rect width="3" height="2" fill="#ED2939"/>
    <rect width="2" height="2" fill="#fff"/>
    <rect width="1" height="2" fill="#002395"/>
  </svg>
);

const FlagIT = () => (
  <svg viewBox="0 0 3 2" className="w-6 h-4 rounded-sm shadow-sm">
    <rect width="3" height="2" fill="#CE2B37"/>
    <rect width="2" height="2" fill="#fff"/>
    <rect width="1" height="2" fill="#009246"/>
  </svg>
);

const flagComponents: Record<Language, React.FC> = {
  en: FlagGB,
  gr: FlagGR,
  de: FlagDE,
  fr: FlagFR,
  it: FlagIT,
};

const languages: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'gr', name: 'Ελληνικά' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
];

const LanguageSwitcher = ({ variant = 'desktop' }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  const CurrentFlag = flagComponents[language];
  const currentLang = languages.find(l => l.code === language);

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] px-1 opacity-70">
          Select Language
        </span>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => {
            const Flag = flagComponents[lang.code];
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 border-2 ${
                  isSelected
                    ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10'
                    : 'border-border/30 bg-background/40 hover:border-accent/20'
                }`}
                aria-label={`Switch to ${lang.name}`}
              >
                <div className={`shrink-0 ${isSelected ? 'scale-110' : 'opacity-90'}`}>
                  <Flag />
                </div>
                <span className={`text-sm font-bold tracking-tight ${isSelected ? 'text-accent' : 'text-foreground/70'}`}>
                  {lang.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center justify-center p-2 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
                aria-label={language === 'gr' ? `Αλλαγή γλώσσας. Τρέχουσα γλώσσα: Ελληνικά` : `Change language. Current language: ${currentLang?.name}`}
                data-tracking-id="language-switcher"
              >
                <CurrentFlag />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {currentLang?.name}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-0 w-auto rounded-xl p-1.5 bg-card border border-border shadow-lg">
          {languages.map((lang) => {
            const Flag = flagComponents[lang.code];
            return (
              <Tooltip key={lang.code}>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center justify-center cursor-pointer rounded-lg p-2 transition-all ${
                      language === lang.code ? 'bg-primary/10 ring-2 ring-primary/20' : 'hover:bg-muted'
                    }`}
                    data-tracking-id="language-switch"
                    data-language={lang.code}
                  >
                    <Flag />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  {lang.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default LanguageSwitcher;
