import type { DashboardSummary } from '../dashboard';
import type { TraceSession } from '@trace/auth';
import { MOCK_PRIMARY_USER, MOCK_TEAM_MEMBERS } from './users';
import { MOCK_WORKSPACE } from './workspace';
import { MOCK_CLI_DEVICES } from './devices';
import { MOCK_REPOSITORIES } from './repositories';
import { MOCK_ATTENTION } from './findings';
import { MOCK_CHANGES } from './changes';
import { MOCK_REPORTS } from './reports';
import { MOCK_CONFLICTS } from './conflicts';
import { MOCK_DECISIONS } from './decisions';
import { MOCK_RULES } from './rules';
import { MOCK_ACTIVITY } from './activity';
import { MOCK_EVIDENCE } from './evidence';
import { applyScenario } from './scenarios';
import type { MockDataProvider, MockScenarioKey, MockUniverse } from './types';

export function createBaseUniverse(): MockUniverse {
  return {
    workspace: { ...MOCK_WORKSPACE },
    currentUser: { ...MOCK_PRIMARY_USER },
    team: [...MOCK_TEAM_MEMBERS],
    devices: [...MOCK_CLI_DEVICES],
    repositories: MOCK_REPOSITORIES.map((repo) => ({ ...repo })),
    attention: [...MOCK_ATTENTION],
    changes: [...MOCK_CHANGES],
    reports: [...MOCK_REPORTS],
    conflicts: [...MOCK_CONFLICTS],
    decisions: [...MOCK_DECISIONS],
    rules: [...MOCK_RULES],
    risks: [],
    activity: [...MOCK_ACTIVITY],
    evidence: [...MOCK_EVIDENCE],
  };
}

export function buildDashboardSummaryFromUniverse(universe: MockUniverse): DashboardSummary {
  const isGithubConnected = universe.repositories.length > 0;
  const preferredRepo = universe.repositories[0] ?? null;
  const analysisState = preferredRepo?.analysis?.status ?? 'not-started';

  return {
    source: 'mock',
    preferredRepositoryId: preferredRepo?.id ?? null,
    workspace: {
      name: universe.workspace.name,
      profileComplete: universe.workspace.profileComplete,
      intendedUsage: universe.workspace.intendedUsage,
      executionMode: universe.workspace.executionMode,
    },
    setup: {
      authenticated: true,
      githubConnected: isGithubConnected,
      repositorySelected: isGithubConnected,
      repositoriesAvailable: universe.repositories.length,
      analysisState: analysisState === 'completed' ? 'completed' : analysisState,
      cloudAnalysisAvailable: false,
      localAnalysisAvailable: true,
    },
    repositories: universe.repositories,
    attention: universe.attention,
    latestChanges: universe.changes,
    latestReports: universe.reports,
    conflicts: universe.conflicts,
    decisions: universe.decisions,
    risks: universe.risks,
    rules: universe.rules,
    activity: universe.activity,
    capabilities: {
      changes: true,
      conflicts: true,
      reports: true,
      decisions: true,
      rules: true,
      activity: true,
    },
  };
}

export const mockDataProvider: MockDataProvider = {
  getUniverse(scenario: MockScenarioKey = 'default'): MockUniverse {
    const base = createBaseUniverse();
    return applyScenario(base, scenario);
  },

  getDashboardSummary(scenario: MockScenarioKey = 'default'): DashboardSummary {
    const universe = this.getUniverse(scenario);
    return buildDashboardSummaryFromUniverse(universe);
  },

  getSession(): TraceSession {
    return {
      user: { ...MOCK_PRIMARY_USER },
      session: {
        expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      },
    };
  },

  getRepositories(scenario: MockScenarioKey = 'default') {
    return this.getUniverse(scenario).repositories;
  },

  getDevices() {
    return [...MOCK_CLI_DEVICES];
  },

  getEvidence(scenario: MockScenarioKey = 'default') {
    return this.getUniverse(scenario).evidence;
  },
};
