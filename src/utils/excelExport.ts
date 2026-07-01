import * as XLSX from 'xlsx'
import { format } from 'date-fns'

// ─── Members Export ───────────────────────────────────────────────────────────
export function exportMembers(members: any[]) {
  const rows = members.map((m) => ({
    'Member ID': m.member_code,
    Name: m.name,
    Phone: m.phone,
    Email: m.email ?? '',
    Gender: m.gender ?? '',
    'Date of Birth': m.dob ?? '',
    Status: m.status,
    'Blood Group': m.blood_group ?? '',
    Address: m.address ?? '',
    'Emergency Contact': m.emergency_contact ?? '',
    Tags: (m.tags ?? []).join(', '),
    Source: m.source ?? '',
    'Joined At': format(new Date(m.joined_at), 'dd/MM/yyyy'),
    'WhatsApp Opted Out': m.whatsapp_opted_out ? 'Yes' : 'No',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  autoFitColumns(ws, rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Members')
  XLSX.writeFile(wb, `members-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

// ─── Payments Export ──────────────────────────────────────────────────────────
export function exportPayments(payments: any[]) {
  const rows = payments.map((p) => {
    const member = p.members as any
    return {
      'Receipt No': p.receipt_no,
      'Member Name': member?.name ?? '',
      'Member ID': member?.member_code ?? '',
      Type: p.type,
      Method: p.payment_method,
      Amount: Number(p.amount),
      Discount: Number(p.discount_amount ?? 0),
      Total: Number(p.amount) - Number(p.discount_amount ?? 0),
      Status: p.status,
      'Paid At': p.paid_at ? format(new Date(p.paid_at), 'dd/MM/yyyy HH:mm') : '',
      Notes: p.notes ?? '',
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  autoFitColumns(ws, rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Payments')
  XLSX.writeFile(wb, `payments-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

// ─── Attendance Export ────────────────────────────────────────────────────────
export function exportAttendance(logs: any[]) {
  const rows = logs.map((l) => {
    const member = l.members as any
    const checkIn = new Date(l.check_in_at)
    const checkOut = l.check_out_at ? new Date(l.check_out_at) : null
    const durationMins = checkOut
      ? Math.round((checkOut.getTime() - checkIn.getTime()) / 60000)
      : null

    return {
      'Member Name': member?.name ?? '',
      'Member ID': member?.member_code ?? '',
      Date: format(checkIn, 'dd/MM/yyyy'),
      'Check-in': format(checkIn, 'HH:mm'),
      'Check-out': checkOut ? format(checkOut, 'HH:mm') : 'Still inside',
      'Duration (mins)': durationMins ?? '',
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  autoFitColumns(ws, rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance')
  XLSX.writeFile(wb, `attendance-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

// ─── Expiring Members Export ──────────────────────────────────────────────────
export function exportExpiryList(subscriptions: any[]) {
  const rows = subscriptions.map((s) => {
    const member = s.members as any
    const plan = s.membership_plans as any
    const daysLeft = Math.ceil(
      (new Date(s.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    )
    return {
      'Member Name': member?.name ?? '',
      'Member ID': member?.member_code ?? '',
      Phone: member?.phone ?? '',
      Plan: plan?.name ?? '',
      'Start Date': format(new Date(s.start_date), 'dd/MM/yyyy'),
      'End Date': format(new Date(s.end_date), 'dd/MM/yyyy'),
      'Days Remaining': daysLeft,
      Status: s.status,
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  autoFitColumns(ws, rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Expiry List')
  XLSX.writeFile(wb, `expiry-list-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

// ─── Auto-fit column widths helper ───────────────────────────────────────────
function autoFitColumns(ws: XLSX.WorkSheet, data: Record<string, unknown>[]) {
  if (!data.length) return
  const keys = Object.keys(data[0])
  const colWidths = keys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length),
    )
    return { wch: Math.min(maxLen + 2, 40) }
  })
  ws['!cols'] = colWidths
}
