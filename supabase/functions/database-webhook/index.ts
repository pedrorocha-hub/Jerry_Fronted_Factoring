import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar preflight requests de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Verificar configuración
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK')
    if (!n8nWebhookUrl) {
      console.error('Error crítico: La variable de entorno N8N_WEBHOOK no está configurada.')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing N8N_WEBHOOK' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parsear el payload
    let payload
    try {
      payload = await req.json()
      console.log('Webhook payload recibido:', JSON.stringify(payload, null, 2))
    } catch (e) {
      console.error('Error al parsear JSON del request:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Reenviar a n8n
    console.log('Enviando datos a n8n...')
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // 4. Manejar respuesta de n8n
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error respuesta n8n (Status ${response.status}):`, errorText)
      // No fallamos con 500 para el cliente si n8n falla, devolvemos 502 Bad Gateway o similar, 
      // pero para la función en sí es "éxito" haberlo intentado, aunque n8n falló.
      // Sin embargo, para alertar al que llama, retornamos error.
      return new Response(
        JSON.stringify({ 
          error: 'Error upstream from n8n', 
          status: response.status, 
          details: errorText 
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Intentar leer respuesta de n8n
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = { text: await response.text() }
    }

    console.log('Envío a n8n exitoso.')
    return new Response(
      JSON.stringify({ success: true, n8n_response: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Excepción no controlada en database-webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})