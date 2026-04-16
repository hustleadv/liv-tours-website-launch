import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { CalendarX, Clock, Check, AlertCircle } from "lucide-react";

const Cancellation = () => {
  const policies = [
    {
      timeframe: "More than 24 hours before",
      refund: "100%",
      description: "Full refund, no questions asked",
      icon: Check,
      color: "text-green-600 bg-green-100",
    },
    {
      timeframe: "12-24 hours before",
      refund: "50%",
      description: "Half refund due to short notice",
      icon: Clock,
      color: "text-amber-600 bg-amber-100",
    },
    {
      timeframe: "Less than 12 hours",
      refund: "0%",
      description: "No refund, driver already assigned",
      icon: AlertCircle,
      color: "text-red-600 bg-red-100",
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Free Cancellation Policy | LIV Tours"
        description="Cancel your transfer booking for free up to 24 hours before pickup. Learn about our flexible cancellation policy."
        canonicalUrl="https://livtours.gr/policies/cancellation"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Our Policies
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Free Cancellation
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Plans change, we understand. Cancel for free up to 24 hours before your pickup.
            </p>
          </div>
        </div>
      </section>

      {/* Policy Timeline */}
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <div className="space-y-6">
            {policies.map((policy, index) => (
              <div key={policy.timeframe} className="glass-card p-6 relative">
                {index < policies.length - 1 && (
                  <div className="absolute left-10 top-full w-0.5 h-6 bg-border" />
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${policy.color}`}>
                    <policy.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-primary">{policy.timeframe}</h3>
                      <span className="text-2xl font-bold text-primary">{policy.refund}</span>
                    </div>
                    <p className="text-muted-foreground">{policy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How to Cancel */}
          <div className="mt-12 glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-olive/10">
                <CalendarX className="w-5 h-5 text-olive" />
              </div>
              <h2 className="text-xl font-semibold text-primary">How to Cancel</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>WhatsApp:</strong> Send us your booking reference at +30 694 436 3525</p>
              <p><strong>Email:</strong> Send cancellation request to bookings@livtours.gr</p>
              <p><strong>Phone:</strong> Call us at +30 694 436 3525 (24/7)</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              You will receive a cancellation confirmation within 1 hour. Refunds are processed 
              within 5-7 business days to the original payment method.
            </p>
          </div>

          {/* No-Show Note */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> If you do not show up for your transfer without 
              cancelling, the full amount will be charged. Please contact us if you are 
              running late or have any issues reaching the pickup point.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cancellation;
