import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  
  // Communication preferences
  alerts_enabled?: boolean;
  advisory_enabled?: boolean;
  whatsapp_enabled?: boolean;
  
  // Security preferences
  two_factor_enabled?: boolean;
  biometrics_enabled?: boolean;
  login_alerts_enabled?: boolean;
  
  // App preferences
  auto_irrigation?: boolean;
  dark_mode?: boolean;
  timezone?: string;
  language?: string;
  preferred_contact_time?: string;
  
  // Farm details
  farm_name?: string;
  location_lat?: number;
  location_long?: number;
  total_area?: number;
  
  settings?: Record<string, any>;
  created_at?: string;
}

export const useProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          // If profile doesn't exist, create an empty one
          if (fetchError.code === 'PGRST116') {
            console.log('Profile not found, creating new one...');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || '',
                email: user.email || ''
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating profile:', createError);
              setError(createError.message);
            } else {
              setProfile(newProfile);
            }
          } else {
            console.error('Error fetching profile:', fetchError);
            setError(fetchError.message);
          }
        } else {
          setProfile(data);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        return { error: updateError.message };
      }

      // Update local state
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err.message };
    }
  };

  const uploadAvatar = async (file: File): Promise<{ url?: string; error?: string }> => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return { error: uploadError.message };
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = data?.publicUrl;

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: avatarUrl });
      return { url: avatarUrl };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    profile,
    loading: authLoading || loading,
    error,
    updateProfile,
    uploadAvatar,
    userName: profile?.full_name || 'Farmer',
    userEmail: profile?.email || user?.email || '',
    userAvatar: profile?.avatar_url || ''
  };
};
