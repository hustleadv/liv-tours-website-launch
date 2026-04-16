import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Clock, MapPin, Users, Check, MessageCircle, Calendar, ArrowLeft, Loader2, 
  Navigation, Shield, CreditCard, Camera, ZoomIn, Mail, Phone, User, Send,
  Star, ChevronRight, Mountain, Footprints, Sun, Heart, Percent, Sparkles,
  Waves, Umbrella, Sunset, Home, Wine, UtensilsCrossed, Landmark, TreePine,
  ChevronDown, ChevronUp, Car, Droplets, Snowflake, Wifi, Fuel, ParkingCircle, Backpack
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/PhoneInput";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import TourDetailSkeleton from "@/components/TourDetailSkeleton";
import SEOHead from "@/components/SEOHead";
import WeatherChip from "@/components/WeatherChip";
import WeatherDetails from "@/components/WeatherDetails";
import PackingTips from "@/components/PackingTips";
import LocalTip from "@/components/LocalTip";
import { FunFactCard } from "@/components/FunFactCard";
import Lightbox from "@/components/Lightbox";
import RelatedTours from "@/components/RelatedTours";
import ShareButtons from "@/components/ShareButtons";
import ErrorBoundary from "@/components/ErrorBoundary";
import ItineraryStop from "@/components/ItineraryStop";
import { useTourBySlug } from "@/hooks/useTours";
import { useTourDescription } from "@/hooks/useTourDescription";
import { useTourFunFact } from "@/hooks/useTourFunFact";
import { trackEvent } from "@/lib/tracking";
import { saveBooking, BookingData } from "@/lib/booking";
import { format, addDays } from "date-fns";
import { TourImageMeta } from "@/lib/toursTypes";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchWeatherForecast, getForecastForDate, DailyForecast, isDateInForecastRange } from "@/lib/weather";
import { getTourRegionWeatherLocation } from "@/lib/weatherLocations";

