import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Save, ArrowLeft } from 'lucide-react';
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
import { SentinelService, type Sentinel } from '@/services/sentinelService';
import { toast } from 'sonner';

const SentinelEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    ruc: '',
    file_url: '',
    status: 'Borrador'
  });

  useEffect(() => {
    if (id) {
      loadSentinel();
    }
  }, [id]);

  const loadSentinel = async () => {
    if (!id) return;
    
    try {
      setInitialLoading(true);
      const data = await SentinelService.getById(id);
      if (data) {
        setFormData({
          ruc: data.ruc,
          file_url: data.file_url || '',
          status: data.status
        });
      }
    } catch (error) {
      console.error('Error loading sentinel:', error);
      toast.error('Error al cargar el documento Sentinel');
      navigate('/sentinel');
    } finally {
      setInitialLoading(false);
    }
  };

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

    if (!id) return;

    try {
      setLoading(true);
      await SentinelService.update(id, formData);
      toast.success('Documento Sentinel actualizado correctamente');
      navigate(`/sentinel/${id}`);
    } catch (error) {
      console.error('Error updating sentinel:', error);
      toast.error('Error al actualizar el documento Sentinel');
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

  if (initialLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/sentinel/${id}`)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <Shield className="h-8 w-8 mr-3 text-[#00FF80]" />
                  Editar Documento Sentinel
                </h1>
                <p className="text-gray-400 mt-2">
                  Modifica la información del documento Sentinel
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-[#121212] border border-gray-800 max-w-2xl">
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
                  <p className="text-xs text-gray-500">
                    El RUC debe tener exactamente 11 dígitos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file_url" className="text-gray-300">
                    URL del Archivo
                  </Label>
                  <Input
                    id="file_url"
                    type="url"
                    placeholder="https://ejemplo.com/archivo.pdf"
                    value={formData.file_url}
                    onChange={(e) => handleInputChange('file_url', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-500">
                    URL opcional del archivo PDF asociado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-300">
                    Estado
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Borrador">Borrador</SelectItem>
                      <SelectItem value="Procesado">Procesado</SelectItem>
                      <SelectItem value="Error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/sentinel/${id}`)}
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
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
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

export default SentinelEditPage;