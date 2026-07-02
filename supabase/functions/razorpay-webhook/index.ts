import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts"

serve(async (req) => {
  try {
    const signature = req.headers.get('x-razorpay-signature')
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    
    if (!signature || !secret) {
      return new Response("Missing signature or secret", { status: 400 })
    }

    // Read the raw body as text for verification
    const rawBody = await req.text()
    
    // Verify signature
    const expectedSignature = hmac("sha256", secret, rawBody, "utf8", "hex")
    if (expectedSignature !== signature) {
      return new Response("Invalid signature", { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // We only care about payment.captured for now
    if (event.event === 'payment.captured') {
      const paymentData = event.payload.payment.entity
      const paymentId = paymentData.notes?.payment_id // Our DB ID

      if (paymentId) {
        // Initialize Supabase admin client to update DB
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Mark payment as 'paid'
        const { error } = await supabaseAdmin
          .from('payments')
          .update({ 
            payment_status: 'paid',
            metadata: {
              razorpay_payment_id: paymentData.id,
              razorpay_order_id: paymentData.order_id,
              method: paymentData.method
            }
          })
          .eq('id', paymentId)

        if (error) {
          console.error("Error updating payment in DB:", error)
          return new Response("Database error", { status: 500 })
        }
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return new Response(error.message, { status: 400 })
  }
})
