// Booking types and utilities for Arrival Mode

export interface BookingData {
  bookingId: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  luggage: string;
  vehicleType: string;
  childSeat: number; // Number of child seats (0 = none)
  extraStop: boolean;
  meetGreet: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  isAirportRoute: boolean;
  isPortRoute: boolean;
  bookingType?: 'transfer' | 'tour';
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  driverName?: string;
  driverPhone?: string;
  driverLanguage?: string;
  driverMessageSent?: boolean;
  driverMessageSentAt?: string;
  // Payment fields
  paymentStatus?: 'pending' | 'paid' | 'deposit_paid' | 'failed' | 'refunded' | 'cash';
  paymentType?: 'full' | 'deposit' | 'cash';
  paymentAmount?: number;
  totalAmount?: number;
  depositPaid?: number;
  paidAt?: string;
  // Tour-specific fields
  tourVibe?: string;
  itineraryTitle?: string;
  pickupArea?: string;
  duration?: string;
  groupSize?: string;
  preferredDate?: string;
  preferredTime?: string;
  addons?: string[];
  notes?: string;
  estimatedTotal?: number;
  finalPrice?: number;
  depositAmount?: number;
  priceSentAt?: string;
  priceConfirmedAt?: string;
}

// Generate a booking ID
export const generateBookingId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'LIV-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// Store booking in localStorage
export const saveBooking = (booking: BookingData): void => {
  localStorage.setItem('liv_last_booking', JSON.stringify(booking));
  
  // Also store in booking history
  const history = getBookingHistory();
  history.unshift(booking);
  localStorage.setItem('liv_booking_history', JSON.stringify(history.slice(0, 10)));
};

// Get last booking from localStorage
export const getLastBooking = (): BookingData | null => {
  const stored = localStorage.getItem('liv_last_booking');
  return stored ? JSON.parse(stored) : null;
};

// Get booking history
export const getBookingHistory = (): BookingData[] => {
  const stored = localStorage.getItem('liv_booking_history');
  return stored ? JSON.parse(stored) : [];
};

// Check if route is an airport route based on pickup/dropoff text
export const detectAirportRoute = (pickup: string, dropoff: string): boolean => {
  const airportKeywords = ['airport', 'αεροδρόμιο', 'her', 'chq', 'heraklion airport', 'chania airport'];
  const text = `${pickup} ${dropoff}`.toLowerCase();
  return airportKeywords.some(keyword => text.includes(keyword));
};

// Check if route is a port route based on pickup/dropoff text
export const detectPortRoute = (pickup: string, dropoff: string): boolean => {
  const portKeywords = ['port', 'λιμάνι', 'souda', 'σούδα', 'kissamos', 'κίσσαμος', 'heraklion port', 'ηράκλειο λιμάνι'];
  const text = `${pickup} ${dropoff}`.toLowerCase();
  return portKeywords.some(keyword => text.includes(keyword));
};

// Generate WhatsApp message for booking confirmation
export const generateBookingWhatsAppMessage = (booking: BookingData): string => {
  const extras = [];
  if (booking.childSeat > 0) extras.push(`Child seat ×${booking.childSeat}`);
  if (booking.extraStop) extras.push('Extra stop');
  if (booking.meetGreet) extras.push('Meet & Greet');
  
  const tripHubLink = `https://livtours.gr/trip?token=${booking.bookingId}`;
  
  return `Hi! This is my booking:

ID: ${booking.bookingId}
Route: ${booking.pickup} → ${booking.dropoff}
Date/Time: ${booking.date} ${booking.time}
Vehicle: ${booking.vehicleType}
Passengers: ${booking.passengers}
Extras: ${extras.length > 0 ? extras.join(', ') : 'None'}

Trip Hub: ${tripHubLink}

Please confirm price & pickup details. Thanks!`;
};

// Generate WhatsApp messages for quick actions
export const generateChangeTimeMessage = (bookingId: string): string => {
  return `Hi! I need to change the pickup time for booking ${bookingId}. Can you help?`;
};

export const generateExtraStopMessage = (bookingId: string): string => {
  return `Hi! Please add an extra stop to booking ${bookingId}. I'll provide the address.`;
};

export const generateChildSeatMessage = (bookingId: string): string => {
  return `Hi! Please add a child seat to booking ${bookingId}. Thank you!`;
};

export const generateMeetingPointMessage = (bookingId: string): string => {
  return `Hi! Can you confirm the exact meeting point for booking ${bookingId}? Where should I wait?`;
};

export const generateTourInquiryMessage = (bookingId: string): string => {
  return `Hi! I have booking ${bookingId}. I'm interested in adding a private tour during my trip. What do you recommend?`;
};

// Generate WhatsApp link
export const getWhatsAppLink = (message: string): string => {
  const phoneNumber = '306944363525';
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};

// Generate Google Maps link for route
export const getGoogleMapsLink = (pickup: string, dropoff: string): string => {
  return `https://www.google.com/maps/dir/${encodeURIComponent(pickup)}/${encodeURIComponent(dropoff)}`;
};

// Generate ICS calendar file content
export const generateICSFile = (booking: BookingData): string => {
  // Parse date and time to create proper ICS format
  const [day, month, year] = booking.date.split('/').map(Number);
  const [hours, minutes] = booking.time.split(':').map(Number);
  
  // Create start date (assume 2024/2025 based on context, use full year if available)
  const fullYear = year < 100 ? 2000 + year : year;
  const startDate = new Date(fullYear, month - 1, day, hours, minutes);
  
  // End time: assume 1 hour transfer duration
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Format dates for ICS (YYYYMMDDTHHMMSS)
  const formatICSDate = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  };

  const extras = [];
  if (booking.childSeat > 0) extras.push(`Child seat ×${booking.childSeat}`);
  if (booking.extraStop) extras.push('Extra stop');
  if (booking.meetGreet) extras.push('Meet & Greet');

  const description = `LIV Tours Transfer\\n\\nBooking ID: ${booking.bookingId}\\nRoute: ${booking.pickup} → ${booking.dropoff}\\nVehicle: ${booking.vehicleType}\\nPassengers: ${booking.passengers}\\nExtras: ${extras.length > 0 ? extras.join(', ') : 'None'}\\n\\nYour driver will contact you via WhatsApp.`;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LIV Tours//Transfer Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:LIV Tours Transfer: ${booking.pickup} → ${booking.dropoff}
DESCRIPTION:${description}
LOCATION:${booking.pickup}
UID:${booking.bookingId}@livtours.gr
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

// Download ICS file
export const downloadCalendarFile = (booking: BookingData): void => {
  const icsContent = generateICSFile(booking);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `liv-transfer-${booking.bookingId}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
