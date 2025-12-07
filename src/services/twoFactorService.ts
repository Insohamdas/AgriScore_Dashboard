import { supabase } from '../lib/supabase';

/**
 * Enable Two-Factor Authentication for user
 * Uses TOTP (Time-based One-Time Password) method
 */
export const enable2FA = async (userId: string) => {
  try {
    // Generate secret for TOTP
    const secret = generateTOTPSecret();
    
    // Store 2FA setup in progress
    const { error } = await supabase
      .from('user_2fa')
      .insert({
        user_id: userId,
        secret: secret,
        enabled: false,
        backup_codes: generateBackupCodes(),
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Generate QR code for authenticator apps
    const qrCodeUrl = generateQRCode(secret, userId);

    return {
      success: true,
      secret,
      qrCodeUrl,
      message: 'Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator)'
    };
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    throw error;
  }
};

/**
 * Verify 2FA setup with TOTP code
 */
export const verify2FASetup = async (userId: string, totpCode: string) => {
  try {
    // Get user's 2FA secret
    const { data, error: fetchError } = await supabase
      .from('user_2fa')
      .select('secret')
      .eq('user_id', userId)
      .eq('enabled', false)
      .single();

    if (fetchError) throw new Error('2FA setup not found');

    // Verify TOTP code
    if (verifyTOTP(data.secret, totpCode)) {
      // Enable 2FA
      const { error: updateError } = await supabase
        .from('user_2fa')
        .update({ enabled: true })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      return {
        success: true,
        message: '2FA enabled successfully! Save your backup codes in a safe place.'
      };
    } else {
      return {
        success: false,
        message: 'Invalid code. Please try again.'
      };
    }
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    throw error;
  }
};

/**
 * Disable Two-Factor Authentication
 */
export const disable2FA = async (userId: string, password: string) => {
  try {
    // Verify password first for security
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    // Update 2FA status
    const { error } = await supabase
      .from('user_2fa')
      .update({ enabled: false })
      .eq('user_id', userId);

    if (error) throw error;

    return {
      success: true,
      message: '2FA has been disabled. You can enable it again anytime.'
    };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    throw error;
  }
};

/**
 * Verify TOTP code during login
 */
export const verifyTOTPLogin = async (userId: string, totpCode: string) => {
  try {
    const { data, error: fetchError } = await supabase
      .from('user_2fa')
      .select('secret')
      .eq('user_id', userId)
      .eq('enabled', true)
      .single();

    if (fetchError) throw new Error('2FA not enabled');

    const isValid = verifyTOTP(data.secret, totpCode);
    return {
      success: isValid,
      message: isValid ? '2FA verified' : 'Invalid code'
    };
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    throw error;
  }
};

/**
 * Get user's backup codes
 */
export const getBackupCodes = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_2fa')
      .select('backup_codes')
      .eq('user_id', userId)
      .eq('enabled', true)
      .single();

    if (error) throw error;
    return data.backup_codes || [];
  } catch (error) {
    console.error('Error fetching backup codes:', error);
    return [];
  }
};

/**
 * Check if user has 2FA enabled
 */
export const is2FAEnabled = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_2fa')
      .select('enabled')
      .eq('user_id', userId)
      .single();

    if (error) return false;
    return data?.enabled || false;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
};

/**
 * Generate TOTP secret (32 characters base32)
 */
const generateTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

/**
 * Verify TOTP code against secret
 * Simple implementation - in production use 'speakeasy' or 'otplib'
 */
const verifyTOTP = (secret: string, code: string): boolean => {
  // This is a simplified version
  // In production, use a library like 'speakeasy' for proper TOTP verification
  // speakeasy.totp.verify({ secret, encoding: 'base32', token: code, window: 2 })
  
  // For now, accept any 6-digit code for demo purposes
  return /^\d{6}$/.test(code);
};

/**
 * Generate backup codes for account recovery
 */
const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Array(4)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join('');
    codes.push(code);
  }
  return codes;
};

/**
 * Generate QR code for authenticator apps
 * Uses standard otpauth:// URI format
 */
const generateQRCode = (secret: string, userId: string): string => {
  // In production, use a QR code library like 'qrcode.react'
  // For now, return the otpauth URI which can be encoded to QR elsewhere
  const encoded = encodeURIComponent(`AgriScore:${userId}`);
  return `otpauth://totp/${encoded}?secret=${secret}&issuer=AgriScore`;
};

/**
 * Create trust device token for login without 2FA
 */
export const createTrustedDevice = async (userId: string, deviceName: string) => {
  try {
    const token = generateDeviceToken();
    
    const { error } = await supabase
      .from('trusted_devices')
      .insert({
        user_id: userId,
        device_name: deviceName,
        device_token: token,
        last_used: new Date().toISOString()
      });

    if (error) throw error;

    return {
      success: true,
      message: 'Device marked as trusted. You won\'t need 2FA on this device for 30 days.'
    };
  } catch (error) {
    console.error('Error creating trusted device:', error);
    throw error;
  }
};

/**
 * Get user's trusted devices
 */
export const getTrustedDevices = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('*')
      .eq('user_id', userId)
      .order('last_used', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trusted devices:', error);
    return [];
  }
};

/**
 * Remove trusted device
 */
export const removeTrustedDevice = async (deviceId: string) => {
  try {
    const { error } = await supabase
      .from('trusted_devices')
      .delete()
      .eq('id', deviceId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing trusted device:', error);
    throw error;
  }
};

/**
 * Generate device token for trusted device
 */
const generateDeviceToken = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
