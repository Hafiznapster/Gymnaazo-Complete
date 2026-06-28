import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  if (digits.startsWith('91') && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return phone
}

export function daysUntilExpiry(endDate: string): number {
  return differenceInDays(parseISO(endDate), new Date())
}

export type ExpiryUrgency = 'expired' | 'today' | 'critical' | 'warning' | 'upcoming' | 'safe'

export function getExpiryUrgency(endDate: string): ExpiryUrgency {
  const days = daysUntilExpiry(endDate)
  if (days < 0) return 'expired'
  if (days === 0) return 'today'
  if (days <= 3) return 'critical'
  if (days <= 7) return 'warning'
  if (days <= 30) return 'upcoming'
  return 'safe'
}

export const EXPIRY_URGENCY_COLORS: Record<ExpiryUrgency, string> = {
  expired: '#EF4444',
  today: '#EF4444',
  critical: '#F97316',
  warning: '#F59E0B',
  upcoming: '#3B82F6',
  safe: '#22C55E',
}

export const EXPIRY_URGENCY_LABELS: Record<ExpiryUrgency, string> = {
  expired: 'Expired',
  today: 'Expires Today',
  critical: 'Critical',
  warning: 'Warning',
  upcoming: 'Upcoming',
  safe: 'Active',
}
