import React, { useState, useEffect } from 'react';
import { Search, Building2, ClipboardEdit, Save, Loader2, AlertCircle, CheckCircle, Edit, Trash2, PlusCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { OperacionesRiesgoService } from '@/services/operacionesRiesgoService';
import { OperacionRiesgo } from '@/types/operacionesRiesgo';
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

const SolicitudesOperacion = () => {
  const [rucInput, setRucInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedCompany, setSearchedCompany] = useState<CompanyData | null>(null);
  const [operaciones, setOperaciones] = useState<OperacionRiesgo[]>([]);
  const [selectedOperacion, setSelectedOperacion] = useState<OperacionRiesgo | null>(null);
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

  useEffect(() => {
    loadOperaciones();
  }, []);

  const loadOperaciones = async () => {
    try {
      const data = await OperacionesRiesgoService.getAll();
      setOperaciones(data);
    } catch (err) {
      showError('No se pudieron cargar las operaciones existentes.');
    }
  };

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setLoading(true);
    setError(null);
    setSearchedCompany(null);
    setSelectedOperacion(null);
    resetForm();

    try {
      const { data, error } = await supabase
        .from('top_10k')
        .select('ruc, razon_social, sector, descripcion_ciiu_rev3, ranking_2024, facturado_2024_soles_maximo, facturado_2023_soles_maximo')
        .eq('ruc', rucInput)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSearchedCompany(data as CompanyData);
      else setError('RUC no encontrado en la base de datos TOP 10K.');
    } catch (err) {
      setError('Ocurrió un error al buscar el RUC.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormData({
      producto: '', proveedor: '', lp_vigente_gve: '', riesgo_aprobado: '',
      propuesta_comercial: '', exposicion_total: '', direccion: '', visita: '', telefono_contacto: '',
    });
  };

  const handleSave = async () => {
    if (!searchedCompany) {
      showError('Debe haber una empresa seleccionada para guardar.');
      return;
    }
    setSaving(true);
    try {
      if (selectedOperacion) {
        await OperacionesRiesgoService.update(selectedOperacion.id, { ruc: searchedCompany.ruc, ...formData });
        showSuccess('Solicitud de operación actualizada exitosamente.');
      } else {
        await OperacionesRiesgoService.create({ ruc: searchedCompany.ruc, ...formData });
        showSuccess('Solicitud de operación guardada exitosamente.');
      }
      handleClear();
      await loadOperaciones();
    } catch (err) {
      showError('No se pudo guardar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (op: OperacionRiesgo) => {
    setSelectedOperacion(op);
    setRucInput(op.ruc);
    setSearchedCompany({
      ruc: op.ruc, razon_social: 'Cargando...', sector: 'Cargando...',
      descripcion_ciiu_rev3: 'Cargando...', ranking_2024: null,
      facturado_2024_soles_maximo: null, facturado_2023_soles_maximo: null
    });
    setFormData({
      producto: op.producto || '', proveedor: op.proveedor || '', lp_vigente_gve: op.lp_vigente_gve || '',
      riesgo_aprobado: op.riesgo_aprobado || '', propuesta_comercial: op.propuesta_comercial || '',
      exposicion_total: op.exposicion_total || '', direccion: op.direccion || '', visita: op.visita || '',
      telefono_contacto: op.telefono_contacto || '',
    });
    supabase.from('top_10k').select('ruc, razon_social, sector, descripcion_ciiu_rev3, ranking_2024, facturado_2024_soles_maximo, facturado_2023_soles_maximo').eq('ruc', op.ruc).single().then(({ data }) => {
      if (data) setSearchedCompany(data as CompanyData);
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta solicitud?')) {
      try {
        await OperacionesRiesgoService.delete(id);
        showSuccess('Solicitud eliminada.');
        await loadOperaciones();
      } catch (err) {
        showError('No se pudo eliminar la solicitud.');
      }
    }
  };

  const handleClear = () => {
    setRucInput('');
    setSearchedCompany(null);
    setSelectedOperacion(null);
    resetForm();
    setError(null);
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
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <ClipboardEdit className="h-6 w-6 mr-3 text-[#00FF80]" />
                Solicitud de Operación
              </h1>
              <p className="text-gray-400">
                {selectedOperacion ? 'Editando solicitud existente' : 'Busque un deudor y registre el análisis de riesgo.'}
              </p>
            </div>
            { (searchedCompany || selectedOperacion) && 
              <Button variant="outline" onClick={handleClear} className="border-gray-700 text-gray-300">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nueva Solicitud
              </Button>
            }
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Ingrese RUC para buscar o crear nueva solicitud" value={rucInput} onChange={(e) => setRucInput(e.target.value)} maxLength={11} className="pl-10 bg-gray-900/50 border-gray-700" />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar Deudor
              </Button>
            </CardContent>
          </Card>

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {searchedCompany && (
            <div className="space-y-6">
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader><CardTitle className="flex items-center justify-between text-white"><div className="flex items-center"><Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />Información del Deudor</div><Badge className="bg-green-500/10 text-green-400 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />TOP 10K</Badge></CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><Label className="text-gray-400">RUC</Label><p className="font-mono text-white">{searchedCompany.ruc}</p></div>
                  <div className="lg:col-span-2"><Label className="text-gray-400">Razón Social</Label><p className="text-white">{searchedCompany.razon_social}</p></div>
                  <div><Label className="text-gray-400">Ranking 2024</Label><p className="font-mono text-white text-lg">#{searchedCompany.ranking_2024 || 'N/A'}</p></div>
                  <div><Label className="text-gray-400">Sector</Label><p className="text-white">{searchedCompany.sector || 'N/A'}</p></div>
                  <div className="lg:col-span-3"><Label className="text-gray-400">Descripción CIIU</Label><p className="text-white text-sm">{searchedCompany.descripcion_ciiu_rev3 || 'N/A'}</p></div>
                  <div className="md:col-span-2 lg:col-span-2"><Label className="text-gray-400">Facturado 2024 (Máx Soles)</Label><p className="font-mono text-white">{formatCurrency(searchedCompany.facturado_2024_soles_maximo)}</p></div>
                  <div className="md:col-span-2 lg:col-span-2"><Label className="text-gray-400">Facturado 2023 (Máx Soles)</Label><p className="font-mono text-white">{formatCurrency(searchedCompany.facturado_2023_soles_maximo)}</p></div>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader><CardTitle className="text-white">Análisis de Riesgo</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label htmlFor="producto">Producto</Label><Input id="producto" value={formData.producto} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                  <div><Label htmlFor="proveedor">Proveedor</Label><Input id="proveedor" value={formData.proveedor} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                  <div><Label htmlFor="lp_vigente_gve">L/P Vigente (GVE)</Label><Input id="lp_vigente_gve" value={formData.lp_vigente_gve} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                  <div><Label htmlFor="riesgo_aprobado">Riesgo Aprobado</Label><Input id="riesgo_aprobado" value={formData.riesgo_aprobado} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                  <div><Label htmlFor="propuesta_comercial">Propuesta Comercial</Label><Input id="propuesta_comercial" value={formData.propuesta_comercial} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                  <div><Label htmlFor="exposicion_total">Exposición Total</Label><Input id="exposicion_total" value={formData.exposicion_total} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader><CardTitle className="text-white">Información de Contacto y Visita</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1"><Label htmlFor="direccion">Dirección</Label><Input id="direccion" value={formData.direccion} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                  <div className="md:col-span-1"><Label htmlFor="telefono_contacto">Teléfono y Contacto</Label><Input id="telefono_contacto" value={formData.telefono_contacto} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                  <div className="md:col-span-1"><Label htmlFor="visita">Visita (Notas)</Label><Textarea id="visita" value={formData.visita} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {selectedOperacion ? 'Actualizar Solicitud' : 'Guardar Solicitud'}
                </Button>
              </div>
            </div>
          )}

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader><CardTitle className="text-white">Operaciones Registradas</CardTitle></CardHeader>
            <CardContent>
              {operaciones.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ClipboardEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay operaciones registradas.</p>
                  <p className="text-sm mt-2">Busca un deudor por su RUC para empezar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-900/50">
                      <TableHead className="text-gray-300">RUC</TableHead>
                      <TableHead className="text-gray-300">Producto</TableHead>
                      <TableHead className="text-gray-300">Proveedor</TableHead>
                      <TableHead className="text-gray-300">Fecha</TableHead>
                      <TableHead className="text-right text-gray-300">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operaciones.map(op => (
                      <TableRow key={op.id} className="border-gray-800 hover:bg-gray-900/30">
                        <TableCell className="font-mono text-white">{op.ruc}</TableCell>
                        <TableCell className="text-white">{op.producto || '-'}</TableCell>
                        <TableCell className="text-white">{op.proveedor || '-'}</TableCell>
                        <TableCell className="text-gray-400">{new Date(op.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(op)} className="text-gray-400 hover:text-white"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(op.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudesOperacion;