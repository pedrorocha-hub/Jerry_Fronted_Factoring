import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DossierRib, DossierSummary } from '@/types/dossier';
import { showSuccess, showError } from '@/utils/toast';

export const useDossierData = () => {
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<DossierRib | null>(null);
  const [dossierList, setDossierList] = useState<DossierSummary[]>([]);

  const searchDossierByRuc = async (rucInput: string) => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }

    setSearching(true);
    setError(null);
    setDossier(null);

    try {
      console.log('Buscando RUC:', rucInput);

      // Buscar solicitud de operación (punto de partida)
      const { data: solicitudes, error: solicitudError } = await supabase
        .from('solicitudes_operacion')
        .select(`
          *,
          solicitud_operacion_riesgos(*)
        `)
        .eq('ruc', rucInput)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('Resultado solicitudes:', { solicitudes, solicitudError });

      if (solicitudError) {
        console.error('Error en consulta solicitud:', solicitudError);
        setError(`Error al buscar la solicitud: ${solicitudError.message}`);
        return;
      }

      if (!solicitudes || solicitudes.length === 0) {
        setError('No se encontró ninguna solicitud de operación para este RUC.');
        return;
      }

      const solicitud = solicitudes[0];
      console.log('Solicitud encontrada:', solicitud);

      // Obtener información del creador por separado
      let creatorInfo = null;
      if (solicitud.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', solicitud.user_id)
          .single();
        
        if (profile) {
          creatorInfo = { fullName: profile.full_name };
        }
      }

      // Cargar todos los datos del dossier en paralelo
      const [
        fichaRucResult,
        analisisRibResult,
        comportamientoCrediticioResult,
        ribReporteTributarioResult,
        ventasMensualesResult,
        top10kResult,
        accionistasResult,
        gerenciaResult,
        ribEeffResult, // <-- NUEVA CONSULTA
      ] = await Promise.allSettled([
        // Ficha RUC
        supabase.from('ficha_ruc').select('*').eq('ruc', rucInput).single(),
        
        // Análisis RIB
        supabase.from('rib').select('*').eq('ruc', rucInput).single(),
        
        // Comportamiento Crediticio
        supabase.from('comportamiento_crediticio').select('*').eq('ruc', rucInput).single(),
        
        // RIB - Reporte Tributario
        supabase.from('rib_reporte_tributario').select('*').eq('ruc', rucInput),
        
        // Ventas Mensuales - Buscar tanto por proveedor_ruc como por deudor_ruc
        supabase.from('ventas_mensuales').select('*').or(`proveedor_ruc.eq.${rucInput},deudor_ruc.eq.${rucInput}`).single(),
        
        // TOP 10K
        supabase.from('top_10k').select('*').eq('ruc', parseInt(rucInput)).single(),
        
        // Accionistas
        supabase.from('ficha_ruc_accionistas').select('*').eq('ruc', rucInput),
        
        // Gerencia
        supabase.from('ficha_ruc_gerencia').select('*').eq('ruc', rucInput),

        // RIB EEFF
        supabase.from('rib_eeff').select('*').eq('ruc', rucInput),
      ]);

      console.log('Resultados paralelos:', {
        fichaRucResult,
        analisisRibResult,
        comportamientoCrediticioResult,
        ribReporteTributarioResult,
        ventasMensualesResult,
        top10kResult,
        accionistasResult,
        gerenciaResult,
        ribEeffResult,
      });

      // Procesar resultados
      const getData = (result: PromiseSettledResult<any>) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          return result.value.data;
        }
        return null;
      };

      // Manejo especial para ventas mensuales
      let ventasMensualesData = null;
      if (ventasMensualesResult.status === 'fulfilled' && !ventasMensualesResult.value.error) {
        ventasMensualesData = ventasMensualesResult.value.data;
      } else {
        // Si no encontramos con .single(), intentar con array y tomar el primero
        console.log('Intentando búsqueda alternativa de ventas mensuales...');
        const { data: ventasArray, error: ventasArrayError } = await supabase
          .from('ventas_mensuales')
          .select('*')
          .or(`proveedor_ruc.eq.${rucInput},deudor_ruc.eq.${rucInput}`)
          .limit(1);
        
        if (!ventasArrayError && ventasArray && ventasArray.length > 0) {
          ventasMensualesData = ventasArray[0];
        }
      }

      console.log('Datos de ventas mensuales encontrados:', ventasMensualesData);

      const dossierData: DossierRib = {
        // 1. Solicitud de operación
        solicitudOperacion: solicitud,
        riesgos: solicitud.solicitud_operacion_riesgos || [],
        fichaRuc: getData(fichaRucResult),
        creatorInfo,
        
        // 2. Análisis RIB
        analisisRib: getData(analisisRibResult),
        accionistas: getData(accionistasResult) || [],
        gerencia: getData(gerenciaResult) || [],
        
        // 3. Comportamiento Crediticio
        comportamientoCrediticio: getData(comportamientoCrediticioResult),
        
        // 4. RIB - Reporte Tributario
        ribReporteTributario: getData(ribReporteTributarioResult) || [],
        
        // 5. Ventas Mensuales
        ventasMensuales: ventasMensualesData,
        
        // 6. RIB EEFF
        ribEeff: getData(ribEeffResult) || [],

        // Datos adicionales
        top10kData: getData(top10kResult)
      };

      console.log('Dossier final:', dossierData);
      setDossier(dossierData);
      showSuccess('Dossier RIB cargado exitosamente.');
      
    } catch (err) {
      console.error('Error inesperado:', err);
      setError(`Ocurrió un error inesperado: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      showError('Error al cargar el dossier.');
    } finally {
      setSearching(false);
    }
  };

  const saveDossier = async () => {
    if (!dossier) {
      showError('No hay dossier para guardar.');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Usuario no autenticado.');
        return;
      }

      const nombreEmpresa = dossier.fichaRuc?.nombre_empresa || 
                           dossier.top10kData?.razon_social || 
                           'Empresa sin nombre';

      // Guardar o actualizar el dossier
      const { error: saveError } = await supabase
        .from('dossiers_guardados')
        .upsert({
          ruc: dossier.solicitudOperacion.ruc,
          nombre_empresa: nombreEmpresa,
          datos_dossier: dossier,
          user_id: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'ruc'
        });

      if (saveError) {
        console.error('Error al guardar dossier:', saveError);
        showError(`Error al guardar el dossier: ${saveError.message}`);
        return;
      }

      showSuccess('Dossier guardado exitosamente.');
      // Recargar la lista de dossiers
      await loadSavedDossiers();
      
    } catch (err) {
      console.error('Error al guardar dossier:', err);
      showError(`Error al guardar el dossier: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  const loadSavedDossiers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar dossiers guardados sin JOIN con profiles
      const { data: dossiers, error: dossiersError } = await supabase
        .from('dossiers_guardados')
        .select('*')
        .order('updated_at', { ascending: false });

      if (dossiersError) {
        console.error('Error al cargar dossiers:', dossiersError);
        setError(`Error al cargar los dossiers: ${dossiersError.message}`);
        return;
      }

      if (!dossiers || dossiers.length === 0) {
        setDossierList([]);
        return;
      }

      // Obtener información de los creadores por separado
      const userIds = [...new Set(dossiers.map(d => d.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      // Mapear los datos guardados
      const dossierSummaries: DossierSummary[] = dossiers.map((dossier) => ({
        ruc: dossier.ruc,
        nombreEmpresa: dossier.nombre_empresa || 'N/A',
        status: dossier.status,
        fechaCreacion: dossier.created_at,
        fechaActualizacion: dossier.updated_at,
        creadorNombre: profilesMap.get(dossier.user_id) || 'N/A',
        ranking: dossier.datos_dossier?.top10kData?.ranking_2024,
        sector: dossier.datos_dossier?.top10kData?.sector
      }));

      setDossierList(dossierSummaries);
      
    } catch (err) {
      console.error('Error al cargar dossiers:', err);
      setError(`Error al cargar los dossiers: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      showError('Error al cargar la lista de dossiers.');
    } finally {
      setLoading(false);
    }
  };

  const loadDossierFromSaved = async (ruc: string) => {
    setSearching(true);
    setError(null);

    try {
      const { data: savedDossier, error: loadError } = await supabase
        .from('dossiers_guardados')
        .select('datos_dossier')
        .eq('ruc', ruc)
        .single();

      if (loadError) {
        console.error('Error al cargar dossier guardado:', loadError);
        setError(`Error al cargar el dossier: ${loadError.message}`);
        return;
      }

      if (!savedDossier) {
        setError('Dossier no encontrado.');
        return;
      }

      setDossier(savedDossier.datos_dossier as DossierRib);
      showSuccess('Dossier cargado desde guardados.');
      
    } catch (err) {
      console.error('Error al cargar dossier guardado:', err);
      setError(`Error al cargar el dossier: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setSearching(false);
    }
  };

  return {
    searching,
    loading,
    saving,
    error,
    dossier,
    dossierList,
    searchDossierByRuc,
    saveDossier,
    loadSavedDossiers,
    loadDossierFromSaved,
    setError
  };
};