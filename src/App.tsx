import React, { lazy, Suspense, ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTopOnNavigate from "@/components/ScrollToTopOnNavigate";
import Analytics from "@/components/Analytics";

// Critical pages - load immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better initial load
const Transfers = lazy(() => import("./pages/Transfers"));
const Tours = lazy(() => import("./pages/Tours"));
const ToursBrowse = lazy(() => import("./pages/ToursBrowse")) as React.ComponentType<{ tourType?: 'private' | 'shared' }>;
const PrivateTours = ToursBrowse;
const SharedTours = lazy(() => import("./pages/SharedTours"));
const TourDetail = lazy(() => import("./pages/TourDetail"));
const TourQuiz = lazy(() => import("./pages/TourQuiz"));
const TourBuilder = lazy(() => import("./pages/TourBuilder"));
const Fleet = lazy(() => import("./pages/Fleet"));
const RoutesPage = lazy(() => import("./pages/Routes"));
const RouteDetail = lazy(() => import("./pages/RouteDetail"));
const Reviews = lazy(() => import("./pages/Reviews"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const BookingConfirmed = lazy(() => import("./pages/BookingConfirmed"));
const TourConfirmed = lazy(() => import("./pages/TourConfirmed"));
const TourConfirmPrice = lazy(() => import("./pages/TourConfirmPrice"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const TripHub = lazy(() => import("./pages/TripHub"));
const Pricelist = lazy(() => import("./pages/Pricelist"));
const Events = lazy(() => import("./pages/Events"));
const About = lazy(() => import("./pages/About"));
const Sitemap = lazy(() => import("./pages/Sitemap"));

// Legal pages
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Cookies = lazy(() => import("./pages/legal/Cookies"));
const CookieSettings = lazy(() => import("./pages/legal/CookieSettings"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const BookingTerms = lazy(() => import("./pages/legal/BookingTerms"));

// Policy pages
const Cancellation = lazy(() => import("./pages/policies/Cancellation"));
const FlightDelays = lazy(() => import("./pages/policies/FlightDelays"));
const Pricing = lazy(() => import("./pages/policies/Pricing"));
const Payments = lazy(() => import("./pages/policies/Payments"));

// Admin pages - lazy load
const AdminAuth = lazy(() => import("./pages/admin/Auth"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const PastePrices = lazy(() => import("./pages/admin/PastePrices"));
const ToursAdmin = lazy(() => import("./pages/admin/ToursAdmin"));
const TourEdit = lazy(() => import("./pages/admin/TourEdit"));
const ToursImport = lazy(() => import("./pages/admin/ToursImport"));
const DriversAdmin = lazy(() => import("./pages/admin/DriversAdmin"));
const ResetPassword = lazy(() => import("./pages/admin/ResetPassword"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

// Optimized QueryClient with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Analytics />
              <ScrollToTopOnNavigate />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/transfers" element={<Transfers />} />
                  <Route path="/tours" element={<Tours />} />
                  <Route path="/tours/browse" element={<ToursBrowse />} />
                  <Route path="/tours/private" element={<PrivateTours tourType="private" />} />
                  <Route path="/tours/shared" element={<SharedTours />} />
                  <Route path="/tours/builder" element={<TourBuilder />} />
                  <Route path="/tours/:slug" element={<TourDetail />} />
                  <Route path="/quiz" element={<TourQuiz />} />
                  <Route path="/fleet" element={<Fleet />} />
                  <Route path="/routes" element={<RoutesPage />} />
                  <Route path="/routes/:routeId" element={<RouteDetail />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/booking/confirmed" element={<BookingConfirmed />} />
                  <Route path="/tour/confirmed" element={<TourConfirmed />} />
                  <Route path="/tour/confirm-price" element={<TourConfirmPrice />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/trip" element={<TripHub />} />
                  <Route path="/pricelist" element={<Pricelist />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  {/* Legal pages */}
                  <Route path="/legal/privacy" element={<Privacy />} />
                  <Route path="/legal/cookies" element={<Cookies />} />
                  <Route path="/legal/cookiesettings" element={<CookieSettings />} />
                  <Route path="/legal/terms" element={<Terms />} />
                  <Route path="/legal/bookingterms" element={<BookingTerms />} />
                  {/* Policy pages */}
                  <Route path="/policies/cancellation" element={<Cancellation />} />
                  <Route path="/policies/flightdelays" element={<FlightDelays />} />
                  <Route path="/policies/pricing" element={<Pricing />} />
                  <Route path="/policies/payments" element={<Payments />} />
                  <Route path="/livy-hq/auth" element={<AdminAuth />} />
                  <Route path="/livy-hq/reset-password" element={<ResetPassword />} />
                  <Route path="/livy-hq" element={<AdminDashboard />} />
                  <Route path="/livy-hq/users" element={<AdminUsers />} />
                  <Route path="/livy-hq/paste-prices" element={<PastePrices />} />
                  <Route path="/livy-hq/tours" element={<ToursAdmin />} />
                  <Route path="/livy-hq/tours/new" element={<TourEdit />} />
                  <Route path="/livy-hq/tours/:id/edit" element={<TourEdit />} />
                  <Route path="/livy-hq/tours/import" element={<ToursImport />} />
                  <Route path="/livy-hq/drivers" element={<DriversAdmin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
