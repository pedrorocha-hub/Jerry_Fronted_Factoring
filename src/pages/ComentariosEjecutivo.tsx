import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Search, Building2, Loader2, AlertCircle, Save, ArrowLeft, MessageSquare, Plus, ClipboardList } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ComentariosEjecutivoService, ComentarioEjecutivo } from '@/services/comentariosEjecutivoService';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import { AsyncCombobox, ComboboxOption } from '@/components/ui/async-combobox';
import ComentariosEjecutivoForm from '@/components/rib/ComentariosEjecutivoForm';
import ComentariosEjecutivoAuditLogViewer from '@/components/audit/ComentariosEjecutivoAuditLogViewer';
import RibProcessWizard from '@/components/solicitud-operacion/RibProcessWizard';

const ComentariosEjecutivoPage = () => {
  const { isAdmin } = useSession();
  const { id } = useParams<{ id: string }>(); // Obtener ID de la URL
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioEjecutivo[]>([]);
  const [selectedComentario, setSelectedComentario] = useState<ComentarioEjecutivo | null>(null);
  const [solicitudId, setSolicitudId] = useState<string>('');
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);

  useEffect(() => {
    if (view === 'list' && !id && !searchParams.get('solicitud_id')) {
      loadComentarios();
    }
  }, [view, id, searchParams]);

  // Efecto para cargar por ID si existe en la URL
  useEffect(() => {
    const loadById = async () => {
      if (id && !selectedComentario) {
        setLoading(true);
        try {
          // Since we don't have a getById in service, we'll fetch all and find it, or implement getById later
          // For now, let's fetch all as a workaround or fix service if needed.
          // Actually, ComentariosEjecutivoService does not have getById.
          // Let's use Supabase directly for this single fetch to be efficient
          const { data, error } = await supabase
             .from('comentarios_ejecutivo')
             .select('*')
             .eq('id', id)
             .single();
          
          if (error) throw error;
          if (data) {
            handleEdit(data);
          }
        } catch (err) {
          console.error('Error loading comentario by ID:', err);
          showError('Error al cargar el comentario');
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (id) {
        loadById();
    }
  }, [id]);

  // Efecto para redirección automática desde Wizard (creación)
  useEffect(() => {
    const solicitudIdParam = searchParams.get('solicitud_id');
    
    if (solicitudIdParam && !id) {
       const handleAutoCreate = async () => {
         // Verificar si ya existe comentario para esta solicitud
         try {
           const existing = await ComentariosEjecutivoService.getBySolicitudId(solicitudIdParam);
           if (existing) {
             handleEdit(existing);
             showSuccess('Se encontraron comentarios existentes para esta solicitud.');
           } else {
             // Crear nuevo
             setSelectedComentario(null);
             setSolicitudId(solicitudIdParam);
             
             // Cargar label de la solicitud
             const { data: solicitud } = await supabase
                .from('solicitudes_operacion')
                .select('id, ruc, created_at')
                .eq('id', solicitudIdParam)
                .single();
                
             if (solicitud) {
                const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).maybeSingle();
                setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
             }
             
             setView('form');
           }
         } catch (err) {
           console.error("Error checking existing comments:", err);
         }
       };
       handleAutoCreate();
    }
  }, [searchParams, id]);

  const loadComentarios = async () => {
    setLoading(true);
    try {
      const data = await ComentariosEjecutivoService.getAll();
      setComentarios(data);
    } catch (err) {
      console.error('Error loading comentarios:', err);
      showError('Error al cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const searchSolicitudes = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_solicitudes', {
      search_term: query,
    });
    if (error) {
      console.error('Error searching solicitudes:', error);
      return [];
    }
    return data || [];
  };

  const handleCreateNew = () => {
    setSelectedComentario(null);
    setSolicitudId('');
    setInitialSolicitudLabel(null);
    setView('form');
  };

  const handleEdit = async (comentario: ComentarioEjecutivo) => {
    setSelectedComentario(comentario);
    setSolicitudId(comentario.solicitud_id);
    
    // Cargar label de la solicitud
    if (comentario.solicitud_id) {
         const { data: solicitud } = await supabase
            .from('solicitudes_operacion')
            .select('id, ruc, created_at')
            .eq('id', comentario.solicitud_id)
            .single();
            
         if (solicitud) {
            const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).maybeSingle();
            setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
         }
    }
    
    setView('form');
  };

  const handleBackToList = () => {
    // Limpiar URL
    window.history.replaceState({}, '', '/comentarios-ejecutivo');
    setView('list');
    setSelectedComentario(null);
    setSolicitudId('');
    setInitialSolicitudLabel(null);
    if (!id && !searchParams.get('solicitud_id')) {
        loadComentarios(); // Reload list if going back manually
    }
  };

  const handleSave = async (comentarioData: ComentarioEjecutivo) => {
    try {
      if (selectedComentario) {
        // Actualizar existente
        await ComentariosEjecutivoService.update(selectedComentario.id!, {
          comentario: comentarioData.comentario,
          archivos_adjuntos: comentarioData.archivos_adjuntos,
          solicitud_id: solicitudId
        });
        showSuccess('Comentarios actualizados correctamente');
      } else {
        // Crear nuevo
        await ComentariosEjecutivoService.create({
          comentario: comentarioData.comentario,
          archivos_adjuntos: comentarioData.archivos_adjuntos,
          solicitud_id: solicitudId
        });
        showSuccess('Comentarios creados correctamente');
      }
      handleBackToList();
    } catch (error) {
      console.error('Error saving comentarios:', error);
      showError('Error al guardar los comentarios');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar estos comentarios?')) {
      try {
        await ComentariosEjecutivoService.delete(id);
        showSuccess('Comentarios eliminados correctamente');
        loadComentarios();
      } catch (error) {
        console.error('Error deleting comentarios:', error);
        showError('Error al eliminar los comentarios');
      }
    }
  };

  const filteredComentarios = comentarios.filter(comentario => 
    comentario.comentario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comentario.solicitud_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <MessageSquare className="h-6 w-6 mr-2 text-[#00FF80]" />
              Comentarios del Ejecutivo
              <Badge variant="secondary" className="ml-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
                BETA
              </Badge>
            </h1>
            {view !== 'list' && (
              <Button variant="outline" onClick={handleBackToList} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            )}
          </div>

          {view === 'list' && (
            <div className="space-y-6">
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Buscar Comentarios</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Buscar por comentario o ID de solicitud..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="pl-10 bg-gray-900/50 border-gray-700" 
                    />
                  </div>
                  <Button onClick={handleCreateNew} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Comentario
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Comentarios del Ejecutivo</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                    </div>
                  ) : filteredComentarios.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p>No hay comentarios del ejecutivo.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-900/50">
                          <TableHead className="text-gray-300">Solicitud ID</TableHead>
                          <TableHead className="text-gray-300">Comentario</TableHead>
                          <TableHead className="text-gray-300">Archivos</TableHead>
                          <TableHead className="text-gray-300">Fecha</TableHead>
                          <TableHead className="text-right text-gray-300">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredComentarios.map((comentario) => (
                          <TableRow key={comentario.id} className="border-gray-800 hover:bg-gray-900/50">
                            <TableCell>
                              {comentario.solicitud_id ? (
                                <Link 
                                  to={`/solicitudes-operacion/editar/${comentario.solicitud_id}`} 
                                  className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs flex items-center"
                                >
                                  <ClipboardList className="h-3 w-3 mr-1" />
                                  Solicitud: {comentario.solicitud_id.substring(0, 8)}...
                                </Link>
                              ) : (
                                <span className="text-gray-500 text-xs">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate text-sm text-gray-300">
                                {comentario.comentario}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-400">
                                {comentario.archivos_adjuntos?.length || 0} archivo(s)
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-400">
                              {comentario.created_at ? new Date(comentario.created_at).toLocaleDateString('es-ES') : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEdit(comentario)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  Editar
                                </Button>
                                {isAdmin && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDelete(comentario.id!)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    Eliminar
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {view === 'form' && (
            <div className="space-y-6">
              {/* WIZARD PROCESS INDICATOR */}
              <RibProcessWizard solicitudId={solicitudId || undefined} currentStep="comentarios" />

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    {selectedComentario ? 'Editar Comentarios' : 'Nuevos Comentarios del Ejecutivo'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="solicitud_id" className="font-semibold text-white">
                      Asociar a Solicitud de Operación
                    </Label>
                    <AsyncCombobox
                      value={solicitudId}
                      onChange={(value) => setSolicitudId(value)}
                      onSearch={searchSolicitudes}
                      placeholder="Buscar por RUC, empresa o ID de solicitud..."
                      searchPlaceholder="Escriba para buscar..."
                      emptyMessage="No se encontraron solicitudes."
                      disabled={!isAdmin}
                      initialDisplayValue={initialSolicitudLabel}
                    />
                  </div>
                </CardContent>
              </Card>

              <ComentariosEjecutivoForm
                comentario={selectedComentario}
                solicitudId={solicitudId}
                onSave={handleSave}
                disabled={!isAdmin}
              />

              {/* Historial de Cambios */}
              {selectedComentario && (
                <ComentariosEjecutivoAuditLogViewer
                  comentarioId={selectedComentario.id}
                  className="mt-6"
                />
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ComentariosEjecutivoPage;