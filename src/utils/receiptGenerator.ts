import jsPDF from 'jspdf'
import { formatDate, formatCurrency } from './formatters'

interface ReceiptData {
  receiptNo: string
  memberName: string
  memberCode: string
  amount: number
  discountAmount: number
  taxAmount: number
  planName: string
  paymentMethod: string
  paymentDate: string
  validFrom?: string
  validTo?: string
  gymName: string
  gymAddress?: string | null
  gymPhone?: string | null
  gymGstin?: string | null
}

export function generateReceiptPDF(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 15

  // Purple header band
  doc.setFillColor(108, 99, 255)
  doc.rect(0, 0, pageWidth, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(data.gymName, pageWidth / 2, 12, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (data.gymAddress) doc.text(data.gymAddress, pageWidth / 2, 19, { align: 'center' })
  if (data.gymPhone) doc.text(data.gymPhone, pageWidth / 2, 26, { align: 'center' })

  y = 40
  doc.setTextColor(30, 30, 30)

  // Title
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT RECEIPT', pageWidth / 2, y, { align: 'center' })
  y += 8

  // Meta row
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Receipt: ${data.receiptNo}`, 12, y)
  doc.text(`Date: ${formatDate(data.paymentDate)}`, pageWidth - 12, y, { align: 'right' })
  y += 5

  // Separator
  doc.setDrawColor(210, 210, 210)
  doc.line(12, y, pageWidth - 12, y)
  y += 7

  doc.setTextColor(30, 30, 30)

  const addRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(label, 12, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, pageWidth / 2, y)
    y += 7
  }

  addRow('Member Name:', data.memberName)
  addRow('Member ID:', data.memberCode)
  addRow('Plan:', data.planName)
  addRow('Payment Mode:', data.paymentMethod.replace(/_/g, ' ').toUpperCase())
  if (data.validFrom) addRow('Valid From:', formatDate(data.validFrom))
  if (data.validTo) addRow('Valid To:', formatDate(data.validTo))

  y += 2
  doc.line(12, y, pageWidth - 12, y)
  y += 7

  // Amount section
  const grossAmount = data.amount + data.discountAmount
  if (data.discountAmount > 0) {
    addRow('Subtotal:', formatCurrency(grossAmount))
    addRow('Discount:', `- ${formatCurrency(data.discountAmount)}`)
  }
  if (data.taxAmount > 0) {
    addRow('Tax (GST):', formatCurrency(data.taxAmount))
  }

  // Total
  doc.setFillColor(245, 243, 255)
  doc.rect(12, y - 2, pageWidth - 24, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(108, 99, 255)
  doc.text('Amount Paid', 16, y + 5)
  doc.text(formatCurrency(data.amount), pageWidth - 16, y + 5, { align: 'right' })
  y += 18

  // Footer
  doc.setTextColor(140, 140, 140)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.line(12, y, pageWidth - 12, y)
  y += 5
  doc.text('This is a computer-generated receipt.', pageWidth / 2, y, { align: 'center' })
  if (data.gymGstin) {
    y += 5
    doc.text(`GSTIN: ${data.gymGstin}`, pageWidth / 2, y, { align: 'center' })
  }
  y += 5
  doc.text(`Thank you for choosing ${data.gymName}! 💪`, pageWidth / 2, y, { align: 'center' })

  return doc
}
