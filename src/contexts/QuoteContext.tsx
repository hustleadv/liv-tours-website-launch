import { createContext, useContext, useState, ReactNode } from "react";

interface QuoteData {
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
  extraHour: boolean;
  coolerWaters: boolean;
  bookingType: 'airport' | 'standard' | 'tour';
}

interface QuoteContextType {
  quoteData: QuoteData | null;
  setQuoteData: (data: QuoteData | null) => void;
}

const defaultQuoteData: QuoteData = {
  pickup: "",
  dropoff: "",
  date: "",
  time: "",
  passengers: "",
  luggage: "medium",
  vehicleType: "",
  childSeat: 0,
  extraStop: false,
  meetGreet: true,
  extraHour: false,
  coolerWaters: false,
  bookingType: 'standard',
};

const QuoteContext = createContext<QuoteContextType>({
  quoteData: null,
  setQuoteData: () => {},
});

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  return (
    <QuoteContext.Provider value={{ quoteData, setQuoteData }}>
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = () => useContext(QuoteContext);

export type { QuoteData };
