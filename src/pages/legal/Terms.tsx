import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { FileText, AlertCircle, Scale, Globe, Edit, Shield } from "lucide-react";

const Terms = () => {
  const sections = [
    {
      icon: Globe,
      title: "Website Use",
      content: `By accessing and using the LIV Tours website, you agree to these terms and conditions. 
      The website is intended for users aged 18 and over. You may use this website for lawful purposes 
      only and must not use it in any way that breaches any applicable local, national, or international 
      law or regulation.`,
    },
    {
      icon: FileText,
      title: "Content Accuracy",
      content: `We strive to ensure all information on this website is accurate and up to date. However, 
      we do not warrant the completeness or accuracy of the content. Prices, availability, and service 
      details are subject to change without notice. Final booking confirmations will contain the 
      accurate details of your service.`,
    },
    {
      icon: Shield,
      title: "Intellectual Property",
      content: `All content on this website, including text, images, logos, and design elements, is the 
      property of LIV Tours or its licensors and is protected by copyright laws. You may not reproduce, 
      distribute, or use any content without our prior written permission.`,
    },
    {
      icon: AlertCircle,
      title: "Limitation of Liability",
      content: `LIV Tours shall not be liable for any indirect, incidental, special, consequential, or 
      punitive damages arising from your use of this website. Our total liability for any claims 
      arising from use of the website or our services shall not exceed the amount paid for the 
      specific service in question.`,
    },
    {
      icon: Scale,
      title: "Governing Law",
      content: `These terms are governed by and construed in accordance with the laws of Greece. 
      Any disputes arising from these terms or your use of the website shall be subject to the 
      exclusive jurisdiction of the courts of Crete, Greece.`,
    },
    {
      icon: Edit,
      title: "Changes to Terms",
      content: `We reserve the right to modify these terms at any time. Changes will be effective 
      immediately upon posting to the website. Your continued use of the website after changes 
      are posted constitutes your acceptance of the modified terms. We recommend reviewing these 
      terms periodically.`,
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Terms and Conditions | LIV Tours"
        description="Read the terms and conditions for using the LIV Tours website and services."
        canonicalUrl="https://livtours.gr/legal/terms"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Legal
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Terms and Conditions
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Please read these terms carefully before using our website and services.
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
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={section.title} className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="p-2 rounded-xl bg-olive/10">
                    <section.icon className="w-5 h-5 text-olive" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 text-center p-6 rounded-2xl bg-olive/5 border border-olive/20">
            <p className="text-muted-foreground">
              Questions about these terms? Contact us at{" "}
              <a href="mailto:legal@livtours.gr" className="text-accent font-medium hover:underline">
                legal@livtours.gr
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;
