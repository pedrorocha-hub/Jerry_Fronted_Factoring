import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import { Loader2 } from 'lucide-react';

const SolicitudOperacionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [formData, setFormData] = useState({
    ruc: '',
    proveedor: '',
    deudor: '',
    producto: '',
    comentarios: '',
  });
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      const fetchSolicitud = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('solicitudes_operacion')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          showError('No se pudo cargar la solicitud.');
          navigate('/solicitudes-operacion');
        } else if (data) {
          setFormData({
            ruc: data.ruc || '',
            proveedor: data.proveedor || '',
            deudor: data.deudor || '',
            producto: data.producto || '',
            comentarios: data.comentarios || '',
          });
        }
        setLoading(false);
      };
      fetchSolicitud();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruc) {
      showError('El RUC es obligatorio.');
      return;
    }

    const toastId = showLoading(isEditing ? 'Actualizando solicitud...' : 'Creando solicitud...');
    
    const dataToSubmit = {
      ...formData,
      user_id: session?.user.id,
      updated_at: new Date().toISOString(),
    };

    try {
      let error;
      if (isEditing) {
        const { error: updateError } = await supabase
          .from('solicitudes_operacion')
          .update(dataToSubmit)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('solicitudes_operacion')
          .insert(dataToSubmit);
        error = insertError;
      }

      if (error) throw error;

      dismissToast(toastId);
      showSuccess(`Solicitud ${isEditing ? 'actualizada' : 'creada'} exitosamente.`);
      navigate('/solicitudes-operacion');
    } catch (err) {
      dismissToast(toastId);
      showError(`Error al ${isEditing ? 'actualizar' : 'crear'} la solicitud.`);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          {isEditing ? 'Editar Solicitud de Operación' : 'Nueva Solicitud de Operación'}
        </h1>
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Detalles de la Solicitud</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && isEditing ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ruc" className="text-gray-300">RUC</Label>
                  <Input id="ruc" name="ruc" value={formData.ruc} onChange={handleChange} className="bg-black border-gray-700 text-white" required />
                </div>
                <div>
                  <Label htmlFor="proveedor" className="text-gray-300">Proveedor</Label>
                  <Input id="proveedor" name="proveedor" value={formData.proveedor} onChange={handleChange} className="bg-black border-gray-700 text-white" />
                </div>
                <div>
                  <Label htmlFor="deudor" className="text-gray-300">Deudor</Label>
                  <Input id="deudor" name="deudor" value={formData.deudor} onChange={handleChange} className="bg-black border-gray-700 text-white" />
                </div>
                <div>
                  <Label htmlFor="producto" className="text-gray-300">Producto</Label>
                  <Input id="producto" name="producto" value={formData.producto} onChange={handleChange} className="bg-black border-gray-700 text-white" />
                </div>
                <div>
                  <Label htmlFor="comentarios" className="text-gray-300">Comentarios</Label>
                  <Textarea id="comentarios" name="comentarios" value={formData.comentarios} onChange={handleChange} className="bg-black border-gray-700 text-white" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/solicitudes-operacion')} className="border-gray-700 text-white hover:bg-gray-800 hover:text-white">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                    {isEditing ? 'Guardar Cambios' : 'Crear Solicitud'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SolicitudOperacionFormPage;