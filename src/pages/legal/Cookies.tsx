import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Cookie, Shield, BarChart3, Target, Settings } from "lucide-react";

const Cookies = () => {
  const cookieCategories = [
    {
      icon: Shield,
      title: "Essential Cookies",
      required: true,
      description: "These cookies are necessary for the website to function properly. They enable core features like security, network management, and accessibility.",
      examples: ["Session management", "Security tokens", "Cookie consent preferences"],
    },
    {
      icon: BarChart3,
      title: "Analytics Cookies",
      required: false,
      description: "These cookies help us understand how visitors interact with our website. All data is anonymized and used to improve our services.",
      examples: ["Page views and navigation paths", "Time spent on pages", "Error tracking"],
    },
    {
      icon: Target,
      title: "Marketing Cookies",
      required: false,
      description: "These cookies are used to show you relevant advertisements and measure the effectiveness of our marketing campaigns.",
      examples: ["Ad performance tracking", "Retargeting pixels", "Social media integration"],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Cookie Policy | LIV Tours"
        description="Learn about the cookies we use on our website and how they help improve your experience."
        canonicalUrl="https://livtours.gr/legal/cookies"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Legal
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Cookie Policy
            </h1>
            <p className="text-lg text-primary-foreground/80">
              We use cookies to enhance your browsing experience. Here is everything 
              you need to know about how and why we use them.
            </p>
            <p className="text-sm text-primary-foreground/60 mt-4">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* What Are Cookies */}
      <section className="section-padding bg-cream-warm">
        <div className="container-wide max-w-4xl">
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-olive/10">
                <Cookie className="w-5 h-5 text-olive" />
              </div>
              <h2 className="text-xl font-semibold text-primary">What Are Cookies?</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. 
              They help websites remember your preferences, understand how you use the site, 
              and provide a more personalized experience. Cookies cannot access other data 
              on your device or harm your computer.
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Categories */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">
            Cookie Categories
          </h2>
          
          <div className="space-y-6">
            {cookieCategories.map((category) => (
              <div key={category.title} className="glass-card p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-olive/10">
                      <category.icon className="w-5 h-5 text-olive" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary">{category.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    category.required 
                      ? "bg-primary/10 text-primary" 
                      : "bg-accent/10 text-accent"
                  }`}>
                    {category.required ? "Required" : "Optional"}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">Examples:</p>
                  <ul className="space-y-1">
                    {category.examples.map((example, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-accent" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Manage Cookies CTA */}
          <div className="mt-10 text-center">
            <p className="text-muted-foreground mb-4">
              You can manage your cookie preferences at any time.
            </p>
            <Link to="/legal/cookiesettings">
              <Button size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Manage Cookie Settings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cookies;
