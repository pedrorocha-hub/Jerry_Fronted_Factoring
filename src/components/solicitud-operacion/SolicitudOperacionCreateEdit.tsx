import React, { useState, useEffect } from 'react';
import { Search, Building2, Save, Loader2, AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { SolicitudOperacion } from '@/types/solicitudOperacion';
import { showSuccess, showError } from '@/utils/toast';

interface CompanyData {
  ruc: string;
  razon_social: string;
  sector: string | null;
  descripcion_ciiu_rev3: string | null;
  ranking_2024: number | null;
  facturado_2024_soles_maximo: number | null;
  facturado_2023_soles_maximo: string | null;
}

interface SolicitudOperacionCreateEditProps {
  solicitud: SolicitudOperacion | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

const SolicitudOperacionCreateEdit: React.FC<SolicitudOperacionCreateEditProps> = ({
  solicitud,
  onSaveSuccess,
  onCancel,
}) => {
  const [rucInput, setRucInput] = useState(solicitud?.ruc || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedCompany, setSearchedCompany] = useState<CompanyData | null>(null);
  const [formData, setFormData] = useState({
    direccion: solicitud?.direccion || '',
    visita: solicitud?.visita || '',
    contacto: solicitud?.contacto || '',
    comentarios: solicitud?.comentarios || '',
    fianza: solicitud?.fianza || '',
    lp: solicitud?.lp || '',
    producto: solicitud?.producto || '',
    proveedor: solicitud?.proveedor || '',
    lp_vigente_gve: solicitud?.lp_vigente_gve || '',
    riesgo_aprobado: solicitud?.riesgo_aprobado || '',
    propuesta_comercial: solicitud?.propuesta_comercial || '',
    exposicion_total: solicitud?.exposicion_total || '',
    fecha_ficha: solicitud?.fecha_ficha || '',
    orden_servicio: solicitud?.orden_servicio || '',
    factura: solicitud?.factura || '',
    tipo_cambio: solicitud?.tipo_cambio || '',
    moneda_operacion: solicitud?.moneda_operacion || '',
    resumen_solicitud: solicitud?.resumen_solicitud || '',
    deudor: solicitud?.deudor || '',
    garantias: solicitud?.garantias || '',
    condiciones_desembolso: solicitud?.condiciones_desembolso || '',
  });

  useEffect(() => {
    if (solicitud) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setLoading(true);
    setError(null);
    setSearchedCompany(null);

    try {
      const { data, error } = await supabase
        .from('top_10k')
        .select('ruc, razon_social, sector, descripcion_ciiu_rev3, ranking_2024, facturado_2024_soles_maximo, facturado_2023_soles_maximo')
        .eq('ruc', rucInput)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSearchedCompany(data as CompanyData);
      } else {
        setError('RUC no encontrado en la base de datos TOP 10K.');
      }
    } catch (err) {
      console.error('Error searching RUC:', err);
      setError('Ocurrió un error al buscar el RUC.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!searchedCompany) {
      showError('Debe buscar y seleccionar una empresa válida.');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ruc: searchedCompany.ruc,
        ...formData,
        status: 'Borrador',
      };

      if (solicitud) {
        await SolicitudOperacionService.update(solicitud.id, dataToSave);
        showSuccess('Solicitud actualizada exitosamente');
      } else {
        await SolicitudOperacionService.create(dataToSave);
        showSuccess('Solicitud creada exitosamente');
      }
      
      onSaveSuccess();
    } catch (err) {
      console.error('Error saving solicitud:', err);
      showError('Error al guardar la solicitud');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Building2 className="h-6 w-6 mr-3 text-[#00FF80]" />
            {solicitud ? 'Editar Solicitud de Operación' : 'Nueva Solicitud de Operación'}
          </h1>
          <p className="text-gray-400">
            Complete la información de la solicitud de operación
          </p>
        </div>
        <Button variant="outline" onClick={onCancel} className="border-gray-700 text-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <Card className="bg-[#121212] border border-gray-800">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Ingrese RUC del deudor" 
              value={rucInput} 
              onChange={(e) => setRucInput(e.target.value)} 
              maxLength={11} 
              className="pl-10 bg-gray-900/50 border-gray-700"
              disabled={!!solicitud}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={loading || !!solicitud} 
            className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Buscar Deudor
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {searchedCompany && (
        <div className="space-y-6">
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                  Información del Deudor
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  TOP 10K
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-400">RUC</Label>
                <p className="font-mono text-white">{searchedCompany.ruc}</p>
              </div>
              <div className="lg:col-span-2">
                <Label className="text-gray-400">Razón Social</Label>
                <p className="text-white">{searchedCompany.razon_social}</p>
              </div>
              <div>
                <Label className="text-gray-400">Ranking 2024</Label>
                <p className="font-mono text-white text-lg">#{searchedCompany.ranking_2024 || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Sector</Label>
                <p className="text-white">{searchedCompany.sector || 'N/A'}</p>
              </div>
              <div className="lg:col-span-3">
                <Label className="text-gray-400">Descripción CIIU</Label>
                <p className="text-white text-sm">{searchedCompany.descripcion_ciiu_rev3 || 'N/A'}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <Label className="text-gray-400">Facturado 2024 (Máx Soles)</Label>
                <p className="font-mono text-white">{formatCurrency(searchedCompany.facturado_2024_soles_maximo)}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <Label className="text-gray-400">Facturado 2023 (Máx Soles)</Label>
                <p className="font-mono text-white">{formatCurrency(searchedCompany.facturado_2023_soles_maximo)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Información General</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" value={formData.direccion} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="contacto">Contacto</Label>
                <Input id="contacto" value={formData.contacto} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="visita">Visita</Label>
                <Input id="visita" value={formData.visita} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="fecha_ficha">Fecha Ficha</Label>
                <Input id="fecha_ficha" type="date" value={formData.fecha_ficha} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="comentarios">Comentarios</Label>
                <Textarea id="comentarios" value={formData.comentarios} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Análisis de Riesgo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="producto">Producto</Label>
                <Input id="producto" value={formData.producto} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input id="proveedor" value={formData.proveedor} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="deudor">Deudor</Label>
                <Input id="deudor" value={formData.deudor} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="lp">L/P</Label>
                <Input id="lp" value={formData.lp} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="lp_vigente_gve">L/P Vigente (GVE)</Label>
                <Input id="lp_vigente_gve" value={formData.lp_vigente_gve} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="riesgo_aprobado">Riesgo Aprobado</Label>
                <Input id="riesgo_aprobado" value={formData.riesgo_aprobado} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="propuesta_comercial">Propuesta Comercial</Label>
                <Input id="propuesta_comercial" value={formData.propuesta_comercial} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="exposicion_total">Exposición Total</Label>
                <Input id="exposicion_total" value={formData.exposicion_total} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="fianza">Fianza</Label>
                <Input id="fianza" value={formData.fianza} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Información Financiera</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="orden_servicio">Orden de Servicio</Label>
                <Input id="orden_servicio" value={formData.orden_servicio} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="factura">Factura</Label>
                <Input id="factura" value={formData.factura} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="tipo_cambio">Tipo de Cambio</Label>
                <Input id="tipo_cambio" type="number" step="0.001" value={formData.tipo_cambio} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label htmlFor="moneda_operacion">Moneda de Operación</Label>
                <Input id="moneda_operacion" value={formData.moneda_operacion} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="garantias">Garantías</Label>
                <Textarea id="garantias" value={formData.garantias} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" rows={2} />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="condiciones_desembolso">Condiciones de Desembolso</Label>
                <Textarea id="condiciones_desembolso" value={formData.condiciones_desembolso} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" rows={2} />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="resumen_solicitud">Resumen de Solicitud</Label>
                <Textarea id="resumen_solicitud" value={formData.resumen_solicitud} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" rows={4} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onCancel} className="border-gray-700 text-gray-300">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} size="lg" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {solicitud ? 'Actualizar Solicitud' : 'Guardar Solicitud'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudOperacionCreateEdit;