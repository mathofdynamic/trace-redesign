import { describe, expect, it } from 'vitest';
import {
  boundaryItems,
  capabilities,
  pipelineNodes,
  productStatus,
} from '../product-data';

describe('Public Product Page Contracts', () => {
  it('preserves the five-stage system architecture reasoning flow', () => {
    expect(pipelineNodes).toHaveLength(5);
    expect(pipelineNodes.map((n) => n.stage)).toEqual([
      'Intent',
      'Change',
      'Evidence',
      'Intelligence',
      'Record',
    ]);
  });

  it('highlights only the active reasoning path in the architecture flow', () => {
    const activeNodes = pipelineNodes.filter((n) => n.active);
    expect(activeNodes.map((n) => n.stage)).toEqual(['Evidence', 'Intelligence']);
  });

  it('preserves the four core product capabilities in order', () => {
    expect(capabilities).toHaveLength(4);
    expect(capabilities.map((c) => c.title)).toEqual([
      'PR intelligence',
      'Concurrent-change conflicts',
      'Daily and weekly reports',
      'A durable project record',
    ]);
  });

  it('maps each capability to a pipeline stage with valid mock data', () => {
    for (const cap of capabilities) {
      expect(cap.index).toMatch(/^\d{2}$/);
      expect(cap.pipelineStage).toContain('Pipeline Stage');
      expect(cap.value.length).toBeGreaterThan(20);
      expect(cap.statusNote.length).toBeGreaterThan(0);
      expect(cap.mock.header.length).toBeGreaterThan(0);
      expect(cap.mock.badge.length).toBeGreaterThan(0);
      expect(cap.mock.body.length).toBeGreaterThan(0);
      expect(cap.mock.evidence.length).toBeGreaterThan(0);
      expect(cap.mock.footer.length).toBeGreaterThan(0);
    }
  });

  it('defines strict local-first privacy boundaries without vague claims', () => {
    expect(boundaryItems).toHaveLength(4);
    expect(boundaryItems.map((b) => b.title)).toEqual([
      'Analysis stays local',
      'Source code is never synchronized',
      'Selective metadata synchronization',
      'Git as the sole authority',
    ]);
    for (const item of boundaryItems) {
      expect(item.tag.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(20);
    }
  });

  it('distinguishes existing functionality from planned future roadmap without status rainbow colors', () => {
    expect(productStatus.exists.length).toBeGreaterThanOrEqual(5);
    expect(productStatus.planned.length).toBeGreaterThanOrEqual(3);

    expect(productStatus.exists).toContain(
      'Zero source code transmission invariant (sourceCodeIncluded: false)'
    );
    expect(productStatus.planned).toContain(
      'Automated GitHub Checks and check-run annotations'
    );
  });
});
