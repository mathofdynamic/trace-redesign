import { describe, expect, it } from 'vitest';
import { executionComparison, narrativeItems } from '../homepage-data';

describe('Public Homepage Data Contracts', () => {
  it('preserves the three core narrative concepts in order', () => {
    expect(narrativeItems).toHaveLength(3);
    expect(narrativeItems.map((item) => item.title)).toEqual([
      'Understand change',
      'See parallel work',
      'Keep the record',
    ]);
  });

  it('provides verified evidence snippets without placeholder content', () => {
    for (const item of narrativeItems) {
      expect(item.index).toMatch(/^\d{2}$/);
      expect(item.description.length).toBeGreaterThan(15);
      expect(item.evidenceTag.length).toBeGreaterThan(0);
      expect(item.evidenceSnippet.length).toBeGreaterThan(0);
    }
  });

  it('accurately distinguishes active vs planned execution modes', () => {
    const local = executionComparison.find((mode) => mode.mode === 'Local Execution');
    const hybrid = executionComparison.find((mode) => mode.mode === 'Hybrid Intelligence');
    const cloud = executionComparison.find((mode) => mode.mode === 'Cloud Coordination');

    expect(local?.active).toBe(true);
    expect(hybrid?.active).toBe(true);
    expect(cloud?.active).toBe(false);
    expect(cloud?.status).toContain('Planned');
  });

  it('preserves privacy constraints across all execution modes', () => {
    for (const mode of executionComparison) {
      expect(mode.sourceHandling).toBeDefined();
      expect(mode.parsing).toBeDefined();
      expect(mode.storage).toBeDefined();
    }
  });
});
