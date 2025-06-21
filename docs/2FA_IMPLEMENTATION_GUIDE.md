# Two-Factor Authentication Implementation Guide

This document outlines how to complete the Two-Factor Authentication (2FA) implementation for Leswise, following Epic 1.3 User Story 1.3.3.

## Current Implementation Status

- ✅ Basic 2FA UI framework in UserProfile component
- ✅ Placeholder for 2FA status and controls
- ✅ Educational content for users about 2FA benefits
- ⏳ TOTP implementation (not yet implemented)
- ⏳ Recovery codes system (not yet implemented)
- ⏳ 2FA verification during login (not yet implemented)

## Technical Implementation Plan

### 1. Database Schema Updates

Create additional migration for 2FA support:

```sql
-- Add 2FA fields to user metadata or create separate table
CREATE TABLE user_two_factor (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_key TEXT NOT NULL, -- Encrypted TOTP secret
  backup_codes TEXT[], -- Array of one-time recovery codes
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE user_two_factor ENABLE ROW LEVEL SECURITY;

-- Users can only access their own 2FA settings
CREATE POLICY "Users can manage their own 2FA settings" ON user_two_factor
FOR ALL USING (auth.uid() = user_id);
```

### 2. Required Dependencies

Add to package.json:

```json
{
  "dependencies": {
    "otplib": "^12.0.1",
    "qrcode": "^1.5.3",
    "crypto-js": "^4.1.1"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.0"
  }
}
```

### 3. TOTP Implementation

Create `src/utils/totp.ts`:

```typescript
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export class TOTPManager {
  static generateSecret(): string {
    return authenticator.generateSecret();
  }

  static async generateQRCode(secret: string, email: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, 'Leswise', secret);
    return await QRCode.toDataURL(otpauth);
  }

  static verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  static generateBackupCodes(count: number = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}
```

### 4. 2FA Setup Component

Create `src/components/TwoFactorSetup.tsx`:

```typescript
"use client";
import { useState } from 'react';
import { TOTPManager } from '../utils/totp';
import { supabase } from '../utils/supabaseClient';

interface TwoFactorSetupProps {
  userEmail: string;
  onComplete: (enabled: boolean) => void;
  onCancel: () => void;
}

export default function TwoFactorSetup({ userEmail, onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup'>('generate');
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQRCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Implementation steps:
  // 1. Generate secret and QR code
  // 2. User scans QR code with authenticator app
  // 3. User enters verification code to confirm setup
  // 4. Generate and display backup codes
  // 5. Save configuration to database
  
  // ... Component implementation
}
```

### 5. Login Flow Updates

Update `LoginForm.tsx` to include 2FA verification:

```typescript
// After successful password verification, check if 2FA is enabled
const handle2FALogin = async (email: string, password: string) => {
  // 1. Verify email/password
  const { error: signInError } = await signIn(email, password);
  
  if (signInError) {
    // Handle password error
    return;
  }

  // 2. Check if user has 2FA enabled
  const { data: user2FA } = await supabase
    .from('user_two_factor')
    .select('enabled')
    .eq('user_id', user.id)
    .single();

  if (user2FA?.enabled) {
    // Show 2FA verification step
    setShow2FAVerification(true);
  } else {
    // Complete login normally
    router.push('/');
  }
};
```

### 6. 2FA Verification Component

Create `src/components/TwoFactorVerification.tsx`:

```typescript
"use client";
import { useState } from 'react';
import { TOTPManager } from '../utils/totp';

interface TwoFactorVerificationProps {
  onVerificationSuccess: () => void;
  onVerificationFailed: (error: string) => void;
  onUseBackupCode: () => void;
}

export default function TwoFactorVerification(props: TwoFactorVerificationProps) {
  // Implementation for 6-digit code verification
  // Include backup code option
  // Handle verification logic
}
```

### 7. Security Logging Integration

Add 2FA events to security logger:

```typescript
// Add to securityLogger.ts
export type SecurityEventType = 
  | 'password_changed' 
  | 'password_reset_requested' 
  | 'password_reset_completed'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'oauth_login_success'
  | 'oauth_login_failed'
  | '2fa_enabled'      // New
  | '2fa_disabled'     // New
  | '2fa_verified'     // New
  | '2fa_failed'       // New
  | 'backup_code_used' // New

export async function log2FAEnabled(userId: string): Promise<void> {
  await logSecurityEvent({
    user_id: userId,
    event_type: '2fa_enabled'
  });
}

// ... other 2FA logging functions
```

### 8. Recovery Flow

Implement backup code verification and account recovery:

```typescript
// Handle backup code verification
const verifyBackupCode = async (code: string, userId: string): Promise<boolean> => {
  // 1. Get user's backup codes
  // 2. Check if code is valid and not used
  // 3. Mark code as used
  // 4. Log security event
  // 5. Allow login
};
```

### 9. Admin Interface Updates

Add 2FA status to admin security logs and user management:

- Show 2FA status in user profiles
- Log 2FA events in security logs
- Provide admin capability to disable 2FA for account recovery

### 10. Testing Strategy

Create comprehensive tests:

```typescript
// Test files to create:
- src/utils/__tests__/totp.test.ts
- src/components/__tests__/TwoFactorSetup.test.tsx
- src/components/__tests__/TwoFactorVerification.test.tsx

// Test scenarios:
- TOTP secret generation and verification
- QR code generation
- Backup code generation and usage
- Integration with login flow
- Security logging of 2FA events
- Error handling and edge cases
```

## Implementation Priority

1. **Phase 1**: Database schema and TOTP utilities
2. **Phase 2**: 2FA setup flow in user profile
3. **Phase 3**: Login flow integration
4. **Phase 4**: Backup codes and recovery
5. **Phase 5**: Admin interface and security logging
6. **Phase 6**: Comprehensive testing

## Security Considerations

- **Secret Storage**: Encrypt TOTP secrets before storing in database
- **Rate Limiting**: Implement rate limiting for 2FA verification attempts
- **Backup Codes**: Generate sufficient backup codes and mark them as used
- **Recovery Process**: Provide secure account recovery for users who lose 2FA access
- **Audit Trail**: Log all 2FA-related events for security monitoring

## User Experience Considerations

- **Clear Instructions**: Provide step-by-step setup instructions
- **QR Code Fallback**: Allow manual secret entry if QR scanning fails
- **App Recommendations**: Suggest compatible authenticator apps
- **Backup Code Security**: Educate users on secure backup code storage
- **Recovery Options**: Clear process for users who lose access

## Acceptance Criteria

- ✅ 2FA can be activated via user profile
- ✅ Support for TOTP authenticator apps
- ✅ 2FA code verification during login
- ✅ Users can disable 2FA with confirmation
- ✅ Recovery options for lost devices (backup codes)
- ✅ Security logging of all 2FA events
- ✅ GDPR/privacy compliance
- ✅ Comprehensive error handling

## Future Enhancements

- SMS 2FA option (requires SMS gateway integration)
- WebAuthn/FIDO2 support for hardware keys
- Risk-based authentication (skip 2FA for trusted devices)
- Push notification-based authentication
- Integration with enterprise SSO systems

---

This implementation would complete Epic 1.3 User Story 1.3.3 with enterprise-grade 2FA functionality.