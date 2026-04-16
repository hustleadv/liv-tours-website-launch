import { Link } from "react-router-dom";
import { Star, ArrowRight, Quote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ReviewCard from "@/components/ReviewCard";
import FinalCTABlock from "@/components/FinalCTABlock";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import reviewsHero from "@/assets/hero-transfer.webp";

const Reviews = () => {
  const featuredReview = {
    name: "James & Emma Thompson",
    location: "London, UK",
    rating: 5,
    text: "Used LIV Tours for 10 days—airport transfers, Knossos tour, sunset drive to Elafonisi. Every single ride was on time. Alexis, our driver, recommended tavernas the tourists never find. By day three he felt like a friend. If you are visiting Crete, just book with them. Do not overthink it.",
    date: "December 2025",
  };

  const reviews = [
    {
      name: "Sarah M.",
      location: "Manchester, UK",
      rating: 5,
      text: "Driver waiting at arrivals, name sign in hand. Vehicle spotless. In the car within 5 minutes of landing. That is what I call a transfer.",
      date: "December 2025",
    },
    {
      name: "Thomas K.",
      location: "Munich, Germany",
      rating: 5,
      text: "Private tour to Spinalonga. Driver knew the best time to avoid crowds and where to eat after. Highlight of the trip.",
      date: "November 2025",
    },
    {
      name: "Maria S.",
      location: "Rome, Italy",
      rating: 5,
      text: "Family of 6, lots of bags, 2 car seats needed. V-Class handled it all. Fair price, zero stress.",
      date: "October 2025",
    },
    {
      name: "Pierre L.",
      location: "Paris, France",
      rating: 5,
      text: "Last-minute booking, 3 hours before landing. They confirmed within 20 minutes. Driver tracked our delay. No extra charge.",
      date: "October 2025",
    },
    {
      name: "Anna W.",
      location: "Amsterdam, Netherlands",
      rating: 5,
      text: "Samaria Gorge day trip. Long drive, but driver was patient and flexible with our stops. Exactly what we needed.",
      date: "September 2025",
    },
    {
      name: "David R.",
      location: "New York, USA",
      rating: 5,
      text: "Used them 4 times during our stay. Same experience every time: clean car, professional driver, fair price. No surprises.",
      date: "September 2025",
    },
    {
      name: "Helena P.",
      location: "Stockholm, Sweden",
      rating: 5,
      text: "WhatsApp replies within minutes. Changed pickup time twice—no problem. Communication made everything easy.",
      date: "August 2025",
    },
    {
      name: "Sophie T.",
      location: "London, UK",
      rating: 5,
      text: "Elite service from start to finish. The Mercedes Sprinter was luxurious and perfectly prepared for our wedding group. Professional, on-time, and very polite.",
      date: "September 2025",
    },
    {
      name: "Elena G.",
      location: "Zürich, Switzerland",
      rating: 5,
      text: "Booking via WhatsApp was effortless. Our driver was waiting at Chania Airport with a clear sign. The Mercedes was spotless and the drive to Elounda was incredibly smooth.",
      date: "August 2025",
    },
    {
      name: "Robert McAllen",
      location: "Edinburgh, Scotland",
      rating: 5,
      text: "Group of 14 for a corporate event. Two minivans arrived exactly as scheduled. Immaculate vehicles and real local expertise from the drivers. Best in Chania.",
      date: "August 2025",
    },
    {
      name: "Nikolai V.",
      location: "Berlin, Germany",
      rating: 5,
      text: "Reliable, professional, and transparent pricing. No hidden fees or surprises. This is how airport transfers should always be. Highly recommended.",
      date: "July 2025",
    },
    {
      name: "Clara & Ben",
      location: "Oslo, Norway",
      rating: 5,
      text: "Private day tour to Balos. Our driver provided cold water, local snacks, and even showed us some hidden viewpoints for photos. Exceptional value and service.",
      date: "July 2025",
    },
  ];

  const stats = [
    { value: "5.0", label: "Google rating" },
    { value: "500+", label: "5-star reviews" },
    { value: "98%", label: "Would recommend" },
  ];

  // Convert reviews to schema format
  const reviewsSchemaData = [
    featuredReview,
    ...reviews.slice(0, 5)
  ].map(review => ({
    name: review.name,
    rating: review.rating,
    text: review.text,
    date: review.date,
  }));

  const breadcrumbs = [
    { name: "Home", url: "https://livtours.gr/" },
    { name: "Reviews", url: "https://livtours.gr/reviews" },
  ];

  return (
    <Layout>
      <SEOHead
        title="Κριτικές & Αξιολογήσεις | 5★ Google Reviews - LIV Tours Χανιά"
        description="Διαβάστε πραγματικές κριτικές από ταξιδιώτες. 5 αστέρια στο Google, 500+ κριτικές. Αξιόπιστες μεταφορές στα Χανιά και την Κρήτη."
        keywords="LIV Tours reviews, κριτικές ταξί Χανιά, Chania transfer reviews, Crete taxi reviews"
        canonicalUrl="https://livtours.gr/reviews"
        reviewsData={reviewsSchemaData}
        breadcrumbs={breadcrumbs}
      />
      <PageHero
        label="Verified Reviews"
        title="275+ Travelers."
        titleAccent="5 Stars on Google."
        subtitle="Real reviews from real people. No edits, no cherry-picking."
        image={reviewsHero}
        icon={Star}
        align="left"
        overlay="dark"
        serifAccent
      >
        <div className="flex flex-col lg:items-start items-center gap-6 mt-8">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 text-accent fill-accent" />
            ))}
          </div>
          
          <div className="flex flex-wrap items-center lg:justify-start justify-center gap-8 md:gap-12 pt-4 border-t border-white/10">
            {[
              { label: "Google Rating", value: "5.0" },
              { label: "5-Star Reviews", value: "275+" },
              { label: "Recommend Us", value: "98%" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col lg:items-start items-center">
                <span className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </PageHero>

      {/* Featured Review */}
      <section className="section-padding relative overflow-hidden mesh-gradient-1">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="section-subheading">Featured Story</div>
            <h2 className="section-heading text-balance mx-auto">The Platinum <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Experience</span></h2>
          </div>
          <div className="max-w-5xl mx-auto cursor-default">
            <div className="glass-card-hover border-accent/20 p-8 md:p-16 relative group shadow-xl">
              <Quote className="absolute top-8 left-8 w-20 h-20 text-accent/10 group-hover:text-accent/20 transition-colors duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-6 h-6 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-2xl md:text-3xl lg:text-4xl text-primary font-medium leading-[1.4] mb-12 text-balance">
                  "{featuredReview.text}"
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-navy-deep text-white flex items-center justify-center shadow-accent border-2 border-accent/20">
                    <span className="text-xl font-bold tracking-widest">JT</span>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-primary">{featuredReview.name}</p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{featuredReview.location} • {featuredReview.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Reviews */}
      <section className="section-padding bg-cream-warm/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-16 px-4">
            <div className="section-subheading">Recent Experiences</div>
            <h2 className="section-heading text-balance mx-auto">
              More From Our <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Guests</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>
        </div>
      </section>

      {/* Leave Review CTA - Redesigned for Quiet Luxury */}
      <section className="section-padding relative overflow-hidden bg-slate-50/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto glass-card border-accent/10 p-10 md:p-20 text-center shadow-2xl rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Quote className="w-24 h-24 text-accent rotate-180" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-8 border border-accent/20">
              <Check className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">Takes just 2 minutes</span>
            </div>

            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-8 tracking-tight leading-none">
              Traveled With <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Us?</span>
            </h3>
            
            <p className="text-lg md:text-2xl text-muted-foreground mb-12 text-balance leading-relaxed">
              Your feedback is the compass that guides us. It helps other travelers make the right choice and helps us maintain our premium standards.
            </p>

            <a
              href="https://www.google.com/search?sca_esv=85e55d5c4d5d0135&sxsrf=ANbL-n7fhJ7uUPJzcWXl1bnqCvbTgaY2dA:1774804546432&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOSHldpZf164XnzJ2Dh6mjM3KdbqNSfGNzOfedRRJtmJIe7MOqmP9qwIA8jWyHzpi5fhIJNtbubi5nIupddRywBiAFgrRD6xZdUUlIuuhnDf92Nb6nTCQN12abGOphc-t6xFJ0jo%3D&q=Liv+-Tours+%26+Transfer+Chania+%CE%9A%CF%81%CE%B9%CF%84%CE%B9%CE%BA%CE%AD%CF%82&sa=X&ved=2ahUKEwjIqKSUzsWTAxW_cfEDHSP0BdEQ0bkNegQILBAH&biw=2752&bih=1017&dpr=1.25"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto"
            >
              <Button variant="hero" size="xl" className="shadow-2xl shadow-accent/20 group rounded-full px-12 h-16 md:h-20 text-xl font-black min-w-[320px]">
                <span className="group-hover:scale-105 transition-transform">Leave a Review on Google</span>
                <Star className="w-5 h-5 ml-3 text-accent-foreground fill-accent-foreground group-hover:rotate-45 transition-transform" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <FinalCTABlock 
        title="Join 10,000+ Happy Travelers"
        subtitle="Fixed prices. Flight tracking. Door-to-door comfort."
        badge="Community"
      />
    </Layout>
  );
};

export default Reviews;
