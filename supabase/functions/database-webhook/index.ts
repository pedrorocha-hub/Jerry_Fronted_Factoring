import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DatabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  schema: string;
  old_record?: any;
}

interface N8nPayload {
  documento_id: string;
  tipo: string;
  storage_path: string;
  signed_url: string;
  nombre_archivo: string;
  size_bytes: number;
  signed_ttl_seconds: number;
  trigger_type: 'database_webhook';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== DATABASE WEBHOOK TRIGGERED ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
      supabaseServiceKey: supabaseServiceKey ? 'SET' : 'MISSING',
      n8nWebhookUrl: n8nWebhookUrl ? 'SET' : 'MISSING'
    })

    if (!supabaseUrl || !supabaseServiceKey || !n8nWebhookUrl) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse webhook payload
    let webhookData: DatabaseWebhookPayload
    try {
      const bodyText = await req.text()
      console.log('Raw webhook payload:', bodyText)
      webhookData = JSON.parse(bodyText)
      console.log('Parsed webhook data:', webhookData)
    } catch (error) {
      console.error('❌ Invalid JSON in webhook payload:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in webhook payload' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Only process INSERT events on documentos table
    if (webhookData.type !== 'INSERT' || webhookData.table !== 'documentos') {
      console.log('⏭️ Skipping webhook - not an INSERT on documentos table')
      return new Response(
        JSON.stringify({ 
          message: 'Webhook received but not processed',
          reason: `Event type: ${webhookData.type}, Table: ${webhookData.table}`
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const documento = webhookData.record
    console.log('📄 New document inserted:', documento)

    // Validate document data
    if (!documento.id || !documento.tipo || !documento.storage_path) {
      console.error('❌ Missing required document fields')
      return new Response(
        JSON.stringify({ error: 'Missing required document fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Step 1: Generating signed URL...')
    console.log('Storage path:', documento.storage_path)
    
    // Generate signed URL for the document (10 minutes TTL)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documentos')
      .createSignedUrl(documento.storage_path, 600) // 10 minutes

    if (signedUrlError) {
      console.error('❌ Error generating signed URL:', signedUrlError)
      
      // Update document with error
      await supabase
        .from('documentos')
        .update({ 
          estado: 'error',
          error_msg: `Failed to generate signed URL: ${signedUrlError.message}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', documento.id)
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate signed URL',
          details: signedUrlError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Signed URL generated successfully')

    console.log('Step 2: Updating document status to processing...')
    
    // Update document status to 'processing'
    const { error: updateError } = await supabase
      .from('documentos')
      .update({ 
        estado: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', documento.id)

    if (updateError) {
      console.error('❌ Error updating document status:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update document status',
          details: updateError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Document status updated to processing')

    console.log('Step 3: Sending payload to n8n webhook...')
    console.log('N8n webhook URL:', n8nWebhookUrl)
    
    // Prepare payload for n8n
    const n8nPayload: N8nPayload = {
      documento_id: documento.id,
      tipo: documento.tipo,
      storage_path: documento.storage_path,
      signed_url: signedUrlData.signedUrl,
      nombre_archivo: documento.nombre_archivo || 'unknown.pdf',
      size_bytes: documento.tamaño_archivo || 0,
      signed_ttl_seconds: 600,
      trigger_type: 'database_webhook'
    }

    console.log('N8n payload (signed_url redacted):', {
      ...n8nPayload,
      signed_url: '[REDACTED - Length: ' + signedUrlData.signedUrl.length + ' chars]'
    })

    // Send POST to n8n webhook
    console.log('📤 Sending POST to n8n...')
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    console.log('📥 N8n response received:', {
      status: n8nResponse.status,
      statusText: n8nResponse.statusText,
      ok: n8nResponse.ok,
      headers: Object.fromEntries(n8nResponse.headers.entries())
    })

    if (n8nResponse.ok) {
      let n8nResponseBody = 'No response body'
      try {
        n8nResponseBody = await n8nResponse.text()
        console.log('✅ N8n response body:', n8nResponseBody)
      } catch (e) {
        console.log('⚠️ Could not read n8n response body')
      }
      
      console.log('✅ N8n webhook responded successfully')
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Document dispatched successfully via database webhook',
          documento_id: documento.id,
          status: 'processing',
          n8n_response: n8nResponseBody
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      // N8n responded with error
      const errorText = await n8nResponse.text()
      console.error('❌ N8n webhook error:', {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        body: errorText
      })

      // Update document status to 'error'
      const { error: errorUpdateError } = await supabase
        .from('documentos')
        .update({ 
          estado: 'error',
          error_msg: `N8n webhook error (${n8nResponse.status}): ${errorText}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', documento.id)

      if (errorUpdateError) {
        console.error('❌ Error updating document error status:', errorUpdateError)
      }

      return new Response(
        JSON.stringify({ 
          error: 'N8n webhook failed',
          status_code: n8nResponse.status,
          details: errorText
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('❌ Unexpected error in database webhook:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})