esta es la funcion, puede que este mal?
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-invoke-token'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed. Only POST is accepted.'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK');
    const invokeToken = Deno.env.get('INVOKE_TOKEN');
    if (!supabaseUrl || !supabaseServiceKey || !n8nWebhookUrl) {
      return new Response(JSON.stringify({
        error: 'Server configuration error'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validate invoke token ONLY if it's configured
    if (invokeToken && invokeToken.trim() !== '') {
      const providedToken = req.headers.get('x-invoke-token');
      console.log('INVOKE_TOKEN validation:', {
        configured: 'YES',
        provided: providedToken ? 'YES' : 'NO',
        matches: providedToken === invokeToken
      });
      if (!providedToken || providedToken !== invokeToken) {
        console.log('❌ INVOKE_TOKEN validation failed');
        return new Response(JSON.stringify({
          error: 'Unauthorized - Invalid or missing invoke token',
          hint: 'Make sure to include x-invoke-token header'
        }), {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      console.log('✅ INVOKE_TOKEN validated successfully');
    } else {
      console.log('⚠️ INVOKE_TOKEN not configured - skipping validation');
    }
    // Parse request body
    let documentData;
    try {
      const bodyText = await req.text();
      documentData = JSON.parse(bodyText);
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error);
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validate required fields
    const requiredFields = [
      'id',
      'tipo',
      'storage_path',
      'nombre_archivo',
      'size_bytes'
    ];
    for (const field of requiredFields){
      if (!documentData[field]) {
        return new Response(JSON.stringify({
          error: `Missing required field: ${field}`
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Generate signed URL for the document (10 minutes TTL)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('documentos').createSignedUrl(documentData.storage_path, 600) // 10 minutes
    ;
    if (signedUrlError) {
      return new Response(JSON.stringify({
        error: 'Failed to generate signed URL',
        details: signedUrlError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Update document status to 'processing'
    const { error: updateError } = await supabase.from('documentos').update({
      estado: 'processing',
      updated_at: new Date().toISOString()
    }).eq('id', documentData.id);
    if (updateError) {
      console.error('❌ Error updating document status:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to update document status',
        details: updateError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Prepare payload for n8n
    const n8nPayload = {
      documento_id: documentData.id,
      tipo: documentData.tipo,
      storage_path: documentData.storage_path,
      signed_url: signedUrlData.signedUrl,
      nombre_archivo: documentData.nombre_archivo,
      size_bytes: documentData.size_bytes,
      signed_ttl_seconds: 600
    };
    // Send POST to n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(n8nPayload)
    });
    if (n8nResponse.ok) {
      let n8nResponseBody = 'No response body';
      try {
        n8nResponseBody = await n8nResponse.text();
        console.log('✅ N8n response body:', n8nResponseBody);
      } catch (e) {
        console.log('⚠️ Could not read n8n response body');
      }
      return new Response(JSON.stringify({
        success: true,
        message: 'Document dispatched successfully',
        documento_id: documentData.id,
        status: 'processing',
        n8n_response: n8nResponseBody
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else {
      // N8n responded with error
      const errorText = await n8nResponse.text();
      console.error('❌ N8n webhook error:', {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        body: errorText
      });
      // Update document status to 'error'
      const { error: errorUpdateError } = await supabase.from('documentos').update({
        estado: 'error',
        error_msg: `N8n webhook error (${n8nResponse.status}): ${errorText}`,
        updated_at: new Date().toISOString()
      }).eq('id', documentData.id);
      if (errorUpdateError) {
        console.error('❌ Error updating document error status:', errorUpdateError);
      }
      return new Response(JSON.stringify({
        error: 'N8n webhook failed',
        status_code: n8nResponse.status,
        details: errorText
      }), {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});