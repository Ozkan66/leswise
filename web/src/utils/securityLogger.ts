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
  [key: string]: unknown;
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

export async function logSecurityEvent(
  event: SecurityEvent,
  userAgent?: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('log_security_event', {
      p_user_id: event.user_id || null,
      p_event_type: event.event_type,
      p_event_details: event.event_details || null,
      p_ip_address: null,
      p_user_agent: userAgent || (typeof window !== 'undefined' ? window.navigator?.userAgent : null) || null
    });

    if (error) {
      // Optioneel: log error of throw
      console.error('Failed to log security event:', error);
    }
  } catch (error) {
    console.error('Error logging security event:', error);
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
