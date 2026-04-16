import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { CreditCard, Wallet, Smartphone, Shield, Check } from "lucide-react";

const Payments = () => {
  const paymentMethods = [
    {
      icon: CreditCard,
      title: "Credit/Debit Card",
      description: "Visa, Mastercard, American Express accepted online and in-vehicle.",
    },
    {
      icon: Wallet,
      title: "Cash",
      description: "Pay your driver directly in Euros upon arrival or completion.",
    },
    {
      icon: Smartphone,
      title: "Online Payment",
      description: "Pay securely online when you receive your booking confirmation.",
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Payment Options | LIV Tours"
        description="Flexible payment options including card, cash, and online. Pay now or on arrival."
        canonicalUrl="https://livtours.gr/policies/payments"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Our Policies
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Payment Options
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Choose how you pay. We offer flexible options to suit your preference.
            </p>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {paymentMethods.map((method) => (
              <div key={method.title} className="glass-card p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-olive/10 flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-7 h-7 text-olive" />
                </div>
                <h3 className="font-semibold text-primary mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
            ))}
          </div>

          {/* When to Pay */}
          <div className="glass-card p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-primary mb-6">When to Pay</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Pay on Arrival</h4>
                  <p className="text-sm text-muted-foreground">
                    Pay your driver directly after the transfer. Cash or card accepted. 
                    No advance payment required. Your booking is still guaranteed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Pay Online in Advance</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete payment securely online after receiving your confirmation. 
                    Nothing to worry about on the day. Just arrive and go.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-olive/10">
                <Shield className="w-5 h-5 text-olive" />
              </div>
              <h2 className="text-xl font-semibold text-primary">Secure Payments</h2>
            </div>
            <ul className="space-y-2">
              {[
                "All online payments are processed securely via PCI-compliant systems",
                "We never store your full card details on our servers",
                "SSL encryption protects all data transmission",
                "Receipts sent automatically to your email",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Currency Note */}
          <div className="mt-6 p-4 rounded-xl bg-olive/5 border border-olive/20">
            <p className="text-sm text-foreground">
              <strong>Currency:</strong> All prices are in Euros (€). If paying by card in 
              another currency, your bank will apply their exchange rate.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Payments;
