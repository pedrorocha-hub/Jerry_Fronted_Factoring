import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import SolicitudOperacionCreateEdit from '@/components/solicitud-operacion/SolicitudOperacionCreateEdit';
import SolicitudOperacionList from '@/components/solicitud-operacion/SolicitudOperacionList';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { SolicitudOperacion as SolicitudOperacionType } from '@/types/solicitudOperacion';
import { showSuccess, showError } from '@/utils/toast';

const SolicitudOperacion = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [solicitudes, setSolicitudes] = useState<SolicitudOperacionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudOperacionType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  useEffect(() => {
    if (id) {
      loadSolicitudById(id);
    }
  }, [id]);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await SolicitudOperacionService.getAll();
      setSolicitudes(data);
    } catch (error) {
      console.error('Error loading solicitudes:', error);
      showError('Error al cargar las solicitudes de operación');
    } finally {
      setLoading(false);
    }
  };

  const loadSolicitudById = async (solicitudId: string) => {
    try {
      const solicitud = await SolicitudOperacionService.getById(solicitudId);
      if (solicitud) {
        setSelectedSolicitud(solicitud);
        setIsCreating(false);
      } else {
        showError('Solicitud no encontrada');
        navigate('/solicitud-operacion');
      }
    } catch (error) {
      console.error('Error loading solicitud:', error);
      showError('Error al cargar la solicitud');
      navigate('/solicitud-operacion');
    }
  };

  const handleCreate = () => {
    setSelectedSolicitud(null);
    setIsCreating(true);
    navigate('/solicitud-operacion/nueva');
  };

  const handleEdit = (solicitud: SolicitudOperacionType) => {
    setSelectedSolicitud(solicitud);
    setIsCreating(false);
    navigate(`/solicitud-operacion/${solicitud.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta solicitud?')) {
      return;
    }

    try {
      await SolicitudOperacionService.delete(id);
      showSuccess('Solicitud eliminada exitosamente');
      await loadSolicitudes();
      if (selectedSolicitud?.id === id) {
        setSelectedSolicitud(null);
        setIsCreating(false);
        navigate('/solicitud-operacion');
      }
    } catch (error) {
      console.error('Error deleting solicitud:', error);
      showError('Error al eliminar la solicitud');
    }
  };

  const handleSaveSuccess = async () => {
    await loadSolicitudes();
    setSelectedSolicitud(null);
    setIsCreating(false);
    navigate('/solicitud-operacion');
  };

  const handleCancel = () => {
    setSelectedSolicitud(null);
    setIsCreating(false);
    navigate('/solicitud-operacion');
  };

  // Si estamos creando o editando, mostrar el formulario
  if (isCreating || selectedSolicitud) {
    return (
      <Layout>
        <div className="min-h-screen bg-black">
          <SolicitudOperacionCreateEdit
            solicitud={selectedSolicitud}
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleCancel}
          />
        </div>
      </Layout>
    );
  }

  // Si no, mostrar la lista
  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <SolicitudOperacionList
          solicitudes={solicitudes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
      </div>
    </Layout>
  );
};

export default SolicitudOperacion;