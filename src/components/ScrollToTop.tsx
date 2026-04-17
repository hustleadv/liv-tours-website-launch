import { useState, useEffect, forwardRef } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = forwardRef<HTMLButtonElement>((_, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const middleOfPage = (scrollHeight - clientHeight) / 2;
      setIsVisible(window.scrollY > middleOfPage && window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      ref={ref}
      onClick={scrollToTop}
      type="button"
      aria-label="Scroll to top of page"
      title="Scroll to top"
      className={`fixed bottom-24 left-4 sm:bottom-28 sm:left-6 z-40 h-10 w-10 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-md text-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-border/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
});

ScrollToTop.displayName = "ScrollToTop";

export default ScrollToTop;
