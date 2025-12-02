import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!n8nWebhookUrl || !supabaseUrl || !supabaseServiceKey) {
      console.error('Error crítico: Variables de entorno faltantes (N8N_WEBHOOK, SUPABASE_URL o SERVICE_KEY).')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parsear el payload del trigger
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

    // 3. Generar Signed URL si hay un storage_path en el registro
    const record = payload.record
    if (record && record.storage_path) {
      console.log('Generando Signed URL para:', record.storage_path)
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Asumimos que el bucket se llama 'documentos' basado en tu código anterior
      const { data, error } = await supabase
        .storage
        .from('documentos')
        .createSignedUrl(record.storage_path, 3600) // URL válida por 1 hora

      if (error) {
        console.error('Error generando signed URL:', error)
        // No detenemos el proceso, enviamos lo que tenemos, pero logueamos el error
        payload.signed_url_error = error.message
      } else if (data) {
        console.log('Signed URL generada exitosamente.')
        // Adjuntamos la URL firmada al payload que se envía a n8n
        payload.signed_url = data.signedUrl
        // También adjuntamos info útil extra
        payload.signed_url_expires_at = new Date(Date.now() + 3600 * 1000).toISOString()
      }
    }

    // 4. Reenviar a n8n con la URL firmada incluida
    console.log('Enviando payload enriquecido a n8n...')
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // 5. Manejar respuesta de n8n
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error respuesta n8n (Status ${response.status}):`, errorText)
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