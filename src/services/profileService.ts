import { supabase } from '@/integrations/supabase/client';

export class ProfileService {
  static async getProfileById(userId: string): Promise<{ full_name: string } | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle(); // Changed from single() to maybeSingle() to avoid 406 error

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }
}