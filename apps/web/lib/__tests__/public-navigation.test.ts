import { describe, expect, it } from 'vitest';
import { navItems } from '../../app/components/public';

describe('Public Navigation Contract', () => {
  it('exposes the approved 5 public routes in exact specification order', () => {
    expect(navItems).toEqual([
      ['Product', '/product'],
      ['Security', '/security'],
      ['Specification', '/specification'],
      ['Pricing', '/pricing'],
      ['Docs', '/docs'],
    ]);
  });

  it('contains valid and secure relative routes', () => {
    for (const [label, href] of navItems) {
      expect(label.length).toBeGreaterThan(0);
      expect(href.startsWith('/')).toBe(true);
      expect(href.includes('..')).toBe(false);
    }
  });
});
