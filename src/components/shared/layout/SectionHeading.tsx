import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  sectionNumber?: string;
  sectionLabel?: string;
  headline: string;
  subhead?: string;
  id?: string;
  inverted?: boolean;
  /** Heading level for the title. Defaults to h2; use h1 for a page's primary heading. */
  as?: "h1" | "h2";
}

export function SectionHeading({ headline, subhead, id, inverted, as = "h2" }: SectionHeadingProps) {
  const Tag = as;
  return (
    <div id={id} className="mb-12 lg:mb-16">
      {/* Headline */}
      <Tag className={cn(
        "text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9]",
        inverted ? "text-inverse" : "text-display"
      )}>
        {headline}
      </Tag>

      {/* Subhead */}
      {subhead && (
        <p className={cn(
          "mt-4 text-base sm:text-lg max-w-2xl leading-relaxed",
          inverted ? "text-inverse/70" : "text-muted"
        )}>
          {subhead}
        </p>
      )}
    </div>
  );
}
