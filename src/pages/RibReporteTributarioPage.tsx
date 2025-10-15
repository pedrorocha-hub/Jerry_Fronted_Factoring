import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { FileText, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RibReporteTributarioList from '@/components/rib-reporte-tributario/RibReporteTributarioList';
import { getRibReporteTributarioSummaries, getReporteTributarioForEdit } from '@/services/ribReporteTributarioService';
import type { RibReporteTributarioSummary, RibReporteTributario } from '@/services/ribReporteTributarioService';
import { showError } from '@/utils/toast';
import RibReporteTributarioForm from '@/components/rib-reporte-tributario/RibReporteTributarioForm';

type EditingReport = {
  deudorReport: Partial<RibReporteTributario> | null;
  proveedorReport: Partial<RibReporteTributario> | null;
} | null;

const RibReporteTributarioPage = () => {
  const [reports, setReports] = useState<RibReporteTributarioSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<EditingReport>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRibReporteTributarioSummaries();
      setReports(data);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleSelectReportForEdit = async (solicitudId: string, anio: number) => {
    try {
      const reportData = await getReporteTributarioForEdit(solicitudId, anio);
      setEditingReport(reportData);
      setIsFormVisible(true);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al cargar el reporte para editar.');
    }
  };

  const handleDeleteReport = async (id: string) => {
    console.log('Deleting report with id:', id);
    showError('Funcionalidad de borrado no implementada aún.');
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setEditingReport(null);
    loadReports();
  };
  
  const handleAddNew = () => {
    setEditingReport(null);
    setIsFormVisible(true);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <FileText className="h-6 w-6 mr-3 text-[#00FF80]" />
            RIB - Reporte Tributario
          </h1>
          {!isFormVisible && (
            <Button onClick={handleAddNew} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuevo Reporte
            </Button>
          )}
        </div>
        
        {isFormVisible ? (
          <RibReporteTributarioForm initialData={editingReport} onClose={handleFormClose} />
        ) : (
          loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
            </div>
          ) : (
            <RibReporteTributarioList
              reports={reports}
              onSelectReport={handleSelectReportForEdit}
              onDeleteReport={handleDeleteReport}
            />
          )
        )}
      </div>
    </Layout>
  );
};

export default RibReporteTributarioPage;