import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, BarChart3, Target, Check } from "lucide-react";
import { toast } from "sonner";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieSettings = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cookie_preferences");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...preferences, ...parsed, essential: true });
      } catch {
        // Use defaults
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("cookie_preferences", JSON.stringify(preferences));
    localStorage.setItem("cookie_consent", "true");
    setSaved(true);
    toast.success("Cookie preferences saved");
    
    // Dispatch event for cookie consent banner to update
    window.dispatchEvent(new Event("cookie_consent_updated"));
    
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    localStorage.setItem("cookie_preferences", JSON.stringify(allAccepted));
    localStorage.setItem("cookie_consent", "true");
    toast.success("All cookies accepted");
    window.dispatchEvent(new Event("cookie_consent_updated"));
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = { essential: true, analytics: false, marketing: false };
    setPreferences(essentialOnly);
    localStorage.setItem("cookie_preferences", JSON.stringify(essentialOnly));
    localStorage.setItem("cookie_consent", "true");
    toast.success("Non-essential cookies rejected");
    window.dispatchEvent(new Event("cookie_consent_updated"));
  };

  const categories = [
    {
      id: "essential",
      icon: Shield,
      title: "Essential Cookies",
      description: "Required for the website to function. These cannot be disabled.",
      required: true,
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Analytics Cookies",
      description: "Help us understand how visitors use our website to improve our services.",
      required: false,
    },
    {
      id: "marketing",
      icon: Target,
      title: "Marketing Cookies",
      description: "Used to show you relevant advertisements based on your interests.",
      required: false,
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Cookie Settings | LIV Tours"
        description="Manage your cookie preferences and control how we use cookies on our website."
        canonicalUrl="https://livtours.gr/legal/cookiesettings"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Privacy Controls
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Cookie Settings
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Control which cookies you allow. Essential cookies are required 
              for the website to work properly.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-cream-warm">
        <div className="container-wide max-w-4xl">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" onClick={handleAcceptAll}>
              Accept All Cookies
            </Button>
            <Button variant="outline" size="lg" onClick={handleRejectNonEssential}>
              Essential Only
            </Button>
          </div>
        </div>
      </section>

      {/* Cookie Categories */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="glass-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-xl bg-olive/10 mt-1">
                      <category.icon className="w-5 h-5 text-olive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-primary">{category.title}</h3>
                        {category.required && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{category.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[category.id as keyof CookiePreferences]}
                    onCheckedChange={(checked) =>
                      !category.required && setPreferences({ ...preferences, [category.id]: checked })
                    }
                    disabled={category.required}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-10 text-center">
            <Button size="xl" onClick={handleSave} className="min-w-[200px]">
              {saved ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Saved!
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Your preferences will be stored and remembered for future visits.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CookieSettings;
