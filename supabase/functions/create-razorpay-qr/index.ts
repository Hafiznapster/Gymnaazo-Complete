import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { member_id, payment_id, amount, notes } = await req.json()

    // 1. Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Fetch member details
    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('name, phone, gym_id')
      .eq('id', member_id)
      .single()

    if (memberError || !member) throw new Error('Member not found')

    // 3. Razorpay API Call
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!keyId || !keySecret) throw new Error('Razorpay keys not configured')

    const auth = btoa(`${keyId}:${keySecret}`)

    // Create QR code
    const qrPayload = {
      type: "upi_qr",
      name: `Gymnazo - ${member.name}`,
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amount * 100, // Convert to paise
      description: notes || `Payment for Gym Services`,
      notes: {
        payment_id: payment_id,
        member_id: member_id,
        gym_id: member.gym_id
      }
    }

    const qrResponse = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(qrPayload)
    })

    if (!qrResponse.ok) {
      const errorText = await qrResponse.text()
      throw new Error(`Razorpay API Error: ${errorText}`)
    }

    const qrData = await qrResponse.json()

    // 4. Update payment record with QR details
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({ 
        metadata: { 
          razorpay_qr_id: qrData.id,
          razorpay_qr_url: qrData.image_url,
          status: 'qr_generated'
        }
      })
      .eq('id', payment_id)

    if (updateError) throw new Error('Failed to update payment record')

    return new Response(
      JSON.stringify({ 
        success: true, 
        qr_id: qrData.id, 
        qr_url: qrData.image_url 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
