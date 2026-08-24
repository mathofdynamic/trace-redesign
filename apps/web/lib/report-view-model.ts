import type { DashboardRepository, DashboardSyncedRecord } from './dashboard';
import { getDateGroupLabel, MOCK_REFERENCE_DATE } from './reference-clock';

export interface ReportsSummaryMetrics {
  totalReportsCount: number;
  syncedRepositoriesCount: number;
  totalRepositoriesCount: number;
  currentCount: number;
  needsRefreshCount: number;
  attentionCount: number;
}

export function computeReportsSummaryMetrics(
  reports: DashboardSyncedRecord[],
  repositories: DashboardRepository[],
): ReportsSummaryMetrics {
  const totalReportsCount = reports.length;

  // Synced repositories are repositories with active synced reports or connected state
  const reposWithReports = new Set(reports.map((r) => r.repositoryId));
  const syncedRepositoriesCount = repositories.filter(
    (repo) => reposWithReports.has(repo.id) || (repo.syncState && repo.syncState !== 'not_analyzed'),
  ).length;

  const totalRepositoriesCount = repositories.length;
  const currentCount = reports.filter((r) => !r.freshness || r.freshness === 'current').length;
  const needsRefreshCount = reports.filter((r) => r.freshness === 'needs-refresh').length;
  const attentionCount = reports.filter((r) => r.freshness === 'attention').length;

  return {
    totalReportsCount,
    syncedRepositoriesCount,
    totalRepositoriesCount,
    currentCount,
    needsRefreshCount,
    attentionCount,
  };
}

export function groupReportsByDate(
  reports: DashboardSyncedRecord[],
  referenceDate: string | Date = MOCK_REFERENCE_DATE,
): Array<{ label: string; reports: DashboardSyncedRecord[] }> {
  const groups = new Map<string, DashboardSyncedRecord[]>();

  for (const report of reports) {
    const group = getDateGroupLabel(report.generatedAt, referenceDate);
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(report);
  }

  const result: Array<{ label: string; reports: DashboardSyncedRecord[] }> = [];
  for (const [label, grpReports] of groups.entries()) {
    if (grpReports.length > 0) {
      result.push({ label, reports: grpReports });
    }
  }

  return result;
}

export interface RepoEmptyStateReason {
  isUnsyncedOrPending: boolean;
  title: string;
  description: string;
  recommendedCommands: string[];
}

export function getRepositoryReportEmptyState(
  selectedRepo: DashboardRepository | undefined,
): RepoEmptyStateReason {
  if (!selectedRepo) {
    return {
      isUnsyncedOrPending: false,
      title: 'No reports match the selected filters',
      description: 'Adjust your search query or reset the filters to view matching records.',
      recommendedCommands: ['trace analyze', 'trace sync --dry-run', 'trace sync'],
    };
  }

  if (selectedRepo.syncState === 'not_analyzed' || selectedRepo.syncState === 'pending') {
    return {
      isUnsyncedOrPending: true,
      title: `${selectedRepo.name} has not been analyzed yet`,
      description:
        'This repository is registered in the workspace, but no local .trace artifacts have been generated or synchronized.',
      recommendedCommands: ['trace analyze', 'trace sync --dry-run', 'trace sync'],
    };
  }

  return {
    isUnsyncedOrPending: false,
    title: `No reports found for ${selectedRepo.name}`,
    description:
      'Run local TRACE analysis and synchronize artifacts to publish reports for this repository.',
    recommendedCommands: ['trace analyze', 'trace sync --dry-run', 'trace sync'],
  };
}
