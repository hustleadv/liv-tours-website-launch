import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface PageHeroProps {
  /** Short eyebrow label above the title */
  label?: string;
  /** Main h1 title */
  title: string;
  /** Highlighted/gradient part of the title (renders as second line) */
  titleAccent?: string;
  /** Subtitle below the title */
  subtitle?: string;
  /** Background image URL */
  image?: string;
  /** Icon shown in the eyebrow pill */
  icon?: LucideIcon;
  /** Extra content rendered below subtitle (e.g. CTA buttons, stat pills) */
  children?: ReactNode;
  /** Overlay darkness — 'light' | 'medium' | 'dark' */
  overlay?: "light" | "medium" | "dark";
  /** Alignment of content — 'left' | 'center' */
  align?: "left" | "center";
  /** Compact height (for simple info pages) */
  compact?: boolean;
  /** Content to show on the right side (only when align="left") */
  sideContent?: ReactNode;
  /** Use the signature serif italic styling for the title accent */
  serifAccent?: boolean;
}

const overlayMap = {
  light:  "from-primary/60 via-primary/40 to-primary/30",
  medium: "from-primary/85 via-primary/70 to-primary/50",
  dark:   "from-primary/95 via-primary/85 to-primary/70",
};

const PageHero = ({
  label,
  title,
  titleAccent,
  subtitle,
  image,
  icon: Icon,
  children,
  overlay = "dark",
  align = "center",
  compact = false,
  sideContent,
  serifAccent = false,
}: PageHeroProps) => {
  const isCenter = align === "center";

  return (
    <section
      className={`relative flex items-center overflow-hidden ${
        compact ? "min-h-[50vh]" : "min-h-[65vh] md:min-h-[70vh] xl:min-h-[75vh]"
      }`}
      aria-label={title}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {image ? (
          <img
            src={image}
            alt=""
            role="presentation"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-primary" />
        )}
        {/* Cinematic overlays for maximum contrast */}
        <div className="absolute inset-0 bg-slate-950/40" aria-hidden="true" />
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-transparent ${image ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-r ${overlayMap[overlay]} ${image ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
        {/* Atmospheric glow */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-olive/15 rounded-full blur-[100px] pointer-events-none"
          aria-hidden="true"
        />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className={`container-wide relative z-10 py-20 lg:py-28 ${compact ? "py-16" : ""}`}>
        <div className={sideContent && !isCenter ? "grid lg:grid-cols-12 gap-12 items-center" : ""}>
          <div className={`${sideContent && !isCenter ? "lg:col-span-7" : "max-w-3xl"} ${isCenter ? "mx-auto text-center" : ""}`}>
            {/* Eyebrow label */}
            {(label || Icon) && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 bg-accent/10 backdrop-blur-md rounded-full mb-6 border border-accent/20 ${
                  isCenter ? "mx-auto" : ""
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-accent" aria-hidden="true" />}
                {label && (
                  <span className={`text-[10px] md:text-xs font-bold ${image ? "text-white/90" : "text-primary-foreground"} uppercase tracking-widest`}>
                    {label}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-5 ${
                image ? "text-white" : "text-primary-foreground"
              } ${
                titleAccent ? "" : "mb-6"
              }`}
            >
              {title}
              {titleAccent && (
                <span className={`block mt-2 py-2 -my-2 ${
                  serifAccent 
                    ? "text-accent italic font-serif underline decoration-accent/20 underline-offset-8" 
                    : "bg-gradient-to-r from-accent via-lime to-accent bg-clip-text text-transparent"
                } leading-[1.2]`}>
                  {titleAccent}
                </span>
              )}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className={`text-lg md:text-xl leading-relaxed mb-8 max-w-2xl ${
                image ? "text-white/75" : "text-primary-foreground/75"
              }`}>
                {subtitle}
              </p>
            )}

            {/* Extra content slot (buttons, pills, etc.) */}
            {children && <div className="mt-2">{children}</div>}
          </div>

          {/* Right Content (Desktop Only) */}
          {sideContent && !isCenter && (
            <div className="lg:col-span-5 hidden lg:block animate-fade-in">
              {sideContent}
            </div>
          )}
        </div>
      </div>


    </section>
  );
};

export default PageHero;
