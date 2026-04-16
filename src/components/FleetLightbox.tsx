import { useEffect, useState, useCallback } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FleetImage {
  src: string;
  alt: string;
  label?: string;
  className?: string;
}

interface FleetLightboxProps {
  images: FleetImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const FleetLightbox = ({ images, currentIndex, isOpen, onClose, onNavigate }: FleetLightboxProps) => {
  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentImage) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation - Previous */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Navigation - Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Main image */}
      <div 
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className={cn("max-w-full max-h-[85vh] object-contain rounded-lg animate-scale-in", currentImage.className)}
        />

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-lg">
          <div className="flex items-center justify-between">
            <p className="text-white font-medium">{currentImage.alt}</p>
            {images.length > 1 && (
              <span className="text-white/70 text-sm">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
          {currentImage.label && (
            <p className="text-white/70 text-sm mt-1">{currentImage.label}</p>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(idx);
              }}
              className={cn(
                "w-12 h-8 rounded overflow-hidden border-2 transition-all",
                idx === currentIndex 
                  ? "border-accent scale-110" 
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={img.src}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Fleet gallery component with thumbnails
export const FleetGallery = ({ 
  images,
  vehicleName,
  className 
}: { 
  images: FleetImage[];
  vehicleName: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeThumb, setActiveThumb] = useState(0);

  const mainImage = images[activeThumb];

  return (
    <>
      <div className={cn("relative", className)}>
        {/* Main image with fixed aspect ratio */}
        <div 
          className="relative cursor-pointer group aspect-[4/3] overflow-hidden"
          onClick={() => {
            setCurrentIndex(activeThumb);
            setIsOpen(true);
          }}
        >
          <img
            src={mainImage.src}
            alt={mainImage.alt}
            className={cn("absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105", mainImage.className)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <ZoomIn className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveThumb(idx);
                }}
                className={cn(
                  "w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shadow-md",
                  idx === activeThumb 
                    ? "border-accent ring-2 ring-accent/50" 
                    : "border-white/50 opacity-80 hover:opacity-100 hover:border-white"
                )}
              >
                <img
                  src={img.src}
                  alt={img.label || `${vehicleName} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <FleetLightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNavigate={setCurrentIndex}
      />
    </>
  );
};

export default FleetLightbox;
