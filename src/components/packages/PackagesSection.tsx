import { SectionContainer } from '@/components/shared/layout/SectionContainer'
import { SectionHeading } from '@/components/shared/layout/SectionHeading'
import { PACKAGES_CONTENT, type PackagePlan, type FeatureItem } from '@/data/packages'
import { whatsappUrl, WHATSAPP_MESSAGES } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { SupportBadge } from './SupportBadge'

/** Map each package to its pre-filled WhatsApp message. */
const PACKAGE_WHATSAPP: Record<PackagePlan['id'], string> = {
  standard: WHATSAPP_MESSAGES.standard,
  premium: WHATSAPP_MESSAGES.premium,
  maintenance: WHATSAPP_MESSAGES.maintenance,
}

// ─── Reusable feature list ─────────────────────────────────────────────────────

function FeatureList({
  items,
  featured,
  /**
   * When true, items flagged premiumOnly render as struck-through with a
   * dimmed bullet — indicating they are not included in this tier.
   */
  strikeUnavailable = false,
}: {
  items: FeatureItem[]
  featured: boolean
  strikeUnavailable?: boolean
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const unavailable = strikeUnavailable && !!item.premiumOnly
        return (
          <li key={item.text} className="flex items-start gap-2.5 text-xs leading-relaxed">
            {/* Bullet */}
            <span
              className={cn(
                'mt-[5px] h-1.5 w-1.5 shrink-0',
                unavailable ? 'bg-display/20' : 'bg-accent'
              )}
            />
            {/* Text */}
            <span
              className={cn(
                unavailable
                  ? 'line-through decoration-display/30 text-display/30'
                  : featured
                    ? 'text-inverse/80'
                    : 'text-display/80'
              )}
            >
              {item.text}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// ─── Horizontal hairline ───────────────────────────────────────────────────────

function Hairline({ featured }: { featured: boolean }) {
  return <div className={cn('h-px', featured ? 'bg-white/15' : 'bg-black/10')} />
}

// ─── Top-row card (Standard & Premium) ────────────────────────────────────────

function TopPackageCard({ plan }: { plan: PackagePlan }) {
  const featured = !!plan.isFeatured
  const isStandard = plan.id === 'standard'

  return (
    <div
      className={cn(
        'flex h-full flex-col border-2 border-display',
        featured ? 'bg-display' : 'bg-canvas'
      )}
    >
      {/* Tagline strip */}
      {/* <div className="bg-accent px-5 py-2.5 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-inverse">
          {plan.tagline}
        </p>
      </div> */}

      {/* Header */}
      <div className="px-5 pt-5 pb-4 sm:px-6">
        {/* Tier label row — badge floats to the top-right */}
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'text-[12px] font-black uppercase tracking-[0.2em]',
              featured ? 'text-accent' : 'text-muted'
            )}
          >
            {plan.tier}
          </span>

          {/* Top-right support badge */}
          {plan.supportBadge && (
            <SupportBadge text={plan.supportBadge} featured={featured} />
          )}
        </div>

        <h2
          className={cn(
            'mt-1.5 text-xl font-black uppercase tracking-tight leading-tight sm:text-2xl',
            featured ? 'text-inverse' : 'text-display'
          )}
        >
          {plan.title}
        </h2>

        <p
          className={cn(
            'mt-2 text-xs leading-relaxed',
            featured ? 'text-inverse/70' : 'text-muted'
          )}
        >
          {plan.description}
        </p>
      </div>

      <Hairline featured={featured} />

      {/* What you get */}
      <div className="px-5 pt-4 pb-4 sm:px-6">
        <h3
          className={cn(
            'mb-3 text-[10px] font-black uppercase tracking-[0.2em]',
            featured ? 'text-inverse/50' : 'text-display/50'
          )}
        >
          What you get
        </h3>
        <FeatureList items={plan.whatYouGet} featured={featured} strikeUnavailable={isStandard} />
      </div>

      {/* Your exclusive benefits */}
      {plan.benefits.length > 0 && (
        <>
          <Hairline featured={featured} />
          <div className="px-5 pt-4 pb-4 sm:px-6">
            <h3
              className={cn(
                'mb-3 text-[10px] font-black uppercase tracking-[0.2em]',
                featured ? 'text-inverse/50' : 'text-display/50'
              )}
            >
              Your exclusive benefits
            </h3>
            <ul className="space-y-2">
              {plan.benefits.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed">
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 bg-accent" />
                  <span className={featured ? 'text-inverse/80' : 'text-display/80'}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* CTA */}
      <a
        href={whatsappUrl(PACKAGE_WHATSAPP[plan.id])}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'mt-auto block w-full px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider transition-colors duration-150',
          featured
            ? 'bg-accent text-inverse hover:bg-accent-hover'
            : 'bg-display text-inverse hover:bg-accent'
        )}
      >
        {plan.ctaLabel}
      </a>
    </div>
  )
}

// ─── Maintenance card (full-width) ────────────────────────────────────────────

function MaintenanceCard({ plan }: { plan: PackagePlan }) {
  return (
    <div className="flex flex-col border-2 border-display bg-canvas">
      {/* Tagline strip */}
      {/* <div className="bg-display px-5 py-2.5 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-inverse">
          {plan.tagline}
        </p>
      </div> */}

      {/* Body — stacks on mobile, side-by-side on lg */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left: header */}
        <div className="px-5 pt-5 pb-4 sm:px-6 lg:w-[38%] lg:border-r-2 lg:border-display">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            {plan.tier}
          </span>

          <h2 className="mt-1.5 text-xl font-black uppercase tracking-tight leading-tight text-display sm:text-2xl">
            {plan.title}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-muted">{plan.description}</p>

          {/* Mobile divider */}
          <div className="mt-4 h-px bg-black/10 lg:hidden" />
        </div>

        {/* Right: 2-col features */}
        <div className="px-5 pt-4 pb-4 sm:px-6 lg:w-[62%] lg:pt-5">
          <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-display/50">
            What you get
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {plan.whatYouGet.map((item) => (
              <li key={item.text} className="flex items-start gap-2.5 text-xs leading-relaxed">
                <span className="mt-[5px] h-1.5 w-1.5 shrink-0 bg-accent" />
                <span className="text-display/80">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <a
        href={whatsappUrl(PACKAGE_WHATSAPP[plan.id])}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto block w-full px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider bg-display text-inverse hover:bg-accent transition-colors duration-150"
      >
        {plan.ctaLabel}
      </a>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function PackagesSection() {
  const { sectionNumber, sectionLabel, headline, subhead, plans } = PACKAGES_CONTENT
  const topRow = plans.filter((p) => p.span !== 'full')
  const bottomRow = plans.filter((p) => p.span === 'full')

  return (
    <section className="border-b-4 border-display" id="packages">
      <SectionContainer className="py-16 lg:py-24">
        <SectionHeading
          as="h1"
          sectionNumber={sectionNumber}
          sectionLabel={sectionLabel}
          headline={headline}
          subhead={subhead}
        />

        {/* ── Top row: Standard + Premium — each is its own bordered card ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {topRow.map((plan) => (
            <TopPackageCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* ── Bottom row: Maintenance — full-width card with a gap above ── */}
        <div className="mt-4 lg:mt-6">
          {bottomRow.map((plan) => (
            <MaintenanceCard key={plan.id} plan={plan} />
          ))}
        </div>
      </SectionContainer>
    </section>
  )
}

export default PackagesSection
