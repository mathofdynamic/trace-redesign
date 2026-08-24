import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { mockDataProvider } from '../mock/adapter';
import { deriveTraceProjectState } from '../dashboard-state';

describe('Phase 32: Final Hardening, Mock-Boundary, CLI Truth & QA Assertions', () => {
  const universe = mockDataProvider.getUniverse('default');

  describe('1. Frozen Universe Counts & Identities Verification', () => {
    it('verifies exact frozen entity counts', () => {
      expect(universe.repositories).toHaveLength(5);
      expect(universe.changes).toHaveLength(9);
      expect(universe.attention).toHaveLength(31);
      expect(universe.reports).toHaveLength(12);
      expect(universe.conflicts).toHaveLength(4);
      expect(universe.decisions).toHaveLength(9);
      expect(universe.rules).toHaveLength(8);
      expect(universe.activity).toHaveLength(35);
      expect(universe.devices).toHaveLength(4);
    });

    it('verifies exact repository product-truth states', () => {
      const trace = universe.repositories.find((r) => r.name === 'TRACE')!;
      const radar = universe.repositories.find((r) => r.name === 'Radar')!;
      const atlas = universe.repositories.find((r) => r.name === 'Atlas')!;
      const orbit = universe.repositories.find((r) => r.name === 'Orbit')!;
      const nova = universe.repositories.find((r) => r.name === 'Nova')!;

      expect(deriveTraceProjectState(trace, universe.attention).key).toBe('needs-refresh');
      expect(deriveTraceProjectState(radar, universe.attention).key).toBe('current');
      expect(deriveTraceProjectState(atlas, universe.attention).key).toBe('current');
      expect(deriveTraceProjectState(orbit, universe.attention).key).toBe('sync-attention');
      expect(deriveTraceProjectState(nova, universe.attention).key).toBe('connected-not-analyzed');
    });
  });

  describe('2. Palette Hardening & Zero Forbidden Colors', () => {
    const cssPath = fs.existsSync(path.resolve(process.cwd(), 'app/globals.css'))
      ? path.resolve(process.cwd(), 'app/globals.css')
      : path.resolve(process.cwd(), 'apps/web/app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    it('globals.css enforces dark-first TRACE palette with 0 forbidden colors', () => {
      // Forbidden color keywords or raw hex/rgb of red/green/amber/purple
      expect(cssContent).not.toMatch(/#[0-9a-fA-F]*?(?:ff0000|00ff00|ff8800|800080)/i);
      expect(cssContent).not.toContain('rgba(255, 90, 95');
      expect(cssContent).not.toContain('rgba(50, 209, 125');
      expect(cssContent).not.toContain('rgba(245, 185, 66');
    });
  });

  describe('3. Mock Boundary & Reusable UI Component Audit', () => {
    const componentsDir = fs.existsSync(path.resolve(process.cwd(), 'app/(app)/app/_components'))
      ? path.resolve(process.cwd(), 'app/(app)/app/_components')
      : path.resolve(process.cwd(), 'apps/web/app/(app)/app/_components');

    const files = fs.readdirSync(componentsDir).filter((f) => f.endsWith('.tsx'));

    it('ensures no hardcoded mock repository IDs in reusable UI components', () => {
      const forbiddenMockIds = ['repo-trace-001', 'repo-radar-002', 'repo-atlas-003', 'repo-orbit-004', 'repo-nova-005'];
      const leaks: string[] = [];

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
        forbiddenMockIds.forEach((mockId) => {
          if (content.includes(`'${mockId}'`) || content.includes(`"${mockId}"`)) {
            leaks.push(`${file} contains hardcoded mock id ${mockId}`);
          }
        });
      });

      expect(leaks).toEqual([]);
    });
  });

  describe('4. CLI Truth Audit', () => {
    const componentsDir = fs.existsSync(path.resolve(process.cwd(), 'app/(app)/app/_components'))
      ? path.resolve(process.cwd(), 'app/(app)/app/_components')
      : path.resolve(process.cwd(), 'apps/web/app/(app)/app/_components');
    const files = fs.readdirSync(componentsDir).filter((f) => f.endsWith('.tsx'));

    it('all displayed CLI commands match authentic trace CLI commands', () => {
      const allowedCliPrefixes = [
        'trace analyze',
        'trace sync',
        'trace sync --dry-run',
        'trace report daily',
        'trace report weekly',
        'trace inspect',
        'trace pr',
        'trace rules',
        'trace login',
        'trace whoami',
        'trace logout',
        'trace connect',
        'trace status',
        'trace validate',
        'trace init',
      ];

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
        const codeMatches = content.matchAll(/<code>(trace\s+[^<]+)<\/code>/g);
        for (const m of codeMatches) {
          if (!m || !m[1]) continue;
          const cmd = m[1].replace(/&amp;/g, '&').trim();
          const subCmds = cmd.split('&&').map((s) => s.trim());
          for (const c of subCmds) {
            const isAllowed = allowedCliPrefixes.some((prefix) => c.startsWith(prefix));
            expect(isAllowed, `Unrecognized CLI command in ${file}: "${c}"`).toBe(true);
          }
        }
      });
    });
  });

  describe('5. Product Claim Audit', () => {
    it('contains no fabricated 10x metrics or fake confidence scores in UI', () => {
      const componentsDir = fs.existsSync(path.resolve(process.cwd(), 'app/(app)/app/_components'))
        ? path.resolve(process.cwd(), 'app/(app)/app/_components')
        : path.resolve(process.cwd(), 'apps/web/app/(app)/app/_components');
      const files = fs.readdirSync(componentsDir).filter((f) => f.endsWith('.tsx'));

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
        expect(content).not.toMatch(/\b10[x\u00d7]\s*(?:faster|boost|increase)/i);
        expect(content).not.toMatch(/confidence\s*score/i);
      });
    });
  });

  describe('6. Geometric & Icon Sizing Constraints', () => {
    const cssPath = fs.existsSync(path.resolve(process.cwd(), 'app/globals.css'))
      ? path.resolve(process.cwd(), 'app/globals.css')
      : path.resolve(process.cwd(), 'apps/web/app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    it('ensures SVG icons have bounded constraints and responsive containment', () => {
      expect(cssContent).toContain('.token-svg-icon');
      expect(cssContent).toContain('.inspect-pill-btn');
      expect(cssContent).toContain('@media (max-width: 768px)');
    });
  });
});
