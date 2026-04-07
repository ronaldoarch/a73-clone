/**
 * Date range filter helpers for reports and record pages.
 * Provides preset date ranges (today, last 3/5/7/15/30 days)
 * with both UTC and local time support.
 */

import { toLocal, now, daysAgo } from './dateTime'

/**
 * Generate a list of date range presets based on max days allowed.
 * @param {number} maxDays - Maximum days (3, 5, 7, 15, or 30)
 * @returns {Array<{name: string, value: number}>}
 */
export function getDateRangePresets(maxDays = 30) {
  const allPresets = [
    { name: 'today', value: 1 },
    { name: 'lastThreeDays', value: 3 },
    { name: 'lastFiveDays', value: 5 },
    { name: 'lastSevenDays', value: 7 },
    { name: 'lastFifteenDays', value: 15 },
    { name: 'lastThirtyDays', value: 30 }
  ]

  return allPresets.filter(p => p.value <= maxDays)
}

/**
 * Calculate start and end dates for a named period (local time).
 * @param {string} period - e.g., 'today', 'lastThreeDays', 'lastSevenDays'
 * @returns {{ startTime: string, endTime: string } | undefined}
 */
export function getDateRangeLocal(period) {
  const dayOffsets = {
    today: 0,
    lastThreeDays: 2,
    lastFiveDays: 4,
    lastSevenDays: 6,
    lastFifteenDays: 14,
    lastThirtyDays: 29
  }

  const offset = dayOffsets[period]
  if (offset === undefined) return undefined

  const end = now()
  const start = daysAgo(offset)

  return {
    startTime: start,
    endTime: end
  }
}

/**
 * Preset names for i18n keys.
 */
export const DateRangeI18nKeys = Object.freeze({
  today: 'date.today',
  lastThreeDays: 'date.lastThreeDays',
  lastFiveDays: 'date.lastFiveDays',
  lastSevenDays: 'date.lastSevenDays',
  lastFifteenDays: 'date.lastFifteenDays',
  lastThirtyDays: 'date.lastThirtyDays'
})

/**
 * Build a time filter option list for UI dropdowns.
 * @param {Function} t - Translation function
 * @returns {Array<{name: string, value: string}>}
 */
export function buildTimeFilterOptions(t) {
  return [
    { name: t('main.all'), value: 'all' },
    { name: t('date.today'), value: 'today' },
    { name: t('date.lastSevenDays'), value: 'lastSevenDays' },
    { name: t('date.lastThirtyDays'), value: 'lastThirtyDays' }
  ]
}
