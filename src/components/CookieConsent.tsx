import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, Settings } from "lucide-react";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }

    const handleUpdate = () => setShowBanner(false);
    window.addEventListener("cookie_consent_updated", handleUpdate);
    return () => window.removeEventListener("cookie_consent_updated", handleUpdate);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie_preferences", JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
    }));
    localStorage.setItem("cookie_consent", "true");
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("cookie_preferences", JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
    }));
    localStorage.setItem("cookie_consent", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
      className="fixed bottom-4 left-4 right-4 z-[100] p-5 lg:right-auto lg:max-w-md animate-in slide-in-from-bottom-5 duration-500"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-navy-deep/95 via-navy/95 to-turquoise-deep/90 backdrop-blur-xl shadow-2xl shadow-turquoise/20">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-turquoise/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-lime/10 rounded-full blur-2xl" aria-hidden="true" />
        
        <div className="relative p-5">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-turquoise/20 to-lime/10 border border-turquoise/30 flex-shrink-0 shadow-lg shadow-turquoise/10" aria-hidden="true">
              <Cookie className="w-6 h-6 text-turquoise" />
            </div>
            <div>
              <h3 id="cookie-title" className="font-semibold text-white text-lg mb-1.5 tracking-tight">
                🍪 Cookie Settings
              </h3>
              <p id="cookie-description" className="text-sm text-white/70 leading-relaxed">
                We use cookies to enhance your browsing experience. Customize your preferences anytime.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="Cookie consent options">
            <Button 
              size="sm" 
              onClick={handleAcceptAll}
              className="bg-gradient-to-r from-turquoise to-turquoise-light hover:from-turquoise-light hover:to-turquoise text-navy-deep font-semibold shadow-lg shadow-turquoise/25 hover:shadow-turquoise/40 transition-all duration-300 hover:scale-105"
            >
              Accept All
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleEssentialOnly}
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Essential Only
            </Button>
            <Link to="/legal/cookiesettings">
              <Button 
                size="sm" 
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <Settings className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Manage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
