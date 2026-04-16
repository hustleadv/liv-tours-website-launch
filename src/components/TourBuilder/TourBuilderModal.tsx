import { useState } from "react";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import TourBuilderWizard from "./TourBuilderWizard";
import { trackEvent } from "@/lib/tracking";

interface TourBuilderModalProps {
  trigger?: React.ReactNode;
  variant?: "hero" | "outline" | "default";
}

const TourBuilderModal = ({ trigger, variant = "hero" }: TourBuilderModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    trackEvent('tour_builder_open' as any);
    setIsOpen(true);
  };

  const defaultTrigger = (
    <Button variant={variant} size="xl" onClick={handleOpen}>
      <Compass className="w-5 h-5" />
      Build Your Tour
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <TourBuilderWizard 
          isModal 
          onClose={() => setIsOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default TourBuilderModal;
