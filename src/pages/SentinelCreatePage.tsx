import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Save, ArrowLeft, Upload } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SentinelService } from '@/services/sentinelService';
import { toast } from 'sonner';

const SentinelCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ruc: '',
    score: '',
    comportamiento_calificacion: '',
    deuda_directa: '',
    deuda_indirecta: '',
    impagos: '',
    deudas_sunat: '',
    protestos: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ruc.trim()) {
      toast.error('El RUC es requerido');
      return;
    }

    if (formData.ruc.length !== 11) {
      toast.error('El RUC debe tener 11 dígitos');
      return;
    }

    try {
      setLoading(true);
      const dataToSave = {
        ...formData,
        deuda_directa: parseFloat(formData.deuda_directa) || null,
        deuda_indirecta: parseFloat(formData.deuda_indirecta) || null,
        impagos: parseFloat(formData.impagos) || null,
        deudas_sunat: parseFloat(formData.deudas_sunat) || null,
        protestos: parseFloat(formData.protestos) || null,
      };
      await SentinelService.create(dataToSave);
      toast.success('Documento Sentinel creado correctamente');
      navigate('/sentinel');
    } catch (error) {
      console.error('Error creating sentinel:', error);
      toast.error('Error al crear el documento Sentinel');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/sentinel')}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <Shield className="h-8 w-8 mr-3 text-[#00FF80]" />
                  Crear Documento Sentinel
                </h1>
                <p className="text-gray-400 mt-2">
                  Registra un nuevo documento Sentinel en el sistema
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-[#121212] border border-gray-800 max-w-4xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2 text-[#00FF80]" />
                Información del Documento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ruc" className="text-gray-300">
                    RUC <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="ruc"
                    type="text"
                    placeholder="Ingrese el RUC (11 dígitos)"
                    value={formData.ruc}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                      handleInputChange('ruc', value);
                    }}
                    className="bg-gray-900 border-gray-700 text-white"
                    maxLength={11}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div className="space-y-2">
                        <Label htmlFor="score" className="text-gray-300">Score / Calificación</Label>
                        <Input id="score" value={formData.score} onChange={(e) => handleInputChange('score', e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comportamiento_calificacion" className="text-gray-300">Calificación del Comportamiento</Label>
                        <Input id="comportamiento_calificacion" value={formData.comportamiento_calificacion} onChange={(e) => handleInputChange('comportamiento_calificacion', e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="deuda_directa" className="text-gray-300">Deuda Directa</Label>
                        <Input id="deuda_directa" type="number" step="0.01" value={formData.deuda_directa} onChange={(e) => handleInputChange('deuda_directa', e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deuda_indirecta" className="text-gray-300">Deuda Indirecta</Label>
                        <Input id="deuda_indirecta" type="number" step="0.01" value={formData.deuda_indirecta} onChange={(e) => handleInputChange('deuda_indirecta', e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="impagos" className="text-gray-300">Impagos</Label>
                        <Input id="impagos" type="number" step="0.01" value={formData.impagos} onChange={(e) => handleInputChange('impagos', e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deudas_sunat" className="text-gray-300">Deudas SUNAT</Label>
                        <Input id="deudas_sunat" type="number" step="0.01" value={formData.deudas_sunat} onChange={(e) => handleInputChange('deudas_sunat', e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="protestos" className="text-gray-300">Protestos</Label>
                        <Input id="protestos" type="number" step="0.01" value={formData.protestos} onChange={(e) => handleInputChange('protestos', e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/sentinel')}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Guardando...' : 'Crear Documento'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SentinelCreatePage;