import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Shield, Mail, Clock, Users, Lock, FileText } from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      icon: FileText,
      title: "What Data We Collect",
      content: [
        "Contact information (name, email, phone number)",
        "Booking details (pickup/dropoff locations, dates, times, passenger count)",
        "Flight information for airport transfers",
        "Payment information (processed securely via payment providers)",
        "Device and browser information for website optimization",
        "Communication history for customer support purposes",
      ],
    },
    {
      icon: Shield,
      title: "Why We Collect It",
      content: [
        "To process and fulfill your transfer or tour bookings",
        "To communicate booking confirmations and updates",
        "To provide customer support and respond to inquiries",
        "To improve our services and website experience",
        "To comply with legal and regulatory requirements",
        "To send relevant offers (only with your consent)",
      ],
    },
    {
      icon: Clock,
      title: "Data Retention",
      content: [
        "Booking records: 7 years for tax and legal compliance",
        "Communication logs: 3 years for customer support reference",
        "Marketing preferences: Until you withdraw consent",
        "Website analytics: 26 months (anonymized)",
        "Payment data: Handled by PCI-compliant payment processors",
      ],
    },
    {
      icon: Users,
      title: "Data Sharing",
      content: [
        "We never sell your personal data to third parties",
        "Drivers receive only necessary booking details for your transfer",
        "Payment processors handle transactions securely",
        "Analytics tools receive anonymized usage data",
        "Legal authorities only when required by law",
      ],
    },
    {
      icon: Lock,
      title: "Your Rights",
      content: [
        "Access: Request a copy of your personal data",
        "Correction: Update or correct inaccurate information",
        "Deletion: Request removal of your data (where legally permitted)",
        "Portability: Receive your data in a portable format",
        "Objection: Opt out of marketing communications anytime",
        "Withdraw consent: Change your preferences at any time",
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Privacy Policy | LIV Tours - Data Protection"
        description="Learn how LIV Tours collects, uses, and protects your personal data. Your privacy matters to us."
        canonicalUrl="https://livtours.gr/legal/privacy"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Legal
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information.
            </p>
            <p className="text-sm text-primary-foreground/60 mt-4">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.title} className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-olive/10">
                    <section.icon className="w-5 h-5 text-olive" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div className="glass-card p-6 md:p-8 bg-olive/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-olive/10">
                  <Mail className="w-5 h-5 text-olive" />
                </div>
                <h2 className="text-xl font-semibold text-primary">Contact Us</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                For any privacy-related questions or to exercise your rights, contact us:
              </p>
              <div className="space-y-2 text-foreground">
                <p><strong>Email:</strong> privacy@livtours.gr</p>
                <p><strong>Phone:</strong> +30 694 436 3525</p>
                <p><strong>Address:</strong> Heraklion, Crete, Greece</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
