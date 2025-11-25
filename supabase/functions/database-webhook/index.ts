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

interface UserData {
  id: string;
  email: string;
  fullName: string | null;
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
  user: UserData;
}

// Document types that require AI processing via webhook
const AUTO_PROCESS_TYPES = ['ficha_ruc', 'reporte_tributario', 'sentinel'];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== DATABASE WEBHOOK TRIGGERED ===')
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')

    if (!supabaseUrl || !supabaseServiceKey || !n8nWebhookUrl) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse webhook payload
    let webhookData: DatabaseWebhookPayload
    try {
      const bodyText = await req.text()
      webhookData = JSON.parse(bodyText)
    } catch (error) {
      console.error('❌ Invalid JSON in webhook payload:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in webhook payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Only process INSERT events on documentos table
    if (webhookData.type !== 'INSERT' || webhookData.table !== 'documentos') {
      return new Response(
        JSON.stringify({ message: 'Webhook received but not processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const documento = webhookData.record
    console.log('📄 New document inserted:', { id: documento.id, tipo: documento.tipo, file: documento.nombre_archivo })

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // FILTER: Check if document type requires processing
    if (!AUTO_PROCESS_TYPES.includes(documento.tipo)) {
      console.log(`⏭️ Skipping AI processing for type '${documento.tipo}'. Marking as completed.`)
      
      // Automatically mark as completed if it wasn't already
      if (documento.estado !== 'completed') {
        await supabase
          .from('documentos')
          .update({ 
            estado: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', documento.id)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Document skipped (no AI processing required)',
          processed: false 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- PROCEED WITH WEBHOOK FOR SELECTED TYPES ---

    console.log('Step 1: Getting user data...')
    let userData: UserData = { id: '', email: '', fullName: null }

    if (documento.created_by) {
      // Handle created_by if it's a string ID
      if (typeof documento.created_by === 'string') {
        const { data: authUser } = await supabase.auth.admin.getUserById(documento.created_by)
        if (authUser?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', documento.created_by)
            .single()

          userData = {
            id: authUser.user.id,
            email: authUser.user.email || '',
            fullName: profile?.full_name || null
          }
        }
      }
    }

    console.log('Step 2: Generating signed URL...')
    // Generate signed URL for the document (10 minutes TTL)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documentos')
      .createSignedUrl(documento.storage_path, 600)

    if (signedUrlError) {
      console.error('❌ Error generating signed URL:', signedUrlError)
      await supabase
        .from('documentos')
        .update({ estado: 'error', error_msg: `Failed to generate signed URL: ${signedUrlError.message}` })
        .eq('id', documento.id)
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate signed URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Step 3: Updating document status to processing...')
    await supabase
      .from('documentos')
      .update({ estado: 'processing', updated_at: new Date().toISOString() })
      .eq('id', documento.id)

    console.log('Step 4: Sending payload to n8n webhook...')
    
    const n8nPayload: N8nPayload = {
      documento_id: documento.id,
      tipo: documento.tipo,
      storage_path: documento.storage_path,
      signed_url: signedUrlData.signedUrl,
      nombre_archivo: documento.nombre_archivo || 'unknown.pdf',
      size_bytes: documento.tamaño_archivo || 0,
      signed_ttl_seconds: 600,
      trigger_type: 'database_webhook',
      user: userData
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload)
    })

    if (n8nResponse.ok) {
      console.log('✅ N8n webhook responded successfully')
      return new Response(
        JSON.stringify({ success: true, message: 'Document dispatched successfully', status: 'processing' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      const errorText = await n8nResponse.text()
      console.error('❌ N8n webhook error:', errorText)
      
      await supabase
        .from('documentos')
        .update({ estado: 'error', error_msg: `N8n webhook error: ${errorText}` })
        .eq('id', documento.id)

      return new Response(
        JSON.stringify({ error: 'N8n webhook failed', details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ Unexpected error in database webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})