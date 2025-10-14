import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Building, FileText, TrendingUp, BarChart3, DollarSign } from 'lucide-react';
import { DossierData } from '@/hooks/useDossierData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface DossierViewerProps {
  dossier: DossierData;
  onSave: () => void;
  saving: boolean;
}

const DossierViewer: React.FC<DossierViewerProps> = ({ dossier, onSave, saving }) => {
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-PE').format(value);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Building className="h-5 w-5 mr-2 text-[#00FF80]" />
            {dossier.nombreEmpresa}
          </CardTitle>
          <Button 
            onClick={onSave}
            disabled={saving}
            className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Dossier'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">RUC</p>
              <p className="text-white font-medium">{dossier.ruc}</p>
            </div>
            {dossier.status && (
              <div>
                <p className="text-gray-400 text-sm">Estado</p>
                <Badge variant="outline" className="text-[#00FF80] border-[#00FF80]">
                  {dossier.status}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RIB */}
      {dossier.rib && (
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-400" />
              RIB (Reporte de Información Básica)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Dirección</p>
                <p className="text-white">{dossier.rib.direccion || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Teléfono</p>
                <p className="text-white">{dossier.rib.telefono || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Grupo Económico</p>
                <p className="text-white">{dossier.rib.grupo_economico || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Visita</p>
                <p className="text-white">{dossier.rib.visita || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Estado</p>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  {dossier.rib.status || 'Borrador'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ficha RUC */}
      {dossier.fichaRuc && (
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Building className="h-5 w-5 mr-2 text-purple-400" />
              Ficha RUC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Actividad Empresa</p>
                <p className="text-white">{dossier.fichaRuc.actividad_empresa || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Estado Contribuyente</p>
                <p className="text-white">{dossier.fichaRuc.estado_contribuyente || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Domicilio Fiscal</p>
                <p className="text-white">{dossier.fichaRuc.domicilio_fiscal || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Representante Legal</p>
                <p className="text-white">{dossier.fichaRuc.nombre_representante_legal || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comportamiento Crediticio */}
      {dossier.comportamientoCrediticio && (
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
              Comportamiento Crediticio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Proveedor</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Calificación Equifax</p>
                    <p className="text-white">{dossier.comportamientoCrediticio.equifax_calificacion || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Calificación Sentinel</p>
                    <p className="text-white">{dossier.comportamientoCrediticio.sentinel_calificacion || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Deuda Directa</p>
                    <p className="text-white">{formatCurrency(dossier.comportamientoCrediticio.equifax_deuda_directa)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Impagos</p>
                    <p className="text-white">{formatCurrency(dossier.comportamientoCrediticio.equifax_impagos)}</p>
                  </div>
                </div>
              </div>
              {dossier.comportamientoCrediticio.deudor && (
                <div>
                  <h4 className="text-white font-medium mb-2">Deudor</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Calificación Equifax</p>
                      <p className="text-white">{dossier.comportamientoCrediticio.deudor_equifax_calificacion || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Calificación Sentinel</p>
                      <p className="text-white">{dossier.comportamientoCrediticio.deudor_sentinel_calificacion || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Deuda Directa</p>
                      <p className="text-white">{formatCurrency(dossier.comportamientoCrediticio.deudor_equifax_deuda_directa)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Impagos</p>
                      <p className="text-white">{formatCurrency(dossier.comportamientoCrediticio.deudor_equifax_impagos)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ventas Mensuales */}
      {dossier.ventasMensuales && (
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-orange-400" />
              Ventas Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  {dossier.ventasMensuales.status || 'Borrador'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Última actualización:</span>
                <span className="text-white">
                  {dossier.ventasMensuales.updated_at 
                    ? new Date(dossier.ventasMensuales.updated_at).toLocaleDateString('es-PE')
                    : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reporte Tributario */}
      {dossier.reporteTributario && (
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-red-400" />
              Reporte Tributario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Año</p>
                <p className="text-white">{dossier.reporteTributario.anio || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Activos</p>
                <p className="text-white">{formatCurrency(dossier.reporteTributario.total_activos)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Pasivos</p>
                <p className="text-white">{formatCurrency(dossier.reporteTributario.total_pasivos)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Patrimonio</p>
                <p className="text-white">{formatCurrency(dossier.reporteTributario.total_patrimonio)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ingreso Ventas</p>
                <p className="text-white">{formatCurrency(dossier.reporteTributario.ingreso_ventas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RIB EEFF */}
      {dossier.ribEeff && dossier.ribEeff.length > 0 && (
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-[#00FF80]" />
              RIB EEFF (Estados Financieros)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dossier.ribEeff.map((eeff, index) => (
                <div key={index} className="border-b border-gray-800 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {eeff.tipo_entidad === 'proveedor' ? 'Proveedor' : 'Deudor'}
                      </Badge>
                      <span className="text-white font-medium">Año {eeff.anio_reporte}</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                      {eeff.status || 'Borrador'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Total Activos</p>
                      <p className="text-white font-medium">{formatCurrency(eeff.activo_total_activos)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Pasivos</p>
                      <p className="text-white font-medium">{formatCurrency(eeff.pasivo_total_pasivos)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Patrimonio</p>
                      <p className="text-white font-medium">{formatCurrency(eeff.patrimonio_neto_total_patrimonio)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Activo Circulante</p>
                      <p className="text-white font-medium">{formatCurrency(eeff.activo_total_activo_circulante)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DossierViewer;