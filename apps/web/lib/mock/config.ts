import type { MockScenarioKey } from './types';

/**
 * Validates whether development mock mode is active.
 * Strict safety: mock mode cannot be enabled silently in standard production environments.
 */
export function isMockModeEnabled(): boolean {
  const envFlag =
    process.env.TRACE_MOCK_MODE === 'true' ||
    process.env.NEXT_PUBLIC_TRACE_MOCK_MODE === 'true';

  // If we are in standard production and no explicit preview/mock override is set, force false.
  if (process.env.NODE_ENV === 'production' && !process.env.TRACE_ALLOW_PRODUCTION_MOCKS) {
    return false;
  }

  return envFlag;
}

/**
 * Retrieves the currently active mock scenario key from environment or headers.
 */
export function getActiveMockScenario(): MockScenarioKey {
  const envScenario = process.env.TRACE_MOCK_SCENARIO as MockScenarioKey | undefined;
  const validScenarios: MockScenarioKey[] = [
    'default',
    'github-unavailable',
    'permission-missing',
    'analysis-running',
    'analysis-failed',
    'sync-running',
    'sync-failed',
    'freshness-unavailable',
    'no-analysis',
  ];

  if (envScenario && validScenarios.includes(envScenario)) {
    return envScenario;
  }

  return 'default';
}
