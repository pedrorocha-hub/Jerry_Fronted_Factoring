import { supabase } from '@/integrations/supabase/client';

export async function testDocumentTypes() {
  const testTypes = [
    'ficha_ruc',
    'representante_legal', 
    'cuenta_bancaria',
    'eeff',
    'factura_negociar',
    'reporte_tributario',
    'sentinel',
    // Variaciones posibles
    'ficha-ruc',
    'representante-legal',
    'cuenta-bancaria', 
    'eeff',
    'factura-negociar',
    'reporte-tributario',
    // Otras posibilidades
    'ruc',
    'legal',
    'bancaria',
    'poderes',
    'factura',
    'tributario'
  ];

  const results: { type: string; valid: boolean; error?: string }[] = [];

  for (const tipo of testTypes) {
    try {
      console.log(`Testing document type: ${tipo}`);
      
      const { data, error } = await supabase
        .from('documentos')
        .insert({
          tipo,
          storage_path: `test_${tipo}_${Date.now()}`,
          estado: 'pending',
          nombre_archivo: `test_${tipo}.pdf`
        })
        .select()
        .single();

      if (error) {
        results.push({ 
          type: tipo, 
          valid: false, 
          error: error.message 
        });
        console.log(`❌ ${tipo}: ${error.message}`);
      } else {
        results.push({ 
          type: tipo, 
          valid: true 
        });
        console.log(`✅ ${tipo}: Valid`);
        
        // Limpiar el registro de prueba
        await supabase
          .from('documentos')
          .delete()
          .eq('id', data.id);
      }
    } catch (error) {
      results.push({ 
        type: tipo, 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      console.log(`❌ ${tipo}: ${error}`);
    }
  }

  console.log('\n=== RESUMEN DE TIPOS VÁLIDOS ===');
  const validTypes = results.filter(r => r.valid);
  const invalidTypes = results.filter(r => !r.valid);
  
  console.log('Tipos válidos:', validTypes.map(r => r.type));
  console.log('Tipos inválidos:', invalidTypes.map(r => r.type));
  
  return {
    validTypes: validTypes.map(r => r.type),
    invalidTypes: invalidTypes.map(r => ({ type: r.type, error: r.error })),
    allResults: results
  };
}

// Función para ejecutar desde la consola del navegador
(window as any).testDocumentTypes = testDocumentTypes;