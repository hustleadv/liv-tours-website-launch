import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CountryCode {
  code: string;
  dial: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "GR", dial: "+30", flag: "🇬🇷" },
  { code: "GB", dial: "+44", flag: "🇬🇧" },
  { code: "DE", dial: "+49", flag: "🇩🇪" },
  { code: "FR", dial: "+33", flag: "🇫🇷" },
  { code: "IT", dial: "+39", flag: "🇮🇹" },
  { code: "US", dial: "+1", flag: "🇺🇸" },
  { code: "NL", dial: "+31", flag: "🇳🇱" },
  { code: "BE", dial: "+32", flag: "🇧🇪" },
  { code: "ES", dial: "+34", flag: "🇪🇸" },
  { code: "PT", dial: "+351", flag: "🇵🇹" },
  { code: "AT", dial: "+43", flag: "🇦🇹" },
  { code: "CH", dial: "+41", flag: "🇨🇭" },
  { code: "SE", dial: "+46", flag: "🇸🇪" },
  { code: "NO", dial: "+47", flag: "🇳🇴" },
  { code: "DK", dial: "+45", flag: "🇩🇰" },
  { code: "FI", dial: "+358", flag: "🇫🇮" },
  { code: "PL", dial: "+48", flag: "🇵🇱" },
  { code: "CZ", dial: "+420", flag: "🇨🇿" },
  { code: "RO", dial: "+40", flag: "🇷🇴" },
  { code: "BG", dial: "+359", flag: "🇧🇬" },
  { code: "HR", dial: "+385", flag: "🇭🇷" },
  { code: "HU", dial: "+36", flag: "🇭🇺" },
  { code: "IE", dial: "+353", flag: "🇮🇪" },
  { code: "CY", dial: "+357", flag: "🇨🇾" },
  { code: "TR", dial: "+90", flag: "🇹🇷" },
  { code: "RU", dial: "+7", flag: "🇷🇺" },
  { code: "AU", dial: "+61", flag: "🇦🇺" },
  { code: "CA", dial: "+1", flag: "🇨🇦" },
  { code: "IL", dial: "+972", flag: "🇮🇱" },
  { code: "AE", dial: "+971", flag: "🇦🇪" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  autoComplete?: string;
}

const PhoneInput = ({
  value,
  onChange,
  onBlur,
  placeholder = "XXX XXX XXXX",
  className,
  id,
  required,
  autoComplete = "tel",
}: PhoneInputProps) => {
  // Parse initial country code from value
  const getInitialCountry = (): CountryCode => {
    if (value) {
      const match = COUNTRY_CODES.find(
        (c) => value.startsWith(c.dial + " ") || value.startsWith(c.dial)
      );
      if (match) return match;
    }
    return COUNTRY_CODES[0]; // Default to Greece
  };

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getInitialCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Get phone number without country code
  const getLocalNumber = (): string => {
    if (!value) return "";
    const dialCode = selectedCountry.dial;
    if (value.startsWith(dialCode + " ")) return value.slice(dialCode.length + 1);
    if (value.startsWith(dialCode)) return value.slice(dialCode.length);
    return value;
  };

  const handleNumberChange = (localNumber: string) => {
    const fullNumber = localNumber ? `${selectedCountry.dial} ${localNumber}` : "";
    onChange(fullNumber);
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    const localNumber = getLocalNumber();
    const fullNumber = localNumber ? `${country.dial} ${localNumber}` : "";
    onChange(fullNumber);
    setIsOpen(false);
    setSearch("");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredCountries = search
    ? COUNTRY_CODES.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search)
      )
    : COUNTRY_CODES;

  return (
    <div className={cn("relative flex w-full group", className)} ref={dropdownRef}>
      {/* Country code button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 border border-r-0 border-input bg-muted/30 rounded-l-[inherit] text-sm shrink-0 hover:bg-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
          "h-full min-h-[44px]"
        )}
        aria-label="Select country code"
        aria-expanded={isOpen}
      >
        <span className="text-lg leading-none">{selectedCountry.flag}</span>
        <span className="text-xs font-bold text-primary">{selectedCountry.dial}</span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Phone number input */}
      <Input
        id={id}
        type="tel"
        placeholder={placeholder}
        value={getLocalNumber()}
        onChange={(e) => handleNumberChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        autoComplete={autoComplete}
        className={cn(
          "flex-1 rounded-l-none border-l-0 bg-transparent h-full border-input focus-visible:ring-primary/20",
          "placeholder:text-muted-foreground/50 font-medium"
        )}
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="p-2 border-b border-border">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-transparent border border-input rounded-lg outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code + country.dial}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent/10 transition-colors",
                  selectedCountry.code === country.code && selectedCountry.dial === country.dial && "bg-accent/10 font-medium"
                )}
              >
                <span className="text-base">{country.flag}</span>
                <span className="text-muted-foreground">{country.code}</span>
                <span className="ml-auto text-xs text-muted-foreground">{country.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