// Animation variants for scroll reveal
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const TourDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { data: tour, isLoading, error } = useTourBySlug(slug || '');
  
  // AI-generated description
  const { description: aiDescription, isLoading: isDescriptionLoading, isAIGenerated } = useTourDescription(tour || null);
  
  // Get main destination for fun fact - extract from tour title first
  const getMainDestinationFromTitle = (title: string, stops: typeof tour.stops) => {
    // Extract main destination from title (before "and", "Tour", "&", etc.)
    const cleanTitle = title
      .replace(/\s+(Tour|Day Trip|Excursion|Experience|Adventure|Highlights|Day)$/i, '')
      .replace(/\s+and\s+.*/i, '')
      .replace(/\s+&\s+.*/i, '')
      .replace(/\s+-\s+.*/i, '')
      .trim();
    
    // Try to find a matching stop that contains the clean title
    const matchingStop = stops.find(stop => {
      const stopName = stop.name.toLowerCase();
      const titleLower = cleanTitle.toLowerCase();
      return titleLower.includes(stopName) || stopName.includes(titleLower);
    });
    
    if (matchingStop) return matchingStop;
    
    // If no stop matches, return a virtual stop with the cleaned title
    // This handles cases where stops have generic names like "Cove time"
    return { name: cleanTitle } as typeof stops[0];
  };
  
  const mainDestinationForFact = tour?.title
    ? getMainDestinationFromTitle(tour.title, tour.stops || [])
    : null;
  
  // Fun fact from Wikipedia + Lovable AI
  const { funFact, sourceUrl: funFactSourceUrl, isLoading: isFunFactLoading } = useTourFunFact(
    tour?.slug || null,
    mainDestinationForFact?.name || null,
    language === 'gr' ? 'el' : 'en'
  );
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Booking form state
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState<Date | undefined>();
  const [bookingTime, setBookingTime] = useState("");
  const [bookingGroupSize, setBookingGroupSize] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentOption, setShowPaymentOption] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [sidebarDatePickerOpen, setSidebarDatePickerOpen] = useState(false);
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  
  // Real-time validation state
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Validation helpers
  const validateEmail = (email: string): string | null => {
    if (!email) return language === 'gr' ? 'Το email είναι υποχρεωτικό' : 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return language === 'gr' ? 'Μη έγκυρη διεύθυνση email' : 'Invalid email address';
    return null;
  };
  
  const validateName = (name: string): string | null => {
    if (!name.trim()) return language === 'gr' ? 'Το όνομα είναι υποχρεωτικό' : 'Name is required';
    if (name.trim().length < 2) return language === 'gr' ? 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες' : 'Name must be at least 2 characters';
    return null;
  };
  
  const validatePhone = (phone: string): string | null => {
    if (!phone) return null; // Optional field
    const phoneRegex = /^[+]?[\d\s-]{8,}$/;
    if (!phoneRegex.test(phone)) return language === 'gr' ? 'Μη έγκυρος αριθμός τηλεφώνου' : 'Invalid phone number';
    return null;
  };
  
  // Handle field blur for validation
  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    let error: string | null = null;
    switch (field) {
      case 'name':
        error = validateName(bookingName);
        break;
      case 'email':
        error = validateEmail(bookingEmail);
        break;
      case 'phone':
        error = validatePhone(bookingPhone);
        break;
      case 'date':
        error = !bookingDate ? (language === 'gr' ? 'Επιλέξτε ημερομηνία' : 'Please select a date') : null;
        break;
      case 'time':
        error = !bookingTime ? (language === 'gr' ? 'Επιλέξτε ώρα' : 'Please select a time') : null;
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
  };
  
  // Real-time validation on change
  const handleNameChange = (value: string) => {
    setBookingName(value);
    if (touchedFields.name) {
      const error = validateName(value);
      setValidationErrors(prev => ({ ...prev, name: error || '' }));
    }
  };
  
  const handleEmailChange = (value: string) => {
    setBookingEmail(value);
    if (touchedFields.email) {
      const error = validateEmail(value);
      setValidationErrors(prev => ({ ...prev, email: error || '' }));
    }
  };
  
  const handlePhoneChange = (value: string) => {
    setBookingPhone(value);
    if (touchedFields.phone) {
      const error = validatePhone(value);
      setValidationErrors(prev => ({ ...prev, phone: error || '' }));
    }
  };
  
  // Check if field is valid (touched and no error)
  const isFieldValid = (field: string): boolean => {
    if (!touchedFields[field]) return false;
    return !validationErrors[field];
  };
  
  // Check if field has error
  const hasFieldError = (field: string): boolean => {
    return touchedFields[field] && !!validationErrors[field];
  };
  
  // Weather state
  const [selectedForecast, setSelectedForecast] = useState<DailyForecast | null>(null);
  const [weatherExpanded, setWeatherExpanded] = useState(true);
  const [itineraryRevealed, setItineraryRevealed] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(true);
  const [highlightsExpanded, setHighlightsExpanded] = useState(true);
  const [includesExpanded, setIncludesExpanded] = useState(true);

  // Generate time slots for tours (06:00-20:00, every 15 minutes)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let h = 6; h <= 20; h++) {
      for (const m of [0, 15, 30, 45]) {
        if (h === 20 && m > 0) break; // Stop at 20:00
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };
  const allTimeSlots = generateTimeSlots();

  // Pricing - 15% discount
  const estimatedPrice = tour?.price_from_eur || 150;
  const depositAmount = Math.ceil(estimatedPrice * 0.3);
  const discountedDeposit = Math.ceil(depositAmount * 0.85);
  const discountSaved = depositAmount - discountedDeposit;
  
  // Scroll to booking section if anchor is present
  useEffect(() => {
    if (location.hash === '#booking') {
      setTimeout(() => {
        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.hash, tour]);
  
  // Fetch weather when date is selected - use tour region for accurate Cretan weather
  useEffect(() => {
    const fetchWeather = async () => {
      if (!bookingDate || !tour?.region) return;
      
      const dateStr = format(bookingDate, 'yyyy-MM-dd');
      if (!isDateInForecastRange(dateStr)) {
        setSelectedForecast(null);
        return;
      }
      
      // Use tour region for accurate weather
      const regionLocation = getTourRegionWeatherLocation(tour.region);
      const weatherData = await fetchWeatherForecast(regionLocation);
      
      if (weatherData) {
        const forecast = getForecastForDate(weatherData, dateStr);
        setSelectedForecast(forecast);
      }
    };
    
    fetchWeather();
  }, [bookingDate, tour]);

  if (isLoading) {
    return (
      <Layout>
        <TourDetailSkeleton />
      </Layout>
    );
  }

  if (error || !tour) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Tour Not Found</h1>
          <p className="text-muted-foreground">The tour you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/tours/browse')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse All Tours
          </Button>
        </div>
      </Layout>
    );
  }

  // Track view
  trackEvent('tour_details_view', { tourId: tour.id, tourTitle: tour.title });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all required fields as touched
    setTouchedFields({ name: true, email: true, date: true, time: true });
    
    // Validate all fields
    const nameError = validateName(bookingName);
    const emailError = validateEmail(bookingEmail);
    const dateError = !bookingDate ? (language === 'gr' ? 'Επιλέξτε ημερομηνία' : 'Please select a date') : null;
    const timeError = !bookingTime ? (language === 'gr' ? 'Επιλέξτε ώρα' : 'Please select a time') : null;
    
    const errors: Record<string, string> = {};
    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (dateError) errors.date = dateError;
    if (timeError) errors.time = timeError;
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: language === 'gr' ? "Λείπουν στοιχεία" : "Missing information",
        description: language === 'gr' 
          ? "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία σωστά."
          : "Please fill in all required fields correctly.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    trackEvent('tour_booking_submit', { tourId: tour.id, tourTitle: tour.title });
    
    // Show payment option after validation
    setShowPaymentOption(true);
    setIsSubmitting(false);
  };

  const handlePayDeposit = async (applyDiscount: boolean) => {
    if (!bookingEmail || !bookingDate) {
      toast({
        title: "Missing information",
        description: "Please fill in your email and preferred date.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);
    trackEvent('tour_pay_online_click', { tourId: tour.id, applyDiscount });

    try {
      const { data, error } = await supabase.functions.invoke('create-tour-deposit', {
        body: {
          customerEmail: bookingEmail,
          customerName: bookingName,
          estimatedTotal: estimatedPrice,
          tourTitle: tour.title,
          tourVibe: tour.category,
          pickupArea: tour.pickup_options[0] || tour.region,
          date: format(bookingDate, 'yyyy-MM-dd'),
          preferredTime: bookingTime,
          groupSize: bookingGroupSize,
          duration: `${tour.duration_hours}h`,
          notes: bookingNotes,
          itineraryTitle: tour.title,
          addons: [],
          applyDiscount,
          language: language, // Pass current language for email
        },
      });

      if (error) throw error;

      if (data?.url) {
        toast({
          title: "Redirecting to payment...",
          description: `You'll pay €${applyDiscount ? discountedDeposit : depositAmount} securely via Stripe.`,
        });
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment error",
        description: error.message || "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePayOnArrival = async () => {
    if (!bookingEmail || !bookingDate || !bookingTime) {
      toast({
        title: "Missing information",
        description: "Please fill in your email, preferred date and time.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);
    trackEvent('tour_pay_on_arrival', { tourId: tour.id });

    try {
      // Generate a unique tour request ID
      const tourRequestId = `TOUR-${Date.now().toString(36).toUpperCase()}`;

      // Save tour request to database with cash payment type
      const { error } = await supabase
        .from("tour_requests")
        .insert({
          request_id: tourRequestId,
          customer_email: bookingEmail,
          customer_name: bookingName || null,
          customer_phone: bookingPhone || null,
          tour_vibe: tour.category || null,
          itinerary_title: tour.title,
          pickup_area: tour.pickup_options[0] || tour.region,
          duration: `${tour.duration_hours}h`,
          group_size: bookingGroupSize || null,
          preferred_date: format(bookingDate, 'yyyy-MM-dd'),
          preferred_time: bookingTime,
          notes: bookingNotes || null,
          addons: [],
          estimated_total: estimatedPrice,
          deposit_amount: 0,
          discount_applied: false,
          discount_amount: 0,
          payment_status: 'pending',
          payment_type: 'cash',
          status: 'pending',
        });

      if (error) throw error;

      // Send confirmation email via edge function
      try {
        await supabase.functions.invoke('send-tour-request-email', {
          body: {
            customerName: bookingName,
            customerEmail: bookingEmail,
            requestId: tourRequestId,
            tourTitle: tour.title,
            preferredDate: format(bookingDate, 'dd/MM/yyyy'),
            preferredTime: bookingTime,
            pickupArea: tour.pickup_options[0] || tour.region,
            groupSize: bookingGroupSize || '2',
            estimatedTotal: estimatedPrice,
            language: language,
          },
        });
        console.log("[TOUR] Confirmation email sent successfully");
      } catch (emailError) {
        console.error("[TOUR] Failed to send confirmation email:", emailError);
        // Don't fail the booking if email fails
      }

      // Save booking to localStorage for BookingConfirmed page
      const bookingData: BookingData = {
        bookingId: tourRequestId,
        pickup: tour.pickup_options[0] || tour.region,
        dropoff: tour.title,
        date: format(bookingDate, 'yyyy-MM-dd'),
        time: bookingTime,
        passengers: bookingGroupSize || '2',
        luggage: 'N/A',
        vehicleType: 'Private Tour',
        childSeat: 0, // Tours don't charge for child seats
        extraStop: false,
        meetGreet: true,
        customerName: bookingName,
        customerEmail: bookingEmail,
        customerPhone: bookingPhone,
        isAirportRoute: false,
        isPortRoute: false,
        bookingType: 'tour',
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentStatus: 'cash',
        paymentType: 'cash',
      };
      saveBooking(bookingData);

      toast({
        title: "Booking Request Sent!",
        description: "We'll confirm your tour booking within 15 minutes.",
      });

      // Redirect to tour confirmed page
      navigate('/tour/confirmed');
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking error",
        description: error.message || "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWhatsApp = () => {
    const message = `Hi! I have questions about the tour: ${tour.title}`;
    window.open(`https://wa.me/306944363525?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Get primary stop for weather (first stop, usually pickup point)
  const primaryStop = tour.stops?.[0];
  
  // Get main destination (stop with longest duration - the main attraction)
  const mainDestination = tour.stops?.length > 0 
    ? tour.stops.reduce((max, stop) => 
        (stop.stop_minutes || 0) > (max.stop_minutes || 0) ? stop : max
      , tour.stops[0])
    : null;

  return (
    <Layout>
      <SEOHead
        title={`${tour.title} | Private Tour Crete`}
        description={tour.short_teaser || tour.description?.slice(0, 160) || `Private ${tour.title} tour in ${tour.region}, Crete`}
        keywords={`${tour.title}, ${tour.region} tour, ${tour.category} tour Crete, private tour`}
        canonicalUrl={`https://livtours.gr/tours/${tour.slug}`}
      />

      {/* Hero Section - Full Width with Overlay */}
      <section className="relative h-[50vh] sm:h-[55vh] md:h-[65vh] lg:h-[75vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {tour.images.cover_url ? (
            <img 
              src={tour.images.cover?.url || tour.images.cover_url} 
              alt={tour.images.cover?.alt || tour.title}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent/50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
        </div>

        {/* Top Navigation Bar */}
        <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-20 flex items-center justify-between">
          <Button 
            variant="secondary" 
            size="sm"
            className="backdrop-blur-md bg-background/80 hover:bg-background/90 shadow-lg"
            onClick={() => navigate('/tours/browse')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Tours
          </Button>

          {/* Share Button */}
          <ShareButtons 
            title={tour.title}
            url={`https://livtours.gr/tours/${tour.slug}`}
            teaser={tour.short_teaser}
          />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container-wide pb-6 md:pb-8 lg:pb-12">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
              <Badge className="bg-accent text-accent-foreground shadow-lg text-xs md:text-sm">{tour.region}</Badge>
              <Badge variant="secondary" className="backdrop-blur-sm bg-background/80 text-xs md:text-sm">{tour.category}</Badge>
              <Badge variant="outline" className="backdrop-blur-sm bg-background/50 border-border/50 text-xs md:text-sm">
                {tour.time_type}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-2 md:mb-3 lg:mb-4 max-w-3xl leading-tight">
              {tour.title}
            </h1>

            {/* Teaser - Hidden on very small screens */}
            {tour.short_teaser && (
              <p className="hidden sm:block text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mb-4 md:mb-6">
                {tour.short_teaser}
              </p>
            )}

            {/* Quick Info Row - Scrollable on mobile */}
            <div className="flex items-center gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
              {tour.stops?.length > 0 && (
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm lg:text-base shrink-0">
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-accent" />
                  <span>{tour.stops.length} stops</span>
                </div>
              )}
              {tour.pickup_options?.length > 0 && (
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm lg:text-base shrink-0">
                  <Navigation className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-accent" />
                  <span>From {tour.pickup_options[0]}</span>
                </div>
              )}
              {tour.best_for?.length > 0 && (
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm lg:text-base shrink-0">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-accent" />
                  <span>{tour.best_for.slice(0, 2).join(', ')}</span>
                </div>
              )}
              {tour.price_from_eur && (
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm lg:text-base font-semibold text-accent shrink-0">
                  <span>From €{tour.price_from_eur}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden sticky top-[64px] z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container-wide py-3 flex items-center justify-between gap-4">
          <div>
            {tour.price_from_eur && (
              <p className="text-lg font-bold text-accent">€{tour.price_from_eur}</p>
            )}
            <p className="text-xs text-muted-foreground">per group</p>
          </div>
          <Button variant="hero" size="sm" onClick={scrollToBooking}>
            <Calendar className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-6 md:py-10 lg:py-16">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
            {/* Left Content - 2/3 */}
            <div className="lg:col-span-2 space-y-6 md:space-y-10 lg:space-y-12">
              
              {/* Quick Facts Cards - Compact on mobile */}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="bg-card rounded-xl md:rounded-2xl p-3 md:p-5 border border-border/50 text-center hover:border-accent/30 transition-colors">
                  <Clock className="w-5 h-5 md:w-7 md:h-7 mx-auto mb-1.5 md:mb-2 text-accent" />
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Duration</p>
                  <p className="font-semibold text-xs md:text-base">{tour.duration_hours}h</p>
                </div>
                <div className="bg-card rounded-xl md:rounded-2xl p-3 md:p-5 border border-border/50 text-center hover:border-accent/30 transition-colors">
                  <Mountain className="w-5 h-5 md:w-7 md:h-7 mx-auto mb-1.5 md:mb-2 text-accent" />
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Difficulty</p>
                  <p className="font-semibold text-xs md:text-base">{tour.difficulty}</p>
                </div>
                <div className="bg-card rounded-xl md:rounded-2xl p-3 md:p-5 border border-border/50 text-center hover:border-accent/30 transition-colors">
                  <Footprints className="w-5 h-5 md:w-7 md:h-7 mx-auto mb-1.5 md:mb-2 text-accent" />
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Walking</p>
                  <p className="font-semibold text-xs md:text-base">{tour.walking_level}</p>
                </div>
              </div>

              {/* Weather Section - Collapsible */}
              {primaryStop && (
                <div className="space-y-4">
                  {/* Weather Header - Always visible */}
                  <div 
                    className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl border border-accent/20 overflow-hidden"
                  >
                    {/* Header with toggle */}
                    <button
                      onClick={() => setWeatherExpanded(!weatherExpanded)}
                      className="w-full flex items-center justify-between gap-2 p-4 md:p-5 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sun className="w-5 h-5 text-accent" />
                        <h3 className="font-semibold text-left">
                          {language === 'gr' ? 'Καιρός στο' : 'Weather at'} {primaryStop.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {bookingDate && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {format(bookingDate, "d MMM")}
                          </span>
                        )}
                        {weatherExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    
                    {/* Collapsible content */}
                    {weatherExpanded && (
                      <div className="px-4 pb-4 md:px-5 md:pb-5 space-y-4">
                        {/* Date Picker */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {language === 'gr' ? 'Επιλέξτε ημερομηνία:' : 'Select a date:'}
                          </p>
                          <Popover open={sidebarDatePickerOpen} onOpenChange={setSidebarDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal h-11 rounded-xl",
                                  !bookingDate && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4 text-accent" />
                                {bookingDate 
                                  ? format(bookingDate, "EEEE, d MMMM yyyy") 
                                  : (language === 'gr' ? 'Διάλεξε ημερομηνία εκδρομής' : 'Pick your tour date')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={bookingDate}
                                onSelect={(d) => {
                                  setBookingDate(d);
                                  if (d) setSidebarDatePickerOpen(false);
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        {/* Weather Display - use tour region for accurate Cretan weather */}
                        <WeatherChip 
                          location={getTourRegionWeatherLocation(tour.region)} 
                          date={bookingDate ? format(bookingDate, 'yyyy-MM-dd') : format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                          className="w-full justify-start"
                        />
                        
                        {!bookingDate && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            {language === 'gr' 
                              ? 'Δείχνουμε την πρόβλεψη για αύριο. Διάλεξε ημερομηνία για ακριβέστερα αποτελέσματα.' 
                              : "Showing tomorrow's forecast. Select a date for accurate results."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Detailed Weather (when date is selected) */}
                  {weatherExpanded && bookingDate && selectedForecast && (
                    <ErrorBoundary
                      fallback={
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                          <p className="text-sm text-muted-foreground">
                            {language === 'gr'
                              ? 'Η αναλυτική πρόβλεψη δεν είναι διαθέσιμη αυτή τη στιγμή.'
                              : 'Detailed forecast is temporarily unavailable.'}
                          </p>
                        </div>
                      }
                    >
                      <WeatherDetails
                        location={getTourRegionWeatherLocation(tour.region)}
                        date={format(bookingDate, 'yyyy-MM-dd')}
                        tourVibe={tour.category}
                      />
                    </ErrorBoundary>
                  )}
                  
                  {/* Packing Tips (when date is selected) */}
                  {weatherExpanded && bookingDate && selectedForecast && (
                    <PackingTips
                      forecast={selectedForecast}
                      location={tour.region}
                    />
                  )}
                  
                  {/* Local Tip - uses main destination (longest stop) */}
                  {mainDestination && (
                    <LocalTip
                      destination={mainDestination.name}
                      pickupLocation={tour.pickup_options[0] || tour.region}
                      locationId={`tour-${tour.slug}-${mainDestination.name.toLowerCase().replace(/\s+/g, '-')}`}
                      locationName={mainDestination.name}
                      lat={mainDestination.lat}
                      lon={mainDestination.lon}
                      locationType="attraction"
                      useAI={true}
                    />
                  )}
                </div>
              )}

              {/* Description - AI Generated */}
              <div className="bg-card/50 border border-border/50 rounded-xl md:rounded-2xl overflow-hidden">
                <button
                  onClick={() => setAboutExpanded(!aboutExpanded)}
                  className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-muted/30 transition-colors"
                >
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                    <span className="w-1 h-5 md:h-6 bg-accent rounded-full"></span>
                    About This Tour
                  </h2>
                  <div className={cn(
                    "w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center transition-transform",
                    aboutExpanded && "rotate-180"
                  )}>
                    <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                </button>
                
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  aboutExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="px-4 pb-5 md:px-5 md:pb-6">
                    {isDescriptionLoading ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                        <div className="h-4 bg-muted rounded animate-pulse w-11/12" />
                        <div className="h-4 bg-muted rounded animate-pulse w-10/12" />
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                        <div className="h-4 bg-muted rounded animate-pulse w-9/12" />
                      </div>
                    ) : (
                      <div className="prose prose-lg max-w-none">
                        {(aiDescription || tour.description || 'Discover the beauty of Crete on this unforgettable journey.')
                          .split('\n\n')
                          .map((paragraph, i) => (
                            <p 
                              key={i} 
                              className="text-foreground/80 leading-[1.8] text-base md:text-[17px] mb-4 last:mb-0"
                              dangerouslySetInnerHTML={{
                                __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                              }}
                            />
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Highlights */}
              {tour.highlights.length > 0 && (
                <motion.div 
                  className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUp}
                >
                  <button
                    onClick={() => setHighlightsExpanded(!highlightsExpanded)}
                    className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
                  >
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                      <span className="w-1 h-6 bg-primary rounded-full"></span>
                      {language === 'gr' ? "Κορυφαία Σημεία" : "Tour Highlights"}
                    </h2>
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-transform",
                      highlightsExpanded && "rotate-180"
                    )}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    highlightsExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <motion.div 
                      className="px-5 pb-5 space-y-3"
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      {tour.highlights.map((highlight, i) => {
                        const getHighlightIcon = (text: string) => {
                          const lower = text.toLowerCase();
                          if (lower.includes('lagoon') || lower.includes('λιμνοθάλασσα')) return <Waves className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('scenic') || lower.includes('view') || lower.includes('θέα')) return <Mountain className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('beach') || lower.includes('παραλία')) return <Umbrella className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('photo') || lower.includes('φωτο')) return <Camera className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('swim') || lower.includes('κολύμπι')) return <Waves className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('sunset') || lower.includes('ηλιοβασίλεμα')) return <Sunset className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('village') || lower.includes('χωριό')) return <Home className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('wine') || lower.includes('κρασί')) return <Wine className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('food') || lower.includes('φαγητό') || lower.includes('lunch') || lower.includes('γεύμα')) return <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('hike') || lower.includes('walk') || lower.includes('περπάτημα')) return <Footprints className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('history') || lower.includes('ιστορ') || lower.includes('ancient') || lower.includes('αρχαί')) return <Landmark className="w-3.5 h-3.5 text-primary" />;
                          if (lower.includes('nature') || lower.includes('φύση') || lower.includes('gorge') || lower.includes('φαράγγι')) return <TreePine className="w-3.5 h-3.5 text-primary" />;
                          return <Star className="w-3.5 h-3.5 text-primary" />;
                        };
                        
                        return (
                          <motion.div 
                            key={i} 
                            variants={scaleIn}
                            className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {getHighlightIcon(highlight)}
                            </div>
                            <span className="text-sm md:text-base leading-relaxed">{highlight}</span>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* What's Included */}
              {tour.includes.length > 0 && (
                <motion.div 
                  className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUp}
                >
                  <button
                    onClick={() => setIncludesExpanded(!includesExpanded)}
                    className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
                  >
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                      <span className="w-1 h-6 bg-accent rounded-full"></span>
                      {language === 'gr' ? "Τι Περιλαμβάνεται" : "What's Included"}
                    </h2>
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-transform",
                      includesExpanded && "rotate-180"
                    )}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    includesExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="px-5 pb-5">
                      <motion.div 
                        className="grid sm:grid-cols-2 gap-2"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        {tour.includes.map((item, i) => {
                          const getItemIcon = (text: string) => {
                            const lower = text.toLowerCase();
                            if (lower.includes('transfer') || lower.includes('μεταφορά')) return <Car className="w-4 h-4" />;
                            if (lower.includes('water') || lower.includes('drink') || lower.includes('νερό')) return <Droplets className="w-4 h-4" />;
                            if (lower.includes('snack') || lower.includes('food') || lower.includes('σνακ')) return <UtensilsCrossed className="w-4 h-4" />;
                            if (lower.includes('pickup') || lower.includes('hotel') || lower.includes('παραλαβή')) return <MapPin className="w-4 h-4" />;
                            if (lower.includes('guide') || lower.includes('driver') || lower.includes('οδηγός')) return <User className="w-4 h-4" />;
                            if (lower.includes('air') || lower.includes('ac') || lower.includes('κλιματισμός')) return <Snowflake className="w-4 h-4" />;
                            if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-4 h-4" />;
                            if (lower.includes('photo') || lower.includes('φωτο')) return <Camera className="w-4 h-4" />;
                            if (lower.includes('insurance') || lower.includes('ασφάλεια')) return <Shield className="w-4 h-4" />;
                            if (lower.includes('fuel') || lower.includes('καύσιμα')) return <Fuel className="w-4 h-4" />;
                            if (lower.includes('parking') || lower.includes('στάθμευση')) return <ParkingCircle className="w-4 h-4" />;
                            if (lower.includes('towel') || lower.includes('πετσέτ')) return <Waves className="w-4 h-4" />;
                            if (lower.includes('equipment') || lower.includes('εξοπλισμός')) return <Backpack className="w-4 h-4" />;
                            return <Check className="w-4 h-4" />;
                          };
                          
                          return (
                            <motion.div 
                              key={i} 
                              variants={scaleIn}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-accent/30 transition-colors"
                            >
                              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                {getItemIcon(item)}
                              </span>
                              <span className="text-sm md:text-base">{item}</span>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                      
                      <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-accent" />
                        {language === 'gr' ? 'Χωρίς κρυφές χρεώσεις' : 'No hidden fees or extras'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Itinerary */}
              {tour.stops.length > 0 && (
                <div className="bg-card rounded-2xl p-5 md:p-6 border border-border/50 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-1 h-6 bg-accent rounded-full"></span>
                      <h2 className="text-xl md:text-2xl font-bold">
                        {language === 'gr' ? "Το Πρόγραμμα" : "Your Itinerary"}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{tour.stops.length} {language === 'gr' ? 'στάσεις' : 'stops'}</span>
                    </div>
                  </div>
                  
                  {/* Timeline - connecting lines are now in each ItineraryStop */}
                  <div className="relative">
                    <div className="space-y-0">
                      {tour.stops.map((stop, i) => {
                        const isFirst = i === 0;
                        const isLast = i === tour.stops.length - 1;
                        
                        return (
                          <ItineraryStop
                            key={i}
                            stop={stop}
                            index={i}
                            isFirst={isFirst}
                            isLast={isLast}
                            totalStops={tour.stops.length}
                            language={language}
                            isRevealed={itineraryRevealed}
                            onReveal={() => setItineraryRevealed(true)}
                            onCollapse={() => setItineraryRevealed(false)}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Total duration */}
                  <div className="mt-6 flex items-center justify-center gap-3 p-4 bg-muted/30 rounded-xl">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="font-medium">
                      {language === 'gr' ? 'Συνολική διάρκεια:' : 'Total duration:'} {tour.duration_hours} {language === 'gr' ? 'ώρες' : 'hours'}
                    </span>
                  </div>
                </div>
              )}

              {/* Fun Fact Card - Standalone Section */}
              <FunFactCard
                funFact={funFact}
                sourceUrl={funFactSourceUrl}
                isLoading={isFunFactLoading}
                label={language === 'gr' ? 'Το ξέρατε;' : 'Fun Fact'}
                sourceLabel={language === 'gr' ? 'Πηγή: Wikipedia' : 'Source: Wikipedia'}
              />
            </div>

            {/* Right Sidebar - 1/3 (Desktop only) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Booking Card */}
                <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg">
                  {tour.price_from_eur && (
                    <div className="mb-6 pb-6 border-b border-border/50">
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="text-4xl font-bold text-accent">€{tour.price_from_eur}</p>
                      <p className="text-sm text-muted-foreground">per group</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button variant="hero" className="w-full" size="lg" onClick={scrollToBooking}>
                      <Calendar className="w-5 h-5 mr-2" />
                      Book This Tour
                    </Button>
                    <Button variant="outline" className="w-full" size="lg" onClick={handleWhatsApp}>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Ask on WhatsApp
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Free cancellation up to 24h before
                  </p>
                </div>

                {/* Trust Section */}
                <div className="bg-card rounded-2xl p-6 border border-border/50">
                  <h4 className="font-semibold mb-4">Why Book With Us</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Local Experts</p>
                        <p className="text-xs text-muted-foreground">Drivers who know every corner of Crete</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">No Hidden Fees</p>
                        <p className="text-xs text-muted-foreground">Transparent pricing, all inclusive</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Flexible Booking</p>
                        <p className="text-xs text-muted-foreground">Free cancellation, easy changes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup Options */}
                {tour.pickup_options.length > 0 && (
                  <div className="bg-card rounded-2xl p-6 border border-border/50">
                    <h4 className="font-semibold mb-3">Pickup Available From</h4>
                    <div className="flex flex-wrap gap-2">
                      {tour.pickup_options.map((option, i) => (
                        <Badge key={i} variant="secondary" className="rounded-full">{option}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery - Full Width */}
      {(tour.images.gallery?.length > 0 || tour.images.gallery_urls?.length > 0) && (
        <motion.section 
          className="py-12 md:py-16 lg:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="container-wide">
            <div className="bg-card rounded-2xl p-5 md:p-6 border border-border/50 shadow-sm">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-6 bg-accent rounded-full"></span>
                  <h2 className="text-xl md:text-2xl font-bold">
                    {language === 'gr' ? "Φωτογραφίες" : "Photo Gallery"}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Camera className="w-4 h-4" />
                  <span>{tour.images.gallery?.length || tour.images.gallery_urls?.length} photos</span>
                </div>
              </div>
          
              {/* Equal Size Grid Gallery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(tour.images.gallery || []).slice(0, 3).map((img: TourImageMeta, i: number) => (
                  <button 
                    key={i} 
                    className="relative group w-full aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10"
                    onClick={() => {
                      setLightboxIndex(i);
                      setLightboxOpen(true);
                    }}
                    aria-label={`View ${img.alt} in full size`}
                  >
                    <img 
                      src={img.url} 
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    {/* Zoom indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <ZoomIn className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    </div>
                    
                    {/* Image number badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] text-white/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {i + 1} / {Math.min(3, tour.images.gallery?.length || 0)}
                    </div>
                  </button>
                ))}
                
                {/* Fallback for old format */}
                {(!tour.images.gallery || tour.images.gallery.length === 0) && 
                  tour.images.gallery_urls?.slice(0, 3).map((url: string, i: number) => (
                    <button 
                      key={i} 
                      className="relative group w-full aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10"
                      onClick={() => {
                        setLightboxIndex(i);
                        setLightboxOpen(true);
                      }}
                    >
                      <img 
                        src={url} 
                        alt={`${tour.title} gallery ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </button>
                  ))
                }
              </div>
              
              {/* View all button */}
              {(tour.images.gallery?.length || 0) > 6 && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 group"
                    onClick={() => {
                      setLightboxIndex(0);
                      setLightboxOpen(true);
                    }}
                  >
                    <span>{language === 'gr' ? "Δες όλες τις φωτογραφίες" : "View all photos"}</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Tags */}
            {tour.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {tour.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="rounded-full px-4 py-1.5 text-sm">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Lightbox - Support both gallery (new format) and gallery_urls (old format) */}
      {(tour.images.gallery?.length > 0 || tour.images.gallery_urls?.length > 0) && (
        <Lightbox
          images={
            tour.images.gallery?.length > 0 
              ? tour.images.gallery 
              : (tour.images.gallery_urls || []).map((url: string, i: number) => ({
                  url,
                  alt: `${tour.title} gallery ${i + 1}`,
                  source: 'placeholder' as const,
                  source_url: url,
                  license: 'Unknown'
                }))
          }
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* Booking Form Section */}
      <motion.section 
        id="booking" 
        className="py-8 md:py-12 lg:py-20 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUp}
      >
        <div className="container-wide max-w-2xl px-4 md:px-6">
          <motion.div 
            className="text-center mb-6 md:mb-8 lg:mb-10"
            variants={fadeInUp}
          >
            <Badge className="mb-3 md:mb-4">Reserve Your Spot</Badge>
            <h2 className="text-xl md:text-2xl lg:text-4xl font-bold mb-2 md:mb-3">Book This Tour</h2>
            <p className="text-sm md:text-base text-muted-foreground">Fill in your details and we'll confirm within 15 minutes</p>
          </motion.div>
          
          <form onSubmit={handleBookingSubmit} className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-10 border border-border/50 shadow-lg space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="booking-name" className="flex items-center gap-2 text-xs md:text-sm font-medium">
                  <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                  {language === 'gr' ? 'Όνομα' : 'Your Name'} *
                </Label>
                <div className="relative">
                  <Input
                    id="booking-name"
                    placeholder={language === 'gr' ? 'Ονοματεπώνυμο' : 'Full name'}
                    value={bookingName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => handleFieldBlur('name')}
                    className={cn(
                      "h-11 md:h-12 rounded-lg md:rounded-xl pr-10 transition-colors text-base",
                      hasFieldError('name') && "border-destructive focus-visible:ring-destructive",
                      isFieldValid('name') && "border-green-500 focus-visible:ring-green-500"
                    )}
                  />
                  {isFieldValid('name') && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-green-500" />
                  )}
                </div>
                {hasFieldError('name') && (
                  <p className="text-[10px] md:text-xs text-destructive flex items-center gap-1 animate-fade-in">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                    {validationErrors.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="booking-email" className="flex items-center gap-2 text-xs md:text-sm font-medium">
                  <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                  {language === 'gr' ? 'Email' : 'Email Address'} *
                </Label>
                <div className="relative">
                  <Input
                    id="booking-email"
                    type="email"
                    placeholder="your@email.com"
                    value={bookingEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    className={cn(
                      "h-11 md:h-12 rounded-lg md:rounded-xl pr-10 transition-colors text-base",
                      hasFieldError('email') && "border-destructive focus-visible:ring-destructive",
                      isFieldValid('email') && "border-green-500 focus-visible:ring-green-500"
                    )}
                  />
                  {isFieldValid('email') && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-green-500" />
                  )}
                </div>
                {hasFieldError('email') && (
                  <p className="text-[10px] md:text-xs text-destructive flex items-center gap-1 animate-fade-in">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="booking-phone" className="flex items-center gap-2 text-xs md:text-sm font-medium">
                  <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                  {language === 'gr' ? 'Τηλέφωνο' : 'Phone Number'}
                </Label>
                <PhoneInput
                  id="booking-phone"
                  value={bookingPhone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleFieldBlur('phone')}
                  placeholder="XXX XXX XXXX"
                  className={cn(
                    "h-11 md:h-12 rounded-lg md:rounded-xl transition-colors text-base",
                    hasFieldError('phone') && "border-destructive focus-visible:ring-destructive",
                    isFieldValid('phone') && bookingPhone && "border-green-500 focus-visible:ring-green-500"
                  )}
                />
                {hasFieldError('phone') && (
                  <p className="text-[10px] md:text-xs text-destructive flex items-center gap-1 animate-fade-in">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5 md:space-y-2">
                <Label className="flex items-center gap-2 text-xs md:text-sm font-medium">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                  {language === 'gr' ? 'Μέγεθος Ομάδας' : 'Group Size'}
                </Label>
                <Input
                  placeholder={language === 'gr' ? 'π.χ. 2 ενήλικες, 1 παιδί' : 'e.g., 2 adults, 1 child'}
                  value={bookingGroupSize}
                  onChange={(e) => setBookingGroupSize(e.target.value)}
                  className="h-11 md:h-12 rounded-lg md:rounded-xl text-base"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
              <div className="space-y-1.5 md:space-y-2">
                <Label className="flex items-center gap-2 text-xs md:text-sm font-medium">
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                  {language === 'gr' ? 'Ημερομηνία' : 'Preferred Date'} *
                </Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setTouchedFields(prev => ({ ...prev, date: true }))}
                      className={cn(
                        "w-full h-11 md:h-12 justify-start text-left font-normal rounded-lg md:rounded-xl transition-colors text-sm md:text-base",
                        !bookingDate && "text-muted-foreground",
                        hasFieldError('date') && "border-destructive",
                        bookingDate && "border-green-500"
                      )}
                    >
                      <Calendar className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                      {bookingDate ? format(bookingDate, "PPP") : (language === 'gr' ? 'Επιλέξτε ημερομηνία' : 'Select date')}
                      {bookingDate && <Check className="ml-auto w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={bookingDate}
                      onSelect={(date) => {
                        setBookingDate(date);
                        setTouchedFields(prev => ({ ...prev, date: true }));
                        setValidationErrors(prev => ({ ...prev, date: '' }));
                        if (date) setDatePickerOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {hasFieldError('date') && (
                  <p className="text-[10px] md:text-xs text-destructive flex items-center gap-1 animate-fade-in">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                    {validationErrors.date}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label className="flex items-center gap-2 text-xs md:text-sm font-medium">
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                  {language === 'gr' ? 'Ώρα' : 'Preferred Time'} *
                </Label>
                <Popover open={timePopoverOpen} onOpenChange={setTimePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setTouchedFields(prev => ({ ...prev, time: true }))}
                      className={cn(
                        "w-full h-11 md:h-12 justify-start text-left font-normal rounded-lg md:rounded-xl transition-colors text-sm md:text-base",
                        !bookingTime && "text-muted-foreground",
                        hasFieldError('time') && "border-destructive",
                        bookingTime && "border-green-500"
                      )}
                    >
                      <Clock className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                      {bookingTime || (language === 'gr' ? 'Επιλέξτε ώρα' : 'Select time')}
                      {bookingTime && <Check className="ml-auto w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2 pointer-events-auto" align="start">
                    <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                      {allTimeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={bookingTime === time ? "default" : "ghost"}
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            setBookingTime(time);
                            setTouchedFields(prev => ({ ...prev, time: true }));
                            setValidationErrors(prev => ({ ...prev, time: '' }));
                            setTimePopoverOpen(false);
                          }}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {hasFieldError('time') && (
                  <p className="text-[10px] md:text-xs text-destructive flex items-center gap-1 animate-fade-in">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                    {validationErrors.time}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="booking-notes" className="flex items-center gap-2 text-xs md:text-sm font-medium">
                <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                {language === 'gr' ? 'Ειδικά Αιτήματα' : 'Special Requests'}
              </Label>
              <Textarea
                id="booking-notes"
                placeholder={language === 'gr' 
                  ? 'Ειδικές απαιτήσεις, προτιμήσεις για σημείο παραλαβής, διατροφικές ανάγκες...' 
                  : 'Any special requirements, pickup location preferences, dietary needs...'}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                rows={3}
                className="rounded-lg md:rounded-xl resize-none text-base"
              />
            </div>

            {!showPaymentOption ? (
              <>
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full h-14 text-base rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {language === 'gr' ? 'Έλεγχος...' : 'Checking...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {language === 'gr' ? 'Συνέχεια στην Κράτηση' : 'Continue to Booking'}
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  {language === 'gr' 
                    ? 'Δωρεάν ακύρωση έως 24 ώρες πριν την εκδρομή σας.' 
                    : 'Free cancellation up to 24h before your tour.'}
                </p>
              </>
            ) : (
              <div className="space-y-4 pt-2 border-t border-border/50">
                {/* 15% Discount Banner */}
                <div className="relative overflow-hidden rounded-xl border-2 border-accent bg-gradient-to-r from-accent/10 to-accent/5 p-4">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Percent className="w-4 h-4 text-accent" />
                      </div>
                      <span className="font-bold text-accent">15% OFF</span>
                      <Badge className="bg-accent text-accent-foreground text-xs">Limited Offer</Badge>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      Prebook online & save €{discountSaved} on deposit!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Secure your spot with a small deposit. Pay the rest on the day.
                    </p>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tour price</span>
                    <span>From €{estimatedPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">30% Deposit</span>
                    <span>€{depositAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-accent border-t border-border/50 pt-2">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      With 15% discount
                    </span>
                    <span>€{discountedDeposit}</span>
                  </div>
                </div>

                {/* Payment Buttons */}
                <div className="space-y-3">
                  <Button 
                    type="button"
                    variant="hero" 
                    size="lg" 
                    className="w-full h-14 text-base rounded-xl"
                    onClick={() => handlePayDeposit(true)}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Prebook & Save 15%
                      </>
                    )}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline" 
                    size="lg" 
                    className="w-full h-12 rounded-xl"
                    onClick={handlePayOnArrival}
                    disabled={isProcessingPayment}
                  >
                    Pay on Arrival
                  </Button>
                  <p className="text-xs text-muted-foreground text-center -mt-1">
                    Full payment to driver (card or cash)
                  </p>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Final price confirmed after booking. Remaining balance paid on tour day.
                </p>

                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setShowPaymentOption(false)}
                >
                  ← Edit booking details
                </Button>
              </div>
            )}
          </form>
        </div>
      </motion.section>

      {/* Related Tours */}
      <RelatedTours 
        currentTourId={tour.id} 
        region={tour.region} 
        category={tour.category} 
      />
    </Layout>
  );
};

export default TourDetail;
