import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import FinalCTABlock from "@/components/FinalCTABlock";
import {
  Car,
  Users,
  Star,
  Clock,
  Shield,
  MapPin,
  Heart,
  Award,
  ArrowRight,
  MessageCircle
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Clock,
      title: "Reliability",
      description: "We track every flight and are always on time. No exceptions.",
    },
    {
      icon: Shield,
      title: "Transparency",
      description: "Fixed prices with no hidden fees. What you see is what you pay.",
    },
    {
      icon: Heart,
      title: "Care",
      description: "Your comfort and safety are our top priorities on every trip.",
    },
    {
      icon: MapPin,
      title: "Local Expertise",
      description: "Born and raised in Crete. We know every road and hidden gem.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Happy Travelers" },
    { value: "5.0", label: "Google Rating" },
    { value: "24/7", label: "Available" },
    { value: "15+", label: "Premium Vehicles" },
  ];

  return (
    <Layout>
      <SEOHead
        title="About LIV Tours | Premium Crete Transfers"
        description="Family-owned transfer service in Crete since 2015. Meet the team behind your stress-free airport transfers and private tours."
        canonicalUrl="https://livtours.gr/about"
      />

      <PageHero
        label="About Us"
        title="Your Trusted Partners"
        titleAccent="in Crete"
        subtitle="Family-owned and operated since 2015. We started with one car and a simple mission: make airport transfers stress-free for travelers visiting our beautiful island."
        icon={Users}
        compact
      />

      {/* Stats */}
      <section className="py-12 bg-cream-warm">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <div className="glass-card p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                LIV Tours was born from a simple frustration: why was getting from the airport 
                to your hotel so stressful? Overpriced taxis, language barriers, uncertainty 
                about prices—it did not have to be this way.
              </p>
              <p>
                In 2015, we started with a single Mercedes sedan and a commitment to transparency. 
                Fixed prices, flight tracking, and drivers who actually wait for you. Word spread 
                quickly among travelers, and today we operate a fleet of premium vehicles serving 
                thousands of guests each year.
              </p>
              <p>
                We are still family-owned and hands-on. Every booking matters to us. Every guest 
                experience shapes how we improve. That is why our 5-star rating is not just a 
                number—it is a reflection of genuine care for every person who trusts us with 
                their journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-cream-warm">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">What We Stand For</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="glass-card p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-olive/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-olive" />
                </div>
                <h3 className="font-semibold text-primary mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTABlock 
        title="Ready to Experience the Difference?"
        subtitle="Book your transfer today and see why thousands of travelers trust LIV Tours."
        badge="Join our community"
        primaryButtonText="Get Your Quote"
        whatsappMessage="Hi! I read your 'About' page and I'd like to ask a question."
      />
    </Layout>
  );
};

export default About;
