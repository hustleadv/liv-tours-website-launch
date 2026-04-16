import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Plane, Clock, Shield, Phone, CheckCircle } from "lucide-react";

const FlightDelays = () => {
  const features = [
    {
      icon: Plane,
      title: "Automatic Flight Tracking",
      description: "We monitor all incoming flights in real-time. No need to inform us of delays.",
    },
    {
      icon: Clock,
      title: "Free Waiting Time",
      description: "60 minutes of free waiting from actual landing time, not scheduled time.",
    },
    {
      icon: Shield,
      title: "No Extra Charges",
      description: "Flight delays never result in additional fees. Your price is fixed.",
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Our team is available around the clock if you need to reach us.",
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Flight Delay Protection | LIV Tours"
        description="We track your flight and adjust pickup times automatically. No extra charges for delays."
        canonicalUrl="https://livtours.gr/policies/flightdelays"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Our Policies
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Flight Delay Protection
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Flight delayed? Do not worry. We track every flight and adjust automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-olive/10 flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-olive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-primary mb-6">How It Works</h2>
            <div className="space-y-4">
              {[
                "We receive your flight number when you book",
                "Our system monitors your flight status automatically",
                "If delayed, we adjust your driver's arrival time",
                "Your driver waits at arrivals when you actually land",
                "60 minutes free waiting from your landing time",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellations */}
          <div className="mt-8 glass-card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-primary mb-4">What About Cancelled Flights?</h2>
            <p className="text-muted-foreground mb-4">
              If your flight is cancelled entirely, contact us as soon as possible:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                We will reschedule your transfer to your new flight at no extra cost
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                Or we will provide a full refund if you prefer
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                No cancellation fees apply for airline-caused cancellations
              </li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FlightDelays;
