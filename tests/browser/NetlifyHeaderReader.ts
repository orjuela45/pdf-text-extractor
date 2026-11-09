export interface HeaderRule {
  readonly pattern: string;
  readonly values: Readonly<Record<string, string>>;
}

export class NetlifyHeaderReader {
  private readonly source: string;

  constructor(source: string) {
    this.source = source;
  }

  rules(): HeaderRule[] {
    const rules: HeaderRule[] = [];
    let current: { pattern: string; values: Record<string, string> } | null = null;
    let inValues = false;

    for (const rawLine of this.source.split('\n')) {
      const line = rawLine.trim();

      if (line === '[[headers]]') {
        current = { pattern: '', values: {} };
        rules.push(current);
        inValues = false;
        continue;
      }

      if (current === null) {
        continue;
      }

      if (line === '[headers.values]') {
        inValues = true;
        continue;
      }

      const separator = line.indexOf('=');

      if (separator === -1) {
        continue;
      }

      const key = line.slice(0, separator).trim();
      const value = line
        .slice(separator + 1)
        .trim()
        .replace(/^"|"$/g, '');

      if (!inValues && key === 'for') {
        current.pattern = value;
        continue;
      }

      if (inValues) {
        current.values[key] = value;
      }
    }

    return rules.filter((rule) => rule.pattern !== '');
  }

  valuesFor(pathname: string): Record<string, string> {
    const values: Record<string, string> = {};

    for (const rule of this.rules()) {
      if (this.matches(rule.pattern, pathname)) {
        Object.assign(values, rule.values);
      }
    }

    return values;
  }

  private matches(pattern: string, pathname: string): boolean {
    if (pattern === '/*') {
      return true;
    }

    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }

    return pathname === pattern;
  }
}
