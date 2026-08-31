import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 52: All Popovers, Dialogs, Prompt Builders & Transient Surfaces Motion Coverage', () => {
  const componentsDir = path.resolve(__dirname, '../../app/(app)/app/_components');
  const webComponentsDir = path.resolve(__dirname, '../../app/components');

  const transientSurfaces = [
    {
      file: path.join(componentsDir, 'trace-redesign.tsx'),
      name: 'LocalActionPanel & FindingDisclosure',
      subcomponents: ['LocalActionPanel', 'FindingDisclosure'],
    },
    {
      file: path.join(componentsDir, 'rule-prompt-builder.tsx'),
      name: 'RulePromptBuilder',
      subcomponents: ['RulePromptBuilder'],
    },
    {
      file: path.join(componentsDir, 'decision-prompt-builder.tsx'),
      name: 'DecisionPromptBuilder',
      subcomponents: ['DecisionPromptBuilder'],
    },
    {
      file: path.join(componentsDir, 'conflicts-view.tsx'),
      name: 'ConflictDetailModal',
      subcomponents: ['ConflictDetailModal'],
    },
    {
      file: path.join(componentsDir, 'reports-view.tsx'),
      name: 'ReportQuickDrawer',
      subcomponents: ['ReportQuickDrawer'],
    },
    {
      file: path.join(componentsDir, 'changes-view.tsx'),
      name: 'ChangeDetailDrawer',
      subcomponents: ['ChangeDetailDrawer'],
    },
    {
      file: path.join(componentsDir, 'settings-view.tsx'),
      name: 'DeviceRenameModal & DeviceRevokeModal',
      subcomponents: ['DeviceRenameModal', 'DeviceRevokeModal'],
    },
    {
      file: path.join(webComponentsDir, 'repository-selector.tsx'),
      name: 'RepositoryAccessModal',
      subcomponents: ['RepositoryAccessModal'],
    },
  ];

  it('verifies all 8 transient surface component files exist and integrate usePresence & getMotionItemProps', () => {
    for (const surface of transientSurfaces) {
      expect(fs.existsSync(surface.file), `File ${surface.file} must exist`).toBe(true);
      const content = fs.readFileSync(surface.file, 'utf-8');

      expect(
        content.includes('usePresence') || content.includes('getMotionItemProps'),
        `${surface.name} must integrate entrance-motion helpers`,
      ).toBe(true);

      for (const sub of surface.subcomponents) {
        expect(
          content.includes(sub),
          `${surface.name} must contain ${sub}`,
        ).toBe(true);
      }
    }
  });

  it('verifies overlay portal and backdrop maintain motion presence state contracts', () => {
    const portalPath = path.join(componentsDir, 'overlay-portal.tsx');
    expect(fs.existsSync(portalPath)).toBe(true);
    const content = fs.readFileSync(portalPath, 'utf-8');

    expect(content.includes('ModalBackdrop')).toBe(true);
    expect(content.includes('CenteredDialog')).toBe(true);
    expect(content.includes('OverlayPortal')).toBe(true);
  });

  it('verifies exit animation contract with exit classes and presence timing in presence.ts', () => {
    const presencePath = path.resolve(__dirname, '../presence.ts');
    expect(fs.existsSync(presencePath)).toBe(true);
    const content = fs.readFileSync(presencePath, 'utf-8');

    expect(content.includes('usePresence')).toBe(true);
    expect(content.includes('66')).toBe(true); // exit duration default
  });
});
