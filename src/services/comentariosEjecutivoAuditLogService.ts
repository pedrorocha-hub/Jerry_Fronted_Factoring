import { supabase } from '@/integrations/supabase/client';
import { 
  ComentariosEjecutivoAuditLog, 
  ComentariosEjecutivoAuditLogWithUserInfo,
  ComentariosEjecutivoAuditLogStats 
} from '@/types/comentarios-ejecutivo-audit-log';

export class ComentariosEjecutivoAuditLogService {
  /**
   * Obtener todos los logs de auditoría para un comentario específico
   */
  static async getLogsByComentarioId(comentarioId: string): Promise<ComentariosEjecutivoAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('comentarios_ejecutivo_audit_log')
        .select('*')
        .eq('comentario_ejecutivo_id', comentarioId)
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
            } as ComentariosEjecutivoAuditLogWithUserInfo;
          }
          return log as ComentariosEjecutivoAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Comentarios Ejecutivo audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener logs por Solicitud ID
   */
  static async getLogsBySolicitudId(solicitudId: string): Promise<ComentariosEjecutivoAuditLogWithUserInfo[]> {
    try {
      // Primero obtener los IDs de comentarios asociados a esta solicitud
      const { data: comentariosData, error: comentariosError } = await supabase
        .from('comentarios_ejecutivo')
        .select('id')
        .eq('solicitud_id', solicitudId);

      if (comentariosError) throw comentariosError;

      if (!comentariosData || comentariosData.length === 0) {
        return [];
      }

      const comentarioIds = comentariosData.map(c => c.id);

      // Obtener logs para todos los comentarios de esta solicitud
      const { data, error } = await supabase
        .from('comentarios_ejecutivo_audit_log')
        .select('*')
        .in('comentario_ejecutivo_id', comentarioIds)
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
            } as ComentariosEjecutivoAuditLogWithUserInfo;
          }
          return log as ComentariosEjecutivoAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Comentarios Ejecutivo audit logs by solicitud:', error);
      throw error;
    }
  }

  /**
   * Obtener logs por RIB ID
   */
  static async getLogsByRibId(ribId: string): Promise<ComentariosEjecutivoAuditLogWithUserInfo[]> {
    try {
      // Primero obtener los IDs de comentarios asociados a este RIB
      const { data: comentariosData, error: comentariosError } = await supabase
        .from('comentarios_ejecutivo')
        .select('id')
        .eq('rib_id', ribId);

      if (comentariosError) throw comentariosError;

      if (!comentariosData || comentariosData.length === 0) {
        return [];
      }

      const comentarioIds = comentariosData.map(c => c.id);

      // Obtener logs para todos los comentarios de este RIB
      const { data, error } = await supabase
        .from('comentarios_ejecutivo_audit_log')
        .select('*')
        .in('comentario_ejecutivo_id', comentarioIds)
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
            } as ComentariosEjecutivoAuditLogWithUserInfo;
          }
          return log as ComentariosEjecutivoAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Comentarios Ejecutivo audit logs by RIB:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de un comentario
   */
  static async getLastChange(comentarioId: string): Promise<ComentariosEjecutivoAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('comentarios_ejecutivo_audit_log')
        .select('*')
        .eq('comentario_ejecutivo_id', comentarioId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw error;
      }

      if (data && data.user_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user_id)
          .single();

        return {
          ...data,
          user_full_name: userData?.full_name || null,
        } as ComentariosEjecutivoAuditLogWithUserInfo;
      }

      return data as ComentariosEjecutivoAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last Comentarios Ejecutivo change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(comentarioId: string): Promise<ComentariosEjecutivoAuditLogStats> {
    try {
      const logs = await this.getLogsByComentarioId(comentarioId);
      
      const changesByAction = {
        created: logs.filter(log => log.action === 'created').length,
        updated: logs.filter(log => log.action === 'updated').length,
        deleted: logs.filter(log => log.action === 'deleted').length,
      };

      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
        changesByAction,
      };
    } catch (error) {
      console.error('Error fetching Comentarios Ejecutivo change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
        changesByAction: {
          created: 0,
          updated: 0,
          deleted: 0,
        },
      };
    }
  }

  /**
   * Obtener todos los logs (para administradores)
   */
  static async getAllLogs(limit: number = 100): Promise<ComentariosEjecutivoAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('comentarios_ejecutivo_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

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
            } as ComentariosEjecutivoAuditLogWithUserInfo;
          }
          return log as ComentariosEjecutivoAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching all Comentarios Ejecutivo audit logs:', error);
      throw error;
    }
  }
}
