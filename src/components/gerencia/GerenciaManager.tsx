import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Briefcase, User, Info, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gerente, GerenteInsert, GerenteUpdate } from '@/types/gerencia';
import { GerenciaService } from '@/services/gerenciaService';
import { showSuccess, showError } from '@/utils/toast';
import GerenteModal from './GerenteModal';

interface GerenciaManagerProps {
  ruc: string;
  readonly?: boolean;
}

const GerenciaManager: React.FC<GerenciaManagerProps> = ({ ruc, readonly = false }) => {
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGerente, setSelectedGerente] = useState<Gerente | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GerenciaService.getAllByRuc(ruc);
      setGerentes(data);
    } catch (error) {
      showError('Error al cargar la gerencia');
    } finally {
      setLoading(false);
    }
  }, [ruc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (gerente: Gerente | null = null) => {
    setSelectedGerente(gerente);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedGerente(null);
  };

  const handleSave = async (data: GerenteInsert | GerenteUpdate) => {
    if (readonly) return;
    setIsSaving(true);
    try {
      if (selectedGerente) {
        await GerenciaService.update(selectedGerente.id, data as GerenteUpdate);
        showSuccess('Gerente actualizado exitosamente');
      } else {
        await GerenciaService.create({ ...data, ruc } as GerenteInsert);
        showSuccess('Gerente agregado exitosamente');
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      showError('Error al guardar el gerente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (readonly) return;
    if (window.confirm('¿Está seguro de que desea eliminar este gerente?')) {
      try {
        await GerenciaService.delete(id);
        showSuccess('Gerente eliminado exitosamente');
        fetchData();
      } catch (error) {
        showError('Error al eliminar el gerente');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center text-white">
          <Briefcase className="h-5 w-5 mr-2 text-[#00FF80]" />
          Gestión de Gerencia
        </h3>
        {!readonly && (
          <Button size="sm" onClick={() => handleOpenModal()} className="bg-[#00FF80] text-black hover:bg-[#00FF80]/90">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Gerente
          </Button>
        )}
      </div>

      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-900/50">
              <TableHead className="text-gray-300">Nombre</TableHead>
              <TableHead className="text-gray-300">DNI</TableHead>
              <TableHead className="text-gray-300">Cargo</TableHead>
              <TableHead className="text-gray-300">Vínculo</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-400">Cargando...</TableCell></TableRow>
            ) : gerentes.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8">No hay gerentes registrados.</TableCell></TableRow>
            ) : (
              gerentes.map(gerente => (
                <TableRow key={gerente.id} className="border-gray-800">
                  <TableCell className="font-medium text-white">{gerente.nombre}</TableCell>
                  <TableCell className="text-gray-400 font-mono">{gerente.dni}</TableCell>
                  <TableCell><Badge variant="outline" className="border-blue-500/30 text-blue-300">{gerente.cargo}</Badge></TableCell>
                  <TableCell className="text-gray-400">{gerente.vinculo || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(gerente)} className="text-gray-400 hover:text-white">
                      {readonly ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                    {!readonly && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(gerente.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {modalOpen && (
        <GerenteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          gerente={selectedGerente}
          loading={isSaving}
          readonly={readonly}
        />
      )}
    </div>
  );
};

export default GerenciaManager;