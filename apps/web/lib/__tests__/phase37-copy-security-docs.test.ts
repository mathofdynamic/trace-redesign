import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { sourceDocuments } from '../docs-data';
import { notClaimedPoints } from '../security-data';
import { packagingTiers } from '../pricing-data';

describe('Phase 37: Product Copy, Security Terminology & Docs Truth', () => {
  const settingsPath = path.resolve(__dirname, '../../app/(app)/app/_components/settings-view.tsx');
  const pagePath = path.resolve(__dirname, '../../app/page.tsx');
  const decisionsMockPath = path.resolve(__dirname, '../mock/decisions.ts');

  it('verifies settings terminology uses Source-Exclusion and source-isolated analysis boundaries', () => {
    const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
    expect(settingsContent).toContain('Source-Exclusion Boundary');
    expect(settingsContent).not.toContain('Zero-Knowledge Boundary');
    expect(settingsContent).toContain('source-isolated local analysis architecture');
    expect(settingsContent).not.toContain('air-gapped local AST architecture');
  });

  it('verifies marketing landing page does not claim air-gapped guarantees', () => {
    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    expect(pageContent).not.toContain('Air-gapped');
    expect(pageContent).toContain('0 Bytes (Local Analysis)');
  });

  it('verifies security and pricing metadata avoid overconfident terminology', () => {
    const llmPoint = notClaimedPoints.find((p) => p.label.includes('No zero-retention'));
    expect(llmPoint?.detail).not.toContain('air-gapped');
    expect(llmPoint?.detail).toContain('network-isolated');

    const enterpriseTier = packagingTiers.find((t) => t.id === 'enterprise-private');
    expect(enterpriseTier?.intendedRole).not.toContain('air-gapped');
    expect(enterpriseTier?.intendedRole).toContain('network-isolated');
  });

  it('verifies mock decisions avoid overconfident mathematical security claims', () => {
    const decisionsContent = fs.readFileSync(decisionsMockPath, 'utf-8');
    expect(decisionsContent).not.toContain('Mathematically enforced');
    expect(decisionsContent).toContain('AST-enforced');
  });

  it('verifies public documentation index prioritizes user docs and classifies internal artifacts', () => {
    const paths = sourceDocuments.map((d) => d.path);
    expect(paths).toContain('README.md');
    expect(paths).toContain('DOC/local-dashboard-workflow.md');
    expect(paths).toContain('DOC/technical-overview.md');
    expect(paths).toContain('DOC/project-overview.md');

    const internalDoc = sourceDocuments.find((d) => d.path === 'Implementation-Prompts/README.md');
    expect(internalDoc).toBeDefined();
    expect(internalDoc?.category).toBe('Internal / Contributor');
  });
});
