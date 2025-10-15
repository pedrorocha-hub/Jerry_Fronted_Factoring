import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SalesData } from '@/types/salesData';
import VentasMensualesTable from '@/components/ventas-mensuales/VentasMensualesTable';
import VentasStatusManager from '@/components/ventas-mensuales/VentasStatusManager';
import { ComboboxOption } from '@/components/ui/async-combobox';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VentasMensualesDetail = () => {
  const { ruc } = useParams<{ ruc: string }>();
  const navigate = useNavigate();

  const [salesData, setSalesData] = useState<SalesData>({});
  const [initialSalesData, setInitialSalesData] = useState<SalesData>({});
  const [status, setStatus] = useState('Borrador');
  const [validadoPor, setValidadoPor] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const hasUnsavedChanges = JSON.stringify(salesData) !== JSON.stringify(initialSalesData);

  const fetchData = useCallback(async () => {
    if (!ruc) return;
    setLoading(true);

    const { data: companyInfo } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', ruc).single();
    if (companyInfo) setCompanyName(companyInfo.nombre_empresa);

    const { data: records, error } = await supabase
      .from('ventas_mensuales')
      .select('*, profiles(full_name), solicitudes_operacion(id, ruc)')
      .eq('proveedor_ruc', ruc);

    if (error) {
      toast.error('Error al cargar los datos de ventas.');
      setLoading(false);
      return;
    }

    if (records && records.length > 0) {
      const transformedData = records.reduce((acc, record) => {
        acc[record.anio] = {
          enero: record.enero, febrero: record.febrero, marzo: record.marzo,
          abril: record.abril, mayo: record.mayo, junio: record.junio,
          julio: record.julio, agosto: record.agosto, setiembre: record.setiembre,
          octubre: record.octubre, noviembre: record.noviembre, diciembre: record.diciembre,
        };
        return acc;
      }, {} as SalesData);
      
      setSalesData(transformedData);
      setInitialSalesData(JSON.parse(JSON.stringify(transformedData)));

      const latestRecord = records.sort((a, b) => b.anio - a.anio)[0];
      setStatus(latestRecord.status || 'Borrador');
      setValidadoPor(latestRecord.validado_por);
      setCreatorName(latestRecord.profiles?.full_name || null);
      setSolicitudId(latestRecord.solicitud_id);
      if (latestRecord.solicitud_id && latestRecord.solicitudes_operacion) {
        setInitialSolicitudLabel(`Solicitud para RUC ${latestRecord.solicitudes_operacion.ruc}`);
      }

    } else {
      const currentYear = new Date().getFullYear();
      const emptyYear = { [currentYear]: { enero: null, febrero: null, marzo: null, abril: null, mayo: null, junio: null, julio: null, agosto: null, setiembre: null, octubre: null, noviembre: null, diciembre: null } };
      setSalesData(emptyYear);
      setInitialSalesData(JSON.parse(JSON.stringify(emptyYear)));
    }
    setLoading(false);
  }, [ruc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDataChange = (year: number, month: string, value: number | null) => {
    setSalesData(prev => ({ ...prev, [year]: { ...prev[year], [month]: value } }));
  };

  const handleSave = async () => {
    if (!ruc) return;
    setIsSaving(true);
    const upsertPromises = Object.entries(salesData).map(([year, months]) => {
      return supabase.from('ventas_mensuales').upsert({
        proveedor_ruc: ruc,
        anio: parseInt(year),
        tipo_entidad: 'proveedor',
        status,
        validado_por: validadoPor,
        solicitud_id: solicitudId,
        ...months,
      }, { onConflict: 'proveedor_ruc,anio' });
    });

    const results = await Promise.all(upsertPromises);
    const firstError = results.find(res => res.error)?.error;

    if (firstError) {
      toast.error('Hubo un error al guardar los cambios.');
      console.error(firstError);
    } else {
      toast.success('Datos de ventas guardados exitosamente.');
      setInitialSalesData(JSON.parse(JSON.stringify(salesData)));
    }
    setIsSaving(false);
  };

  const searchSolicitudes = async (query: string): Promise<ComboboxOption[]> => {
    const { data, error } = await supabase.rpc('search_solicitudes', { search_term: query });
    if (error) {
      console.error(error);
      return [];
    }
    return data.map((s: { value: string; label: string }) => ({ value: s.value, label: s.label }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin mr-4" />
        Cargando...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-gray-800">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Ventas Mensuales de {companyName || ruc}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <VentasStatusManager
              status={status}
              validadoPor={validadoPor}
              creatorName={creatorName}
              onStatusChange={setStatus}
              onValidatedByChange={setValidadoPor}
              onSave={handleSave}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              onSolicitudIdChange={setSolicitudId}
              searchSolicitudes={searchSolicitudes}
              initialSolicitudLabel={initialSolicitudLabel}
            />
            <VentasMensualesTable data={salesData} onDataChange={handleDataChange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VentasMensualesDetail;