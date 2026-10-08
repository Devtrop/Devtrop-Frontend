import { ArrowUpRight } from "lucide-react";
import { SectionContainer } from "@/components/shared/layout/SectionContainer";
import { SectionHeading } from "@/components/shared/layout/SectionHeading";
import { SERVICES_CONTENT } from "@/data/services";

export function ServicesGrid() {
  const { sectionNumber, sectionLabel, headline, subhead, pillars } = SERVICES_CONTENT;

  return (
    <section className="border-b-4 border-display" id="services">
      <SectionContainer className="py-20 lg:py-28">
        <SectionHeading
          sectionNumber={sectionNumber}
          sectionLabel={sectionLabel}
          headline={headline}
          subhead={subhead}
        />

        {/* 2×2 grid with thick borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-display">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.number}
              className={`group relative p-8 sm:p-10 lg:p-12 transition-colors duration-150 hover:bg-accent ${
                i % 2 === 0 ? "md:border-r-2 border-display" : ""
              } ${i < 2 ? "border-b-2 border-display" : ""}`}
            >
              {/* Number + Arrow */}
              <div className="flex items-start justify-between mb-6">
                <span className="text-accent font-black text-lg tracking-tighter group-hover:text-inverse transition-colors duration-150">
                  {pillar.number}
                </span>
                <ArrowUpRight className="h-5 w-5 text-display/30 -rotate-45 group-hover:rotate-0 group-hover:text-inverse transition-all duration-150" />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-display leading-tight group-hover:text-inverse transition-colors duration-150">
                {pillar.title}
              </h3>

              {/* Pitch */}
              <p className="mt-3 text-sm text-muted leading-relaxed group-hover:text-inverse/70 transition-colors duration-150">
                {pillar.pitch}
              </p>

              {/* Deliverables */}
              <ul className="mt-6 space-y-2">
                {pillar.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-xs text-display/70 group-hover:text-inverse/80 transition-colors duration-150">
                    <span className="mt-1 h-1.5 w-1.5 bg-accent flex-shrink-0 group-hover:bg-inverse transition-colors duration-150" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

export default ServicesGrid;
