import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 24: Motion, Interaction Feel & Accessibility Verification', () => {
  const cssPath = fs.existsSync(path.resolve(process.cwd(), 'app/globals.css'))
    ? path.resolve(process.cwd(), 'app/globals.css')
    : path.resolve(process.cwd(), 'apps/web/app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('verifies tactile press feedback and scale compression on active states', () => {
    expect(cssContent).toContain('.trace-button:active:not(:disabled) {');
    expect(cssContent).toContain('transform: scale(0.985);');
    expect(cssContent).toContain('.repository-context__trigger:active {');
    expect(cssContent).toContain('transform: scale(0.988);');
    expect(cssContent).toContain('.finding-disclosure__trigger:active,');
    expect(cssContent).toContain('transform: scale(0.95);');
  });

  it('verifies spatially anchored popovers with top-origin materialization', () => {
    expect(cssContent).toContain('.repository-switcher {');
    expect(cssContent).toContain('transform-origin: top right;');
    expect(cssContent).toContain('@keyframes popoverMaterialize {');
    expect(cssContent).toContain('transform: translateY(-6px) scale(0.975);');
  });

  it('verifies critically damped cubic-bezier curves for drawers and modal dialogs', () => {
    expect(cssContent).toContain('cubic-bezier(0.16, 1, 0.3, 1)');
    expect(cssContent).toContain('@keyframes drawerCriticallyDamped {');
    expect(cssContent).toContain('@keyframes modalScaleMaterialize {');
  });

  it('verifies precision focus visible outline and TRACE blue focus ring', () => {
    expect(cssContent).toContain(':focus-visible {');
    expect(cssContent).toContain('outline: 2px solid var(--trace-blue-bright) !important;');
    expect(cssContent).toContain('outline-offset: 2px !important;');
    expect(cssContent).toContain('box-shadow: 0 0 0 4px var(--trace-focus) !important;');
  });

  it('verifies prefers-reduced-motion media query completely halts non-essential motion', () => {
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('animation-duration: 0.001ms !important;');
    expect(cssContent).toContain('.finding-drawer,');
    expect(cssContent).toContain('.repository-switcher,');
    expect(cssContent).toContain('.trace-dialog,');
  });

  it('verifies prefers-reduced-transparency media query strips backdrop blurs for solid surfaces', () => {
    expect(cssContent).toContain('@media (prefers-reduced-transparency: reduce)');
    expect(cssContent).toContain('backdrop-filter: none !important;');
    expect(cssContent).toContain('background: #0c0d10 !important;');
  });

  it('verifies prefers-contrast media query strengthens borders and text contrast', () => {
    expect(cssContent).toContain('@media (prefers-contrast: more)');
    expect(cssContent).toContain('--trace-border-strong: rgba(255, 255, 255, 0.85);');
    expect(cssContent).toContain('--trace-text: #ffffff;');
    expect(cssContent).toContain('outline: 3px solid #ffffff !important;');
  });
});
