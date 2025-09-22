import React, { useState } from 'react';
import { Search, Building2, ClipboardEdit, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { OperacionesRiesgoService } from '@/services/operacionesRiesgoService';
import { showSuccess, showError } from '@/utils/toast';

interface CompanyData {
  ruc: string;
  razon_social: string;
  sector: string;
  // Agrega aquí otros campos que existan en tu tabla top_10k
}

const SolicitudOperacion = () => {
  const [rucInput, setRucInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedCompany, setSearchedCompany] = useState<CompanyData | null>(null);
  const [formData, setFormData] = useState({
    producto: '',
    proveedor: '',
    lp_vigente_gve: '',
    riesgo_aprobado: '',
    propuesta_comercial: '',
    exposicion_total: '',
    direccion: '',
    visita: '',
    telefono_contacto: '',
  });

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
        .select('ruc, razon_social, sector') // Ajusta las columnas según tu tabla
        .eq('ruc', rucInput)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setSearchedCompany(data as CompanyData);
      } else {
        setError('RUC no encontrado en la base de datos TOP 10K.');
      }
    } catch (err) {
      console.error('Error buscando RUC:', err);
      setError('Ocurrió un error al buscar el RUC. Por favor, intente de nuevo.');
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
      showError('Primero debe buscar y encontrar una empresa.');
      return;
    }

    setSaving(true);
    try {
      await OperacionesRiesgoService.create({
        ruc: searchedCompany.ruc,
        ...formData,
      });
      showSuccess('Solicitud de operación guardada exitosamente.');
      // Reset form
      setRucInput('');
      setSearchedCompany(null);
      setFormData({
        producto: '',
        proveedor: '',
        lp_vigente_gve: '',
        riesgo_aprobado: '',
        propuesta_comercial: '',
        exposicion_total: '',
        direccion: '',
        visita: '',
        telefono_contacto: '',
      });
    } catch (err) {
      console.error('Error guardando solicitud:', err);
      showError('No se pudo guardar la solicitud. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <ClipboardEdit className="h-6 w-6 mr-3 text-[#00FF80]" />
                Solicitud de Operación
              </h1>
              <p className="text-gray-400">
                Busque un deudor en el TOP 10K y registre el análisis de riesgo.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="bg-[#121212] border border-gray-800">
            <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Ingrese el número de RUC (11 dígitos)"
                  value={rucInput}
                  onChange={(e) => setRucInput(e.target.value)}
                  maxLength={11}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
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
              {/* Card 1: Company Info */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Información del Deudor
                    </div>
                    <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      TOP 10K
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-400">RUC</Label>
                    <p className="font-mono text-white">{searchedCompany.ruc}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Razón Social / Giro</Label>
                    <p className="text-white">{searchedCompany.razon_social}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Sector</Label>
                    <p className="text-white">{searchedCompany.sector}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Risk Analysis */}
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
                </CardContent>
              </Card>

              {/* Card 3: Contact & Visit */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Información de Contacto y Visita</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input id="direccion" value={formData.direccion} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="telefono_contacto">Teléfono y Contacto</Label>
                    <Input id="telefono_contacto" value={formData.telefono_contacto} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="visita">Visita (Notas)</Label>
                    <Textarea id="visita" value={formData.visita} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Solicitud
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudOperacion;