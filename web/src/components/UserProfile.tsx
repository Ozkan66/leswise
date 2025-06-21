"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { logPasswordChanged } from '../utils/securityLogger';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'teacher' | 'student' | null;
  // Student-specific fields
  birthYear?: string;
  educationType?: string;
  // Teacher-specific fields
  institution?: string;
  subjects?: string;
  // Profile photo
  profilePhotoUrl?: string;
  // 2FA settings
  twoFactorEnabled?: boolean;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    role: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [show2FASection, setShow2FASection] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        role: user.user_metadata?.role || null,
        birthYear: user.user_metadata?.birth_year || '',
        educationType: user.user_metadata?.education_type || '',
        institution: user.user_metadata?.institution || '',
        subjects: user.user_metadata?.subjects || '',
        profilePhotoUrl: user.user_metadata?.profile_photo_url || '',
        twoFactorEnabled: user.user_metadata?.two_factor_enabled || false,
      });
      
      if (user.user_metadata?.profile_photo_url) {
        setPhotoPreview(user.user_metadata.profile_photo_url);
      }
    }
  }, [user]);

  const handleInputChange = (field: keyof UserProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordError(null);
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Wachtwoord moet minimaal 8 karakters lang zijn';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Wachtwoord moet minimaal één kleine letter bevatten';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Wachtwoord moet minimaal één hoofdletter bevatten';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Wachtwoord moet minimaal één cijfer bevatten';
    }
    return null;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validate new password
    const passwordValidation = validatePassword(passwordData.newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Nieuwe wachtwoorden komen niet overeen');
      setIsLoading(false);
      return;
    }

    try {
      // First verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordData.currentPassword,
      });

      if (signInError) {
        setPasswordError('Huidig wachtwoord is onjuist');
        setIsLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        setPasswordError(updateError.message);
      } else {
        setPasswordSuccess('Wachtwoord succesvol gewijzigd!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
        
        // Log security event
        await logPasswordChanged(user.id);
      }
    } catch (err: unknown) {
      setPasswordError((err as Error).message);
    }

    setIsLoading(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Bestand is te groot. Maximaal 5MB toegestaan.');
        return;
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Ongeldig bestandsformaat. Alleen JPG, PNG en GIF toegestaan.');
        return;
      }
      
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;
  
    // Haal de user op via Supabase (jouw voorbeeld)
    const { data: userDataRes, error: userError } = await supabase.auth.getUser();
    if (userError || !userDataRes?.user) {
      throw new Error('Kon gebruiker niet ophalen');
    }
  
    // Zet het pad op <user-id>/<bestandsnaam>
    const filePath = `${userDataRes.user.id}/${photoFile.name}`;
  
    // Upload het bestand
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, photoFile);
  
    if (error) {
      throw new Error(`Foto upload mislukt: ${error.message}`);
    }
  
    // Haal de public URL op van het geüploade bestand
    const { data: publicUrlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);
  
    return publicUrlData?.publicUrl || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let photoUrl = profileData.profilePhotoUrl;
      
      // Upload new photo if selected
      if (photoFile) {
        const uploadedPhotoUrl = await uploadPhoto();
        if (uploadedPhotoUrl) {
          photoUrl = uploadedPhotoUrl;
        }
      }
      
      // Update user metadata
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        role: profileData.role,
        ...(profileData.role === 'student' && {
          birth_year: profileData.birthYear,
          education_type: profileData.educationType,
        }),
        ...(profileData.role === 'teacher' && {
          institution: profileData.institution,
          subjects: profileData.subjects,
        }),
        ...(photoUrl && { profile_photo_url: photoUrl }),
      };

      const { error } = await supabase.auth.updateUser({
        email: profileData.email,
        data: updateData
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Profiel succesvol bijgewerkt!');
        setPhotoFile(null);
        
        // Update preview URL if new photo was uploaded
        if (photoUrl && photoUrl !== profileData.profilePhotoUrl) {
          setProfileData(prev => ({ ...prev, profilePhotoUrl: photoUrl }));
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    }
    
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Je moet ingelogd zijn om je profiel te bekijken.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Mijn Profiel</h1>
      
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#efe', 
          color: '#060', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Photo */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h3>Profielfoto</h3>
          {photoPreview && (
            <div style={{ marginBottom: '12px' }}>
              <Image 
                src={photoPreview} 
                alt="Profiel voorbeeldweergave" 
                width={120}
                height={120}
                style={{ 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '2px solid #ccc'
                }} 
              />
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handlePhotoChange}
            style={{ marginBottom: '8px' }}
          />
          <div style={{ fontSize: '14px', color: '#666' }}>
            Maximaal 5MB, JPG/PNG/GIF formaten toegestaan
          </div>
        </div>

        {/* Basic Information */}
        <div style={{ marginBottom: '24px' }}>
          <h3>Persoonlijke Gegevens</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="firstName">
              Voornaam:
              <input
                id="firstName"
                type="text"
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="lastName">
              Achternaam:
              <input
                id="lastName"
                type="text"
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email">
              E-mailadres:
              <input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>
        </div>

        {/* Role Selection */}
        <div style={{ marginBottom: '24px' }}>
          <h3>Rol</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={profileData.role === 'teacher'}
                onChange={(e) => handleInputChange('role', e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Docent
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="student"
                checked={profileData.role === 'student'}
                onChange={(e) => handleInputChange('role', e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Leerling
            </label>
          </div>
        </div>

        {/* Student-specific fields */}
        {profileData.role === 'student' && (
          <div style={{ marginBottom: '24px' }}>
            <h3>Leerling Informatie</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="birthYear">
                Geboortejaar:
                <input
                  id="birthYear"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={profileData.birthYear}
                  onChange={(e) => handleInputChange('birthYear', e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="educationType">
                Type opleiding:
                <select
                  id="educationType"
                  value={profileData.educationType}
                  onChange={(e) => handleInputChange('educationType', e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Selecteer opleidingstype</option>
                  <option value="vmbo">VMBO</option>
                  <option value="havo">HAVO</option>
                  <option value="vwo">VWO</option>
                  <option value="mbo">MBO</option>
                  <option value="hbo">HBO</option>
                  <option value="wo">WO</option>
                  <option value="anders">Anders</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* Teacher-specific fields */}
        {profileData.role === 'teacher' && (
          <div style={{ marginBottom: '24px' }}>
            <h3>Docent Informatie</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="institution">
                Instelling:
                <input
                  id="institution"
                  type="text"
                  value={profileData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  placeholder="Bijv. Gymnasium De Scholengemeenschap"
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="subjects">
                Vakken:
                <input
                  id="subjects"
                  type="text"
                  value={profileData.subjects}
                  onChange={(e) => handleInputChange('subjects', e.target.value)}
                  placeholder="Bijv. Wiskunde, Natuurkunde, Scheikunde"
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </label>
              <small style={{ color: '#666', fontSize: '14px' }}>
                Scheidt meerdere vakken met komma&apos;s
              </small>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Opslaan...' : 'Profiel Opslaan'}
        </button>
      </form>

      {/* Password Change Section - Separate form to avoid nesting */}
      <div style={{ marginBottom: '24px', marginTop: '32px' }}>
        <h3>Wachtwoord</h3>
        
        {passwordSuccess && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#efe', 
            color: '#060', 
            borderRadius: '6px', 
            marginBottom: '16px' 
          }}>
            {passwordSuccess}
          </div>
        )}

        {!showPasswordForm ? (
          <button
            type="button"
            onClick={() => setShowPasswordForm(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Wachtwoord wijzigen
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '6px' }}>
            {passwordError && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#fee', 
                color: '#c00', 
                borderRadius: '6px', 
                marginBottom: '16px' 
              }}>
                {passwordError}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="currentPassword">
                Huidig wachtwoord:
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="newPassword">
                Nieuw wachtwoord:
                <input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </label>
              <small style={{ color: '#666', fontSize: '12px' }}>
                Minimaal 8 tekens, met hoofdletter, kleine letter en cijfer
              </small>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="confirmPassword">
                Bevestig nieuw wachtwoord:
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Wijzigen...' : 'Wachtwoord wijzigen'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setPasswordError(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Annuleren
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Two-Factor Authentication Section */}
      <div style={{ marginBottom: '24px', marginTop: '32px' }}>
        <h3>Two-Factor Authentication (2FA)</h3>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0' }}>
                Status: {profileData.twoFactorEnabled ? 
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>Ingeschakeld</span> : 
                  <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Uitgeschakeld</span>
                }
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Voeg een extra beveiligingslaag toe aan je account met two-factor authentication.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShow2FASection(!show2FASection)}
              style={{
                padding: '8px 16px',
                backgroundColor: profileData.twoFactorEnabled ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {profileData.twoFactorEnabled ? '2FA uitschakelen' : '2FA inschakelen'}
            </button>
          </div>
        </div>

        {show2FASection && (
          <div style={{ 
            border: '1px solid #ddd', 
            padding: '16px', 
            borderRadius: '6px',
            backgroundColor: '#fff'
          }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#fff3cd', 
              color: '#856404', 
              borderRadius: '6px', 
              marginBottom: '16px',
              border: '1px solid #ffeaa7'
            }}>
              <h4 style={{ margin: '0 0 8px 0' }}>🚧 Functie in ontwikkeling</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Two-Factor Authentication is momenteel in ontwikkeling. Deze functie zal binnenkort beschikbaar zijn
                met ondersteuning voor:
              </p>
              <ul style={{ margin: '8px 0 0 20px', fontSize: '14px' }}>
                <li>TOTP authenticator apps (Google Authenticator, Authy, etc.)</li>
                <li>E-mail verificatie codes</li>
                <li>Recovery codes voor noodtoegang</li>
                <li>Backup verificatie methodes</li>
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4>Hoe werkt 2FA?</h4>
              <ol style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Installeer een authenticator app op je telefoon</li>
                <li>Scan de QR-code om je account te koppelen</li>
                <li>Voer de 6-cijferige code in om de koppeling te bevestigen</li>
                <li>Bewaar je recovery codes op een veilige plek</li>
                <li>Vanaf dan heb je bij elke login je telefoon nodig</li>
              </ol>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4>Veiligheidsvoordelen:</h4>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>Extra bescherming tegen ongeautoriseerde toegang</li>
                <li>Beveiligt je account zelfs als je wachtwoord gelekt is</li>
                <li>Voldoet aan moderne beveiligingsstandaarden</li>
                <li>Beschermt gevoelige leerling- en docentgegevens</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShow2FASection(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sluiten
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>Privacy & Gegevensverwerking</h4>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          Je gegevens worden veilig opgeslagen en alleen gebruikt voor het personaliseren van je Leswise-ervaring. 
          Voor leerlingen onder de 16 jaar waarborgen we extra privacy volgens AVG/GDPR-richtlijnen.
        </p>
      </div>
    </div>
  );
}