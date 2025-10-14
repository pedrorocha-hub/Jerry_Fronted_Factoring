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

  const searchDossierBySolicitudId = async (solicitudId: string) => {
    if (!solicitudId) {
      setError('Por favor, proporcione un ID de solicitud válido.');
      return;
    }

    setSearching(true);
    setError(null);
    setDossier(null);

    try {
      console.log('Buscando solicitud:', solicitudId);

      // Buscar solicitud de operación
      const { data: solicitud, error: solicitudError } = await supabase
        .from('solicitudes_operacion')
        .select(`
          *,
          solicitud_operacion_riesgos(*)
        `)
        .eq('id', solicitudId)
        .single();

      console.log('Resultado solicitud:', { solicitud, solicitudError });

      if (solicitudError) {
        console.error('Error en consulta solicitud:', solicitudError);
        setError(`Error al buscar la solicitud: ${solicitudError.message}`);
        return;
      }

      if (!solicitud) {
        setError('No se encontró la solicitud de operación.');
        return;
      }

      console.log('Solicitud encontrada:', solicitud);

      // Obtener información del creador
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

      // Cargar todos los datos del dossier en paralelo usando solicitud_id
      const [
        fichaRucResult,
        analisisRibResult,
        comportamientoCrediticioResult,
        ribReporteTributarioResult,
        ventasMensualesResult,
        top10kResult,
        accionistasResult,
        gerenciaResult,
        ribEeffResult,
      ] = await Promise.allSettled([
        // Ficha RUC (por RUC, ya que es información general de la empresa)
        supabase.from('ficha_ruc').select('*').eq('ruc', solicitud.ruc).single(),
        
        // Análisis RIB (por solicitud_id)
        supabase.from('rib').select('*').eq('solicitud_id', solicitudId).single(),
        
        // Comportamiento Crediticio (por solicitud_id)
        supabase.from('comportamiento_crediticio').select('*').eq('solicitud_id', solicitudId).single(),
        
        // RIB - Reporte Tributario (por solicitud_id)
        supabase.from('rib_reporte_tributario').select('*').eq('solicitud_id', solicitudId),
        
        // Ventas Mensuales (por solicitud_id)
        supabase.from('ventas_mensuales').select('*').eq('solicitud_id', solicitudId).single(),
        
        // TOP 10K (por RUC, información general)
        supabase.from('top_10k').select('*').eq('ruc', parseInt(solicitud.ruc)).single(),
        
        // Accionistas (por RUC, información general)
        supabase.from('ficha_ruc_accionistas').select('*').eq('ruc', solicitud.ruc),
        
        // Gerencia (por RUC, información general)
        supabase.from('ficha_ruc_gerencia').select('*').eq('ruc', solicitud.ruc),

        // RIB EEFF (por solicitud_id)
        supabase.from('rib_eeff').select('*').eq('solicitud_id', solicitudId),
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
        ventasMensuales: getData(ventasMensualesResult),
        
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

      // Guardar o actualizar el dossier usando solicitud_id como clave
      const { error: saveError } = await supabase
        .from('dossiers_guardados')
        .upsert({
          ruc: dossier.solicitudOperacion.ruc,
          nombre_empresa: nombreEmpresa,
          datos_dossier: dossier,
          user_id: user.id,
          updated_at: new Date().toISOString(),
          solicitud_id: dossier.solicitudOperacion.id
        }, {
          onConflict: 'solicitud_id'
        });

      if (saveError) {
        console.error('Error al guardar dossier:', saveError);
        showError(`Error al guardar el dossier: ${saveError.message}`);
        return;
      }

      showSuccess('Dossier guardado exitosamente.');
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

      const userIds = [...new Set(dossiers.map(d => d.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const dossierSummaries: DossierSummary[] = dossiers.map((dossier) => ({
        ruc: dossier.ruc,
        nombreEmpresa: dossier.nombre_empresa || 'N/A',
        status: dossier.status,
        fechaCreacion: dossier.created_at,
        fechaActualizacion: dossier.updated_at,
        creadorNombre: profilesMap.get(dossier.user_id) || 'N/A',
        ranking: dossier.datos_dossier?.top10kData?.ranking_2024,
        sector: dossier.datos_dossier?.top10kData?.sector,
        solicitudId: dossier.solicitud_id
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

  const loadDossierFromSaved = async (solicitudId: string) => {
    setSearching(true);
    setError(null);

    try {
      const { data: savedDossier, error: loadError } = await supabase
        .from('dossiers_guardados')
        .select('datos_dossier')
        .eq('solicitud_id', solicitudId)
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
    searchDossierBySolicitudId,
    saveDossier,
    loadSavedDossiers,
    loadDossierFromSaved,
    setError
  };
};