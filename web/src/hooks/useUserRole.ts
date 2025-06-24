"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<'teacher' | 'student' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // First check user_profiles table for role
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profileData && !profileError) {
          setRole(profileData.role);
        } else {
          // Fallback to user metadata if profile doesn't exist yet
          const roleFromMetadata = user.user_metadata?.role;
          setRole(roleFromMetadata || 'student'); // Default to student if no role found
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Fallback to user metadata
        const roleFromMetadata = user.user_metadata?.role;
        setRole(roleFromMetadata || 'student');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { user, role, loading };
}
