import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

interface RouteSchemaData {
  from: string;
  to: string;
  price: string;
  duration: string;
  description: string;
  routeUrl: string;
}

interface ReviewSchemaData {
  name: string;
  rating: number;
  text: string;
  date: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
  faqItems?: FAQItem[];
  includeLocalBusiness?: boolean;
  noindex?: boolean;
  routeData?: RouteSchemaData;
  reviewsData?: ReviewSchemaData[];
  includeAggregateRating?: boolean;
  breadcrumbs?: { name: string; url: string }[];
  serviceData?: ServiceSchemaData;
}

interface ServiceSchemaData {
  name: string;
  description: string;
  serviceType: string;
  areaServed: string;
  url: string;
  priceRange?: string;
  offers?: { name: string; description: string; price?: string }[];
}

// LocalBusiness structured data for LIV Tours
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://livtours.gr/#organization",
  "name": "LIV Tours & Transfers",
  "alternateName": "LIV Tours Crete Transfers",
  "description": "Premium airport transfers and private tours in Crete. Fixed prices, flight monitoring, Mercedes fleet.",
  "url": "https://livtours.gr",
  "telephone": "+306944363525",
  "email": "info@liv-tours.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Chania",
    "addressRegion": "Crete",
    "addressCountry": "GR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "35.5138",
    "longitude": "24.0180"
  },
  "areaServed": [
    {
      "@type": "State",
      "name": "Crete"
    }
  ],
  "priceRange": "€€",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "280",
    "bestRating": "5",
    "worstRating": "1"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "sameAs": [
    "https://www.facebook.com/livtours",
    "https://www.instagram.com/livtours"
  ]
};

// Generate FAQ structured data from FAQ items
const generateFAQSchema = (faqItems: FAQItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
});

// Generate TaxiService schema for routes
const generateRouteSchema = (routeData: RouteSchemaData) => ({
  "@context": "https://schema.org",
  "@type": "TaxiService",
  "name": `Transfer from ${routeData.from} to ${routeData.to}`,
  "description": routeData.description,
  "url": routeData.routeUrl,
  "provider": {
    "@type": "LocalBusiness",
    "@id": "https://livtours.gr/#organization",
    "name": "LIV Tours & Transfers"
  },
  "areaServed": {
    "@type": "State",
    "name": "Crete"
  },
  "serviceType": "Airport Transfer",
  "offers": {
    "@type": "Offer",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "price": routeData.price.replace("€", ""),
      "priceCurrency": "EUR"
    },
    "availability": "https://schema.org/InStock"
  },
  "tripOrigin": {
    "@type": "Place",
    "name": routeData.from
  },
  "tripDestination": {
    "@type": "Place",
    "name": routeData.to
  },
  "estimatedTravelTime": routeData.duration
});

// Generate Review schema
const generateReviewsSchema = (reviews: ReviewSchemaData[]) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://livtours.gr/#organization",
  "name": "LIV Tours & Transfers",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "280",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": reviews.map(review => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.name
    },
    "datePublished": review.date,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": review.text
  }))
});

// Generate Breadcrumb schema
const generateBreadcrumbSchema = (breadcrumbs: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Generate Service schema
const generateServiceSchema = (serviceData: ServiceSchemaData) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": serviceData.name,
  "description": serviceData.description,
  "serviceType": serviceData.serviceType,
  "url": serviceData.url,
  "provider": {
    "@type": "LocalBusiness",
    "@id": "https://livtours.gr/#organization",
    "name": "LIV Tours & Transfers"
  },
  "areaServed": {
    "@type": "State",
    "name": serviceData.areaServed
  },
  ...(serviceData.priceRange && { "priceRange": serviceData.priceRange }),
  ...(serviceData.offers && serviceData.offers.length > 0 && {
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": serviceData.name,
      "itemListElement": serviceData.offers.map(offer => ({
        "@type": "Offer",
        "name": offer.name,
        "description": offer.description,
        ...(offer.price && {
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": offer.price.replace("€", ""),
            "priceCurrency": "EUR"
          }
        })
      }))
    }
  })
});

// Generate standalone AggregateRating schema
const generateAggregateRatingSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "LIV Tours & Transfers",
  "@id": "https://livtours.gr/#organization",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "280",
    "bestRating": "5",
    "worstRating": "1"
  }
});

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://livtours.gr/og-image.jpg',
  ogType = 'website',
  structuredData,
  faqItems,
  includeLocalBusiness = false,
  noindex = false,
  routeData,
  reviewsData,
  includeAggregateRating = false,
  breadcrumbs,
  serviceData,
}: SEOHeadProps) => {
  const fullTitle = title.includes('LIV Tours') ? title : `${title} | LIV Tours & Transfers`;
  
  // Combine all structured data into an array for multiple schemas
  const allStructuredData: object[] = [];
  
  if (structuredData) {
    allStructuredData.push(structuredData);
  }
  
  if (faqItems && faqItems.length > 0) {
    allStructuredData.push(generateFAQSchema(faqItems));
  }
  
  if (includeLocalBusiness) {
    allStructuredData.push(localBusinessSchema);
  }
  
  if (routeData) {
    allStructuredData.push(generateRouteSchema(routeData));
  }
  
  if (reviewsData && reviewsData.length > 0) {
    allStructuredData.push(generateReviewsSchema(reviewsData));
  }
  
  if (includeAggregateRating && !reviewsData) {
    allStructuredData.push(generateAggregateRatingSchema());
  }
  
  if (breadcrumbs && breadcrumbs.length > 0) {
    allStructuredData.push(generateBreadcrumbSchema(breadcrumbs));
  }
  
  if (serviceData) {
    allStructuredData.push(generateServiceSchema(serviceData));
  }
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="LIV Tours & Transfers" />
      <meta property="og:locale" content="el_GR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data - Output each schema separately */}
      {allStructuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
