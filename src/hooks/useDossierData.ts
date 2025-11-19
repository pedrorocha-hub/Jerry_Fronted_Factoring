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

  const searchDossierById = async (solicitudId: string) => {
    if (!solicitudId) {
      setError('Por favor, ingrese un ID de Solicitud válido.');
      return;
    }

    setSearching(true);
    setError(null);
    setDossier(null);

    try {
      console.log('Buscando Solicitud ID:', solicitudId);

      const { data: solicitud, error: solicitudError } = await supabase
        .from('solicitudes_operacion')
        .select(`
          *,
          solicitud_operacion_riesgos(*)
        `)
        .eq('id', solicitudId)
        .single();

      if (solicitudError || !solicitud) {
        console.error('Error en consulta solicitud:', solicitudError);
        setError(`No se encontró ninguna solicitud con el ID: ${solicitudId}`);
        return;
      }

      console.log('Solicitud encontrada:', solicitud);
      const rucInput = solicitud.ruc;

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
        comentariosEjecutivoResult,
      ] = await Promise.allSettled([
        supabase.from('ficha_ruc').select('*').eq('ruc', rucInput).single(),
        supabase.from('rib').select('*').eq('solicitud_id', solicitudId).single(),
        supabase.from('comportamiento_crediticio').select('*').eq('solicitud_id', solicitudId).single(),
        supabase.from('rib_reporte_tributario').select('*').eq('solicitud_id', solicitudId),
        supabase.from('ventas_mensuales').select('*').eq('solicitud_id', solicitudId).single(),
        supabase.from('top_10k').select('*').eq('ruc', parseInt(rucInput)).single(),
        supabase.from('ficha_ruc_accionistas').select('*').eq('ruc', rucInput),
        supabase.from('ficha_ruc_gerencia').select('*').eq('ruc', rucInput),
        supabase.from('rib_eeff').select('*').eq('solicitud_id', solicitudId),
        supabase.from('comentarios_ejecutivo').select('*').eq('solicitud_id', solicitudId).single(),
      ]);

      const getData = (result: PromiseSettledResult<any>) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          return result.value.data;
        }
        return null;
      };

      const dossierData: DossierRib = {
        solicitudOperacion: solicitud,
        riesgos: solicitud.solicitud_operacion_riesgos || [],
        fichaRuc: getData(fichaRucResult),
        creatorInfo,
        analisisRib: getData(analisisRibResult),
        accionistas: getData(accionistasResult) || [],
        gerencia: getData(gerenciaResult) || [],
        comportamientoCrediticio: getData(comportamientoCrediticioResult),
        ribReporteTributario: getData(ribReporteTributarioResult) || [],
        ventasMensuales: getData(ventasMensualesResult),
        ribEeff: getData(ribEeffResult) || [],
        top10kData: getData(top10kResult),
        comentariosEjecutivo: getData(comentariosEjecutivoResult)
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

      const { error: saveError } = await supabase
        .from('dossiers_guardados')
        .upsert({
          solicitud_id: dossier.solicitudOperacion.id,
          ruc: dossier.solicitudOperacion.ruc,
          nombre_empresa: nombreEmpresa,
          datos_dossier: dossier,
          user_id: user.id,
          updated_at: new Date().toISOString()
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

  const deleteDossier = async (dossierId: string) => {
    if (!window.confirm('¿Está seguro de eliminar este dossier guardado? Esta acción es irreversible.')) {
      return;
    }
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('dossiers_guardados')
        .delete()
        .eq('id', dossierId);

      if (deleteError) {
        console.error('Error al eliminar dossier:', deleteError);
        showError(`Error al eliminar el dossier: ${deleteError.message}`);
        return;
      }

      showSuccess('Dossier eliminado exitosamente.');
      await loadSavedDossiers();
      
      // Si el dossier eliminado era el que se estaba viendo, limpiarlo
      if (dossier?.solicitudOperacion.id === dossierList.find(d => d.id === dossierId)?.solicitud_id) {
        setDossier(null);
      }

    } catch (err) {
      console.error('Error al eliminar dossier:', err);
      showError(`Error al eliminar el dossier: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
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
        id: dossier.id,
        solicitud_id: dossier.solicitud_id,
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
    searchDossierById,
    saveDossier,
    deleteDossier, // Exportar la nueva función
    loadSavedDossiers,
    loadDossierFromSaved,
    setError
  };
};