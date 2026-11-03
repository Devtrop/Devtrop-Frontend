'use client'

import { useState } from 'react'
import { ESTIMATOR_PROJECT_TYPES, ESTIMATOR_SPEEDS, ESTIMATOR_MATRIX } from '@/data/hero'
import { openBooking } from '@/lib/booking'

export function ScopeEstimator() {
  const [projectType, setProjectType] = useState<string>(ESTIMATOR_PROJECT_TYPES[0])
  const [speed, setSpeed] = useState<string>(ESTIMATOR_SPEEDS[0])

  const result = ESTIMATOR_MATRIX[projectType]?.[speed]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Controls */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-display mb-6">
          Scope Estimator
        </h3>

        {/* Project Type Toggle */}
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Project Type
          </legend>
          <div className="flex flex-col gap-1" role="radiogroup" aria-label="Project type">
            {ESTIMATOR_PROJECT_TYPES.map((type) => (
              <button
                key={type}
                role="radio"
                aria-checked={projectType === type}
                onClick={() => setProjectType(type)}
                className={`text-left px-4 py-3 text-sm font-bold uppercase tracking-wide border-2 transition-colors duration-150 ${
                  projectType === type
                    ? 'bg-display text-inverse border-display'
                    : 'bg-canvas text-display border-display/20 hover:border-display'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Speed Toggle */}
        <fieldset className="mt-6">
          <legend className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Delivery Speed
          </legend>
          <div className="flex gap-1" role="radiogroup" aria-label="Delivery speed">
            {ESTIMATOR_SPEEDS.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={speed === s}
                onClick={() => setSpeed(s)}
                className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-wide border-2 transition-colors duration-150 ${
                  speed === s
                    ? 'bg-display text-inverse border-display'
                    : 'bg-canvas text-display border-display/20 hover:border-display'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Output Panel */}
      <div
        className="border-2 border-display p-6 sm:p-8 bg-subtle swiss-dots min-h-48 flex flex-col justify-between"
        aria-live="polite"
      >
        {result && (
          <>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Timeline
                </span>
                <p className="text-3xl sm:text-4xl font-black text-display tracking-tighter mt-1">
                  {result.timeline}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-display/20">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Squad
                  </span>
                  <p className="text-sm font-bold text-display mt-1">{result.squad}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Architecture
                  </span>
                  <p className="text-sm font-bold text-display mt-1">{result.architecture}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                openBooking()
              }}
              className="mt-6 w-full bg-accent px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-inverse hover:bg-accent-hover transition-all duration-150 cursor-pointer active:scale-95 active:translate-y-1 md:active:scale-100 md:active:translate-y-0"
            >
              Schedule call for this scope →
            </button>
          </>
        )}
        <p className="text-xs text-muted mt-4 tracking-wide">
          Indicative estimates — your real scope gets confirmed after the architecture review.
        </p>
      </div>
    </div>
  )
}

export default ScopeEstimator
