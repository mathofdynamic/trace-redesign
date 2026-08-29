import { describe, expect, it } from 'vitest';
import {
  INITIAL_DECISION_PROMPT_DRAFT,
  generateDecisionPrompt,
  isDecisionDraftValid,
  type DecisionPromptDraft,
} from '../decision-prompt';
import { mockDataProvider } from '../mock/adapter';
import { MOCK_DECISIONS, getDecisionById } from '../mock/decisions';
import { MOCK_RULES, getRuleById } from '../mock/rules';

describe('Phase 46: Decisions, Rules & Decision Definition Prompt Builder', () => {
  describe('Decision Prompt Generation Logic', () => {
    it('initializes with an empty draft structure', () => {
      expect(INITIAL_DECISION_PROMPT_DRAFT).toEqual({
        repositoryId: '',
        repositoryName: '',
        title: '',
        context: '',
        decision: '',
        rationale: '',
        consequences: '',
        invariants: '',
        relatedChange: '',
      });
    });

    it('correctly validates required fields in draft', () => {
      const invalidDraft: DecisionPromptDraft = {
        ...INITIAL_DECISION_PROMPT_DRAFT,
        repositoryName: 'trace/trace-core',
        title: 'Migrate to Ephemeral Tokens',
        context: 'Session tokens were previously persistent in localStorage',
        decision: '', // missing
      };
      expect(isDecisionDraftValid(invalidDraft)).toBe(false);

      const validDraft: DecisionPromptDraft = {
        ...invalidDraft,
        decision: 'Use Ed25519 cryptographic signatures with 1-hour expiration',
      };
      expect(isDecisionDraftValid(validDraft)).toBe(true);
    });

    it('generates a deterministic, agent-friendly prompt with all fields and invariants', () => {
      const sampleDraft: DecisionPromptDraft = {
        repositoryId: 'repo-trace-001',
        repositoryName: 'trace/trace-core',
        title: 'ADR 0014: Constant-Time Digest Verification for CLI Device Authentication',
        context: 'CLI authentication handshake requires timing-attack resistant digest comparison.',
        decision: 'Enforce crypto.timingSafeEqual on all cryptographic signature verifications.',
        rationale: 'Prevents statistical timing side-channel attacks during local-to-cloud handshakes.',
        consequences: 'Minor CPU constant overhead; eliminates timing side-channel attack vectors.',
        invariants: 'Zero source transmission; timing-safe comparisons mandatory in all auth routines.',
        relatedChange: 'PR #104 or commit 9f1a23b',
      };

      const prompt = generateDecisionPrompt(sampleDraft);

      expect(prompt).toContain('You are working in repository: trace/trace-core.');
      expect(prompt).toContain('Record the following architectural decision using this repository\'s existing TRACE/.trace decision conventions.');
      expect(prompt).toContain('ADR 0014: Constant-Time Digest Verification for CLI Device Authentication');
      expect(prompt).toContain('CLI authentication handshake requires timing-attack resistant digest comparison.');
      expect(prompt).toContain('Enforce crypto.timingSafeEqual on all cryptographic signature verifications.');
      expect(prompt).toContain('Prevents statistical timing side-channel attacks during local-to-cloud handshakes.');
      expect(prompt).toContain('Minor CPU constant overhead; eliminates timing side-channel attack vectors.');
      expect(prompt).toContain('Zero source transmission; timing-safe comparisons mandatory in all auth routines.');
      expect(prompt).toContain('PR #104 or commit 9f1a23b');
      expect(prompt).toContain('1. Inspect the repository and existing `.trace` schema/decision records before writing.');
      expect(prompt).toContain('5. Preserve TRACE privacy rules.');
      expect(prompt).toContain('6. Validate the resulting record with the repository\'s existing checks/CLI.');
    });

    it('handles fallback defaults gracefully when optional fields are omitted', () => {
      const minimalDraft: DecisionPromptDraft = {
        repositoryId: 'repo-radar-002',
        repositoryName: 'radar/stream-ingester',
        title: 'Strict Memory Bounds on Ingestion Ring Buffers',
        context: 'High-throughput stream processing risked unbounded heap allocations.',
        decision: 'Cap in-memory buffer to 256MB with backpressure propagation.',
        rationale: '',
        consequences: '',
        invariants: '',
        relatedChange: '',
      };

      const prompt = generateDecisionPrompt(minimalDraft);
      expect(prompt).toContain('You are working in repository: radar/stream-ingester.');
      expect(prompt).toContain('Strict Memory Bounds on Ingestion Ring Buffers');
      expect(prompt).toContain('Cap in-memory buffer to 256MB with backpressure propagation.');
      expect(prompt).toContain('Rationale:\n(None provided)');
      expect(prompt).toContain('Consequences / tradeoffs:\n(None provided)');
      expect(prompt).toContain('Constraints / invariants:\n(None provided)');
      expect(prompt).toContain('Related change:\n(None provided)');
    });
  });

  describe('Decisions and Governance Rules State Integrity', () => {
    it('maintains 9 frozen decisions and 8 governance rules in mock universe', () => {
      const universe = mockDataProvider.getUniverse();
      expect(universe.decisions).toHaveLength(9);
      expect(universe.rules).toHaveLength(8);

      const d1 = getDecisionById('decision-trace-001');
      expect(d1?.title).toBe('Single-Direction Local-to-Cloud Intelligence Synchronization');

      const r1 = getRuleById('rule-trace-001');
      expect(r1?.title).toBe('Cryptographic Review & Secret Ingestion Invariant');
    });

    it('verifies decisions and rules enforce source-free privacy guarantees', () => {
      for (const d of MOCK_DECISIONS) {
        expect(d.origin).toBe('local');
        expect(d.content).not.toMatch(/developer score/i);
        expect(d.content).not.toMatch(/developer rank/i);
      }

      for (const r of MOCK_RULES) {
        expect(r.origin).toBe('local');
        expect(r.content).not.toMatch(/productivity rating/i);
      }
    });
  });
});
