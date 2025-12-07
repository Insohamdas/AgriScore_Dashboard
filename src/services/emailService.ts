import { supabase } from '../lib/supabase';

export interface EmailNotification {
  userId: string;
  type: 'profile_update' | 'team_invite' | 'document_upload' | 'system_alert';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Send email notification through Supabase Email
 * In production, connect to real email service (SendGrid, AWS SES, etc.)
 */
export const sendEmailNotification = async (notification: EmailNotification) => {
  try {
    // Get user email
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('User not found');

    // Store notification in database for audit trail
    const { error } = await supabase.from('email_notifications').insert({
      user_id: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      action_url: notification.actionUrl,
      metadata: notification.metadata,
      sent_at: new Date().toISOString(),
      read: false
    });

    if (error) throw error;

    // In production, trigger real email here
    console.log('📧 Email notification queued:', {
      email: user.email,
      type: notification.type,
      title: notification.title
    });

    return { success: true, message: 'Notification queued' };
  } catch (error) {
    console.error('Email notification error:', error);
    throw error;
  }
};

/**
 * Send profile update notification
 */
export const notifyProfileUpdate = async (userId: string, fieldName: string, newValue: any) => {
  return sendEmailNotification({
    userId,
    type: 'profile_update',
    title: 'Profile Updated',
    message: `Your ${fieldName} has been updated successfully.`,
    metadata: { fieldName, newValue }
  });
};

/**
 * Send team invitation notification
 */
export const notifyTeamInvitation = async (userId: string, inviterName: string, farmName: string) => {
  return sendEmailNotification({
    userId,
    type: 'team_invite',
    title: 'You\'ve been invited to a team!',
    message: `${inviterName} invited you to manage ${farmName}. Accept the invitation to get started.`,
    actionUrl: '/account?tab=team',
    metadata: { inviterName, farmName }
  });
};

/**
 * Send document upload notification
 */
export const notifyDocumentUpload = async (userId: string, documentName: string) => {
  return sendEmailNotification({
    userId,
    type: 'document_upload',
    title: 'Document Uploaded',
    message: `${documentName} has been successfully uploaded to your document locker.`,
    actionUrl: '/account?tab=profile',
    metadata: { documentName }
  });
};

/**
 * Send system alert notification
 */
export const notifySystemAlert = async (userId: string, alertMessage: string) => {
  return sendEmailNotification({
    userId,
    type: 'system_alert',
    title: 'System Alert',
    message: alertMessage,
    metadata: { severity: 'warning' }
  });
};

/**
 * Get user's notification history
 */
export const getNotificationHistory = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('email_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};
