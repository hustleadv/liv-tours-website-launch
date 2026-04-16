import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/PhoneInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, Users, Send, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LargeGroupContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeInfo: {
    pickup: string;
    dropoff: string;
    date: string;
    time: string;
  };
}

export function LargeGroupContactModal({ 
  open, 
  onOpenChange, 
  routeInfo 
}: LargeGroupContactModalProps) {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    groupSize: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.groupSize.trim()) {
      toast({
        title: language === 'gr' ? 'Συμπληρώστε τα απαιτούμενα πεδία' : 'Please fill required fields',
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email notification via edge function
      await supabase.functions.invoke('send-quote-email', {
        body: {
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone || undefined,
          pickup: routeInfo.pickup,
          dropoff: routeInfo.dropoff,
          date: routeInfo.date,
          time: routeInfo.time,
          passengers: formData.groupSize,
          vehicleType: 'Large Group Request',
          isLargeGroup: true,
          notes: formData.message,
        },
      });

      toast({
        title: language === 'gr' ? 'Αίτημα εστάλη!' : 'Request sent!',
        description: language === 'gr' 
          ? 'Θα επικοινωνήσουμε σύντομα μαζί σας.' 
          : 'We will contact you shortly.',
      });

      onOpenChange(false);
      setFormData({ name: "", email: "", phone: "", groupSize: "", message: "" });
    } catch (error) {
      console.error('Error sending large group request:', error);
      toast({
        title: language === 'gr' ? 'Κάτι πήγε στραβά' : 'Something went wrong',
        description: language === 'gr' 
          ? 'Παρακαλώ δοκιμάστε ξανά ή επικοινωνήστε μέσω WhatsApp.' 
          : 'Please try again or contact us via WhatsApp.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi, I need a transfer for a large group.\n\n` +
    `Route: ${routeInfo.pickup} → ${routeInfo.dropoff}\n` +
    `Date: ${routeInfo.date || 'TBD'}\n` +
    `Time: ${routeInfo.time || 'TBD'}\n` +
    `Group Size: ${formData.groupSize || '12+'}`
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            {language === 'gr' ? 'Αίτημα για Μεγάλη Ομάδα' : 'Large Group Request'}
          </DialogTitle>
          <DialogDescription>
            {language === 'gr' 
              ? 'Για ομάδες άνω των 11 ατόμων, κανονίζουμε πολλαπλά οχήματα. Συμπληρώστε τα στοιχεία σας και θα επικοινωνήσουμε με προσφορά.' 
              : 'For groups over 11, we arrange multiple vehicles. Fill in your details and we\'ll send you a quote.'}
          </DialogDescription>
        </DialogHeader>

        {/* Route Summary */}
        <div className="p-3 rounded-lg bg-muted/50 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium text-foreground">{routeInfo.pickup}</span>
            <span>→</span>
            <span className="font-medium text-foreground">{routeInfo.dropoff}</span>
          </div>
          {(routeInfo.date || routeInfo.time) && (
            <div className="text-xs text-muted-foreground mt-1">
              {routeInfo.date && <span>{routeInfo.date}</span>}
              {routeInfo.date && routeInfo.time && <span> • </span>}
              {routeInfo.time && <span>{routeInfo.time}</span>}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="lg-name" className="text-sm font-medium">
                {language === 'gr' ? 'Όνομα' : 'Name'} *
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="lg-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  placeholder={language === 'gr' ? 'Το όνομά σας' : 'Your name'}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lg-email" className="text-sm font-medium">
                Email *
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="lg-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lg-phone" className="text-sm font-medium">
                {language === 'gr' ? 'Τηλέφωνο' : 'Phone'}
              </Label>
              <div className="mt-1">
                <PhoneInput
                  id="lg-phone"
                  value={formData.phone}
                  onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                  placeholder="XXX XXX XXXX"
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="lg-groupSize" className="text-sm font-medium">
                {language === 'gr' ? 'Μέγεθος Ομάδας' : 'Group Size'} *
              </Label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="lg-groupSize"
                  value={formData.groupSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, groupSize: e.target.value }))}
                  className="pl-10"
                  placeholder={language === 'gr' ? 'π.χ. 15 άτομα' : 'e.g. 15 people'}
                  required
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="lg-message" className="text-sm font-medium">
                {language === 'gr' ? 'Επιπλέον Σχόλια' : 'Additional Notes'}
              </Label>
              <Textarea
                id="lg-message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="mt-1 resize-none"
                rows={2}
                placeholder={language === 'gr' 
                  ? 'Ειδικές απαιτήσεις, αποσκευές κ.λπ.' 
                  : 'Special requirements, luggage, etc.'}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {language === 'gr' ? 'Αποστολή...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'gr' ? 'Αποστολή Αιτήματος' : 'Send Request'}
                </>
              )}
            </Button>
            <a
              href={`https://wa.me/306944363525?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white font-medium hover:bg-[#22c55e] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}