import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 39: Systemic Readability, Contrast, Font & Spacing Foundation', () => {
  const globalsCssPath = path.resolve(__dirname, '../../app/globals.css');
  const css = fs.readFileSync(globalsCssPath, 'utf-8');

  it('verifies Kunst Grotesk is configured as primary UI font and tokens are declared', () => {
    expect(css).toContain('@font-face');
    expect(css).toContain("font-family: 'Kunst Grotesk';");
    expect(css).toContain('--trace-font-sans:');
    expect(css).toContain('Kunst Grotesk');
    expect(css).toContain('--trace-font-mono:');
    expect(css).toContain("font-family: var(--trace-font-sans, 'Kunst Grotesk'");
  });

  it('verifies authenticated-app typography scale and line-height tokens', () => {
    expect(css).toContain('--trace-text-page-title:');
    expect(css).toContain('--trace-text-section-title: 18px;');
    expect(css).toContain('--trace-text-card-title: 15px;');
    expect(css).toContain('--trace-text-item-title: 14px;');
    expect(css).toContain('--trace-text-body: 14px;');
    expect(css).toContain('--trace-text-body-sm: 13px;');
    expect(css).toContain('--trace-text-meta: 12px;');
    expect(css).toContain('--trace-text-eyebrow: 11px;');
    expect(css).toContain('--trace-lh-tight: 1.15;');
    expect(css).toContain('--trace-lh-snug: 1.35;');
    expect(css).toContain('--trace-lh-normal: 1.55;');
    expect(css).toContain('--trace-lh-relaxed: 1.65;');
  });

  it('verifies global spacing rhythm tokens adhere to the 4/8 grid system', () => {
    expect(css).toContain('--trace-space-1: 4px;');
    expect(css).toContain('--trace-space-2: 8px;');
    expect(css).toContain('--trace-space-3: 12px;');
    expect(css).toContain('--trace-space-4: 16px;');
    expect(css).toContain('--trace-space-5: 20px;');
    expect(css).toContain('--trace-space-6: 24px;');
    expect(css).toContain('--trace-space-8: 32px;');
    expect(css).toContain('--trace-space-10: 40px;');
    expect(css).toContain('--trace-space-12: 48px;');
    expect(css).toContain('--trace-space-16: 64px;');
  });

  it('verifies neutral contrast refinements for WCAG AA compliance on dark surfaces', () => {
    expect(css).toContain('--trace-canvas: #080809;');
    expect(css).toContain('--trace-surface-1: #111112;');
    expect(css).toContain('--trace-text: #f5f5f7;');
    expect(css).toContain('--trace-text-secondary: #c5c5cb;');
    expect(css).toContain('--trace-muted: #92929a;');
    expect(css).toContain('--trace-text-muted: #72727c;');
    expect(css).toContain('--trace-border-subtle: rgba(255, 255, 255, 0.08);');
    expect(css).toContain('--trace-border: rgba(255, 255, 255, 0.125);');
    expect(css).toContain('--trace-border-strong: rgba(255, 255, 255, 0.19);');
  });

  it('verifies standardized control geometry for buttons and form controls', () => {
    expect(css).toContain('--trace-control-height-sm: 30px;');
    expect(css).toContain('--trace-control-height: 36px;');
    expect(css).toContain('--trace-control-height-lg: 40px;');
    expect(css).toContain('--trace-radius-control: 8px;');

    // Button geometry & variants
    expect(css).toContain('.trace-button {');
    expect(css).toContain('min-height: 36px;');
    expect(css).toContain('.trace-button--sm,');
    expect(css).toContain('.trace-button--lg,');

    // Input & Filter control geometry
    expect(css).toContain('.trace-input {');
    expect(css).toContain('min-height: 38px;');
    expect(css).toContain('.filter-reset-button {');
  });

  it('verifies universal form element inheritance of font-family and text rendering', () => {
    expect(css).toContain('button,');
    expect(css).toContain('input,');
    expect(css).toContain('select,');
    expect(css).toContain('textarea {');
    expect(css).toContain('font: inherit;');
    expect(css).toContain('font-family: inherit;');
  });

  it('verifies strict palette boundaries remain intact (dark-first, no purple AI slop)', () => {
    expect(css).not.toContain('#7c3aed'); // No purple
    expect(css).not.toContain('#06b6d4'); // No cyan
    expect(css).toContain('--trace-blue: #087cf0;');
    expect(css).toContain('--trace-blue-bright: #1688ff;');
  });
});
