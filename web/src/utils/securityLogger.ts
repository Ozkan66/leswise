import { supabase } from './supabaseClient';

export type SecurityEventType = 
  | 'password_changed' 
  | 'password_reset_requested' 
  | 'password_reset_completed'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'oauth_login_success'
  | 'oauth_login_failed';

interface SecurityEventDetails {
  method?: string;
  provider?: string;
  error_message?: string;
  [key: string]: any;
}

export interface SecurityEvent {
  user_id?: string;
  event_type: SecurityEventType;
  event_details?: SecurityEventDetails;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log a security event to the database
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    // Get user agent if not provided
    const userAgent = event.user_agent || (typeof window !== 'undefined' ? window.navigator.userAgent : undefined);
    
    // For client-side logging, we'll use a simple insert since we can't easily get IP address
    // In a production environment, this should be done server-side to get real IP addresses
    const { error } = await supabase
      .from('log_security_event')
      .insert([{
        user_id: event.user_id || null,
        event_type: event.event_type,
        event_details: event.event_details || null,
        ip_address: null,
        user_agent: userAgent || null
      }]);

    if (error) {
      console.error('Failed to log security event:', error);
    }
  } catch (err) {
    console.error('Error logging security event:', err);
  }
}

/**
 * Log password change event
 */
export async function logPasswordChanged(userId: string): Promise<void> {
  await logSecurityEvent({
    user_id: userId,
    event_type: 'password_changed',
    event_details: {
      method: 'profile_settings'
    }
  });
}

/**
 * Log password reset request
 */
export async function logPasswordResetRequested(email: string): Promise<void> {
  await logSecurityEvent({
    event_type: 'password_reset_requested',
    event_details: {
      email,
      method: 'forgot_password_form'
    }
  });
}

/**
 * Log password reset completion
 */
export async function logPasswordResetCompleted(userId: string): Promise<void> {
  await logSecurityEvent({
    user_id: userId,
    event_type: 'password_reset_completed',
    event_details: {
      method: 'email_link'
    }
  });
}

/**
 * Log successful login
 */
export async function logLoginSuccess(userId: string, method: 'email' | 'oauth' = 'email', provider?: string): Promise<void> {
  await logSecurityEvent({
    user_id: userId,
    event_type: method === 'oauth' ? 'oauth_login_success' : 'login_success',
    event_details: {
      method,
      ...(provider && { provider })
    }
  });
}

/**
 * Log failed login attempt
 */
export async function logLoginFailed(email?: string, method: 'email' | 'oauth' = 'email', provider?: string, errorMessage?: string): Promise<void> {
  await logSecurityEvent({
    event_type: method === 'oauth' ? 'oauth_login_failed' : 'login_failed',
    event_details: {
      method,
      ...(email && { email }),
      ...(provider && { provider }),
      ...(errorMessage && { error_message: errorMessage })
    }
  });
}

/**
 * Log user logout
 */
export async function logLogout(userId: string): Promise<void> {
  await logSecurityEvent({
    user_id: userId,
    event_type: 'logout'
  });
}