// Placeholder tracking hooks for analytics integration
// These will be connected to actual analytics providers later

export type TrackingEvent = 
  | 'quote_start'
  | 'quote_step1_complete'
  | 'quote_complete'
  | 'whatsapp_click'
  | 'booking_confirmed'
  | 'route_view'
  | 'route_quote_prefill'
  | 'route_cta_click'
  | 'booking_confirm_click'
  | 'booking_confirm_view'
  | 'booking_whatsapp_open'
  | 'booking_return_trip_start'
  | 'booking_return_trip_submit'
  | 'booking_change_request_click'
  | 'whatsapp_quick_action_click'
  // Tour Builder events
  | 'tour_builder_open'
  | 'tour_vibe_select'
  | 'tour_details_complete'
  | 'tour_itinerary_select'
  | 'tour_request_submit'
  | 'tour_whatsapp_click'
  | 'tour_addon_toggle'
  // Trust Engine events
  | 'reviews_view'
  | 'reviews_filter_change'
  | 'trust_badge_view'
  | 'policy_expand_click'
  | 'cta_microcopy_view'
  // Smart UX events
  | 'autocomplete_suggestion_view'
  | 'autocomplete_select'
  | 'recent_route_saved'
  | 'recent_route_click'
  | 'quote_save_click'
  | 'quote_resume_click'
  | 'defaults_applied'
  | 'routes_search'
  | 'routes_filter_apply'
  | 'routes_sort_change'
  | 'trip_hub_view'
  | 'trip_hub_whatsapp_click'
  | 'trip_hub_return_trip_click'
  | 'trip_hub_empty_state_view'
  // Weather events
  | 'weather_fetch_start'
  | 'weather_fetch_success'
  | 'weather_fetch_error'
  | 'weather_chip_view'
  | 'weather_insight_shown'
  // Meeting Point events
  | 'meetingpoint_view'
  | 'meetingpoint_maps_click'
  | 'meetingpoint_whatsapp_click'
  | 'meetingpoint_ferry_schedule_click'
  // Review events
  | 'review_card_view'
  | 'review_google_click'
  | 'review_star_select'
  | 'review_liv_submit'
  | 'review_liv_submit_success'
  // Local Tip events
  | 'local_tip_view'
  | 'local_tip_generated'
  | 'local_tip_fallback_used'
  // Trip Hub events
  | 'trip_hub_nav_click'
  | 'trip_hub_open'
  | 'trip_find_view'
  | 'trip_find_submit'
  | 'trip_find_fail'
  // Badge & Level events
  | 'badge_view'
  | 'badge_unlock'
  | 'badge_cta_click'
  | 'level_view'
  | 'level_up'
  | 'local_gems_view'
  | 'local_gem_maps_click'
  | 'rebook_same_trip'
  | 'smart_alternative_switch'
  // Tours system events
  | 'tours_page_view'
  | 'tour_card_view'
  | 'tour_details_view'
  | 'tour_book_click'
  | 'tour_booking_submit'
  | 'tour_pay_online_click'
  | 'tour_pay_on_arrival'
  | 'tour_whatsapp_booking'
  | 'tour_quiz_start'
  | 'tour_quiz_complete'
  | 'tour_quiz_result_view'
  | 'tour_quiz_book_click'
  | 'admin_tour_create'
  | 'admin_tour_update'
  | 'admin_tour_publish'
  | 'admin_tour_unpublish'
  | 'admin_tour_import'
  | 'admin_ai_draft_generate'
  // Payment events
  | 'payment_initiated'
  | 'payment_success'
  | 'payment_canceled';

interface TrackingData {
  pickup?: string;
  dropoff?: string;
  date?: string;
  time?: string;
  passengers?: string;
  vehicleType?: string;
  extras?: string[];
  source?: string;
  routeId?: string;
  ctaType?: string;
  // Trust Engine tracking
  context?: string;
  policy?: string;
  category?: string;
  // Weather tracking
  location?: string;
  error?: string;
  insightType?: string;
  // Meeting Point tracking
  type?: string;
  platform?: 'google' | 'apple';
  // Local Tip tracking
  locationId?: string;
  confidence?: number;
  reason?: string;
  // Badge & Level tracking
  badgeId?: string;
  level?: number;
  name?: string;
  gemId?: string;
  // Tours tracking
  tourId?: string;
  tourTitle?: string;
  // Payment tracking
  bookingId?: string;
  paymentType?: string;
  paymentMethod?: 'online' | 'cash';
  amount?: number;
  sessionId?: string | null;
  applyDiscount?: boolean;
}

export const trackEvent = (event: TrackingEvent, data?: TrackingData) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, data || {});
  }
  
  // Connect to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, {
      ...data,
      // Map event to GA4 recommended parameters if possible
      event_category: 'engagement',
      event_label: event,
    });
  }
};

export const generateWhatsAppLink = (formData?: {
  pickup?: string;
  dropoff?: string;
  date?: string;
  time?: string;
  passengers?: string;
  luggage?: string;
  vehicleType?: string;
  extras?: string[];
}) => {
  const phoneNumber = '306944363525';
  
  let message: string;
  
  if (formData?.pickup && formData?.dropoff) {
    const extrasText = formData.extras?.length 
      ? formData.extras.join(', ') 
      : 'None';
    
    message = `Hi! I want to book a ${formData.vehicleType || 'transfer'}.

Route: ${formData.pickup} → ${formData.dropoff}
Date/Time: ${formData.date || 'TBD'} ${formData.time || ''}
Passengers: ${formData.passengers || 'TBD'}
Luggage: ${formData.luggage || 'TBD'}
Extras: ${extrasText}

Please confirm price & availability. Thanks!`;
  } else {
    message = "Hi! I need help with a transfer/tour booking in Crete.";
  }
  
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};
