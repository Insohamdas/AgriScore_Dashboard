import { supabase } from '../lib/supabase';

export interface UserActivity {
  userId: string;
  action: 'login' | 'profile_update' | 'document_upload' | 'report_export' | 'settings_change';
  description: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  loginCount: number;
  profileUpdates: number;
  documentsUploaded: number;
  reportsGenerated: number;
  averageSessionDuration: number;
}

/**
 * Track user activity for analytics
 */
export const trackActivity = async (activity: UserActivity) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('user_analytics').insert({
      user_id: activity.userId,
      action: activity.action,
      description: activity.description,
      metadata: activity.metadata,
      timestamp: activity.timestamp || new Date().toISOString()
    });

    if (error) throw error;
    console.log('📊 Activity tracked:', activity.action);
    return { success: true };
  } catch (error) {
    console.error('Error tracking activity:', error);
    return { success: false, error };
  }
};

/**
 * Get user's activity history
 */
export const getUserActivityHistory = async (userId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching activity history:', error);
    return [];
  }
};

/**
 * Get analytics dashboard data
 */
export const getAnalyticsDashboard = async (): Promise<Analytics> => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // Get login count (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentLogins } = await supabase
      .from('user_analytics')
      .select('user_id')
      .eq('action', 'login')
      .gte('timestamp', thirtyDaysAgo);

    const activeUsers = new Set(recentLogins?.map(l => l.user_id) || []).size;

    // Get action counts
    const { count: loginCount } = await supabase
      .from('user_analytics')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'login')
      .gte('timestamp', thirtyDaysAgo);

    const { count: profileUpdates } = await supabase
      .from('user_analytics')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'profile_update')
      .gte('timestamp', thirtyDaysAgo);

    const { count: documentsUploaded } = await supabase
      .from('user_analytics')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'document_upload')
      .gte('timestamp', thirtyDaysAgo);

    const { count: reportsGenerated } = await supabase
      .from('user_analytics')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'report_export')
      .gte('timestamp', thirtyDaysAgo);

    return {
      totalUsers: totalUsers || 0,
      activeUsers,
      loginCount: loginCount || 0,
      profileUpdates: profileUpdates || 0,
      documentsUploaded: documentsUploaded || 0,
      reportsGenerated: reportsGenerated || 0,
      averageSessionDuration: 0 // Calculate based on session data
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      loginCount: 0,
      profileUpdates: 0,
      documentsUploaded: 0,
      reportsGenerated: 0,
      averageSessionDuration: 0
    };
  }
};

/**
 * Get activity breakdown by action type
 */
export const getActivityBreakdown = async (userId: string, days = 30) => {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('user_analytics')
      .select('action')
      .eq('user_id', userId)
      .gte('timestamp', startDate);

    if (error) throw error;

    const breakdown: Record<string, number> = {};
    data?.forEach(record => {
      breakdown[record.action] = (breakdown[record.action] || 0) + 1;
    });

    return breakdown;
  } catch (error) {
    console.error('Error getting activity breakdown:', error);
    return {};
  }
};

/**
 * Get daily activity statistics
 */
export const getDailyActivityStats = async (userId: string, days = 7) => {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('user_analytics')
      .select('timestamp')
      .eq('user_id', userId)
      .gte('timestamp', startDate);

    if (error) throw error;

    // Group by date
    const dailyStats: Record<string, number> = {};
    data?.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    return dailyStats;
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return {};
  }
};

/**
 * Track page/feature usage
 */
export const trackFeatureUsage = async (userId: string, featureName: string, duration: number) => {
  return trackActivity({
    userId,
    action: 'profile_update',
    description: `Used feature: ${featureName}`,
    metadata: {
      feature: featureName,
      durationSeconds: duration,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Get most used features
 */
export const getMostUsedFeatures = async (userId: string, limit = 5) => {
  try {
    const activities = await getUserActivityHistory(userId, 100);
    
    const featureUsage: Record<string, number> = {};
    activities.forEach(activity => {
      if (activity.metadata?.feature) {
        featureUsage[activity.metadata.feature] = (featureUsage[activity.metadata.feature] || 0) + 1;
      }
    });

    return Object.entries(featureUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([feature, count]) => ({ feature, count }));
  } catch (error) {
    console.error('Error getting most used features:', error);
    return [];
  }
};
