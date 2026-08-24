import { describe, expect, it } from 'vitest';
import {
  notClaimedPoints,
  securityMatrix,
  trustBoundaryGates,
  trustBoundaryNodes,
} from '../security-data';

describe('Public Security & Privacy Page Contracts', () => {
  it('preserves the three-stage trust-boundary sequence', () => {
    expect(trustBoundaryNodes).toHaveLength(3);
    expect(trustBoundaryNodes.map((n) => n.title)).toEqual([
      'Local Repository & CLI',
      'Approved Record Boundary',
      'TRACE Dashboard',
    ]);
  });

  it('enforces explicit data transmission perimeter gates', () => {
    expect(trustBoundaryGates).toHaveLength(3);
    expect(trustBoundaryGates.map((g) => g.label)).toEqual([
      'sourceCodeIncluded: false',
      'codeSnippetsIncluded: false',
      'Secrets & Prompts Redacted',
    ]);
  });

  it('maps the four security boundaries to explicit current behaviors and exclusions', () => {
    expect(securityMatrix).toHaveLength(4);
    expect(securityMatrix.map((m) => m.title)).toEqual([
      'Local mode',
      'Cloud mode',
      'Secrets',
      'Planned controls',
    ]);

    for (const item of securityMatrix) {
      expect(item.boundary.length).toBeGreaterThan(0);
      expect(item.iconTag.length).toBeGreaterThan(0);
      expect(item.currentBehavior.length).toBeGreaterThan(20);
      expect(item.excludedNotClaimed.length).toBeGreaterThan(20);
      expect(item.invariantStatus.length).toBeGreaterThan(0);
    }
  });

  it('explicitly specifies non-claimed items without ambiguous assurances', () => {
    expect(notClaimedPoints).toHaveLength(4);
    expect(notClaimedPoints.map((p) => p.label)).toEqual([
      'No external compliance certifications',
      'No zero-retention third-party claims',
      'No absolute vulnerability immunity',
      'No developer surveillance metrics',
    ]);

    for (const point of notClaimedPoints) {
      expect(point.detail.length).toBeGreaterThan(15);
    }
  });

  it('guarantees zero raw source transmission and zero developer surveillance invariants', () => {
    const local = securityMatrix.find((m) => m.title === 'Local mode');
    expect(local?.invariantStatus).toContain('0 bytes source transmitted');

    const secrets = securityMatrix.find((m) => m.title === 'Secrets');
    expect(secrets?.invariantStatus).toContain('Zero secret persistence');

    const surveillance = notClaimedPoints.find((p) =>
      p.label.includes('surveillance')
    );
    expect(surveillance?.detail).toContain('productivity scoring');
  });
});
