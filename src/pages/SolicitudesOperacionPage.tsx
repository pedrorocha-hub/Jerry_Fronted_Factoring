import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Eye, Edit, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface Solicitud {
  id: string;
  ruc: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  proveedor?: string;
  deudor?: string;
}

const SolicitudesOperacionPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [newRuc, setNewRuc] = useState('');

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solicitudes_operacion')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
      showError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newRuc || newRuc.length !== 11) {
      showError('Por favor, ingrese un RUC válido de 11 dígitos');
      return;
    }

    setCreatingNew(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Usuario no autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('solicitudes_operacion')
        .insert({
          ruc: newRuc,
          status: 'Borrador',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      showSuccess('Nueva solicitud creada exitosamente');
      setNewRuc('');
      await loadSolicitudes();
      
      // Navegar a la vista del dossier para esta nueva solicitud
      navigate(`/dossier?solicitudId=${data.id}`);
    } catch (err) {
      console.error('Error al crear solicitud:', err);
      showError('Error al crear la solicitud');
    } finally {
      setCreatingNew(false);
    }
  };

  const handleViewDossier = (solicitudId: string) => {
    navigate(`/dossier?solicitudId=${solicitudId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'En revisión':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Borrador':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredSolicitudes = solicitudes.filter(s => 
    s.ruc.includes(searchTerm) || 
    s.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.deudor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Solicitudes de Operación</h1>
            <p className="text-gray-400 mt-1">
              Gestiona todas las solicitudes y análisis de riesgo
            </p>
          </div>
        </div>

        {/* Card para crear nueva solicitud */}
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Plus className="h-5 w-5 mr-2 text-[#00FF80]" />
              Nueva Solicitud de Operación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Ingrese el RUC (11 dígitos)"
                value={newRuc}
                onChange={(e) => setNewRuc(e.target.value)}
                maxLength={11}
                className="flex-1 bg-gray-900 border-gray-700 text-white"
                disabled={creatingNew}
              />
              <Button
                onClick={handleCreateNew}
                disabled={creatingNew || !newRuc || newRuc.length !== 11}
                className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
              >
                {creatingNew ? (
                  <>
                    <Plus className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Solicitud
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Crea una nueva solicitud de operación para iniciar el análisis de riesgo
            </p>
          </CardContent>
        </Card>

        {/* Lista de solicitudes */}
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#00FF80]" />
                Solicitudes Existentes
              </CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por RUC, proveedor o deudor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando solicitudes...</div>
            ) : filteredSolicitudes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No se encontraron solicitudes
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">RUC</TableHead>
                      <TableHead className="text-gray-400">Proveedor</TableHead>
                      <TableHead className="text-gray-400">Deudor</TableHead>
                      <TableHead className="text-gray-400">Estado</TableHead>
                      <TableHead className="text-gray-400">Fecha Creación</TableHead>
                      <TableHead className="text-gray-400">Última Actualización</TableHead>
                      <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSolicitudes.map((solicitud) => (
                      <TableRow key={solicitud.id} className="border-gray-800">
                        <TableCell className="text-white font-mono">{solicitud.ruc}</TableCell>
                        <TableCell className="text-gray-300">{solicitud.proveedor || '-'}</TableCell>
                        <TableCell className="text-gray-300">{solicitud.deudor || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(solicitud.status)}>
                            {solicitud.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            {new Date(solicitud.created_at).toLocaleDateString('es-PE')}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(solicitud.updated_at).toLocaleDateString('es-PE')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDossier(solicitud.id)}
                            className="text-[#00FF80] hover:text-[#00FF80]/80 hover:bg-[#00FF80]/10"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Dossier
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SolicitudesOperacionPage;