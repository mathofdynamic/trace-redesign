import type {
  DashboardActivity,
  DashboardAttention,
  DashboardChange,
  DashboardRepository,
  DashboardSummary,
  DashboardSyncedRecord,
} from '../dashboard';
import type { TraceSession, TraceUser } from '@trace/auth';

export type MockScenarioKey =
  | 'default'
  | 'github-unavailable'
  | 'permission-missing'
  | 'analysis-running'
  | 'analysis-failed'
  | 'sync-running'
  | 'sync-failed'
  | 'freshness-unavailable'
  | 'no-analysis';

export type MockTeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  githubLogin: string;
  avatarUrl: string | null;
};

export type MockWorkspace = {
  id: string;
  name: string;
  slug: string;
  intendedUsage: 'team' | 'personal' | 'organization';
  executionMode: 'Local TRACE' | 'Cloud' | 'Hybrid';
  profileComplete: boolean;
};

export type MockCliDevice = {
  id: string;
  organizationId: string;
  userId: string;
  label: string;
  tokenHash: string;
  scopes: string[];
  expiresAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MockEvidenceType =
  | 'file-location'
  | 'configuration'
  | 'dependency'
  | 'test-result'
  | 'schema'
  | 'git-change'
  | 'analysis-record';

export type MockEvidenceRecord = {
  id: string;
  repositoryId: string;
  findingId: string;
  changeId?: string | null;
  type: MockEvidenceType;
  path: string;
  lineRange?: string | null;
  label: string;
  explanation: string;
  verificationSource: string;
  classification: 'deterministic' | 'probabilistic';
  collectedAt: string;
  analysisCommit: string;
  sourceCodeIncluded: false;
  codeSnippetsIncluded: false;
};

export type MockUniverse = {
  workspace: MockWorkspace;
  currentUser: TraceUser;
  team: MockTeamMember[];
  devices: MockCliDevice[];
  repositories: DashboardRepository[];
  attention: DashboardAttention[];
  changes: DashboardChange[];
  reports: DashboardSyncedRecord[];
  conflicts: DashboardSyncedRecord[];
  decisions: DashboardSyncedRecord[];
  rules: DashboardSyncedRecord[];
  risks: DashboardSyncedRecord[];
  activity: DashboardActivity[];
  evidence: MockEvidenceRecord[];
};

export type MockDataProvider = {
  getUniverse(scenario?: MockScenarioKey): MockUniverse;
  getDashboardSummary(scenario?: MockScenarioKey): DashboardSummary;
  getSession(): TraceSession;
  getRepositories(scenario?: MockScenarioKey): DashboardRepository[];
  getDevices(): MockCliDevice[];
  getEvidence(scenario?: MockScenarioKey): MockEvidenceRecord[];
};
