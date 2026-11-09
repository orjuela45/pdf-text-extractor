import { HERO_BADGE, HERO_FEATURES, HERO_HEADLINE, HERO_NOTE, HERO_SUBHEAD } from './constants';

export function HeroPanel() {
  return (
    <header className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 pt-6 text-center">
      <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-medium text-on-surface-variant">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-container" />
        {HERO_BADGE}
      </span>

      <h1 className="font-serif text-3xl leading-tight font-medium text-balance text-on-surface sm:text-4xl">
        {HERO_HEADLINE}
      </h1>

      <p className="max-w-xl text-sm leading-relaxed text-pretty text-on-surface-variant">
        {HERO_SUBHEAD}
      </p>

      <ul className="flex flex-wrap justify-center gap-2">
        {HERO_FEATURES.map((feature) => (
          <li
            key={feature.label}
            className="glass rounded-full px-3 py-1 text-xs text-on-surface-variant"
          >
            {feature.label}
          </li>
        ))}
      </ul>

      <p className="text-xs text-on-surface-variant">{HERO_NOTE}</p>
    </header>
  );
}
