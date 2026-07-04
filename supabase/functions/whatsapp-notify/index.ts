import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { gym_id, phone, template_name, parameters } = await req.json()

    if (!gym_id || !phone || !template_name) {
      return new Response('Missing required fields', { status: 400 })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: config } = await supabaseClient
      .from('integration_configs')
      .select('api_key')
      .eq('gym_id', gym_id)
      .eq('provider', 'wati')
      .single()

    if (!config?.api_key) {
      return new Response('WATI API key not configured', { status: 400 })
    }

    // Call WATI API
    // Replace API_ENDPOINT with the actual WATI API endpoint for the client
    const watiEndpoint = `https://live-server-XXXX.wati.io/api/v1/sendTemplateMessage?whatsappNumber=${phone}`
    
    const response = await fetch(watiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_name: template_name,
        broadcast_name: `gymnazo_auto_${template_name}`,
        parameters: parameters // e.g. [{name: 'name', value: 'John'}]
      })
    })

    const result = await response.json()

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
