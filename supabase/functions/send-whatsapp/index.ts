import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { corsHeaders } from "../_shared/cors.ts"

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE'
  table: string
  record: any
  old_record: any
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: WebhookPayload = await req.json()
    
    // Validate this is coming from Supabase (optional: check secret header)
    const webhookSecret = req.headers.get('x-supabase-webhook-secret')
    if (webhookSecret !== Deno.env.get('SUPABASE_WEBHOOK_SECRET')) {
      return new Response("Unauthorized", { status: 401 })
    }

    const watiEndpoint = Deno.env.get('WATI_API_ENDPOINT')
    const watiToken = Deno.env.get('WATI_API_KEY')

    if (!watiEndpoint || !watiToken) {
      console.warn("WATI API keys missing, skipping notification")
      return new Response("OK", { status: 200 })
    }

    // Initialize Supabase admin client to fetch related data if needed
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let phone = ""
    let templateName = ""
    let parameters: any[] = []

    // Trigger Logic Based on Table
    if (payload.table === 'members' && payload.type === 'INSERT') {
      phone = payload.record.phone
      templateName = "welcome_member"
      parameters = [
        { name: "name", value: payload.record.name },
        { name: "gym_name", value: "Gymnazo" } // Could fetch gym name dynamically
      ]
    } 
    else if (payload.table === 'payments' && payload.record.payment_status === 'paid' && (payload.type === 'INSERT' || (payload.type === 'UPDATE' && payload.old_record.payment_status !== 'paid'))) {
      // Fetch member phone
      const { data: member } = await supabaseAdmin.from('members').select('name, phone').eq('id', payload.record.member_id).single()
      if (member) {
        phone = member.phone
        templateName = "payment_receipt"
        parameters = [
          { name: "name", value: member.name },
          { name: "amount", value: payload.record.amount.toString() },
          { name: "receipt_no", value: payload.record.receipt_no }
        ]
      }
    }
    // Add other triggers (expiry reminders, etc.) via cron or other webhooks

    if (phone && templateName) {
      // Clean phone number (WATI requires country code, e.g., 91 for India)
      let cleanPhone = phone.replace(/\D/g, '')
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone

      // Send to WATI
      const response = await fetch(`${watiEndpoint}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${watiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_name: templateName,
          broadcast_name: `Automated_${templateName}`,
          parameters: parameters
        })
      })

      if (!response.ok) {
        console.error("WATI API Error:", await response.text())
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Error in send-whatsapp function:", error)
    return new Response(error.message, { status: 400 })
  }
})
