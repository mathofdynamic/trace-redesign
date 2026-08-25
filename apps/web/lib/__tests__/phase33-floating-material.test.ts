import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 33: Floating Material & Background Blur System', () => {
  const cssPath = fs.existsSync(path.resolve(process.cwd(), 'app/globals.css'))
    ? path.resolve(process.cwd(), 'app/globals.css')
    : path.resolve(process.cwd(), 'apps/web/app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('defines shared floating material tokens in :root', () => {
    expect(cssContent).toContain('--trace-floating-bg:');
    expect(cssContent).toContain('--trace-floating-bg-popover:');
    expect(cssContent).toContain('--trace-floating-bg-drawer:');
    expect(cssContent).toContain('--trace-floating-border:');
    expect(cssContent).toContain('--trace-floating-border-strong:');
    expect(cssContent).toContain('--trace-overlay-scrim:');
    expect(cssContent).toContain('--trace-backdrop-blur:');
    expect(cssContent).toContain('--trace-backdrop-blur-sm:');
    expect(cssContent).toContain('--trace-backdrop-blur-lg:');
    expect(cssContent).toContain('--trace-floating-shadow:');
    expect(cssContent).toContain('--trace-floating-shadow-drawer:');
    expect(cssContent).toContain('--trace-floating-shadow-modal:');
  });

  it('applies blurred-material and elevation tokens to repository switcher', () => {
    expect(cssContent).toContain('.repository-switcher {');
    expect(cssContent).toContain('background: var(--trace-floating-bg);');
    expect(cssContent).toContain('backdrop-filter: blur(var(--trace-backdrop-blur));');
    expect(cssContent).toContain('border: 1px solid var(--trace-floating-border-strong);');
    expect(cssContent).toContain('box-shadow: var(--trace-floating-shadow), var(--trace-floating-highlight);');
  });

  it('applies blurred-material to trace select popover listbox', () => {
    expect(cssContent).toContain('.trace-select-listbox {');
    expect(cssContent).toContain('background: var(--trace-floating-bg-popover);');
    expect(cssContent).toContain('backdrop-filter: blur(var(--trace-backdrop-blur-sm));');
    expect(cssContent).toContain('border: 1px solid var(--trace-floating-border);');
    expect(cssContent).toContain('box-shadow: var(--trace-floating-shadow-sm), var(--trace-floating-highlight);');
  });

  it('applies large-blur material tokens to all drawer surfaces', () => {
    // Finding drawer
    expect(cssContent).toContain('.finding-drawer {');
    expect(cssContent).toContain('background: var(--trace-floating-bg-drawer);');
    expect(cssContent).toContain('backdrop-filter: blur(var(--trace-backdrop-blur-lg));');
    expect(cssContent).toContain('box-shadow: var(--trace-floating-shadow-drawer);');

    // Change drawer
    expect(cssContent).toContain('.change-drawer {');
    expect(cssContent).toContain('background: var(--trace-floating-bg-drawer);');

    // Conflict drawer
    expect(cssContent).toContain('.conflict-drawer {');
    expect(cssContent).toContain('background: var(--trace-floating-bg-drawer);');

    // Report drawer
    expect(cssContent).toContain('.report-drawer {');
    expect(cssContent).toContain('background: var(--trace-floating-bg-drawer);');
  });

  it('applies blurred material to modal dialogs and scrim overlays', () => {
    expect(cssContent).toContain('.trace-dialog {');
    expect(cssContent).toContain('background: var(--trace-floating-bg);');
    expect(cssContent).toContain('backdrop-filter: blur(var(--trace-backdrop-blur));');
    expect(cssContent).toContain('box-shadow: var(--trace-floating-shadow-modal), var(--trace-floating-highlight);');

    expect(cssContent).toContain('.trace-dialog-scrim {');
    expect(cssContent).toContain('background: var(--trace-overlay-scrim);');
    expect(cssContent).toContain('backdrop-filter: blur(8px);');
  });

  it('applies blurred material to mobile navigation panels and drawers', () => {
    expect(cssContent).toContain('.mobile-nav-panel {');
    expect(cssContent).toContain('background: var(--trace-floating-bg);');
    expect(cssContent).toContain('backdrop-filter: blur(var(--trace-backdrop-blur));');

    expect(cssContent).toContain('.dashboard-mobile-drawer {');
    expect(cssContent).toContain('background: var(--trace-floating-bg-drawer);');
    expect(cssContent).toContain('backdrop-filter: blur(var(--trace-backdrop-blur-lg));');
  });

  it('verifies accessibility fallbacks for reduced-transparency and contrast', () => {
    expect(cssContent).toContain('@media (prefers-reduced-transparency: reduce)');
    expect(cssContent).toContain('backdrop-filter: none !important;');
    expect(cssContent).toContain('background: #0c0d10 !important;');

    expect(cssContent).toContain('@media (prefers-contrast: more)');
    expect(cssContent).toContain('--trace-floating-border-strong: rgba(255, 255, 255, 0.85);');
  });
});
