import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Plane,
  Map,
  Compass,
  Car,
   HelpCircle,
   Briefcase,
   MapPin,
  Users,
  Heart,
  Palette,
  Star,
  X,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import HamburgerIcon from "@/components/HamburgerIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMobileMenu } from "@/contexts/MobileMenuContext";
import { trackEvent } from "@/lib/tracking";
import logo from "@/assets/logo.webp";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WeatherBadge from "@/components/WeatherBadge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail, 
  Phone, 
  MessageCircle, 
  Globe 
} from "lucide-react";

interface NavLink {
  name: string;
  path?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children?: { name: string; path: string; icon?: LucideIcon; iconColor?: string }[];
}

const Header = () => {
  const { isMenuOpen: mobileMenuOpen, setIsMenuOpen: setMobileMenuOpen } = useMobileMenu();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  // Track scroll for header style change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setOpenMobileSubmenu(null);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks: NavLink[] = [
    {
      name: t.nav.services,
      icon: Briefcase,
      iconColor: "text-primary",
      children: [
        { name: t.nav.airportTransfers, path: "/transfers", icon: Plane, iconColor: "text-primary" },
        { name: t.nav.privateTours, path: "/tours", icon: Compass, iconColor: "text-primary" },
        { name: t.nav.customTour, path: "/tours/builder", icon: Palette, iconColor: "text-primary" },
        { name: "Events & Weddings", path: "/events", icon: Heart, iconColor: "text-primary" },
      ],
    },
    {
      name: t.nav.tours, 
      icon: Map, 
      iconColor: "text-primary",
      children: [
        { name: t.nav.privateTours, path: "/tours/private", icon: Compass, iconColor: "text-primary" },
        { name: t.nav.sharedTours, path: "/tours/shared", icon: Users, iconColor: "text-primary" },
      ]
    },
    { name: t.nav.routes, path: "/routes", icon: MapPin, iconColor: "text-primary" },
    { name: t.nav.fleet, path: "/fleet", icon: Car, iconColor: "text-primary" },
    { name: t.nav.reviews, path: "/reviews", icon: Star, iconColor: "text-primary" },
    { name: t.nav.faq, path: "/faq", icon: HelpCircle, iconColor: "text-primary" },
  ];

  return (
    <>
      <header 
        role="banner"
        aria-label="Main navigation"
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] transition-all duration-500",
          scrolled && !mobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" 
            : "bg-transparent"
        )}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center relative z-50 group">
              <span className="flex flex-col font-black leading-none tracking-tight">
                <span className="block text-xl md:text-2xl text-foreground drop-shadow-sm transition-colors duration-300">
                  LIV <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-4">Tours</span>
                </span>
                <span className="block text-[10px] md:text-xs text-muted-foreground font-semibold tracking-[0.25em] mt-1.5 uppercase">& Transfers</span>
              </span>
            </Link>

            {/* Desktop Navigation - Modern pill style */}
            <nav className="hidden lg:flex items-center" aria-label="Primary navigation">
              <ul className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-300",
                scrolled ? "bg-muted/50" : "bg-background/60 backdrop-blur-sm"
              )} role="menubar">
                {navLinks.map((link) =>
                  link.children ? (
                    <li 
                      key={link.name} 
                      role="none"
                      onMouseEnter={() => setActiveDropdown(link.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="relative"
                    >
                      <DropdownMenu open={activeDropdown === link.name}>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="group flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 rounded-full hover:bg-background/80 focus:outline-none leading-none"
                            aria-haspopup="true"
                            role="menuitem"
                          >
                            <span className="flex items-center">{link.name}</span>
                            <ChevronDown className={cn(
                              "w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-all duration-300",
                              activeDropdown === link.name && "rotate-180"
                            )} aria-hidden="true" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="start" 
                          className="w-64 mt-2 p-2 bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
                          role="menu"
                        >
                          {link.children.map((child) => (
                            <DropdownMenuItem key={child.path} asChild role="none">
                              <Link
                                to={child.path}
                                role="menuitem"
                                aria-current={isActive(child.path) ? "page" : undefined}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item",
                                  isActive(child.path) 
                                    ? "text-accent font-medium bg-accent/10" 
                                    : "hover:bg-muted"
                                )}
                              >
                                {child.icon && (
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                    isActive(child.path) ? "bg-accent/20" : "bg-muted group-hover/item:bg-background",
                                    child.iconColor
                                  )}>
                                    <child.icon className="w-4 h-4" />
                                  </div>
                                )}
                                <span className="text-sm">{child.name}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ) : (
                    <li key={link.path} role="none">
                      <Link
                        to={link.path!}
                        role="menuitem"
                        aria-current={isActive(link.path!) ? "page" : undefined}
                        onClick={() => {
                          if (link.path === '/trip') {
                            trackEvent('trip_hub_nav_click' as any);
                          }
                        }}
                        className={cn(
                          "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 leading-none flex items-center",
                          isActive(link.path!)
                            ? "text-accent"
                            : "text-foreground/80 hover:text-foreground hover:bg-background/80"
                        )}
                      >
                        <span>{link.name}</span>
                        {isActive(link.path!) && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" aria-hidden="true" />
                        )}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-1.5">
              <WeatherBadge />
              
              <LanguageSwitcher variant="desktop" />
              
              <Link to="/contact">
                <Button 
                  size="sm" 
                  className="ml-2 h-10 px-5 rounded-full bg-gradient-to-r from-accent to-lime text-accent-foreground font-semibold shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-105 transition-all duration-300"
                  data-tracking-id="header-get-quote"
                >
                  {t.cta.getQuote}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2.5 rounded-full hover:bg-muted/50 transition-colors focus:outline-none relative z-[70] touch-manipulation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <HamburgerIcon isOpen={mobileMenuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay & Panel - Modern Full Screen "Quiet Luxury" */}
      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] lg:hidden"
          >
            {/* Backdrop with extreme blur for premium feel */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
              onClick={() => setMobileMenuOpen(false)}
              role="button"
              aria-label="Close menu"
              tabIndex={0}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-full md:max-w-md bg-background border-l border-border/20 shadow-2xl overflow-y-auto overscroll-contain flex flex-col"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 80px)' }}
            >
              {/* Decorative Mesh Gradient Background */}
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lime/20 rounded-full blur-[100px]" />
              </div>

              {/* Header Spacer - ensuring menu items start after the logo space */}
              {/* Mobile Menu Logo & Close Area Header Replicated for perfect alignment */}
              <div className="flex items-center justify-between px-6 h-14 md:h-16 border-b border-border/10 shrink-0">
                <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                  <span className="flex flex-col font-black leading-none tracking-tight">
                    <span className="block text-xl text-foreground">
                      LIV <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-4">Tours</span>
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-semibold tracking-[0.25em] mt-1.5 uppercase">& Transfers</span>
                  </span>
                </Link>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-foreground/70" />
                </button>
              </div>

              {/* Language Switcher - Clear and accessible */}
              <div className="relative z-10 px-6 pt-6 pb-6 border-b border-border/10 bg-muted/20">
                <LanguageSwitcher variant="mobile" />
              </div>

              {/* Navigation Items */}
              <nav className="relative z-10 px-4 py-4 flex-1" aria-label="Mobile navigation">
                <ul className="space-y-2">
                  {navLinks.map((link, index) => {
                    const isDropdown = !!link.children;
                    const isOpen = openMobileSubmenu === link.name;
                    
                    return (
                      <motion.li 
                        key={link.name || link.path}
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                      >
                        {isDropdown ? (
                          <div className="space-y-1">
                            <button
                              onClick={() => setOpenMobileSubmenu(isOpen ? null : link.name)}
                              className={cn(
                                "w-full flex items-center justify-between py-4 border-b border-border/40 transition-colors",
                                isOpen ? "text-accent" : "text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                {link.icon && (
                                  <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                                    isOpen ? "bg-accent/10" : "bg-muted/50",
                                    link.iconColor
                                  )}>
                                    <link.icon className="w-5 h-5" />
                                  </div>
                                )}
                                <span className="text-xl font-semibold tracking-tight leading-none">{link.name}</span>
                              </div>
                              <ChevronRight className={cn(
                                "w-5 h-5 transition-transform duration-300",
                                isOpen && "rotate-90 text-accent"
                              )} />
                            </button>
                            
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.ul
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  className="overflow-hidden space-y-1 pl-14"
                                >
                                  {link.children?.map((child, cIdx) => (
                                    <motion.li 
                                      key={child.path}
                                      initial={{ x: -10, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: cIdx * 0.03 }}
                                    >
                                      <Link
                                        to={child.path}
                                        className={cn(
                                          "flex items-center gap-3 py-3 text-base transition-colors",
                                          isActive(child.path) ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"
                                        )}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                                        {child.name}
                                      </Link>
                                    </motion.li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            to={link.path!}
                            className={cn(
                              "flex items-center justify-between py-4 border-b border-border/40 transition-colors group",
                              isActive(link.path!) ? "text-accent" : "text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              {link.icon && (
                                <div className={cn(
                                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                                  isActive(link.path!) ? "bg-accent/10" : "bg-muted/50",
                                  link.iconColor
                                )}>
                                  <link.icon className="w-5 h-5" />
                                </div>
                              )}
                              <span className="text-xl font-semibold tracking-tight leading-none">{link.name}</span>
                            </div>
                            {isActive(link.path!) && (
                              <motion.div 
                                layoutId="activeDot"
                                className="w-2 h-2 rounded-full bg-accent" 
                              />
                            )}
                            <ChevronRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-40 group-hover:translate-x-0 transition-all" />
                          </Link>
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Concierge & Contact Section */}
              <div className="relative z-10 px-8 py-10 bg-muted/30 border-t border-border/20">
                <div className="flex flex-col gap-8">
                  {/* Branding Accent */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent leading-none">
                      {t.concierge.badge}
                    </p>
                    <h4 className="text-2xl font-serif italic text-primary leading-tight whitespace-pre-line">
                      {t.concierge.title}
                    </h4>
                  </div>

                  {/* Contact Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <a 
                      href="tel:+306944363525" 
                      className="flex flex-col gap-3 p-4 rounded-2xl bg-background border border-border/50 hover:border-accent/40 transition-colors shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.concierge.callUs}</span>
                      <span className="text-sm font-medium leading-none truncate">+30 694 436 3525</span>
                    </a>
                    <a 
                      href="mailto:info@liv-tours.com" 
                      className="flex flex-col gap-3 p-4 rounded-2xl bg-background border border-border/50 hover:border-accent/40 transition-colors shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.concierge.email}</span>
                      <span className="text-sm font-medium leading-none truncate">info@liv-tours.com</span>
                    </a>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-col gap-6">
                    <Link to="/contact">
                      <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-accent to-lime text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all active:scale-[0.98]">
                        {t.concierge.bookTransfer}
                      </Button>
                    </Link>
                    
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
