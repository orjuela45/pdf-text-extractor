import { INTRO_STEPS } from './constants';
import type { ExtractionStatus } from './models';

export interface IntroStepsProps {
  readonly status: ExtractionStatus;
}

export function IntroSteps({ status }: IntroStepsProps) {
  const current = status === 'idle' ? 0 : status === 'loading' ? 1 : 2;

  return (
    <ol aria-label="Pasos" className="flex items-stretch gap-2">
      {INTRO_STEPS.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'active' : 'waiting';

        return (
          <li key={step.label} className="flex-1">
            <div
              aria-current={state === 'active' ? 'step' : undefined}
              className={`glass flex h-full flex-col gap-1 rounded-lg p-3 transition-all duration-500 ${
                state === 'active' ? 'ring-2 ring-primary-container' : ''
              } ${state === 'waiting' ? 'opacity-60' : 'opacity-100'}`}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs font-medium transition-colors duration-500 ${
                    state === 'waiting'
                      ? 'bg-surface-container text-on-surface-variant'
                      : 'bg-primary-container text-on-primary'
                  }`}
                >
                  {state === 'done' ? '✓' : index + 1}
                </span>
                <span className="font-sans text-xs font-semibold text-on-surface">
                  {step.label}
                </span>
              </span>
              <span className="text-[0.6875rem] leading-relaxed text-on-surface-variant">
                {step.detail}
              </span>
              <span
                aria-hidden="true"
                className={`mt-auto h-0.5 rounded-full transition-all duration-700 ${
                  state === 'active'
                    ? 'w-full animate-pulse bg-primary-container'
                    : state === 'done'
                      ? 'w-full bg-primary-container/50'
                      : 'w-0 bg-transparent'
                }`}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
