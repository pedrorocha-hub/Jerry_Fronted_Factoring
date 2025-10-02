import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, Save, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FichaRuc } from '@/types/ficha-ruc';
import { ComportamientoCrediticio, ComportamientoCrediticioInsert, ComportamientoCrediticioUpdate } from '@/types/comportamientoCrediticio';
import { FichaRucService } from '@/services/fichaRucService';
import { ComportamientoCrediticioService } from '@/services/comportamientoCrediticioService';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';

const ComportamientoCrediticioPage = () => {
  const { isAdmin } = useSession();
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ComportamientoCrediticio | null>(null);

  const emptyForm = {
    proveedor: '',
    equifax_calificacion: '',
    sentinel_calificacion: '',
    equifax_deuda_directa: '',
    sentinel_deuda_directa: '',
    equifax_deuda_indirecta: '',
    sentinel_deuda_indirecta: '',
    equifax_impagos: '',
    sentinel_impagos: '',
    equifax_deuda_sunat: '',
    sentinel_deuda_sunat: '',
    equifax_protestos: '',
    sentinel_protestos: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setFormData(emptyForm);

    try {
      const fichaData = await FichaRucService.getByRuc(rucInput);
      if (fichaData) {
        setSearchedFicha(fichaData);
        setFormData(prev => ({ ...prev, proveedor: fichaData.nombre_empresa }));
        showSuccess('Empresa encontrada.');
      } else {
        setError('Ficha RUC no encontrada. No se puede crear un reporte.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar la empresa.');
      showError('Error al buscar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!searchedFicha) return;
    setSaving(true);
    try {
      const dataToSave: Omit<ComportamientoCrediticioInsert, 'user_id'> = {
        ruc: searchedFicha.ruc,
        proveedor: formData.proveedor,
        equifax_calificacion: formData.equifax_calificacion || null,
        sentinel_calificacion: formData.sentinel_calificacion || null,
        equifax_deuda_directa: parseFloat(formData.equifax_deuda_directa) || null,
        sentinel_deuda_directa: parseFloat(formData.sentinel_deuda_directa) || null,
        equifax_deuda_indirecta: parseFloat(formData.equifax_deuda_indirecta) || null,
        sentinel_deuda_indirecta: parseFloat(formData.sentinel_deuda_indirecta) || null,
        equifax_impagos: parseFloat(formData.equifax_impagos) || null,
        sentinel_impagos: parseFloat(formData.sentinel_impagos) || null,
        equifax_deuda_sunat: parseFloat(formData.equifax_deuda_sunat) || null,
        sentinel_deuda_sunat: parseFloat(formData.sentinel_deuda_sunat) || null,
        equifax_protestos: parseFloat(formData.equifax_protestos) || null,
        sentinel_protestos: parseFloat(formData.sentinel_protestos) || null,
      };

      if (selectedReport) {
        await ComportamientoCrediticioService.update(selectedReport.id, dataToSave);
        showSuccess('Reporte actualizado exitosamente.');
      } else {
        await ComportamientoCrediticioService.create(dataToSave);
        showSuccess('Reporte creado exitosamente.');
      }
      // Here you might want to reload the list of reports
    } catch (err) {
      showError('Error al guardar el reporte.');
    } finally {
      setSaving(false);
    }
  };

  const formFields = [
    { id: 'calificacion', label: 'Calificación', type: 'text' },
    { id: 'deuda_directa', label: 'Deuda Directa Bancos', type: 'number' },
    { id: 'deuda_indirecta', label: 'Deuda Indirecta Bancos', type: 'number' },
    { id: 'impagos', label: 'Impagos', type: 'number' },
    { id: 'deuda_sunat', label: 'Deuda SUNAT', type: 'number' },
    { id: 'protestos', label: 'Protestos', type: 'number' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <TrendingUp className="h-6 w-6 mr-3 text-[#00FF80]" />
            Comportamiento Crediticio
          </h1>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Buscar Empresa por RUC</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Ingrese RUC de 11 dígitos" 
                  value={rucInput} 
                  onChange={(e) => setRucInput(e.target.value)} 
                  maxLength={11} 
                  className="pl-10 bg-gray-900/50 border-gray-700" 
                />
              </div>
              <Button onClick={handleSearch} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar
              </Button>
            </CardContent>
          </Card>

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {searchedFicha && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Nuevo Reporte de Comportamiento Crediticio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input id="proveedor" value={formData.proveedor} disabled className="bg-gray-800 border-gray-700 text-gray-400" />
                </div>
                
                <div className="space-y-4 pt-4 mt-4 border-t border-gray-800">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 items-center font-medium">
                    <div className="text-gray-300">Concepto</div>
                    <div className="text-white text-center">Equifax</div>
                    <div className="text-white text-center">Sentinel</div>
                  </div>

                  {formFields.map(field => (
                    <div key={field.id} className="grid grid-cols-3 gap-x-4 items-center">
                      <Label htmlFor={`equifax_${field.id}`} className="text-gray-400">{field.label}</Label>
                      <Input 
                        id={`equifax_${field.id}`} 
                        type={field.type}
                        value={formData[`equifax_${field.id}` as keyof typeof formData]}
                        onChange={handleFormChange}
                        className="bg-gray-900/50 border-gray-700 text-white"
                        disabled={!isAdmin}
                      />
                      <Input 
                        id={`sentinel_${field.id}`} 
                        type={field.type}
                        value={formData[`sentinel_${field.id}` as keyof typeof formData]}
                        onChange={handleFormChange}
                        className="bg-gray-900/50 border-gray-700 text-white"
                        disabled={!isAdmin}
                      />
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      {selectedReport ? 'Actualizar Reporte' : 'Guardar Reporte'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Reportes Creados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-400">
                <p>La tabla con los reportes de comportamiento crediticio aparecerá aquí.</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
};

export default ComportamientoCrediticioPage;