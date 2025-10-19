import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-invoke-token',
}

interface DocumentRequest {
  id: string;
  tipo: string;
  storage_path: string;
  nombre_archivo: string;
  size_bytes: number;
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
  user: UserData;
}

serve(async (req) => {
  console.log('🚨 DISPATCH-DOCUMENT EDGE FUNCTION STARTED 🚨')
  console.log('🚨 Request method:', req.method)
  console.log('🚨 Timestamp:', new Date().toISOString())
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Only POST is accepted.' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    console.log('=== DISPATCH DOCUMENT STARTED ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
    const invokeToken = Deno.env.get('INVOKE_TOKEN')

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
      supabaseServiceKey: supabaseServiceKey ? 'SET' : 'MISSING',
      n8nWebhookUrl: n8nWebhookUrl ? 'SET' : 'MISSING',
      invokeToken: invokeToken ? 'SET' : 'NOT_SET'
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

    // Validate invoke token ONLY if it's configured
    if (invokeToken && invokeToken.trim() !== '') {
      const providedToken = req.headers.get('x-invoke-token')
      console.log('INVOKE_TOKEN validation:', {
        configured: 'YES',
        provided: providedToken ? 'YES' : 'NO',
        matches: providedToken === invokeToken
      })
      
      if (!providedToken || providedToken !== invokeToken) {
        console.log('❌ INVOKE_TOKEN validation failed')
        return new Response(
          JSON.stringify({ 
            error: 'Unauthorized - Invalid or missing invoke token',
            hint: 'Make sure to include x-invoke-token header'
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      console.log('✅ INVOKE_TOKEN validated successfully')
    } else {
      console.log('⚠️ INVOKE_TOKEN not configured - skipping validation')
    }

    // Parse request body
    let documentData: DocumentRequest
    try {
      const bodyText = await req.text()
      console.log('Raw request body:', bodyText)
      documentData = JSON.parse(bodyText)
      console.log('Parsed request data:', documentData)
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate required fields
    const requiredFields = ['id', 'tipo', 'storage_path', 'nombre_archivo', 'size_bytes']
    for (const field of requiredFields) {
      if (!documentData[field as keyof DocumentRequest]) {
        console.error(`❌ Missing required field: ${field}`)
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Step 1: Getting document with user info...')
    
    // Get document with created_by from database
    const { data: documento, error: documentError } = await supabase
      .from('documentos')
      .select('*, created_by')
      .eq('id', documentData.id)
      .single()

    if (documentError) {
      console.error('❌ Error fetching document:', documentError)
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('📄 Document fetched from DB:', documento)
    console.log('📄 Document created_by field:', documento.created_by)
    console.log('📄 All document fields:', Object.keys(documento))

    console.log('Step 2: Getting user data...')
    let userData: UserData = {
      id: '',
      email: '',
      fullName: null
    }

    if (documento.created_by) {
      console.log('created_by type:', typeof documento.created_by)
      console.log('created_by value:', documento.created_by)
      
      // Check if created_by is already a user object or just an ID
      if (typeof documento.created_by === 'object' && documento.created_by !== null) {
        // created_by is already a user object
        console.log('created_by is an object, extracting data directly')
        userData = {
          id: documento.created_by.id || '',
          email: documento.created_by.email || '',
          fullName: documento.created_by.full_name || null
        }
        console.log('User data from object:', userData)
      } else if (typeof documento.created_by === 'string') {
        // created_by is a user ID, need to fetch user data
        console.log('created_by is a string ID, fetching user data')
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(documento.created_by)
        
        if (!authError && authUser.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', documento.created_by)
            .single()

          userData = {
            id: authUser.user.id,
            email: authUser.user.email || '',
            fullName: profile?.full_name || null
          }
          
          console.log('User data from API:', userData)
        } else {
          console.warn('Could not fetch user data:', authError?.message)
        }
      } else {
        console.warn('created_by has unexpected type:', typeof documento.created_by)
      }
    } else {
      console.warn('Document has no created_by')
    }

    console.log('Step 3: Generating signed URL...')
    console.log('Storage path:', documentData.storage_path)
    
    // Generate signed URL for the document (10 minutes TTL)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documentos')
      .createSignedUrl(documentData.storage_path, 600) // 10 minutes

    if (signedUrlError) {
      console.error('❌ Error generating signed URL:', signedUrlError)
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

    console.log('Step 4: Updating document status to processing...')
    
    // Update document status to 'processing'
    const { error: updateError } = await supabase
      .from('documentos')
      .update({ 
        estado: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentData.id)

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

    console.log('Step 5: Sending payload to n8n webhook...')
    console.log('N8n webhook URL:', n8nWebhookUrl)
    
    // Prepare payload for n8n
    console.log('🔨 Building payload with userData:', userData)
    const n8nPayload: N8nPayload = {
      documento_id: documentData.id,
      tipo: documentData.tipo,
      storage_path: documentData.storage_path,
      signed_url: signedUrlData.signedUrl,
      nombre_archivo: documentData.nombre_archivo,
      size_bytes: documentData.size_bytes,
      signed_ttl_seconds: 600,
      user: userData
    }
    console.log('🔨 Payload built, user field:', n8nPayload.user)

    console.log('N8n payload (signed_url redacted):', {
      ...n8nPayload,
      signed_url: '[REDACTED - Length: ' + signedUrlData.signedUrl.length + ' chars]'
    })
    
    console.log('🔍 User data being sent:', {
      hasCreatedBy: !!documento.created_by,
      createdByType: typeof documento.created_by,
      userId: userData.id || 'EMPTY',
      userEmail: userData.email || 'EMPTY', 
      userFullName: userData.fullName || 'NULL'
    })
    
    console.log('📦 Final payload user object:', JSON.stringify(userData, null, 2))

    // Ensure user object is always present, even if empty
    if (!userData.id && !userData.email && !userData.fullName) {
      console.log('⚠️ No user data found, sending empty user object')
      userData = {
        id: '',
        email: '',
        fullName: null
      }
    }

    // Send POST to n8n webhook
    console.log('📤 Sending POST to n8n...')
    console.log('📋 Complete payload being sent:', JSON.stringify(n8nPayload, null, 2))
    
    const payloadString = JSON.stringify(n8nPayload)
    console.log('📋 Serialized payload string:', payloadString)
    console.log('📋 Payload contains user:', payloadString.includes('"user"'))
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payloadString
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
          message: 'Document dispatched successfully',
          documento_id: documentData.id,
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
        .eq('id', documentData.id)

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
    console.error('❌ Unexpected error in dispatch-document:', error)
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