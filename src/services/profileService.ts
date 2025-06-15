
import { supabase } from "@/integrations/supabase/client";

export const profileService = {
  // User Profile
  async getUserProfile(userId: string) {
    console.log('Getting user profile for:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }

    console.log('User profile found:', data);
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    console.log('Updating user profile:', userId, updates);
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    console.log('User profile updated:', data);
    return data;
  },
};
