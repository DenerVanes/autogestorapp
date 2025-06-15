
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
    console.log('Upserting user profile:', userId, updates);
    const profileData = {
      id: userId,
      ...updates,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }

    console.log('User profile upserted:', data);
    return data;
  },
};
