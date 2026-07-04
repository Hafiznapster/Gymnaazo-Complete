import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import crypto from "node:crypto"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-razorpay-signature')
    if (!signature) {
      return new Response('Missing signature', { status: 400 })
    }

    const payload = await req.text()
    const body = JSON.parse(payload)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const gymId = body.payload?.payment?.entity?.notes?.gym_id
    if (!gymId) {
      return new Response('Missing gym_id in notes', { status: 400 })
    }

    const { data: config } = await supabaseClient
      .from('integration_configs')
      .select('webhook_secret')
      .eq('gym_id', gymId)
      .eq('provider', 'razorpay')
      .single()

    if (!config?.webhook_secret) {
      return new Response('Webhook secret not configured', { status: 400 })
    }

    // Node:crypto requires running with --compat or via npm specifiers depending on deno version,
    // For Deno deploy, crypto web API is safer, but standard node:crypto is often supported via esm.sh
    const expectedSignature = crypto
      .createHmac('sha256', config.webhook_secret)
      .update(payload)
      .digest('hex')

    if (expectedSignature !== signature) {
      return new Response('Invalid signature', { status: 401 })
    }

    if (body.event === 'payment.captured') {
      const payment = body.payload.payment.entity
      const amount = payment.amount / 100 
      
      await supabaseClient
        .from('payments')
        .insert({
          gym_id: gymId,
          member_id: payment.notes.member_id,
          amount: amount,
          payment_method: 'upi',
          transaction_ref: payment.id,
          status: 'completed',
          type: payment.notes.type || 'subscription'
        })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
