import { Check, X, Users, Briefcase, Car, Bus, Wifi, Snowflake, Baby, Info, Plane, UserCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VehicleSpec {
  name: string;
  nameGr: string;
  icon: React.ReactNode;
  passengers: string;
  luggage: string;
  carryOn: string;
  childSeat: boolean;
  wifi: boolean;
  ac: boolean;
  meetGreet: boolean;
  flightTracking: boolean;
  idealFor: string;
  idealForGr: string;
}

const vehicles: VehicleSpec[] = [
  {
    name: "Mercedes E-Class",
    nameGr: "Mercedes E-Class",
    icon: <Car className="w-5 h-5" />,
    passengers: "1-4",
    luggage: "Flexible",
    carryOn: "Flexible",
    childSeat: true,
    wifi: true,
    ac: true,
    meetGreet: true,
    flightTracking: true,
    idealFor: "Couples, small families",
    idealForGr: "Ζευγάρια, μικρές οικογένειες",
  },
  {
    name: "Mercedes Sprinter",
    nameGr: "Mercedes Sprinter",
    icon: <Car className="w-5 h-5" />,
    passengers: "5-11",
    luggage: "Flexible",
    carryOn: "Flexible",
    childSeat: true,
    wifi: true,
    ac: true,
    meetGreet: true,
    flightTracking: true,
    idealFor: "Families, friend groups",
    idealForGr: "Οικογένειες, παρέες",
  },
  {
    name: "Mercedes Sprinter Maxi",
    nameGr: "Mercedes Sprinter Maxi",
    icon: <Bus className="w-5 h-5" />,
    passengers: "12-20",
    luggage: "Flexible",
    carryOn: "Flexible",
    childSeat: true,
    wifi: true,
    ac: true,
    meetGreet: true,
    flightTracking: true,
    idealFor: "Large groups, events",
    idealForGr: "Μεγάλες ομάδες, εκδηλώσεις",
  },
];

interface FeatureRowProps {
  label: string;
  tooltip: string;
  icon: React.ReactNode;
  isAlt?: boolean;
  children: React.ReactNode;
}

const FeatureRow = ({ label, tooltip, icon, isAlt, children }: FeatureRowProps) => (
  <tr className={`border-b border-border ${isAlt ? 'bg-muted/30' : ''}`}>
    <td className="p-4 font-medium text-foreground">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help group">
              {icon}
              <span>{label}</span>
              <Info className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </td>
    {children}
  </tr>
);

const VehicleComparisonTable = () => {
  const { language } = useLanguage();
  const isGreek = language === 'gr';

  const labels = {
    passengers: isGreek ? "Επιβάτες" : "Passengers",
    luggage: isGreek ? "Μεγάλες βαλίτσες" : "Large bags",
    carryOn: isGreek ? "Χειραποσκευές" : "Carry-ons",
    childSeat: isGreek ? "Παιδικό κάθισμα" : "Child seat",
    wifi: "WiFi",
    ac: isGreek ? "Κλιματισμός" : "A/C",
    meetGreet: "Meet & Greet",
    flightTracking: isGreek ? "Παρακολούθηση πτήσης" : "Flight tracking",
    idealFor: isGreek ? "Ιδανικό για" : "Ideal for",
    title: isGreek ? "Σύγκριση Οχημάτων" : "Vehicle Comparison",
    subtitle: isGreek ? "Βρείτε το τέλειο όχημα για το ταξίδι σας" : "Find the perfect vehicle for your trip",
    onRequest: isGreek ? "Κατόπιν αιτήματος" : "On request",
  };

  const tooltips = {
    passengers: isGreek 
      ? "Μέγιστος αριθμός επιβατών που μπορεί να μεταφέρει άνετα το όχημα"
      : "Maximum number of passengers the vehicle can comfortably transport",
    luggage: isGreek
      ? "Μπορούμε να κανονίσουμε όσες αποσκευές χρειάζεστε"
      : "We can accommodate any amount of luggage",
    carryOn: isGreek
      ? "Ευέλικτος χώρος για χειραποσκευές"
      : "Flexible space for carry-on bags",
    childSeat: isGreek
      ? "Βρεφικά καθίσματα (0-12μ), παιδικά καθίσματα (1-4 ετών) και boosters (4-12 ετών) διατίθενται δωρεάν κατόπιν αιτήματος"
      : "Baby seats (0-12mo), child seats (1-4yrs), and boosters (4-12yrs) available free on request",
    wifi: isGreek
      ? "Δωρεάν WiFi hotspot για να παραμένετε συνδεδεμένοι κατά τη διάρκεια της διαδρομής"
      : "Free WiFi hotspot to stay connected during your journey",
    ac: isGreek
      ? "Πλήρης κλιματισμός με ατομικό έλεγχο για μέγιστη άνεση"
      : "Full climate control with individual settings for maximum comfort",
    meetGreet: isGreek
      ? "Ο οδηγός σας περιμένει με πινακίδα με το όνομά σας στην αίθουσα αφίξεων"
      : "Your driver waits with a name sign at the arrivals hall",
    flightTracking: isGreek
      ? "Παρακολουθούμε την πτήση σας σε πραγματικό χρόνο και προσαρμόζουμε την ώρα παραλαβής αν καθυστερήσει"
      : "We monitor your flight in real-time and adjust pickup time if it's delayed",
    idealFor: isGreek
      ? "Προτεινόμενο για αυτούς τους τύπους ταξιδιωτών"
      : "Recommended for these types of travelers",
  };

  const FeatureCheck = ({ available }: { available: boolean }) => (
    available ? (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent">
        <Check className="w-4 h-4" />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground">
        <X className="w-4 h-4" />
      </span>
    )
  );

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto text-center mb-16 px-4">
        <div className="section-subheading">{isGreek ? "Σύγκριση Στόλου" : "Fleet Comparison"}</div>
        <h2 className="section-heading text-balance mx-auto leading-none mb-3">
          {isGreek ? "Βρείτε το " : "Find Your Perfect "}
          <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">
            {isGreek ? "Τέλειο Όχημα" : "Vehicle"}
          </span>
        </h2>
        <p className={`text-muted-foreground text-sm md:text-base max-w-2xl mx-auto ${isGreek ? "font-medium" : ""}`}>
          {labels.subtitle}
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-4 bg-muted/50 rounded-tl-xl"></th>
              {vehicles.map((vehicle) => (
                <th key={vehicle.name} className="p-4 bg-muted/50 last:rounded-tr-xl">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                      {vehicle.icon}
                    </div>
                    <span className="font-bold text-primary text-lg">
                      {isGreek ? vehicle.nameGr : vehicle.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Passengers */}
            <FeatureRow
              label={labels.passengers}
              tooltip={tooltips.passengers}
              icon={<Users className="w-4 h-4 text-muted-foreground" />}
            >
              {vehicles.map((vehicle) => (
                <td key={vehicle.name} className="p-4 text-center">
                  <span className="text-xl font-bold text-primary">{vehicle.passengers}</span>
                </td>
              ))}
            </FeatureRow>

            {/* Luggage */}
            <FeatureRow
              label={labels.luggage}
              tooltip={tooltips.luggage}
              icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
              isAlt
            >
              {vehicles.map((vehicle) => (
                <td key={vehicle.name} className="p-4 text-center">
                  <span className="text-lg font-semibold text-foreground">{vehicle.luggage}</span>
                </td>
              ))}
            </FeatureRow>

            {/* Carry-on */}
            <FeatureRow
              label={labels.carryOn}
              tooltip={tooltips.carryOn}
              icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
            >
              {vehicles.map((vehicle) => (
                <td key={vehicle.name} className="p-4 text-center">
                  <span className="text-lg font-semibold text-foreground">{vehicle.carryOn}</span>
                </td>
              ))}
            </FeatureRow>

            {/* Child Seat */}
            <FeatureRow
              label={labels.childSeat}
              tooltip={tooltips.childSeat}
              icon={<Baby className="w-4 h-4 text-muted-foreground" />}
              isAlt
            >
              {vehicles.map((vehicle) => (
                <td key={vehicle.name} className="p-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <FeatureCheck available={vehicle.childSeat} />
                    <span className="text-xs text-muted-foreground font-medium">{labels.onRequest}</span>
                  </div>
                </td>
              ))}
            </FeatureRow>

            {/* WiFi */}
            <FeatureRow
              label={labels.wifi}
              tooltip={tooltips.wifi}
              icon={<Wifi className="w-4 h-4 text-muted-foreground" />}
            >
              {vehicles.map((vehicle) => (
                <td key={vehicle.name} className="p-4 text-center">
                  <FeatureCheck available={vehicle.wifi} />
                </td>
              ))}
            </FeatureRow>

            {/* A/C */}
            <FeatureRow
              label={labels.ac}
              tooltip={tooltips.ac}
              icon={<Snowflake className="w-4 h-4 text-muted-foreground" />}
              isAlt
            >
              {vehicles.map((vehicle) => (
                <td key={vehicle.name} className="p-4 text-center">
                  <FeatureCheck available={vehicle.ac} />
                </td>
              ))}
            </FeatureRow>

            {/* Meet & Greet */}
            <FeatureRow
              label={labels.meetGreet}
              tooltip={tooltips.meetGreet}
              icon={<UserCheck className="w-4 h-4 text-muted-foreground" />}
            >
              {vehicles.map((vehicle) => (
                <td key={vehicle.name} className="p-4 text-center">
                  <FeatureCheck available={vehicle.meetGreet} />
                </td>
              ))}
            </FeatureRow>

            {/* Flight Tracking */}
            <FeatureRow
              label={labels.flightTracking}
              tooltip={tooltips.flightTracking}
              icon={<Plane className="w-4 h-4 text-muted-foreground" />}
              isAlt
            >
              {vehicles.map((vehicle) => (
                <td key={vehicle.name} className="p-4 text-center">
                  <FeatureCheck available={vehicle.flightTracking} />
                </td>
              ))}
            </FeatureRow>

            {/* Ideal For */}
            <tr>
              <td className="p-4 font-medium text-foreground rounded-bl-xl">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help group">
                        <span>{labels.idealFor}</span>
                        <Info className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-sm">{tooltips.idealFor}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
              {vehicles.map((vehicle, index) => (
                <td key={vehicle.name} className={`p-4 text-center ${index === vehicles.length - 1 ? 'rounded-br-xl' : ''}`}>
                  <span className="text-sm text-muted-foreground">
                    {isGreek ? vehicle.idealForGr : vehicle.idealFor}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.name} className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                {vehicle.icon}
              </div>
              <div>
                <h3 className="font-bold text-primary text-lg">
                  {isGreek ? vehicle.nameGr : vehicle.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isGreek ? vehicle.idealForGr : vehicle.idealFor}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl cursor-help">
                      <Users className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">{labels.passengers}</p>
                        <p className="font-bold text-primary">{vehicle.passengers}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm max-w-xs">{tooltips.passengers}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl cursor-help">
                      <Briefcase className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">{labels.luggage}</p>
                        <p className="font-bold text-primary">{vehicle.luggage}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm max-w-xs">{tooltips.luggage}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl cursor-help">
                      <Baby className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">{labels.childSeat}</p>
                        <p className="font-medium text-muted-foreground text-xs">{labels.onRequest}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm max-w-xs">{tooltips.childSeat}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl cursor-help">
                      <Plane className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">{labels.flightTracking}</p>
                        <FeatureCheck available={vehicle.flightTracking} />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm max-w-xs">{tooltips.flightTracking}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleComparisonTable;
