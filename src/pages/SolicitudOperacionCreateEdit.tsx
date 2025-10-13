import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { SolicitudOperacion, SolicitudOperacionRiesgo, SolicitudOperacionWithRiesgos, SolicitudStatus } from '@/types/solicitudOperacion';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Save, ArrowLeft, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

const SolicitudOperacionCreateEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [solicitudFormData, setSolicitudFormData] = useState({
    ruc: '',
    status: 'Borrador' as SolicitudStatus,
    direccion: '',
    visita: '',
    contacto: '',
    comentarios: '',
    fianza: '',
    proveedor: '',
    exposicion_total: '',
    fecha_ficha: '',
    orden_servicio: '',
    factura: '',
    tipo_cambio: '',
    moneda_operacion: 'USD',
    resumen_solicitud: '',
    garantias: '',
    condiciones_desembolso: '',
  });
  const [riesgosRows, setRiesgosRows] = useState<Partial<SolicitudOperacionRiesgo>[]>([{}]);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSolicitud, setEditingSolicitud] = useState<SolicitudOperacionWithRiesgos | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<{ fullName: string; email: string } | null>(null);

  const handleEditSolicitud = useCallback((solicitud: SolicitudOperacionWithRiesgos) => {
    setEditingSolicitud(solicitud);
    setSolicitudFormData({
      ruc: solicitud.ruc || '',
      status: solicitud.status || 'Borrador',
      direccion: solicitud.direccion || '',
      visita: solicitud.visita || '',
      contacto: solicitud.contacto || '',
      comentarios: solicitud.comentarios || '',
      fianza: solicitud.fianza || '',
      proveedor: solicitud.proveedor || '',
      exposicion_total: solicitud.exposicion_total || '',
      fecha_ficha: solicitud.fecha_ficha || '',
      orden_servicio: solicitud.orden_servicio || '',
      factura: solicitud.factura || '',
      tipo_cambio: solicitud.tipo_cambio?.toString() || '',
      moneda_operacion: solicitud.moneda_operacion || 'USD',
      resumen_solicitud: solicitud.resumen_solicitud || '',
      garantias: solicitud.garantias || '',
      condiciones_desembolso: solicitud.condiciones_desembolso || '',
    });
    if (solicitud.riesgos && solicitud.riesgos.length > 0) {
      setRiesgosRows(solicitud.riesgos);
    } else {
      setRiesgosRows([{}]);
    }
  }, []);

  useEffect(() => {
    const fetchSolicitud = async () => {
      if (id) {
        try {
          setLoading(true);
          const solicitudData = await SolicitudOperacionService.getById(id);
          if (solicitudData) {
            handleEditSolicitud(solicitudData);
            if (solicitudData.user_id) {
              const { data: creatorData, error: creatorError } = await supabase.rpc('get_user_details', {
                user_id_input: solicitudData.user_id,
              });

              if (creatorError) throw creatorError;
              
              if (creatorData && creatorData.length > 0) {
                const userDetails = creatorData[0] as { full_name: string; email: string };
                setCreatorInfo({
                  fullName: userDetails.full_name,
                  email: userDetails.email
                });
              }
            }
          } else {
            toast.error('Solicitud no encontrada.');
            navigate('/solicitudes-operacion');
          }
        } catch (error) {
          console.error(error);
          toast.error('Error al cargar la solicitud.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSolicitud();
  }, [id, navigate, handleEditSolicitud]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSolicitudFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSolicitudFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRiesgoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newRows = [...riesgosRows];
    newRows[index] = { ...newRows[index], [name]: value };
    setRiesgosRows(newRows);
  };

  const addRiesgoRow = () => {
    setRiesgosRows([...riesgosRows, {}]);
  };

  const removeRiesgoRow = (index: number) => {
    const newRows = riesgosRows.filter((_, i) => i !== index);
    setRiesgosRows(newRows);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const firstRiesgoRow = riesgosRows[0] || {};
      const dataToSave: Partial<SolicitudOperacion> = {
        ...solicitudFormData,
        tipo_cambio: parseFloat(solicitudFormData.tipo_cambio) || null,
        lp: firstRiesgoRow.lp,
        producto: firstRiesgoRow.producto,
        deudor: firstRiesgoRow.deudor,
        lp_vigente_gve: firstRiesgoRow.lp_vigente_gve,
        riesgo_aprobado: String(firstRiesgoRow.riesgo_aprobado || ''),
        propuesta_comercial: String(firstRiesgoRow.propuesta_comercial || ''),
      };

      if (isEditMode && editingSolicitud) {
        await SolicitudOperacionService.update(editingSolicitud.id, dataToSave);
        await supabase.from('solicitud_operacion_riesgos').delete().eq('solicitud_id', editingSolicitud.id);
        
        const riesgosToSave = riesgosRows.map(riesgo => ({
          ...riesgo,
          solicitud_id: editingSolicitud.id,
        }));
        await supabase.from('solicitud_operacion_riesgos').insert(riesgosToSave);

        toast.success('Solicitud actualizada con éxito.');
      } else {
        const createdData = await SolicitudOperacionService.create(dataToSave);
        const newSolicitudId = createdData.id;
        
        const riesgosToSave = riesgosRows.map(riesgo => ({
          ...riesgo,
          solicitud_id: newSolicitudId,
        }));
        await supabase.from('solicitud_operacion_riesgos').insert(riesgosToSave);

        toast.success('Solicitud creada con éxito.');
      }
      navigate('/solicitudes-operacion');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-screen bg-black"><Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="p-6 bg-black min-h-screen text-white">
        <Button variant="outline" onClick={() => navigate('/solicitudes-operacion')} className="mb-6 bg-transparent border-gray-700 hover:bg-gray-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Solicitudes
        </Button>

        <form onSubmit={handleSubmit}>
          <Card className="bg-[#121212] border-gray-800">
            <CardHeader>
              <CardTitle>{isEditMode ? 'Editar' : 'Crear'} Solicitud de Operación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Form fields will go here */}
              <div className="text-right">
                <Button type="submit" disabled={isSubmitting} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {isEditMode ? 'Guardar Cambios' : 'Crear Solicitud'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default SolicitudOperacionCreateEdit;