import { useState } from "react";
import { Share2, MessageCircle, Facebook, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  url: string;
  teaser?: string;
}

const ShareButtons = ({ title, url, teaser }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareText = teaser 
    ? `${title} - ${teaser}` 
    : title;

  // Check if mobile device (more reliable than just checking navigator.share)
  const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  // Check if native Web Share API is available AND we're on mobile
  const canUseNativeShare = isMobile && typeof navigator !== "undefined" && !!navigator.share;

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: shareText,
        url: url,
      });
    } catch (err) {
      // User cancelled or share failed - fallback to popover
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
        // Show popover as fallback
        setIsOpen(true);
      }
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${url}`)}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The tour link has been copied to your clipboard.",
      });
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  // On mobile with native share support, use native share directly
  if (canUseNativeShare) {
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full w-10 h-10 backdrop-blur-md bg-background/80 hover:bg-background/90 border-border/50"
        onClick={handleNativeShare}
      >
        <Share2 className="w-4 h-4" />
        <span className="sr-only">Share this tour</span>
      </Button>
    );
  }

  // Fallback for desktop: show popover with share options
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full w-10 h-10 backdrop-blur-md bg-background/80 hover:bg-background/90 border-border/50"
        >
          <Share2 className="w-4 h-4" />
          <span className="sr-only">Share this tour</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-2" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center gap-2">
          {/* WhatsApp */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 hover:bg-green-500/10 hover:text-green-600"
            onClick={handleWhatsAppShare}
            title="Share on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="sr-only">Share on WhatsApp</span>
          </Button>

          {/* Facebook */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 hover:bg-blue-500/10 hover:text-blue-600"
            onClick={handleFacebookShare}
            title="Share on Facebook"
          >
            <Facebook className="w-5 h-5" />
            <span className="sr-only">Share on Facebook</span>
          </Button>

          {/* Copy Link */}
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full w-10 h-10 transition-colors ${
              copied 
                ? "bg-green-500/10 text-green-600" 
                : "hover:bg-accent/10 hover:text-accent"
            }`}
            onClick={handleCopyLink}
            title="Copy link"
          >
            {copied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Link2 className="w-5 h-5" />
            )}
            <span className="sr-only">Copy link</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButtons;
