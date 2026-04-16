import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight, Command } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.webp";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t, language } = useLanguage();

  const servicesLinks = [
    { name: t.footer.airportTransfers, path: "/transfers" },
    { name: t.footer.privateTours, path: "/tours" },
    { name: t.events?.heroTitle || "Events & Weddings", path: "/events" },
    { name: t.footer.fleet, path: "/fleet" },
    { name: t.footer.routes, path: "/routes" },
  ];

  const companyLinks = [
    { name: t.footer.about, path: "/about" },
    { name: t.footer.reviews, path: "/reviews" },
    { name: t.footer.faq, path: "/faq" },
    { name: t.footer.contact, path: "/contact" },
    { name: t.footer.tripHub, path: "/trip" },
  ];

  const legalLinks = [
    { name: t.footer.privacyPolicy, path: "/legal/privacy" },
    { name: t.footer.cookiePolicy, path: "/legal/cookies" },
    { name: t.footer.cookieSettings, path: "/legal/cookiesettings" },
    { name: t.footer.termsConditions, path: "/legal/terms" },
    { name: t.footer.bookingTerms, path: "/legal/bookingterms" },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/liv_tours_chania/",
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    },
    {
      name: "Facebook",
      href: "https://web.facebook.com/profile.php?id=61560867682963",
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    },
    {
      name: "TripAdvisor",
      href: "https://www.tripadvisor.com.gr/Attraction_Review-g189415-d33104911-Reviews-Liv_Tours-Chania_Town_Chania_Prefecture_Crete.html",
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 0 0 4.04 10.43 5.976 5.976 0 0 0 4.075-1.6L12 19.705l1.922-2.09a5.972 5.972 0 0 0 4.072 1.598 6 6 0 0 0 4.041-10.43L24 6.648h-4.35a13.573 13.573 0 0 0-7.644-2.353zM12 6.255a11.399 11.399 0 0 1 5.666 1.467c-.9.326-1.683.862-2.31 1.543a4.022 4.022 0 0 0-6.712 0 5.971 5.971 0 0 0-2.31-1.543A11.397 11.397 0 0 1 12 6.255zM6.004 17.236a4.022 4.022 0 1 1 0-8.044 4.022 4.022 0 0 1 0 8.044zm11.992 0a4.022 4.022 0 1 1 0-8.044 4.022 4.022 0 0 1 0 8.044zM6.004 11.18a2.035 2.035 0 1 0 0 4.07 2.035 2.035 0 0 0 0-4.07zm11.992 0a2.035 2.035 0 1 0 0 4.07 2.035 2.035 0 0 0 0-4.07z"/></svg>,
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/306944363525",
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@liv_it_tours_chania",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
        </svg>
      ),
    },
];

  return (
    <footer ref={ref} className="bg-slate-950 relative overflow-hidden border-t border-white/5 pt-16 md:pt-32 pb-12">
      {/* High-End Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="container-wide relative z-10 px-6 md:px-8">
        {/* Top Section: Logo & Motto */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 md:gap-12 mb-16 md:mb-24 pb-12 md:pb-16 border-b border-white/5">
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex flex-col group w-fit">
              <div className="font-black leading-none uppercase tracking-[0.2em]">
                <span className="block text-white text-xl md:text-2xl lg:text-3xl group-hover:text-accent transition-colors duration-300">LIV Tours & Transfers</span>
                <span className="block text-white/40 text-[9px] md:text-[10px] mt-3 italic font-serif tracking-[0.2em]">Premium Crete Services</span>
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              {language === 'gr'
                ? 'Εξατομικευμένες μεταφορές και ιδιωτικές ξεναγήσεις στην Κρήτη με την αξιοπιστία και την πολυτέλεια της LIV.'
                : 'Redefining Crete transportation through unmatched luxury, local expertise, and the pursuit of the perfect journey.'}
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-accent/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white/90 tracking-tighter leading-none">
              Just <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-[8px] md:underline-offset-[12px]">Live</span> it
            </h2>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-12 lg:gap-8 mb-16 md:mb-24">
          {/* Services */}
          <div className="col-span-1 lg:col-span-3">
            <h3 className="text-white font-black mb-6 md:mb-8 uppercase text-[10px] tracking-[0.3em] opacity-50">{t.footer.services}</h3>
            <ul className="space-y-4">
              {servicesLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/40 hover:text-accent transition-all duration-300 text-sm flex items-center gap-2 group">
                    <div className="w-1.5 h-[1px] bg-accent/40 group-hover:w-4 transition-all" />
                    <span className="leading-tight">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 lg:col-span-3">
            <h3 className="text-white font-black mb-6 md:mb-8 uppercase text-[10px] tracking-[0.3em] opacity-50">{t.footer.company}</h3>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/40 hover:text-accent transition-all duration-300 text-sm flex items-center gap-2 group">
                    <div className="w-1.5 h-[1px] bg-accent/40 group-hover:w-4 transition-all" />
                    <span className="leading-tight">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Cards - Glassmorphic Style */}
          <div className="col-span-2 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="tel:+306944363525" className="glass-card bg-white/[0.03] border-white/5 p-6 rounded-3xl hover:bg-white/[0.06] transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mb-1">WhatsApp & Call</p>
              <p className="text-white text-lg font-bold">+30 694 436 3525</p>
            </a>

            <a href="mailto:info@liv-tours.com" className="glass-card bg-white/[0.03] border-white/5 p-6 rounded-3xl hover:bg-white/[0.06] transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Email Support</p>
              <p className="text-white text-lg font-bold">info@liv-tours.com</p>
            </a>

            <div className="glass-card bg-white/[0.03] border-white/5 p-5 md:p-6 rounded-3xl sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Based In</p>
                  <p className="text-white text-sm font-bold">{t.footer.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-accent hover:border-accent/30 transition-all"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 md:pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center lg:items-baseline gap-8 text-center lg:text-left">
          <div className="flex flex-wrap items-baseline justify-center lg:justify-start gap-x-8 gap-y-4">
            <span className="text-white/20 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none">
              © {new Date().getFullYear()} LIV Tours & Transfers
            </span>
            {legalLinks.slice(0, 3).map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className="text-white/20 hover:text-white transition-colors text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 text-white/20 text-[9px] font-bold uppercase tracking-[0.3em]">
            <Command className="w-3 h-3 text-accent/50" />
            <span>Digital Excellence by</span>
            <a 
              href="https://hustlelabs.gr/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/40 hover:text-accent transition-colors font-black tracking-normal flex items-center gap-1"
            >
              Hustle<span>Labs</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;