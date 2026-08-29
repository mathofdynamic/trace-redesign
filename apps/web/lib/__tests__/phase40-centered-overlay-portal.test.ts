import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 40: Centered Overlay Portal & Full Background Blur', () => {
  const globalsCssPath = path.resolve(__dirname, '../../app/globals.css');
  const overlayPortalPath = path.resolve(__dirname, '../../app/(app)/app/_components/overlay-portal.tsx');
  const traceRedesignPath = path.resolve(__dirname, '../../app/(app)/app/_components/trace-redesign.tsx');
  const changesViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/changes-view.tsx');
  const conflictsViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/conflicts-view.tsx');
  const reportsViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/reports-view.tsx');
  const settingsViewPath = path.resolve(__dirname, '../../app/(app)/app/_components/settings-view.tsx');

  const css = fs.readFileSync(globalsCssPath, 'utf-8');
  const overlayPortalContent = fs.readFileSync(overlayPortalPath, 'utf-8');
  const traceRedesignContent = fs.readFileSync(traceRedesignPath, 'utf-8');
  const changesViewContent = fs.readFileSync(changesViewPath, 'utf-8');
  const conflictsViewContent = fs.readFileSync(conflictsViewPath, 'utf-8');
  const reportsViewContent = fs.readFileSync(reportsViewPath, 'utf-8');
  const settingsViewContent = fs.readFileSync(settingsViewPath, 'utf-8');

  it('verifies OverlayPortal renders to document.body and manages active overlay state', () => {
    expect(overlayPortalContent).toContain('createPortal');
    expect(overlayPortalContent).toContain('document.body');
    expect(overlayPortalContent).toContain('data-overlay-active');
    expect(overlayPortalContent).toContain('trace-overlay-root');
  });

  it('verifies full-screen blur scrim and backdrop covering the entire application', () => {
    expect(css).toContain('.trace-dialog-layer');
    expect(css).toContain('position: fixed;');
    expect(css).toContain('inset: 0;');
    expect(css).toContain('z-index: var(--trace-z-modal, 1001);');
    expect(css).toContain('.trace-dialog-scrim');
    expect(css).toContain('backdrop-filter: blur(');
    expect(css).toContain('-webkit-backdrop-filter: blur(');
  });

  it('verifies centered modal dialog geometry, max bounds, and size variants', () => {
    expect(css).toContain('.trace-centered-dialog');
    expect(css).toContain('position: relative;');
    expect(css).toContain('max-height: min(86dvh, 880px);');
    expect(css).toContain('border-radius: 14px;');
    expect(css).toContain('.trace-centered-dialog--sm');
    expect(css).toContain('.trace-centered-dialog--md');
    expect(css).toContain('.trace-centered-dialog--lg');
  });

  it('verifies finding disclosure uses CenteredDialog and OverlayPortal', () => {
    expect(traceRedesignContent).toContain('OverlayPortal');
    expect(traceRedesignContent).toContain('ModalBackdrop');
    expect(traceRedesignContent).toContain('CenteredDialog');
    expect(traceRedesignContent).toContain('size="lg"');
  });

  it('verifies changes view detail modal uses CenteredDialog and OverlayPortal', () => {
    expect(changesViewContent).toContain('OverlayPortal');
    expect(changesViewContent).toContain('ModalBackdrop');
    expect(changesViewContent).toContain('CenteredDialog');
    expect(changesViewContent).toContain('className="change-drawer"');
  });

  it('verifies conflicts view detail modal uses CenteredDialog and OverlayPortal', () => {
    expect(conflictsViewContent).toContain('OverlayPortal');
    expect(conflictsViewContent).toContain('ModalBackdrop');
    expect(conflictsViewContent).toContain('CenteredDialog');
    expect(conflictsViewContent).toContain('className="conflict-drawer"');
  });

  it('verifies reports quick inspect drawer uses CenteredDialog and OverlayPortal', () => {
    expect(reportsViewContent).toContain('OverlayPortal');
    expect(reportsViewContent).toContain('ModalBackdrop');
    expect(reportsViewContent).toContain('CenteredDialog');
    expect(reportsViewContent).toContain('className="report-drawer report-quick-inspect"');
  });

  it('verifies settings rename and revoke dialogs use CenteredDialog and OverlayPortal', () => {
    expect(settingsViewContent).toContain('OverlayPortal');
    expect(settingsViewContent).toContain('ModalBackdrop');
    expect(settingsViewContent).toContain('CenteredDialog');
    expect(settingsViewContent).toContain('size="md"');
  });

  it('verifies accessibility fallbacks for reduced-motion and high-contrast / reduced-transparency', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@media (prefers-reduced-transparency: reduce)');
  });
});
