import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Users, 
  Briefcase, 
  Wifi, 
  Snowflake, 
  Shield, 
  Star, 
  Sparkles,
  Battery,
  Droplets,
  Baby,
  Check,
  MessageCircle,
  HelpCircle,
  Car,
  SprayCan,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import TrustBar from "@/components/TrustBar";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import VehicleComparisonTable from "@/components/VehicleComparisonTable";
import FinalCTABlock from "@/components/FinalCTABlock"; // Added FinalCTABlock import
import fleetSedan from "@/assets/fleet-sedan-new.webp";
import fleetSedanInterior from "@/assets/fleet-sedan-interior-real.webp";
import fleetSedanInterior2 from "@/assets/fleet-sedan-interior-2.webp";
import fleetMinivan from "@/assets/fleet-vclass-exterior.webp";
import fleetMinivanInterior from "@/assets/fleet-minivan-interior-real.webp";
import fleetMinivanInterior2 from "@/assets/fleet-minivan-interior-2.jpg";
import fleetMinivanInterior3 from "@/assets/fleet-minivan-interior-3.webp";
import fleetMinibus from "@/assets/minibusmaxi4.jpg";
import fleetHero from "@/assets/fleet-hero.webp";
import { FleetGallery } from "@/components/FleetLightbox";

const Fleet = () => {

  const vehicles = [
    {
      name: "Mercedes E-Class",
      category: "Executive Sedan",
      passengers: 4,
      luggage: "Flexible",
      images: [
        { src: fleetSedan, alt: "Mercedes E-Class Exterior", label: "Exterior" },
        { src: fleetSedanInterior, alt: "Mercedes E-Class Interior", label: "Interior" },
        { src: fleetSedanInterior2, alt: "Mercedes E-Class Seats", label: "Seats" },
      ],
      features: [
        { icon: Wifi, label: "Free WiFi" },
        { icon: Snowflake, label: "Climate Control" },
        { icon: Battery, label: "USB Charging" },
        { icon: Droplets, label: "Bottled Water" },
      ],
      bestFor: ["Couples", "Business travelers", "Airport transfers"],
      description: "Elegant comfort for smaller groups. Leather interior, smooth ride, and executive-class amenities.",
    },
    {
      name: "Mercedes Sprinter",
      category: "Premium Minivan",
      passengers: 11,
      luggage: "Flexible",
      images: [
        { src: fleetMinivan, alt: "Mercedes Sprinter Exterior", label: "Exterior" },
        { src: fleetMinivanInterior, alt: "Mercedes Sprinter Interior", label: "Interior" },
        { src: fleetMinivanInterior3, alt: "Mercedes Sprinter Cabin", label: "Cabin" },
      ],
      features: [
        { icon: Wifi, label: "Free WiFi" },
        { icon: Snowflake, label: "Climate Control" },
        { icon: Battery, label: "USB Charging" },
        { icon: Droplets, label: "Bottled Water" },
      ],
      bestFor: ["Families", "Small groups", "Day tours", "Extra luggage"],
      description: "Spacious cabin with flexible seating. Perfect for families or groups who want room to relax.",
    },
    {
      name: "Mercedes Sprinter Maxi",
      category: "Luxury Minibus",
      passengers: 20,
      luggage: "Flexible",
      images: [
        { 
          src: fleetMinibus, 
          alt: "Mercedes Sprinter Maxi Exterior", 
          label: "Exterior", 
          className: "scale-[1.15] object-[center_70%]" 
        },
      ],
      features: [
        { icon: Wifi, label: "Free WiFi" },
        { icon: Snowflake, label: "Climate Control" },
        { icon: Battery, label: "USB Charging" },
        { icon: Droplets, label: "Bottled Water" },
      ],
      bestFor: ["Large groups", "Events", "Corporate transfers", "Extended tours"],
      description: "High-ceiling luxury for groups of any size. Reclining seats, panoramic windows, and ample luggage space.",
    },
  ];

  const standards = [
    {
      icon: Shield,
      title: "Fully Licensed & Insured",
      description: "All vehicles carry comprehensive passenger insurance. Every driver is fully licensed for your safety.",
    },
    {
      icon: SprayCan,
      title: "Deep Cleaned Daily",
      description: "Thorough sanitization after every trip. Fresh interiors, spotless condition, every single time.",
    },
    {
      icon: Wrench,
      title: "Regularly Serviced",
      description: "Strict maintenance schedules ensure mechanical reliability. No breakdowns, no surprises.",
    },
  ];

  const vehicleHelper = [
    {
      scenario: "1-4 passengers",
      recommendation: "Mercedes E-Class",
      note: "Comfortable for couples or small groups. Luggage is always flexible.",
    },
    {
      scenario: "5-11 passengers",
      recommendation: "Mercedes Sprinter",
      note: "Ideal for families or groups. Child seats and extra luggage no problem.",
    },
    {
      scenario: "12-20 passengers",
      recommendation: "Mercedes Sprinter Maxi",
      note: "Best for large groups or events. Maximum space and comfort.",
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Στόλος Οχημάτων Mercedes | Ταξί & Minibus Χανιά - LIV Tours"
        description="Πολυτελής στόλος Mercedes E-Class, Sprinter & Sprinter Maxi για μεταφορές στα Χανιά. 1-20 επιβάτες, WiFi, κλιματισμός, παιδικά καθίσματα κατόπιν αιτήματος."
        keywords="Mercedes taxi Chania, VIP transfer Crete, minibus Chania, Sprinter Maxi, στόλος οχημάτων Κρήτη, luxury transfer Chania"
        canonicalUrl="https://livtours.gr/fleet"
      />
      <PageHero
        label="Our Fleet"
        title="Our Elite"
        titleAccent="Mercedes-Benz Fleet"
        subtitle="Every vehicle is maintained to the highest standards. Clean interiors, modern amenities, and the reliability you deserve."
        image={fleetHero}
        icon={Car}
        overlay="dark"
        serifAccent
      >
        <div className="flex flex-col items-center gap-8 mt-6">
          {/* Trust Badge - Homepage Style */}
          <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-accent fill-accent" />
              ))}
            </div>
            <div className="w-px h-5 bg-white/20" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">5.0 on Google Chania</span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-white/80 text-[10px] md:text-sm font-bold uppercase tracking-widest">
            {["Licensed & Insured", "Deep Cleaned Daily", "Professional Drivers"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </PageHero>

      <div className="bg-background">
        <TrustBar />
      </div>

      {/* Vehicle Cards */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-16 px-4">
            <div className="section-subheading">Choose Your Ride</div>
            <h2 className="section-heading text-balance mx-auto">
              Vehicles for Every <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Group Size</span>
            </h2>
          </div>

          <div className="space-y-12">
            {vehicles.map((vehicle, index) => (
              <div 
                key={vehicle.name} 
                className={`glass-card overflow-hidden hover-lift ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="grid lg:grid-cols-2">
                  {/* Image Gallery */}
                  <div className={`relative overflow-hidden ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <FleetGallery
                      images={vehicle.images}
                      vehicleName={vehicle.name}
                    />
                    <div className="absolute top-4 left-4 pointer-events-none z-10">
                      <span className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-full">
                        {vehicle.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-8 lg:p-10 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <h3 className="text-2xl lg:text-3xl font-black text-primary mb-3">
                      {vehicle.name}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {vehicle.description}
                    </p>

                    {/* Capacity */}
                    <div className="flex items-center gap-8 mb-6 pb-6 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-olive/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-olive" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-primary">{vehicle.passengers}</div>
                          <div className="text-xs text-muted-foreground">Passengers</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-olive/10 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-olive" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-primary">{vehicle.luggage}</div>
                          <div className="text-xs text-muted-foreground">Luggage</div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {vehicle.features.map((feature) => (
                        <div key={feature.label} className="flex items-center gap-2 text-sm text-foreground">
                          <feature.icon className="w-4 h-4 text-olive" />
                          <span>{feature.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Best For */}
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Best For
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.bestFor.map((use) => (
                          <span 
                            key={use} 
                            className="px-3 py-1 bg-primary/5 text-primary text-sm rounded-full"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link to="/contact">
                        <Button size="lg" className="w-full sm:w-auto">
                          Get Quote
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <a 
                        href={`https://wa.me/306944363525?text=Hi!%20I'm%20interested%20in%20the%20${encodeURIComponent(vehicle.name)}%20for%20a%20transfer.`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                          <MessageCircle className="w-4 h-4" />
                          Ask About This Vehicle
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standard Amenities */}
      <section className="section-padding bg-cream-warm">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-16 px-4">
            <div className="section-subheading">Every Vehicle Includes</div>
            <h2 className="section-heading text-balance mx-auto">
              Standard <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Amenities</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Snowflake, label: "Climate Control", desc: "Stay cool in summer" },
              { icon: Wifi, label: "Free WiFi", desc: "Stay connected" },
              { icon: Battery, label: "USB Charging", desc: "Keep devices powered" },
              { icon: Droplets, label: "Bottled Water", desc: "Complimentary refreshment" },
              { icon: Sparkles, label: "Clean Interiors", desc: "Sanitized daily" },
              { icon: Shield, label: "Full Insurance", desc: "Peace of mind" },
              { icon: Baby, label: "Child Seats", desc: "Available on request" },
              { icon: Star, label: "Premium Comfort", desc: "Leather interiors" },
            ].map((amenity) => (
              <div key={amenity.label} className="glass-card p-5 text-center hover-lift">
                <div className="w-12 h-12 mx-auto rounded-xl bg-olive/10 flex items-center justify-center mb-3">
                  <amenity.icon className="w-6 h-6 text-olive" />
                </div>
                <h3 className="font-semibold text-primary text-sm mb-1">{amenity.label}</h3>
                <p className="text-xs text-muted-foreground">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Comparison Table */}
      <section className="section-padding">
        <div className="container-wide">
          <VehicleComparisonTable />
        </div>
      </section>

      {/* Vehicle Helper Section Header */}
      <section className="section-padding bg-cream-warm">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-16 px-4">
            <div className="section-subheading">Vehicle Selection Guide</div>
            <h2 className="section-heading text-balance mx-auto">
              Which Vehicle Do I <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Need?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not sure which vehicle suits your group? Here's a quick guide to help you choose the best ride for your journey.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 lg:p-12 border-2 border-olive/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <HelpCircle className="w-24 h-24 text-olive" />
              </div>

              <div className="relative z-10 space-y-6">
                {vehicleHelper.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-muted/50 rounded-2xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-foreground">{item.scenario}</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">{item.note}</p>
                    </div>
                    <div className="ml-11 sm:ml-0">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium">
                        <ArrowRight className="w-4 h-4" />
                        {item.recommendation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Tip:</strong> When in doubt, go one size up. Extra space is always appreciated, 
                  especially on longer journeys or with children.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Special needs?</strong> We can accommodate wheelchairs, sports equipment, 
                  and oversized luggage. Just let us know when booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Standards */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-16 px-4">
            <div className="section-subheading">Your Safety First</div>
            <h2 className="section-heading text-balance mx-auto">
              Quality You Can <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Trust</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {standards.map((standard) => (
              <div key={standard.title} className="glass-card p-8 text-center hover-lift">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-olive/10 flex items-center justify-center mb-6">
                  <standard.icon className="w-8 h-8 text-olive" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-3">{standard.title}</h3>
                <p className="text-muted-foreground">{standard.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTABlock 
        title="Ready to Book Your Ride?"
        subtitle="Get an instant quote or chat with us to find the perfect vehicle for your trip."
        badge="Our Fleet"
        primaryButtonText="Get Instant Quote"
        whatsappMessage="Hi! I'm interested in booking a specific vehicle from your fleet."
      />
    </Layout>
  );
};

export default Fleet;
