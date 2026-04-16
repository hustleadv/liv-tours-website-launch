import { cn } from "@/lib/utils";

interface HamburgerIconProps {
  isOpen: boolean;
  className?: string;
}

const HamburgerIcon = ({ isOpen, className }: HamburgerIconProps) => {
  return (
    <div className={cn("relative w-6 h-5 flex flex-col justify-between", className)}>
      <span
        className={cn(
          "block h-0.5 w-full bg-foreground rounded-full transition-all duration-300 ease-out origin-center",
          isOpen && "rotate-45 translate-y-[9px]"
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-full bg-foreground rounded-full transition-all duration-200 ease-out",
          isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-full bg-foreground rounded-full transition-all duration-300 ease-out origin-center",
          isOpen && "-rotate-45 -translate-y-[9px]"
        )}
      />
    </div>
  );
};

export default HamburgerIcon;
