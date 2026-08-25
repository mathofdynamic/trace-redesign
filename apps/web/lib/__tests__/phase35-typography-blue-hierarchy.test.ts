import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 35: App Typography, Blue Hierarchy & Metadata Readability', () => {
  const globalsCssPath = path.resolve(__dirname, '../../app/globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

  it('bounds redesign and dashboard operational H1s between 28px and 38px', () => {
    // Check that .redesign-header h1 uses operational scale (not hero 52px scale)
    expect(globalsCss).toContain('.redesign-header h1 {');
    expect(globalsCss).toMatch(/\.redesign-header h1\s*\{[^}]*font-size:\s*clamp\(30px,\s*2\.5vw,\s*38px\)/);

    // Check that .dashboard-page-header h1 uses operational scale
    expect(globalsCss).toMatch(/\.dashboard-page-header h1\s*\{[^}]*font-size:\s*clamp\(28px,\s*2\.5vw,\s*36px\)/);
  });

  it('normalizes metadata font sizes to readable 12-13px and improves contrast', () => {
    // Check eyebrow tag
    expect(globalsCss).toMatch(/\.eyebrow\s*\{[^}]*font-size:\s*11px/);

    // Check source-note / quiet-count
    expect(globalsCss).toMatch(/\.source-note,\s*\.quiet-count\s*\{[^}]*font-size:\s*13px/);

    // Check change-state-badge
    expect(globalsCss).toMatch(/\.change-state-badge\s*\{[^}]*font-size:\s*11px/);

    // Check change-row-card__meta-tags
    expect(globalsCss).toMatch(/\.change-row-card__meta-tags\s*\{[^}]*font-size:\s*12\.5px/);

    // Check change-area-pill and change-findings-badge
    expect(globalsCss).toMatch(/\.change-area-pill\s*\{[^}]*font-size:\s*12px/);
    expect(globalsCss).toMatch(/\.change-findings-badge\s*\{[^}]*font-size:\s*12px/);
  });

  it('neutralizes repetitive blue saturation from change row badges and GitHub actions', () => {
    // Check OPEN state badge is neutral
    expect(globalsCss).toMatch(/\.change-state-badge\[data-state="open"\]\s*\{[^}]*color:\s*#e6edf3/);

    // Check reports summary metric labels
    expect(globalsCss).toMatch(/\.reports-summary-metric__label\s*\{[^}]*font-size:\s*0\.78rem/);

    // Check decision, rule, and activity metric labels are readable sans-serif
    expect(globalsCss).toMatch(/\.decision-metric-label\s*\{[^}]*font-size:\s*0\.76rem/);
    expect(globalsCss).toMatch(/\.rule-metric-label\s*\{[^}]*font-size:\s*0\.76rem/);
    expect(globalsCss).toMatch(/\.activity-metric-label\s*\{[^}]*font-size:\s*0\.76rem/);
  });
});
