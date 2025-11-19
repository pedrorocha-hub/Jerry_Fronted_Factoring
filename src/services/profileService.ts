import { supabase } from '@/integrations/supabase/client';

export class ProfileService {
  static async getProfileById(userId: string): Promise<{ full_name: string } | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }
}