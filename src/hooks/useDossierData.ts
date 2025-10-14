import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RibService } from '@/services/ribService';
import { FichaRucService } from '@/services/fichaRucService';
import { ComportamientoCrediticioService } from '@/services/comportamientoCrediticioService';
import { VentasMensualesService } from '@/services/ventasMensualesService';
import { RibReporteTributarioService } from '@/services/ribReporteTributarioService';
import { RibEeffService } from '@/services/ribEeffService';

export interface DossierData {
  ruc: string;
  nombreEmpresa: string;
  rib?: any;
  fichaRuc?: any;
  comportamientoCrediticio?: any;
  ventasMensuales?: any;
  reporteTributario?: any;
  ribEeff?: any[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useDossierData = () => {
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [dossierList, setDossierList] = useState<any[]>([]);

  const searchDossierByRuc = async (ruc: string) => {
    setSearching(true);
    setError(null);
    try {
      // Buscar datos en todas las tablas relevantes
      const [rib, fichaRuc, comportamiento, ventas, reporte, ribEeff] = await Promise.all([
        RibService.getByRuc(ruc).catch(() => null),
        FichaRucService.getByRuc(ruc).catch(() => null),
        ComportamientoCrediticioService.getByRuc(ruc).catch(() => null),
        VentasMensualesService.getByProveedorRuc(ruc).catch(() => null),
        RibReporteTributarioService.getByRuc(ruc).catch(() => null),
        RibEeffService.getByRuc(ruc).catch(() => [])
      ]);

      if (!rib && !fichaRuc && !comportamiento && !ventas && !reporte && ribEeff.length === 0) {
        setError('No se encontraron datos para este RUC');
        setDossier(null);
        return;
      }

      const dossierData: DossierData = {
        ruc,
        nombreEmpresa: fichaRuc?.nombre_empresa || rib?.ruc || 'Empresa sin nombre',
        rib,
        fichaRuc,
        comportamientoCrediticio: comportamiento,
        ventasMensuales: ventas,
        reporteTributario: reporte,
        ribEeff: ribEeff || []
      };

      setDossier(dossierData);
      toast.success('Dossier encontrado');
    } catch (err) {
      console.error('Error al buscar dossier:', err);
      setError('Error al buscar el dossier');
      toast.error('Error al buscar el dossier');
    } finally {
      setSearching(false);
    }
  };

  const saveDossier = async () => {
    if (!dossier) {
      toast.error('No hay dossier para guardar');
      return;
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error: saveError } = await supabase
        .from('dossiers_guardados')
        .upsert({
          ruc: dossier.ruc,
          nombre_empresa: dossier.nombreEmpresa,
          datos_dossier: {
            rib: dossier.rib,
            fichaRuc: dossier.fichaRuc,
            comportamientoCrediticio: dossier.comportamientoCrediticio,
            ventasMensuales: dossier.ventasMensuales,
            reporteTributario: dossier.reporteTributario,
            ribEeff: dossier.ribEeff
          },
          user_id: userData.user?.id,
          status: 'Guardado'
        }, {
          onConflict: 'ruc'
        });

      if (saveError) throw saveError;

      toast.success('Dossier guardado correctamente');
      await loadSavedDossiers();
    } catch (err) {
      console.error('Error al guardar dossier:', err);
      toast.error('Error al guardar el dossier');
    } finally {
      setSaving(false);
    }
  };

  const loadSavedDossiers = async () => {
    setLoading(true);
    try {
      const { data, error: loadError } = await supabase
        .from('dossiers_guardados')
        .select('*')
        .order('updated_at', { ascending: false });

      if (loadError) throw loadError;

      setDossierList(data || []);
    } catch (err) {
      console.error('Error al cargar dossiers guardados:', err);
      toast.error('Error al cargar los dossiers guardados');
    } finally {
      setLoading(false);
    }
  };

  const loadDossierFromSaved = async (ruc: string) => {
    setLoading(true);
    try {
      const { data, error: loadError } = await supabase
        .from('dossiers_guardados')
        .select('*')
        .eq('ruc', ruc)
        .single();

      if (loadError) throw loadError;

      if (data) {
        const dossierData: DossierData = {
          ruc: data.ruc,
          nombreEmpresa: data.nombre_empresa,
          ...data.datos_dossier,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        setDossier(dossierData);
        toast.success('Dossier cargado');
      }
    } catch (err) {
      console.error('Error al cargar dossier:', err);
      toast.error('Error al cargar el dossier');
    } finally {
      setLoading(false);
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