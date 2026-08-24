import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 26: Forbidden Color Regression & Palette Hardening', () => {
  const cssPath = fs.existsSync(path.resolve(process.cwd(), 'app/globals.css'))
    ? path.resolve(process.cwd(), 'app/globals.css')
    : path.resolve(process.cwd(), 'apps/web/app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Scanning helper for forbidden color values
  function findForbiddenColors(content: string, filename: string): Array<{ line: number; value: string; lineContent: string }> {
    const violations: Array<{ line: number; value: string; lineContent: string }> = [];
    const lines = content.split('\n');
    let insideComment = false;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('/*')) insideComment = true;
      if (insideComment) {
        if (trimmed.includes('*/')) insideComment = false;
        return;
      }

      // Check RGB / RGBA definitions
      const rgbaMatches = line.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g);
      for (const m of rgbaMatches) {
        const r = parseInt(m[1] ?? '0', 10);
        const g = parseInt(m[2] ?? '0', 10);
        const b = parseInt(m[3] ?? '0', 10);

        // Allowed: Neutrals/Greys (where r, g, b are within 25 of each other), or distinct TRACE Blue hues / cool dark tones
        const isGreyOrNeutral = Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25 && Math.abs(r - b) <= 30;
        const isTraceBlue = b > r && b > g;

        if (!isGreyOrNeutral && !isTraceBlue) {
          violations.push({
            line: idx + 1,
            value: m[0],
            lineContent: trimmed,
          });
        }
      }

      // Check HEX definitions
      const hexMatches = line.matchAll(/#([0-9a-fA-F]{3,8})\b/g);
      for (const m of hexMatches) {
        const hex = m[1];
        if (!hex) continue;
        let r = 0, g = 0, b = 0;
        if (hex.length === 3) {
          r = parseInt((hex[0] ?? '0') + (hex[0] ?? '0'), 16);
          g = parseInt((hex[1] ?? '0') + (hex[1] ?? '0'), 16);
          b = parseInt((hex[2] ?? '0') + (hex[2] ?? '0'), 16);
        } else if (hex.length >= 6) {
          r = parseInt(hex.slice(0, 2), 16);
          g = parseInt(hex.slice(2, 4), 16);
          b = parseInt(hex.slice(4, 6), 16);
        }

        const isGreyOrNeutral = Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25 && Math.abs(r - b) <= 30;
        const isTraceBlue = b > r && b > g;

        if (!isGreyOrNeutral && !isTraceBlue) {
          violations.push({
            line: idx + 1,
            value: `#${hex}`,
            lineContent: trimmed,
          });
        }
      }
    });

    return violations;
  }

  it('scans globals.css and finds 0 forbidden product colors (red, green, amber, yellow, purple, teal)', () => {
    const violations = findForbiddenColors(cssContent, 'globals.css');
    expect(violations.length).toBe(0);
  });

  it('verifies that danger and status badges use neutral styling without traffic-light colors', () => {
    expect(cssContent).toContain('.trace-button--danger {');
    expect(cssContent).toContain('.trace-badge--danger {');
    expect(cssContent).not.toContain('rgba(255, 90, 95');
    expect(cssContent).not.toContain('rgba(50, 209, 125');
    expect(cssContent).not.toContain('rgba(245, 185, 66');
  });

  it('verifies public and app component files do not introduce forbidden inline color values', () => {
    const componentsDir = fs.existsSync(path.resolve(process.cwd(), 'app/(app)/app/_components'))
      ? path.resolve(process.cwd(), 'app/(app)/app/_components')
      : path.resolve(process.cwd(), 'apps/web/app/(app)/app/_components');
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
    let totalComponentViolations = 0;

    files.forEach(file => {
      const filePath = path.join(componentsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const violations = findForbiddenColors(content, file);
      totalComponentViolations += violations.length;
    });

    expect(totalComponentViolations).toBe(0);
  });
});
