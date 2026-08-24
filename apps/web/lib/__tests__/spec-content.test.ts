import { describe, expect, it } from 'vitest';
import {
  artifactRelationships,
  specLifecycleNodes,
  specQuestions,
} from '../spec-data';

describe('Public .trace Specification Page Contracts', () => {
  it('preserves the four-stage lifecycle sequence', () => {
    expect(specLifecycleNodes).toHaveLength(4);
    expect(specLifecycleNodes.map((n) => n.title)).toEqual([
      'Local Analysis',
      'Approved .trace Artifact',
      'Optional Sync',
      'Dashboard Projection',
    ]);
  });

  it('guarantees source exclusion and local persistence invariants in lifecycle', () => {
    const analysis = specLifecycleNodes.find((n) => n.title === 'Local Analysis');
    expect(analysis?.boundaryNote).toContain('Raw source stays on local disk');

    const sync = specLifecycleNodes.find((n) => n.title === 'Optional Sync');
    expect(sync?.boundaryNote).toContain('sourceCodeIncluded: false');

    const projection = specLifecycleNodes.find((n) => n.title === 'Dashboard Projection');
    expect(projection?.boundaryNote).toContain('Ephemeral presentation layer');
  });

  it('defines the core .trace versioned directory structure', () => {
    expect(artifactRelationships).toHaveLength(6);
    const paths = artifactRelationships.map((a) => a.path);
    expect(paths).toContain('.trace/config.yml');
    expect(paths).toContain('.trace/pull-requests/142.md');
    expect(paths).toContain('.trace/reports/daily/2026-08-20.md');
    expect(paths).toContain('.trace/decisions/DEC-2026-0042.md');
    expect(paths).toContain('.trace/risks/RISK-2026-0017.md');
    expect(paths).toContain('.trace/state/sync.json');

    for (const rel of artifactRelationships) {
      expect(rel.name.length).toBeGreaterThan(0);
      expect(rel.role.length).toBeGreaterThan(15);
      expect(rel.upstream.length).toBeGreaterThan(5);
      expect(rel.downstream.length).toBeGreaterThan(5);
    }
  });

  it('answers the four core architectural questions with code snippets', () => {
    expect(specQuestions).toHaveLength(4);
    expect(specQuestions.map((q) => q.title)).toEqual([
      'What it holds',
      'How it relates',
      'How it travels',
      'Current state',
    ]);

    for (const q of specQuestions) {
      expect(q.number).toMatch(/^\d{2}$/);
      expect(q.summary.length).toBeGreaterThan(20);
      expect(q.details.length).toBeGreaterThanOrEqual(3);
      expect(q.snippetTitle.length).toBeGreaterThan(0);
      expect(q.snippet.length).toBeGreaterThan(20);
    }
  });

  it('enforces schema v0.1 frontmatter standards in question snippets', () => {
    const whatItHolds = specQuestions.find((q) => q.id === 'what-it-holds');
    expect(whatItHolds?.snippet).toContain('schema_version: "0.1.0"');
    expect(whatItHolds?.snippet).toContain('source_code_included: false');

    const howItTravels = specQuestions.find((q) => q.id === 'how-it-travels');
    expect(howItTravels?.snippet).toContain('"sourceCodeIncluded": false');
    expect(howItTravels?.snippet).toContain('"secretsIncluded": false');
  });
});
