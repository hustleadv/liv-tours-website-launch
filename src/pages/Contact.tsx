import { Phone, Mail, MapPin, Clock, MessageCircle, Check, Send, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import QuoteWidget from "@/components/QuoteWidget";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import contactHeroImage from "@/assets/routes-hero-new.webp";

const Contact = () => {
  const { language } = useLanguage();
  
  const contactMethods = [
    {
      icon: MessageCircle,
      title: language === 'gr' ? "WhatsApp" : "WhatsApp",
      value: "+30 694 436 3525",
      href: "https://wa.me/306944363525",
      description: language === 'gr' ? "Ταχύτερη απάντηση" : "Fastest response",
      highlight: true,
    },
    {
      icon: Phone,
      title: language === 'gr' ? "Τηλέφωνο" : "Call Us",
      value: "+30 694 436 3525",
      href: "tel:+306944363525",
      description: language === 'gr' ? "24/7 διαθέσιμοι" : "24/7 available",
    },
    {
      icon: Mail,
      title: "Email",
      value: "info@liv-tours.com",
      href: "mailto:info@liv-tours.com",
      description: language === 'gr' ? "Απάντηση εντός 15'" : "Reply within 15'",
    },
    {
      icon: MapPin,
      title: language === 'gr' ? "Έδρα" : "Based in",
      value: language === 'gr' ? "Χανιά, Κρήτη" : "Chania, Crete",
      description: language === 'gr' ? "Τοπική ομάδα" : "Local team",
    },
  ];

  const trustPoints = [
    {
      icon: Zap,
      text: language === 'gr' ? "Απάντηση σε 15'" : "Reply in 15 min",
    },
    {
      icon: Shield,
      text: language === 'gr' ? "Χωρίς κρυφές χρεώσεις" : "No hidden fees",
    },
    {
      icon: Star,
      text: language === 'gr' ? "5 αστέρια Google" : "5 star rated",
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={language === 'gr' ? "Επικοινωνία | Κράτηση Μεταφοράς Χανιά - LIV Tours" : "Contact | Book Transfer Chania - LIV Tours"}
        description={language === 'gr' 
          ? "Επικοινωνήστε μαζί μας για κράτηση μεταφοράς στα Χανιά. WhatsApp, τηλέφωνο, email - απάντηση εντός 15 λεπτών. 24/7 υποστήριξη."
          : "Contact us to book your transfer in Chania. WhatsApp, phone, email - reply within 15 minutes. 24/7 support."
        }
        keywords="επικοινωνία LIV Tours, κράτηση ταξί Χανιά, book transfer Chania, contact taxi Crete"
        canonicalUrl="https://livtours.gr/contact"
      />

      <PageHero
        label={language === 'gr' ? "Επικοινωνία" : "Get in Touch"}
        title={language === 'gr' ? "Μιλήστε" : "Let's Talk"}
        titleAccent={language === 'gr' ? "Μαζί μας" : "Directly"}
        subtitle={language === 'gr'
          ? "Συμπληρώστε τη φόρμα ή στείλτε μας μήνυμα. Θα έχετε επιβεβαιωμένη τιμή εντός 15'."
          : "Fill out the form or message us directly. You'll have a confirmed price within 15 minutes."
        }
        image={contactHeroImage}
        icon={Send}
        align="left"
        overlay="dark"
        serifAccent
      >
        <div className="flex flex-col gap-6">
          {/* Trust pills */}
          <div className="flex flex-wrap gap-3">
            {trustPoints.map((point, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <point.icon className="w-3 h-3 text-accent" />
                </div>
                <span className="text-xs font-semibold text-white/90">{point.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-4 border-t border-white/15">
            <div>
              <p className="text-2xl font-bold text-white">15'</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/50">
                {language === 'gr' ? "Χρόνος Απόκρισης" : "Response Time"}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/50">
                {language === 'gr' ? "Διαθέσιμοι" : "Available"}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5★</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/50">
                {language === 'gr' ? "Google Rating" : "Google Rating"}
              </p>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Contact Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Contact Methods - Left Side */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="sticky top-24">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {language === 'gr' ? "Προτιμάτε να μιλήσετε;" : "Prefer to talk?"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'gr' 
                    ? "Είμαστε διαθέσιμοι 24/7. Το WhatsApp είναι ο ταχύτερος τρόπος."
                    : "We're available 24/7. WhatsApp is usually fastest."
                  }
                </p>

                {/* Contact Cards */}
                <div className="space-y-4">
                  {contactMethods.map((method) => (
                    <div 
                      key={method.title} 
                      className={`glass-card p-4 transition-all duration-300 hover:shadow-lg ${
                        method.highlight 
                          ? 'border-accent/30 bg-accent/5 hover:border-accent/50' 
                          : 'hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          method.highlight 
                            ? 'bg-accent/20' 
                            : 'bg-olive/10'
                        }`}>
                          <method.icon className={`w-6 h-6 ${
                            method.highlight ? 'text-accent' : 'text-olive'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                            {method.title}
                          </p>
                          {method.href ? (
                            <a
                              href={method.href}
                              target={method.href.startsWith("http") ? "_blank" : undefined}
                              rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="font-semibold text-primary hover:text-accent transition-colors block truncate"
                            >
                              {method.value}
                            </a>
                          ) : (
                            <p className="font-semibold text-primary truncate">{method.value}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                        </div>
                        {method.href && (
                          <Button 
                            variant={method.highlight ? "default" : "outline"} 
                            size="sm"
                            className={method.highlight ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}
                            asChild
                          >
                            <a
                              href={method.href}
                              target={method.href.startsWith("http") ? "_blank" : undefined}
                              rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            >
                              {method.highlight 
                                ? (language === 'gr' ? "Chat" : "Chat") 
                                : (language === 'gr' ? "Άνοιγμα" : "Open")
                              }
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Availability Card */}
                <div className="mt-6 glass-card p-5 bg-muted/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-olive/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-olive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">
                        {language === 'gr' ? "Διαθεσιμότητα" : "Availability"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {language === 'gr' ? "Πάντα εδώ για εσάς" : "Always here for you"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">
                        {language === 'gr' ? "Μεταφορές" : "Transfers"}
                      </span>
                      <span className="text-sm font-semibold text-accent">24/7</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">
                        {language === 'gr' ? "Υποστήριξη" : "Support"}
                      </span>
                      <span className="text-sm font-semibold text-accent">24/7</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        {language === 'gr' ? "Απάντηση" : "Response time"}
                      </span>
                      <span className="text-sm font-semibold text-foreground">~15'</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Form - Right Side */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    {language === 'gr' ? "Ζητήστε Προσφορά" : "Request Your Quote"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-accent" />
                      {language === 'gr' ? "Σταθερή τιμή" : "Fixed price"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-accent" />
                      {language === 'gr' ? "Χωρίς δέσμευση" : "No commitment"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-accent" />
                      {language === 'gr' ? "Απάντηση σε 15'" : "Reply in 15'"}
                    </span>
                  </div>
                </div>
                <QuoteWidget variant="inline" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-muted/30">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-4">
              {language === 'gr' 
                ? "Ερωτήσεις; Απλά στείλτε μας μήνυμα στο WhatsApp."
                : "Questions? Just message us on WhatsApp."
              }
            </p>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              asChild
            >
              <a 
                href="https://wa.me/306944363525" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5" />
                {language === 'gr' ? "Ανοίξτε WhatsApp" : "Open WhatsApp"}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
