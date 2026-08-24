import { describe, expect, it } from 'vitest';
import { packagingTiers, prelaunchPrinciples } from '../pricing-data';

describe('Public Pricing & Pre-Launch Page Contracts', () => {
  it('defines the three conceptual packaging operating modes without fabricated prices', () => {
    expect(packagingTiers).toHaveLength(3);
    expect(packagingTiers.map((t) => t.name)).toEqual([
      'Local / Community',
      'Team Cloud',
      'Enterprise / Private',
    ]);

    // Ensure no fabricated pricing numbers ($9, $29, $99, etc.)
    for (const tier of packagingTiers) {
      expect(tier.licensingStatus).not.toMatch(/\$\d+/);
      expect(tier.currentAvailability).not.toMatch(/\$\d+/);
    }
  });

  it('explicitly guarantees source code exclusion and data boundary in each mode', () => {
    const local = packagingTiers.find((t) => t.id === 'local-community');
    expect(local?.dataBoundary).toContain('100% on-device');
    expect(local?.currentAvailability).toContain('Available now');

    const team = packagingTiers.find((t) => t.id === 'team-cloud');
    expect(team?.dataBoundary).toContain('zero raw source code stored');
    expect(team?.currentAvailability).toContain('No checkout');

    const enterprise = packagingTiers.find((t) => t.id === 'enterprise-private');
    expect(enterprise?.dataBoundary).toContain('Self-hosted control plane');
  });

  it('articulates clear status tags for neutral semantic communication', () => {
    const statuses = packagingTiers.map((t) => t.statusTag);
    expect(statuses).toContain('Active Local Reference');
    expect(statuses).toContain('Validation in Progress');
    expect(statuses).toContain('Partner Validation');
  });

  it('defines pre-launch commercial principles ensuring no lock-in and open specification', () => {
    expect(prelaunchPrinciples).toHaveLength(3);
    const titles = prelaunchPrinciples.map((p) => p.title);
    expect(titles).toContain('Zero commercial gating on the `.trace` format');
    expect(titles).toContain('Evidence before monetization');
    expect(titles).toContain('No proprietary repository lock-in');

    for (const p of prelaunchPrinciples) {
      expect(p.description.length).toBeGreaterThan(30);
      expect(p.tag.length).toBeGreaterThan(0);
    }
  });
});
