import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Building2, 
  Users, 
  CreditCard, 
  Scale, 
  Receipt, 
  FileBarChart,
  TrendingUp,
  Activity,
  Brain,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ClipboardEdit,
  ShieldCheck,
  List
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Import services
import { DocumentoService } from '@/services/documentoService';
import { FichaRucService } from '@/services/fichaRucService';
import { RepresentanteLegalService } from '@/services/representanteLegalService';
import { CuentaBancariaService } from '@/services/cuentaBancariaService';
import { VigenciaPoderesService } from '@/services/vigenciaPoderesService';
import { FacturaNegociarService } from '@/services/facturaNegociarService';
import { ReporteTributarioService } from '@/services/reporteTributarioService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    documentos: { total: 0, procesados: 0, pendientes: 0, errores: 0 },
    fichasRuc: { total: 0, activas: 0, inactivas: 0 },
    representantes: { total: 0, conCargo: 0, sinCargo: 0 },
    cuentasBancarias: { total: 0, activas: 0, cerradas: 0 },
    vigenciaPoderes: { total: 0, vigentes: 0, vencidos: 0 },
    facturas: { total: 0, pendientes: 0, negociadas: 0, vencidas: 0 },
    reportes: { total: 0, thisYear: 0, lastYear: 0 }
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
    loadRecentActivity();
  }, []);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      
      // Load stats from all services
      const [
        documentosStats,
        fichasRucStats,
        representantesStats,
        cuentasStats,
        vigenciasStats,
        facturasStats,
        reportesStats
      ] = await Promise.all([
        DocumentoService.getStats().catch(() => ({ total: 0, procesados: 0, pendientes: 0, errores: 0 })),
        FichaRucService.getStats().catch(() => ({ total: 0, active: 0, inactive: 0 })),
        RepresentanteLegalService.getStats().catch(() => ({ total: 0, withCargo: 0, withoutCargo: 0 })),
        CuentaBancariaService.getStats().catch(() => ({ total: 0, activeCounts: 0, inactiveCounts: 0 })),
        VigenciaPoderesService.getStats().catch(() => ({ total: 0, vigentes: 0, vencidos: 0 })),
        FacturaNegociarService.getStats().catch(() => ({ total: 0, pendientes: 0, negociadas: 0, vencidas: 0 })),
        ReporteTributarioService.getStats().catch(() => ({ total: 0, thisYear: 0, lastYear: 0 }))
      ]);

      setStats({
        documentos: {
          total: documentosStats.total || 0,
          procesados: documentosStats.procesados || 0,
          pendientes: documentosStats.pendientes || 0,
          errores: documentosStats.errores || 0
        },
        fichasRuc: {
          total: fichasRucStats.total || 0,
          activas: fichasRucStats.active || 0,
          inactivas: fichasRucStats.inactive || 0
        },
        representantes: {
          total: representantesStats.total || 0,
          conCargo: representantesStats.withCargo || 0,
          sinCargo: representantesStats.withoutCargo || 0
        },
        cuentasBancarias: {
          total: cuentasStats.total || 0,
          activas: cuentasStats.activeCounts || 0,
          cerradas: cuentasStats.inactiveCounts || 0
        },
        vigenciaPoderes: {
          total: vigenciasStats.total || 0,
          vigentes: vigenciasStats.vigentes || 0,
          vencidos: vigenciasStats.vencidos || 0
        },
        facturas: {
          total: facturasStats.total || 0,
          pendientes: facturasStats.pendientes || 0,
          negociadas: facturasStats.negociadas || 0,
          vencidas: facturasStats.vencidas || 0
        },
        reportes: {
          total: reportesStats.total || 0,
          thisYear: reportesStats.thisYear || 0,
          lastYear: reportesStats.lastYear || 0
        }
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Get recent fichas RUC as activity
      const recentFichas = await FichaRucService.getAll();
      const recentActivityData = recentFichas.slice(0, 5).map((ficha) => ({
        id: ficha.id,
        type: 'ficha_ruc',
        message: `Ficha RUC procesada: ${ficha.nombre_empresa}`,
        timestamp: new Date(ficha.created_at).toLocaleString('es-ES'),
        status: 'completed',
        empresa: ficha.nombre_empresa,
        ruc: ficha.ruc,
        created_at: ficha.created_at
      }));
      
      setRecentActivity(recentActivityData);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      setRecentActivity([]);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'ficha_ruc':
        return <Building2 className="h-4 w-4 text-[#00FF80]" />;
      case 'upload':
        return <FileText className="h-4 w-4 text-[#00FF80]" />;
      case 'processing':
        return <Brain className="h-4 w-4 text-yellow-400 animate-pulse" />;
      case 'analysis':
        return <CheckCircle className="h-4 w-4 text-[#00FF80]" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-[#00FF80]/10 text-[#00FF80] rounded-full border border-[#00FF80]/20">✨ Procesado por IA</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20">Procesando</span>;
      case 'error':
        return <span className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded-full border border-red-500/20">Error</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-500/10 text-gray-400 rounded-full border border-gray-500/20">Desconocido</span>;
    }
  };

  if (loading) {
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
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Brain className="h-8 w-8 mr-3 text-[#00FF80]" />
                Dashboard de Análisis IA
              </h1>
              <p className="text-gray-400 mt-2">
                Resumen completo de documentos procesados y análisis inteligente
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-[#00FF80]/10 border border-[#00FF80]/20 rounded-lg px-3 py-2">
                <Zap className="h-4 w-4 text-[#00FF80] animate-pulse" />
                <span className="text-sm text-[#00FF80] font-medium">IA Activa</span>
              </div>
              <Button 
                className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium"
                onClick={() => window.location.href = '/upload'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Subir Documentos
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Documentos Totales
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <FileText className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{stats.documentos.total}</div>
                {stats.documentos.total > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Progress value={(stats.documentos.procesados / stats.documentos.total) * 100} className="flex-1 h-2" />
                    <span className="text-xs text-gray-400">{Math.round((stats.documentos.procesados / stats.documentos.total) * 100)}%</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {stats.documentos.procesados} procesados, {stats.documentos.pendientes} pendientes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-blue-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Fichas RUC
                </CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400 font-mono">{stats.fichasRuc.total}</div>
                <p className="text-xs text-gray-500">
                  {stats.fichasRuc.activas} activas, {stats.fichasRuc.inactivas} inactivas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-purple-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Representantes
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Users className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400 font-mono">{stats.representantes.total}</div>
                <p className="text-xs text-gray-500">
                  {stats.representantes.conCargo} con cargo definido
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-yellow-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Facturas Pendientes
                </CardTitle>
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <Receipt className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400 font-mono">{stats.facturas.pendientes}</div>
                <p className="text-xs text-gray-500">
                  De {stats.facturas.total} facturas totales
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#121212] border border-gray-800 hover:border-green-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Cuentas Bancarias
                </CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CreditCard className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400 font-mono">{stats.cuentasBancarias.total}</div>
                <p className="text-xs text-gray-500">
                  {stats.cuentasBancarias.activas} activas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-orange-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Vigencia Poderes
                </CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <Scale className="h-4 w-4 text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400 font-mono">{stats.vigenciaPoderes.total}</div>
                <p className="text-xs text-gray-500">
                  {stats.vigenciaPoderes.vigentes} vigentes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-cyan-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Reportes Tributarios
                </CardTitle>
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <FileBarChart className="h-4 w-4 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-400 font-mono">{stats.reportes.total}</div>
                <p className="text-xs text-gray-500">
                  {stats.reportes.thisYear} este año
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Status */}
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-[#00FF80]" />
                  Estado de Procesamiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-[#00FF80]" />
                    <span className="text-sm text-gray-300">Documentos Procesados</span>
                  </div>
                  <span className="text-sm font-mono text-[#00FF80]">{stats.documentos.procesados}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">En Proceso</span>
                  </div>
                  <span className="text-sm font-mono text-yellow-400">{stats.documentos.pendientes}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-300">Con Errores</span>
                  </div>
                  <span className="text-sm font-mono text-red-400">{stats.documentos.errores}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No hay actividad reciente</p>
                    <p className="text-sm text-gray-500">Los documentos procesados aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                        <div className="flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300">{activity.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                            {getStatusBadge(activity.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Documentos Section */}
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#00FF80]" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-blue-500/50"
                  onClick={() => window.location.href = '/ficha-ruc'}
                >
                  <Building2 className="h-6 w-6" />
                  <span className="text-xs">Fichas RUC</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-purple-500/50"
                  onClick={() => window.location.href = '/representante-legal'}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-xs">Representantes</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-green-500/50"
                  onClick={() => window.location.href = '/cuenta-bancaria'}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="text-xs">Cuentas Bancarias</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-orange-500/50"
                  onClick={() => window.location.href = '/vigencia-poderes'}
                >
                  <Scale className="h-6 w-6" />
                  <span className="text-xs">Vigencia Poderes</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-yellow-500/50"
                  onClick={() => window.location.href = '/factura-negociar'}
                >
                  <Receipt className="h-6 w-6" />
                  <span className="text-xs">Facturas</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-cyan-500/50"
                  onClick={() => window.location.href = '/reporte-tributario'}
                >
                  <FileBarChart className="h-6 w-6" />
                  <span className="text-xs">Reportes Tributarios</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Creación del RIB */}
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-[#00FF80]" />
                Creación del RIB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-pink-500/50"
                  onClick={() => window.location.href = '/rib'}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-xs">Rib</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-indigo-500/50"
                  onClick={() => alert('Página en construcción')}
                >
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-xs">Comportamiento Crediticio</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-cyan-500/50"
                  onClick={() => window.location.href = '/reporte-tributario'}
                >
                  <FileBarChart className="h-6 w-6" />
                  <span className="text-xs">Reporte Tributario Deudor</span>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;