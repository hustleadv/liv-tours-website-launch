import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Euro, Car, Check, X } from "lucide-react";

const Pricing = () => {
  const included = [
    "Meet and greet service at airport",
    "Flight monitoring and delay adjustments",
    "Door-to-door service",
    "Professional, licensed driver",
    "Air-conditioned vehicle",
    "Bottled water",
    "Child seats (on request)",
    "60 minutes airport waiting time",
    "15 minutes address waiting time",
    "VAT / all taxes",
    "Fuel and tolls",
  ];

  const notIncluded = [
    "Entry fees to attractions (tours)",
    "Meals and personal expenses",
    "Tips (appreciated but not expected)",
    "Additional stops beyond included allowance",
  ];

  return (
    <Layout>
      <SEOHead
        title="Transparent Pricing | LIV Tours"
        description="No hidden fees, no surge pricing. Our prices are per vehicle and include everything you need."
        canonicalUrl="https://livtours.gr/policies/pricing"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Our Policies
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Transparent Pricing
            </h1>
            <p className="text-lg text-primary-foreground/80">
              The price you see is the price you pay. No surprises, no hidden fees, no meters.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Model */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <div className="glass-card p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-olive/10">
                <Car className="w-5 h-5 text-olive" />
              </div>
              <h2 className="text-xl font-semibold text-primary">Price Per Vehicle</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              All our prices are quoted per vehicle, not per person. This means whether you are 
              traveling solo or with a group, the price remains the same for the vehicle you book.
            </p>
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-foreground">
                <strong>Example:</strong> A sedan transfer from Chania Airport to Chania City costs 
                €30 whether you have 1 passenger or 4 passengers.
              </p>
            </div>
          </div>

          {/* Included / Not Included */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-green-100">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-primary">Included in Price</h3>
              </div>
              <ul className="space-y-2">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-red-100">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-primary">Not Included</h3>
              </div>
              <ul className="space-y-2">
                {notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* No Surge Pricing */}
          <div className="mt-8 glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-olive/10">
                <Euro className="w-5 h-5 text-olive" />
              </div>
              <h2 className="text-xl font-semibold text-primary">No Surge Pricing</h2>
            </div>
            <p className="text-muted-foreground">
              Unlike ride-hailing apps, we never apply surge pricing. Whether it is a holiday, 
              peak season, late night, or early morning, your quoted price remains the same. 
              The price you accept when booking is guaranteed.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;
