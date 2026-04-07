/**
 * Date/time utilities with timezone support using dayjs.
 * Matches the original A73 platform's date handling.
 */

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isoWeek)

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_TZ = 'Asia/Shanghai'

function getTz() {
  try {
    const stored = localStorage.getItem('tenant_timezone')
    return stored || DEFAULT_TZ
  } catch {
    return DEFAULT_TZ
  }
}

export function setTimezone(tz) {
  localStorage.setItem('tenant_timezone', tz)
}

/**
 * Convert a UTC datetime to the tenant's timezone.
 */
export function toLocal(utcDate, format) {
  const tz = getTz()
  return format
    ? dayjs.utc(utcDate).tz(tz).format(format)
    : dayjs.utc(utcDate).tz(tz)
}

/**
 * Format a UTC datetime with full date+time format.
 */
export function formatDateTime(utcDate, format = DATETIME_FORMAT) {
  return dayjs.utc(utcDate).tz(getTz()).format(format)
}

/**
 * Format a UTC date with date-only format.
 */
export function formatDateOnly(utcDate, format = DATE_FORMAT) {
  return dayjs.utc(utcDate).tz(getTz()).format(format)
}

/**
 * Convert a local datetime to UTC.
 */
export function toUTC(localDate, format) {
  const tz = getTz()
  return format
    ? dayjs(localDate).tz(tz).utc().format(format)
    : dayjs(localDate).tz(tz).utc()
}

/**
 * Get the current time in the tenant's timezone.
 */
export function now(format) {
  const tz = getTz()
  return format ? dayjs().tz(tz).format(format) : dayjs().tz(tz)
}

/**
 * Get tomorrow in the tenant's timezone.
 */
export function tomorrow(format) {
  const tz = getTz()
  return dayjs().tz(tz).add(1, 'day').format(format)
}

/**
 * Get today's date string.
 */
export function today() {
  return now(DATE_FORMAT)
}

/**
 * Get a past date string.
 */
export function daysAgo(n = 1) {
  return dayjs().tz(getTz()).subtract(n, 'day').format(DATE_FORMAT)
}

/**
 * Parse a date string in the tenant's timezone.
 */
export function parseLocal(dateStr) {
  return dayjs.tz(dateStr, getTz())
}

/**
 * Calculate time difference from now to a target date (in tenant TZ).
 */
export function getTimeDiff(targetUtcDate) {
  const tz = getTz()
  const target = dayjs.utc(targetUtcDate).tz(tz)
  const current = dayjs().tz(tz)

  return {
    day: target.diff(current, 'd'),
    hour: target.diff(current, 'h'),
    minute: target.diff(current, 'm'),
    second: target.diff(current, 's')
  }
}

/**
 * Get start and end of a time period.
 */
export function getPeriodRange(unit, offset = 0) {
  const tz = getTz()
  let start = dayjs().tz(tz)
  let end = dayjs().tz(tz)

  if (offset !== 0) {
    start = start.subtract(Math.abs(offset), unit)
    end = end.subtract(Math.abs(offset), unit)
  }

  const rangeUnit = unit === 'week' ? 'isoWeek' : unit

  return {
    start: start.startOf(rangeUnit),
    end: end.endOf(rangeUnit)
  }
}

export function getThisWeek() { return getPeriodRange('week', 0) }
export function getLastWeek() { return getPeriodRange('week', 1) }
export function getThisMonth() { return getPeriodRange('month', 0) }
export function getLastMonth() { return getPeriodRange('month', 1) }
export function getToday() { return getPeriodRange('day', 0) }
export function getYesterday() { return getPeriodRange('day', 1) }

/**
 * Check if a date string is parseable JSON.
 */
export function isJsonString(str) {
  if (typeof str !== 'string') return false
  try {
    const parsed = JSON.parse(str)
    return !!parsed && typeof parsed === 'object'
  } catch {
    return false
  }
}

export { dayjs, DATETIME_FORMAT, DATE_FORMAT, DEFAULT_TZ }
