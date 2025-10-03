import { supabase } from '@/integrations/supabase/client';

export interface Sentinel {
  id: string;
  ruc: string;
  file_url?: string;
  status: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSentinelData {
  ruc: string;
  file_url?: string;
  status?: string;
}

export interface UpdateSentinelData {
  ruc?: string;
  file_url?: string;
  status?: string;
}

export class SentinelService {
  static async getAll(): Promise<Sentinel[]> {
    const { data, error } = await supabase
      .from('sentinel')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sentinel records:', error);
      throw error;
    }

    return data || [];
  }

  static async getById(id: string): Promise<Sentinel | null> {
    const { data, error } = await supabase
      .from('sentinel')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sentinel record:', error);
      throw error;
    }

    return data;
  }

  static async create(sentinelData: CreateSentinelData): Promise<Sentinel> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('sentinel')
      .insert({
        ...sentinelData,
        user_id: user?.id,
        status: sentinelData.status || 'Borrador'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sentinel record:', error);
      throw error;
    }

    return data;
  }

  static async update(id: string, sentinelData: UpdateSentinelData): Promise<Sentinel> {
    const { data, error } = await supabase
      .from('sentinel')
      .update({
        ...sentinelData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sentinel record:', error);
      throw error;
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sentinel')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sentinel record:', error);
      throw error;
    }
  }

  static async getStats() {
    const { data, error } = await supabase
      .from('sentinel')
      .select('status');

    if (error) {
      console.error('Error fetching sentinel stats:', error);
      return { total: 0, borrador: 0, procesado: 0, error: 0 };
    }

    const stats = {
      total: data?.length || 0,
      borrador: data?.filter(item => item.status === 'Borrador').length || 0,
      procesado: data?.filter(item => item.status === 'Procesado').length || 0,
      error: data?.filter(item => item.status === 'Error').length || 0
    };

    return stats;
  }
}