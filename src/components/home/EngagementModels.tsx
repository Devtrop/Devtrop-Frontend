import Link from 'next/link'
import { Check } from "lucide-react";
import { SectionContainer } from "@/components/shared/layout/SectionContainer";
import { SectionHeading } from "@/components/shared/layout/SectionHeading";
import { ENGAGEMENT_CONTENT } from "@/data/engagement";

export function EngagementModels() {
  const { sectionNumber, sectionLabel, headline, subhead, models } = ENGAGEMENT_CONTENT;

  return (
    <section className="border-b-4 border-display" id="engagement">
      <SectionContainer className="py-20 lg:py-28">
        <SectionHeading
          sectionNumber={sectionNumber}
          sectionLabel={sectionLabel}
          headline={headline}
          subhead={subhead}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-2 border-display">
          {models.map((model, i) => (
            <div
              key={model.title}
              className={`relative p-8 sm:p-10 flex flex-col justify-between ${
                model.isPopular ? "bg-display text-inverse" : "bg-canvas text-display"
              } ${i < models.length - 1 ? "border-b-2 lg:border-b-0 lg:border-r-2 border-display" : ""}`}
            >
              {model.isPopular && (
                <div className="absolute top-0 right-0 bg-accent px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-inverse">
                  MOST POPULAR
                </div>
              )}

              <div>
                <span className={`text-xs font-bold uppercase tracking-[0.15em] ${model.isPopular ? "text-accent" : "text-muted"}`}>
                  {model.audience}
                </span>

                <h3 className={`mt-3 text-2xl font-black uppercase tracking-tight leading-tight ${model.isPopular ? "text-inverse" : "text-display"}`}>
                  {model.title}
                </h3>

                <p className={`mt-4 text-xs leading-relaxed ${model.isPopular ? "text-inverse/70" : "text-muted"}`}>
                  {model.description}
                </p>

                <div className={`my-8 h-px ${model.isPopular ? "bg-white/10" : "bg-black/10"}`} />

                <ul className="space-y-3">
                  {model.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-xs font-medium">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
                      <span className={model.isPopular ? "text-inverse/80" : "text-display/80"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10">
                <Link
                  href="/packages"
                  className={`block w-full text-center px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                    model.isPopular
                      ? "bg-accent text-inverse hover:bg-accent-hover"
                      : "bg-display text-inverse hover:bg-accent"
                  }`}
                >
                  {model.ctaLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

export default EngagementModels;
