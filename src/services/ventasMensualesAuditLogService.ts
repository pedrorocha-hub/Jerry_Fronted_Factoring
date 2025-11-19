import { supabase } from '@/integrations/supabase/client';
import { VentasMensualesAuditLog, VentasMensualesAuditLogWithUserInfo } from '@/types/ventas-mensuales-audit-log';

export class VentasMensualesAuditLogService {
  /**
   * Obtener logs de auditoría para una solicitud específica
   */
  static async getLogsBySolicitud(
    proveedorRuc: string,
    deudorRuc: string | null,
    solicitudId: string
  ): Promise<VentasMensualesAuditLogWithUserInfo[]> {
    try {
      // Obtener los IDs de ventas_mensuales para esta solicitud específica
      let query = supabase
        .from('ventas_mensuales')
        .select('id')
        .eq('proveedor_ruc', proveedorRuc)
        .eq('solicitud_id', solicitudId);
      
      // Para NULL, usar .is() en lugar de .eq()
      if (deudorRuc === null) {
        query = query.is('deudor_ruc', null);
      } else {
        query = query.eq('deudor_ruc', deudorRuc);
      }

      const { data: ventasRecords, error: ventasError } = await query;

      if (ventasError) throw ventasError;

      if (!ventasRecords || ventasRecords.length === 0) {
        return [];
      }

      const ventasIds = ventasRecords.map(r => r.id);

      // Obtener todos los logs para esos IDs
      const { data, error } = await supabase
        .from('ventas_mensuales_audit_log')
        .select('*')
        .in('ventas_mensuales_id', ventasIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con información del usuario
      const logsWithUserInfo = await Promise.all(
        (data || []).map(async (log) => {
          if (log.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', log.user_id)
              .single();

            return {
              ...log,
              user_full_name: userData?.full_name || null,
            } as VentasMensualesAuditLogWithUserInfo;
          }
          return log as VentasMensualesAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Ventas Mensuales audit logs by solicitud:', error);
      throw error;
    }
  }
  /**
   * Obtener todos los logs de auditoría para un reporte de ventas mensuales específico
   */
  static async getLogsByVentasId(ventasId: string): Promise<VentasMensualesAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('ventas_mensuales_audit_log')
        .select('*')
        .eq('ventas_mensuales_id', ventasId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con información del usuario
      const logsWithUserInfo = await Promise.all(
        (data || []).map(async (log) => {
          if (log.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', log.user_id)
              .single();

            return {
              ...log,
              user_full_name: userData?.full_name || null,
            } as VentasMensualesAuditLogWithUserInfo;
          }
          return log as VentasMensualesAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Ventas Mensuales audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los logs por RUC (busca en todos los años/registros del mismo proveedor/deudor)
   */
  static async getLogsByRuc(
    proveedorRuc: string, 
    deudorRuc: string | null
  ): Promise<VentasMensualesAuditLogWithUserInfo[]> {
    try {
      // Primero obtener todos los IDs de ventas_mensuales para este proveedor/deudor
      let query = supabase
        .from('ventas_mensuales')
        .select('id')
        .eq('proveedor_ruc', proveedorRuc);
      
      // Para NULL, usar .is() en lugar de .eq()
      if (deudorRuc === null) {
        query = query.is('deudor_ruc', null);
      } else {
        query = query.eq('deudor_ruc', deudorRuc);
      }

      const { data: ventasRecords, error: ventasError } = await query;

      if (ventasError) throw ventasError;

      if (!ventasRecords || ventasRecords.length === 0) {
        return [];
      }

      const ventasIds = ventasRecords.map(r => r.id);

      // Obtener todos los logs para esos IDs
      const { data, error } = await supabase
        .from('ventas_mensuales_audit_log')
        .select('*')
        .in('ventas_mensuales_id', ventasIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con información del usuario
      const logsWithUserInfo = await Promise.all(
        (data || []).map(async (log) => {
          if (log.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', log.user_id)
              .single();

            return {
              ...log,
              user_full_name: userData?.full_name || null,
            } as VentasMensualesAuditLogWithUserInfo;
          }
          return log as VentasMensualesAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Ventas Mensuales audit logs by RUC:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de un reporte de ventas mensuales
   */
  static async getLastChange(ventasId: string): Promise<VentasMensualesAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('ventas_mensuales_audit_log')
        .select('*')
        .eq('ventas_mensuales_id', ventasId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data && data.user_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user_id)
          .single();

        return {
          ...data,
          user_full_name: userData?.full_name || null,
        } as VentasMensualesAuditLogWithUserInfo;
      }

      return data as VentasMensualesAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last Ventas Mensuales change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(ventasId: string): Promise<{
    totalChanges: number;
    lastModifiedBy: string | null;
    lastModifiedAt: string | null;
  }> {
    try {
      const logs = await this.getLogsByVentasId(ventasId);
      
      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
      };
    } catch (error) {
      console.error('Error fetching Ventas Mensuales change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}
