import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Building } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EeffService } from '@/services/eeffService';
import { FichaRucService } from '@/services/fichaRucService';
import { FichaRuc } from '@/types/ficha-ruc';
import { CreateEeffDto, UpdateEeffDto } from '@/types/eeff';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';

const EeffForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<CreateEeffDto & UpdateEeffDto>>({
    ruc: '',
    activo_total_activo_neto: 0,
    pasivo_total_pasivo: 0,
    patrimonio_total_patrimonio: 0,
  });
  const [fichas, setFichas] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fichasData = await FichaRucService.getAll();
        setFichas(fichasData);

        if (isEditMode && id) {
          const eeffData = await EeffService.getById(id);
          if (eeffData) {
            setFormData(eeffData);
          } else {
            toast.error('No se encontró el registro de EEFF.');
            navigate('/eeff');
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('No se pudieron cargar los datos necesarios.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : null }));
  };

  const handleRucChange = (value: string) => {
    setFormData(prev => ({ ...prev, ruc: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruc) {
      toast.error('Por favor, seleccione una empresa (RUC).');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await EeffService.update(id, formData as UpdateEeffDto);
        toast.success('EEFF actualizado correctamente.');
      } else {
        await EeffService.create(formData as CreateEeffDto);
        toast.success('EEFF creado correctamente.');
      }
      navigate('/eeff');
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar el registro de EEFF.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rucOptions = fichas.map(ficha => ({
    value: ficha.ruc,
    label: `${ficha.nombre_empresa} (${ficha.ruc})`,
  }));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                {isEditMode ? 'Editar' : 'Nuevo'} Estado Financiero
              </h1>
              <p className="text-gray-400 mt-2">
                {isEditMode ? 'Actualice los detalles del registro.' : 'Complete el formulario para crear un nuevo registro.'}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/eeff')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al listado
            </Button>
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-[#00FF80]" />
                Datos de la Empresa y EEFF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="ruc" className="text-gray-300">Empresa (RUC)</Label>
                    <Combobox
                      options={rucOptions}
                      value={formData.ruc || ''}
                      onChange={handleRucChange}
                      placeholder="Seleccione una empresa..."
                      searchPlaceholder="Buscar empresa por RUC o nombre..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="activo_total_activo_neto" className="text-gray-300">Total Activo Neto</Label>
                    <Input
                      id="activo_total_activo_neto"
                      name="activo_total_activo_neto"
                      type="number"
                      step="0.01"
                      value={formData.activo_total_activo_neto || ''}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pasivo_total_pasivo" className="text-gray-300">Total Pasivo</Label>
                    <Input
                      id="pasivo_total_pasivo"
                      name="pasivo_total_pasivo"
                      type="number"
                      step="0.01"
                      value={formData.pasivo_total_pasivo || ''}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patrimonio_total_patrimonio" className="text-gray-300">Total Patrimonio</Label>
                    <Input
                      id="patrimonio_total_patrimonio"
                      name="patrimonio_total_patrimonio"
                      type="number"
                      step="0.01"
                      value={formData.patrimonio_total_patrimonio || ''}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
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

export default EeffForm;