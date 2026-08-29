import { describe, expect, it } from 'vitest';
import {
  INITIAL_RULE_PROMPT_DRAFT,
  generateRulePrompt,
  isRuleDraftValid,
  type RulePromptDraft,
} from '../rule-prompt';

describe('Phase 47: Rules Definition & Prompt Builder', () => {
  describe('Rule Prompt Generation Logic', () => {
    it('initializes with a valid empty default draft structure', () => {
      expect(INITIAL_RULE_PROMPT_DRAFT).toEqual({
        repositoryId: '',
        repositoryName: '',
        ruleId: '',
        title: '',
        purpose: '',
        scope: 'repository',
        severity: 'high',
        mode: 'deterministic',
        targetPaths: '',
        remediation: '',
        overrideAllowed: true,
      });
    });

    it('correctly validates required fields in draft', () => {
      const invalidDraft: RulePromptDraft = {
        ...INITIAL_RULE_PROMPT_DRAFT,
        repositoryName: 'trace/trace-core',
        title: 'Database Migration Backward Compatibility',
        purpose: '', // missing
      };
      expect(isRuleDraftValid(invalidDraft)).toBe(false);

      const validDraft: RulePromptDraft = {
        ...invalidDraft,
        purpose: 'All migrations must support running concurrently against prior version without dropping active columns.',
      };
      expect(isRuleDraftValid(validDraft)).toBe(true);
    });

    it('generates a deterministic, agent-friendly governance rule prompt with all fields', () => {
      const sampleDraft: RulePromptDraft = {
        repositoryId: 'repo-trace-001',
        repositoryName: 'trace/trace-core',
        ruleId: 'rule.security.constant-time-signatures',
        title: 'Constant-Time Signature Verification Invariant',
        purpose: 'Authentication handshake routines must execute constant-time digest comparisons.',
        scope: 'repository',
        severity: 'high',
        mode: 'deterministic',
        targetPaths: 'packages/auth/**',
        remediation: 'Replace loose equality checks with crypto.timingSafeEqual in authentication routes.',
        overrideAllowed: false,
      };

      const prompt = generateRulePrompt(sampleDraft);

      expect(prompt).toContain('You are working in repository: trace/trace-core.');
      expect(prompt).toContain('Define and record the following repository governance rule / boundary policy');
      expect(prompt).toContain('Rule ID:\nrule.security.constant-time-signatures');
      expect(prompt).toContain('Rule Title:\nConstant-Time Signature Verification Invariant');
      expect(prompt).toContain('Purpose & Boundary Invariant:\nAuthentication handshake routines must execute constant-time digest comparisons.');
      expect(prompt).toContain('- Severity: HIGH');
      expect(prompt).toContain('- Enforcement Mode: Deterministic AST / Pattern Matching');
      expect(prompt).toContain('- Scope: repository');
      expect(prompt).toContain('- Target Loci / Path Matchers: packages/auth/**');
      expect(prompt).toContain('- Override Policy: Strictly prohibited');
      expect(prompt).toContain('Remediation Guidance:\nReplace loose equality checks with crypto.timingSafeEqual in authentication routes.');
      expect(prompt).toContain('1. Inspect the repository and existing `.trace/rules/` schema/records or configuration before writing.');
      expect(prompt).toContain('5. Preserve TRACE privacy rules and local-first verification guarantees.');
      expect(prompt).toContain('6. Validate the resulting rule definition with the repository\'s existing checks/CLI (e.g. `trace rules check`).');
    });

    it('handles fallback defaults gracefully when optional fields are omitted', () => {
      const minimalDraft: RulePromptDraft = {
        repositoryId: 'repo-atlas-003',
        repositoryName: 'atlas/gateway',
        ruleId: '',
        title: 'Multi-Tenant Query Authorization Check',
        purpose: 'All database queries must include tenant isolation clauses.',
        scope: 'repository',
        severity: 'medium',
        mode: 'deterministic',
        targetPaths: '',
        remediation: '',
        overrideAllowed: true,
      };

      const prompt = generateRulePrompt(minimalDraft);
      expect(prompt).toContain('You are working in repository: atlas/gateway.');
      expect(prompt).toContain('Multi-Tenant Query Authorization Check');
      expect(prompt).toContain('Rule ID:\n(Auto-slug from title or rule.domain.name)');
      expect(prompt).toContain('- Severity: MEDIUM');
      expect(prompt).toContain('- Target Loci / Path Matchers: (All repository files or specified paths)');
      expect(prompt).toContain('- Override Policy: Allowed with justification');
      expect(prompt).toContain('Remediation Guidance:\n(None specified)');
    });
  });
});
