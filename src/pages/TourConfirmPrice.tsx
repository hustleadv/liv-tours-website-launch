import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Calendar, Users, MapPin, Clock, CreditCard, X, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import Layout from "@/components/Layout";
import { Textarea } from "@/components/ui/textarea";

interface TourRequest {
  id: string;
  request_id: string;
  customer_name: string | null;
  customer_email: string;
  itinerary_title: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  group_size: string | null;
  duration: string | null;
  pickup_area: string | null;
  final_price: number | null;
  estimated_total: number | null;
  status: string;
  price_confirmed_at: string | null;
}

const TourConfirmPrice = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [tourRequest, setTourRequest] = useState<TourRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Μη έγκυρος σύνδεσμος επιβεβαίωσης");
      setIsLoading(false);
      return;
    }

    fetchTourRequest();
  }, [token]);

  const fetchTourRequest = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("tour_requests")
        .select("*")
        .eq("confirmation_token", token)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("Δεν βρέθηκε το αίτημα εκδρομής ή ο σύνδεσμος έχει λήξει");
        setIsLoading(false);
        return;
      }

      // Check if already confirmed or declined
      if (data.price_confirmed_at || data.status === 'confirmed') {
        setIsConfirmed(true);
      } else if (data.status === 'declined') {
        setIsDeclined(true);
      }

      setTourRequest(data);
    } catch (err) {
      console.error("Error fetching tour request:", err);
      setError("Σφάλμα κατά την ανάκτηση του αιτήματος");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPrice = async () => {
    if (!tourRequest) return;

    setIsConfirming(true);
    try {
      const { error: updateError } = await supabase
        .from("tour_requests")
        .update({
          price_confirmed_at: new Date().toISOString(),
          status: "confirmed",
          confirmed_at: new Date().toISOString()
        })
        .eq("id", tourRequest.id);

      if (updateError) throw updateError;

      setIsConfirmed(true);
      toast({
        title: "Επιβεβαίωση επιτυχής!",
        description: "Η τιμή επιβεβαιώθηκε. Μπορείτε τώρα να προχωρήσετε στην πληρωμή.",
      });
    } catch (err) {
      console.error("Error confirming price:", err);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία επιβεβαίωσης τιμής. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDeclinePrice = async () => {
    if (!tourRequest) return;

    setIsDeclining(true);
    try {
      const { error: updateError } = await supabase
        .from("tour_requests")
        .update({
          status: "declined",
          admin_notes: declineReason ? `Λόγος απόρριψης: ${declineReason}` : "Ο πελάτης απέρριψε την τιμή"
        })
        .eq("id", tourRequest.id);

      if (updateError) throw updateError;

      setIsDeclined(true);
      toast({
        title: "Η τιμή απορρίφθηκε",
        description: "Θα επικοινωνήσουμε σύντομα μαζί σας.",
      });
    } catch (err) {
      console.error("Error declining price:", err);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία απόρριψης. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const handlePayDeposit = async () => {
    if (!tourRequest || !tourRequest.final_price) return;

    try {
      const depositAmount = Math.round(tourRequest.final_price * 0.30);
      
      const { data, error } = await supabase.functions.invoke("create-tour-deposit", {
        body: {
          tourRequestId: tourRequest.id,
          amount: depositAmount,
          customerEmail: tourRequest.customer_email,
          customerName: tourRequest.customer_name,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error creating payment:", err);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία δημιουργίας πληρωμής. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <SEOHead title="Σφάλμα | LIV Tours" description="Σφάλμα επιβεβαίωσης" noindex={true} />
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full p-8 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Σφάλμα</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Επιστροφή στην αρχική
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!tourRequest) return null;

  const finalPrice = tourRequest.final_price || 0;
  const depositAmount = Math.round(finalPrice * 0.30);

  return (
    <Layout>
      <SEOHead 
        title="Επιβεβαίωση Τιμής Εκδρομής | LIV Tours" 
        description="Επιβεβαιώστε την τιμή της εκδρομής σας"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isConfirmed ? "Τιμή Επιβεβαιωμένη!" : "Επιβεβαίωση Τιμής Εκδρομής"}
            </h1>
            <p className="text-muted-foreground">
              {isConfirmed 
                ? "Μπορείτε τώρα να προχωρήσετε στην πληρωμή της προκαταβολής"
                : "Ελέγξτε την τελική τιμή και επιβεβαιώστε για να συνεχίσετε"
              }
            </p>
          </div>

          {/* Tour Details Card */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-primary/10 px-6 py-4 border-b">
              <h2 className="font-semibold text-foreground">Στοιχεία Εκδρομής</h2>
              <p className="text-sm text-muted-foreground">#{tourRequest.request_id}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {tourRequest.itinerary_title && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Εκδρομή</p>
                    <p className="font-medium">{tourRequest.itinerary_title}</p>
                  </div>
                </div>
              )}

              {tourRequest.preferred_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ημερομηνία</p>
                    <p className="font-medium">{tourRequest.preferred_date}</p>
                  </div>
                </div>
              )}

              {tourRequest.group_size && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Άτομα</p>
                    <p className="font-medium">{tourRequest.group_size}</p>
                  </div>
                </div>
              )}

              {tourRequest.duration && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Διάρκεια</p>
                    <p className="font-medium">{tourRequest.duration}</p>
                  </div>
                </div>
              )}

              {tourRequest.pickup_area && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Παραλαβή από</p>
                    <p className="font-medium">{tourRequest.pickup_area}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Price Card */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center text-white">
              <p className="text-sm uppercase tracking-wider opacity-90 mb-2">Τελική Τιμή</p>
              <p className="text-5xl font-bold mb-2">€{finalPrice}</p>
              <p className="text-sm opacity-80">
                Προκαταβολή 30%: €{depositAmount}
              </p>
            </div>

            <div className="p-6">
              {isDeclined ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-destructive mb-4">
                    <XCircle className="w-6 h-6" />
                    <span className="font-semibold">Η τιμή απορρίφθηκε</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Θα επικοινωνήσουμε μαζί σας για εναλλακτικές επιλογές.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => window.open("https://wa.me/306944363525", "_blank")}
                    className="w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Επικοινωνήστε μαζί μας
                  </Button>
                </div>
              ) : !isConfirmed ? (
                <>
                  <p className="text-center text-muted-foreground mb-6">
                    Επιβεβαιώστε ότι αποδέχεστε την τιμή για να συνεχίσετε
                  </p>
                  
                  {!showDeclineForm ? (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleConfirmPrice}
                        disabled={isConfirming || isDeclining}
                        className="w-full h-14 text-lg"
                        variant="hero"
                      >
                        {isConfirming ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Επιβεβαίωση...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Αποδέχομαι την Τιμή
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        onClick={() => setShowDeclineForm(true)}
                        disabled={isConfirming || isDeclining}
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Δεν αποδέχομαι την τιμή
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <p className="text-sm font-medium text-destructive mb-3">
                          Θέλετε να απορρίψετε την τιμή;
                        </p>
                        <Textarea
                          placeholder="Πείτε μας τον λόγο (προαιρετικά)..."
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          className="mb-3"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleDeclinePrice}
                            disabled={isDeclining}
                            variant="destructive"
                            className="flex-1"
                          >
                            {isDeclining ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Απόρριψη"
                            )}
                          </Button>
                          <Button
                            onClick={() => setShowDeclineForm(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Ακύρωση
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-emerald-600 mb-6">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-semibold">Η τιμή επιβεβαιώθηκε!</span>
                  </div>
                  
                  <Button 
                    onClick={handlePayDeposit}
                    className="w-full h-14 text-lg"
                    variant="hero"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Πληρωμή Προκαταβολής €{depositAmount}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Η πληρωμή γίνεται με ασφάλεια μέσω Stripe
                  </p>
                </>
              )}
            </div>
          </Card>

          {/* Contact Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Χρειάζεστε βοήθεια;</p>
            <p>
              <a href="mailto:info@liv-tours.com" className="text-primary hover:underline">
                info@liv-tours.com
              </a>
              {" • "}
              <a href="https://wa.me/306944363525" className="text-primary hover:underline">
                WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TourConfirmPrice;
