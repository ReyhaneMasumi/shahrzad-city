/**
 * Minimal IntersectionObserver double for jsdom. Instances self-register so
 * tests can drive visibility changes through `trigger`.
 */
export class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  static last(): MockIntersectionObserver {
    const observer = MockIntersectionObserver.instances.at(-1);
    if (observer === undefined) throw new Error('No MockIntersectionObserver was registered');
    return observer;
  }

  static reset(): void {
    MockIntersectionObserver.instances.length = 0;
  }

  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  private readonly callback: IntersectionObserverCallback;
  readonly targets = new Set<Element>();

  constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.targets.add(target);
  }

  unobserve(target: Element): void {
    this.targets.delete(target);
  }

  disconnect(): void {
    this.targets.clear();
    const index = MockIntersectionObserver.instances.indexOf(this);
    if (index >= 0) MockIntersectionObserver.instances.splice(index, 1);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(entries: Partial<IntersectionObserverEntry>[]): void {
    this.callback(entries as IntersectionObserverEntry[], this);
  }
}
