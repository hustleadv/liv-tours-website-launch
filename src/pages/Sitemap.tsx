import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { routes } from "@/data/routes";
import { usePublishedTours } from "@/hooks/useTours";
import { Map, FileText, Car, Shield, ArrowRight, Compass } from "lucide-react";
const Sitemap = () => {
  const { data: tours = [] } = usePublishedTours();

  const mainPages = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Reviews", path: "/reviews" },
    { name: "Events & Weddings", path: "/events" },
  ];

  const servicePages = [
    { name: "Airport Transfers", path: "/transfers" },
    { name: "Private Tours", path: "/tours" },
    { name: "Browse Tours", path: "/tours/browse" },
    { name: "Tour Builder", path: "/tours/builder" },
    { name: "Tour Quiz", path: "/quiz" },
    { name: "Fleet", path: "/fleet" },
    { name: "Routes", path: "/routes" },
    { name: "Price List", path: "/pricelist" },
  ];

  const supportPages = [
    { name: "FAQ", path: "/faq" },
    { name: "Trip Hub", path: "/trip" },
  ];

  const legalPages = [
    { name: "Privacy Policy", path: "/legal/privacy" },
    { name: "Cookie Policy", path: "/legal/cookies" },
    { name: "Cookie Settings", path: "/legal/cookiesettings" },
    { name: "Terms and Conditions", path: "/legal/terms" },
    { name: "Booking Terms", path: "/legal/bookingterms" },
  ];

  const policyPages = [
    { name: "Free Cancellation", path: "/policies/cancellation" },
    { name: "Flight Delays", path: "/policies/flightdelays" },
    { name: "Pricing Transparency", path: "/policies/pricing" },
    { name: "Payments", path: "/policies/payments" },
  ];

  const routePages = routes.slice(0, 12).map((route) => ({
    name: `${route.from} to ${route.to}`,
    path: `/routes/${route.id}`,
  }));

  const tourPages = tours.map((tour) => ({
    name: tour.title,
    path: `/tours/${tour.slug}`,
  }));

  const sections = [
    { title: "Main Pages", icon: Map, pages: mainPages },
    { title: "Services", icon: Car, pages: servicePages },
    { title: "Private Tours", icon: Compass, pages: tourPages },
    { title: "Support", icon: FileText, pages: supportPages },
    { title: "Legal", icon: Shield, pages: legalPages },
    { title: "Policies", icon: Shield, pages: policyPages },
    { title: "Transfer Routes", icon: ArrowRight, pages: routePages },
  ];

  return (
    <Layout>
      <SEOHead
        title="Sitemap | LIV Tours"
        description="Complete sitemap of LIV Tours website. Find all pages including transfers, tours, routes, and policies."
        canonicalUrl="https://livtours.gr/sitemap"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Sitemap
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Find every page on our website organized by category.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section) => (
              <div key={section.title} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-olive/10">
                    <section.icon className="w-5 h-5 text-olive" />
                  </div>
                  <h2 className="text-lg font-semibold text-primary">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.pages.map((page) => (
                    <li key={page.path}>
                      <Link 
                        to={page.path}
                        className="text-muted-foreground hover:text-accent transition-colors text-sm flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-accent" />
                        {page.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Sitemap;
