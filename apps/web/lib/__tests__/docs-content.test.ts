import { describe, expect, it } from 'vitest';
import {
  localAnalysisCommands,
  localToDashboardStages,
  sourceDocuments,
  syncWorkflowCommands,
} from '../docs-data';

describe('Public Documentation Page Contracts', () => {
  it('indexes all authoritative in-tree source documents and classifies internal artifacts', () => {
    expect(sourceDocuments).toHaveLength(7);
    const paths = sourceDocuments.map((d) => d.path);
    expect(paths).toContain('README.md');
    expect(paths).toContain('DOC/local-dashboard-workflow.md');
    expect(paths).toContain('DOC/technical-overview.md');
    expect(paths).toContain('DOC/project-overview.md');
    expect(paths).toContain('DOC/github-app-setup.md');
    expect(paths).toContain('Design-system/TRACE-DESIGN-SPEC.md');
    expect(paths).toContain('Implementation-Prompts/README.md');

    const internalDoc = sourceDocuments.find((d) => d.path === 'Implementation-Prompts/README.md');
    expect(internalDoc?.category).toBe('Internal / Contributor');

    for (const doc of sourceDocuments) {
      expect(doc.name.length).toBeGreaterThan(0);
      expect(doc.purpose.length).toBeGreaterThan(15);
      expect(doc.url).toMatch(/^https:\/\/github\.com\/mathofdynamic\/TRACE/);
    }
  });

  it('defines the four-stage local to dashboard workflow', () => {
    expect(localToDashboardStages).toHaveLength(4);
    expect(localToDashboardStages.map((s) => s.title)).toEqual([
      'Local AST Extraction',
      'Versioned Markdown Record',
      'Dry-Run Verification',
      'Projection Sync',
    ]);

    const stage1 = localToDashboardStages[0];
    expect(stage1?.boundaryGuarantee).toContain('Raw source stays on local disk');

    const stage3 = localToDashboardStages[2];
    expect(stage3?.boundaryGuarantee).toContain('sourceCodeIncluded: false');
  });

  it('documents local analysis CLI commands without fake terminal animations', () => {
    expect(localAnalysisCommands).toHaveLength(4);
    const commands = localAnalysisCommands.map((c) => c.command);
    expect(commands).toContain('trace init');
    expect(commands).toContain('trace analyze changes');
    expect(commands).toContain('trace report daily --write --yes');
    expect(commands).toContain('trace validate');

    for (const cmd of localAnalysisCommands) {
      expect(cmd.explanation.length).toBeGreaterThan(15);
    }
  });

  it('documents sync workflow CLI commands with source-exclusion invariants', () => {
    expect(syncWorkflowCommands).toHaveLength(5);
    const commands = syncWorkflowCommands.map((c) => c.command);
    expect(commands).toContain('trace login');
    expect(commands).toContain('trace connect');
    expect(commands).toContain('trace analyze');
    expect(commands).toContain('trace sync --dry-run');
    expect(commands).toContain('trace sync');

    const dryRun = syncWorkflowCommands.find((c) => c.id === 'trace-sync-dry-run');
    expect(dryRun?.contextNote).toContain('0 bytes of source code transmitted');

    const sync = syncWorkflowCommands.find((c) => c.id === 'trace-sync');
    expect(sync?.contextNote).toContain('sourceCodeIncluded: false');
  });
});
