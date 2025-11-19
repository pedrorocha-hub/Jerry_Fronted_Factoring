import { supabase } from '@/integrations/supabase/client';
import { FichaRucAuditLog, FichaRucAuditLogWithUserInfo } from '@/types/ficha-ruc-audit-log';
import { AccionistaAuditLogWithUserInfo } from '@/types/accionista-audit-log';
import { GerenciaAuditLogWithUserInfo } from '@/types/gerencia-audit-log';

// Tipo unificado para todos los logs relacionados con una Ficha RUC
export interface UnifiedAuditLog {
  id: string;
  entity_type: 'ficha_ruc' | 'accionista' | 'gerencia';
  entity_id: string | number;
  user_id: string | null;
  user_email: string | null;
  user_full_name?: string;
  action: string;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export class FichaRucAuditLogService {
  /**
   * Obtener todos los logs de auditoría para una Ficha RUC específica (solo ficha)
   */
  static async getLogsByFichaRucId(fichaRucId: number): Promise<FichaRucAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('ficha_ruc_audit_log')
        .select('*')
        .eq('ficha_ruc_id', fichaRucId)
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
            } as FichaRucAuditLogWithUserInfo;
          }
          return log as FichaRucAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Ficha RUC audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener logs UNIFICADOS: ficha RUC + accionistas + gerencia por RUC
   */
  static async getUnifiedLogsByRuc(ruc: string): Promise<UnifiedAuditLog[]> {
    try {
      // Primero obtener el ID de la ficha RUC usando el RUC
      const { data: fichaRucData, error: fichaRucError } = await supabase
        .from('ficha_ruc')
        .select('id')
        .eq('ruc', ruc)
        .single();

      if (fichaRucError || !fichaRucData) {
        console.error('Error fetching ficha RUC:', fichaRucError);
        return [];
      }

      const fichaRucId = fichaRucData.id;

      // 1. Obtener logs de Ficha RUC
      const { data: fichaLogs } = await supabase
        .from('ficha_ruc_audit_log')
        .select('*')
        .eq('ficha_ruc_id', fichaRucId);

      // 2. Obtener IDs de todos los accionistas de este RUC
      const { data: accionistasData } = await supabase
        .from('ficha_ruc_accionistas')
        .select('id')
        .eq('ruc', ruc);

      const accionistaIds = accionistasData?.map(a => a.id) || [];

      // 3. Obtener logs de Accionistas usando los IDs
      let accionistaLogs: any[] = [];
      if (accionistaIds.length > 0) {
        const { data } = await supabase
          .from('accionista_audit_log')
          .select('*')
          .in('accionista_id', accionistaIds);
        accionistaLogs = data || [];
      }

      // 4. Obtener IDs de todos los gerentes de este RUC
      const { data: gerenciasData } = await supabase
        .from('ficha_ruc_gerencia')
        .select('id')
        .eq('ruc', ruc);

      const gerenteIds = gerenciasData?.map(g => g.id) || [];

      // 5. Obtener logs de Gerencia usando los IDs
      let gerenciaLogs: any[] = [];
      if (gerenteIds.length > 0) {
        const { data } = await supabase
          .from('gerencia_audit_log')
          .select('*')
          .in('gerente_id', gerenteIds);
        gerenciaLogs = data || [];
      }

      // Combinar todos los logs
      const allLogs: UnifiedAuditLog[] = [];

      // Agregar logs de Ficha RUC
      if (fichaLogs) {
        fichaLogs.forEach(log => {
          allLogs.push({
            id: log.id,
            entity_type: 'ficha_ruc',
            entity_id: log.ficha_ruc_id,
            user_id: log.user_id,
            user_email: log.user_email,
            action: log.action,
            changed_fields: log.changed_fields,
            old_values: log.old_values,
            new_values: log.new_values,
            created_at: log.created_at,
          });
        });
      }

      // Agregar logs de Accionistas
      if (accionistaLogs) {
        accionistaLogs.forEach(log => {
          allLogs.push({
            id: log.id,
            entity_type: 'accionista',
            entity_id: log.accionista_id,
            user_id: log.user_id,
            user_email: log.user_email,
            action: log.action,
            changed_fields: log.changed_fields,
            old_values: log.old_values,
            new_values: log.new_values,
            created_at: log.created_at,
          });
        });
      }

      // Agregar logs de Gerencia
      if (gerenciaLogs) {
        gerenciaLogs.forEach(log => {
          allLogs.push({
            id: log.id,
            entity_type: 'gerencia',
            entity_id: log.gerente_id,
            user_id: log.user_id,
            user_email: log.user_email,
            action: log.action,
            changed_fields: log.changed_fields,
            old_values: log.old_values,
            new_values: log.new_values,
            created_at: log.created_at,
          });
        });
      }

      // Ordenar todos por fecha (más reciente primero)
      allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Enriquecer con información del usuario
      const logsWithUserInfo = await Promise.all(
        allLogs.map(async (log) => {
          if (log.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', log.user_id)
              .single();

            return {
              ...log,
              user_full_name: userData?.full_name || null,
            };
          }
          return log;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching unified audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener logs por RUC
   */
  static async getLogsByRuc(ruc: string): Promise<FichaRucAuditLogWithUserInfo[]> {
    try {
      // Primero obtener el ID de la ficha RUC usando el RUC
      const { data: fichaRucData, error: fichaRucError } = await supabase
        .from('ficha_ruc')
        .select('id')
        .eq('ruc', ruc)
        .single();

      if (fichaRucError || !fichaRucData) {
        console.error('Error fetching ficha RUC:', fichaRucError);
        return [];
      }

      const { data, error } = await supabase
        .from('ficha_ruc_audit_log')
        .select('*')
        .eq('ficha_ruc_id', fichaRucData.id)
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
            } as FichaRucAuditLogWithUserInfo;
          }
          return log as FichaRucAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Ficha RUC audit logs by RUC:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de una Ficha RUC
   */
  static async getLastChange(fichaRucId: number): Promise<FichaRucAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('ficha_ruc_audit_log')
        .select('*')
        .eq('ficha_ruc_id', fichaRucId)
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
        } as FichaRucAuditLogWithUserInfo;
      }

      return data as FichaRucAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last Ficha RUC change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(fichaRucId: number): Promise<{
    totalChanges: number;
    lastModifiedBy: string | null;
    lastModifiedAt: string | null;
  }> {
    try {
      const logs = await this.getLogsByFichaRucId(fichaRucId);
      
      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
      };
    } catch (error) {
      console.error('Error fetching Ficha RUC change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}
