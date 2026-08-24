/**
 * Reference Clock & Date Helpers
 *
 * Provides a deterministic reference clock for the frozen mock universe
 * while cleanly accepting runtime reference dates or real dates.
 */

export const MOCK_REFERENCE_DATE = '2026-08-19T20:00:00.000Z';

export function getEffectiveReferenceDate(override?: string | Date): Date {
  if (override) {
    return typeof override === 'string' ? new Date(override) : override;
  }
  return new Date(MOCK_REFERENCE_DATE);
}

export function getDateGroupLabel(
  dateString: string,
  referenceDate: string | Date = MOCK_REFERENCE_DATE,
): string {
  const target = new Date(dateString);
  const ref = getEffectiveReferenceDate(referenceDate);

  const diffDays = Math.floor(
    (Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate()) -
      Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())) /
      86_400_000,
  );

  if (diffDays <= 0) {
    const formatted = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `Today (${formatted})`;
  }
  if (diffDays === 1) {
    const formatted = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `Yesterday (${formatted})`;
  }
  if (diffDays < 7) {
    return 'This week';
  }
  return 'Earlier';
}
