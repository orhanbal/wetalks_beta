import { useEffect, useRef, useState } from 'react';
import { Save, Upload, Trash2, Eye, EyeOff, Check, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from './AdminLayout';
import AvatarCrop from '../components/AvatarCrop';

export default function AdminProfile() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');

      const { data } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url, title, bio, twitter, instagram, linkedin, website')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setFullName(data.full_name ?? '');
        setUsername((data as any).username ?? '');
        setTitle((data as any).title ?? '');
        setBio((data as any).bio ?? '');
        setTwitter((data as any).twitter ?? '');
        setInstagram((data as any).instagram ?? '');
        setLinkedin((data as any).linkedin ?? '');
        setWebsite((data as any).website ?? '');
        setAvatarUrl(data.avatar_url ?? null);
        setAvatarPreview(data.avatar_url ?? null);
      }
    })();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setProfileError('Dosya boyutu 10MB\'ı geçemez.');
      return;
    }
    setProfileError('');
    setCropFile(file);
  };

  const handleCropConfirm = (blob: Blob) => {
    setCropFile(null);
    setAvatarBlob(blob);
    setAvatarPreview(URL.createObjectURL(blob));
  };

  const handleRemoveAvatar = () => {
    setAvatarBlob(null);
    setAvatarPreview(null);
    setAvatarUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    setSavingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let finalAvatarUrl = avatarUrl;

    if (avatarBlob) {
      const path = `${user.id}/avatar.webp`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarBlob, { contentType: 'image/webp', upsert: true });

      if (uploadError) {
        setProfileError('Avatar yüklenirken hata oluştu.');
        setSavingProfile(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      finalAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(finalAvatarUrl);
      setAvatarPreview(finalAvatarUrl);
      setAvatarBlob(null);
      window.dispatchEvent(new Event('profile-avatar-updated'));
    } else if (avatarPreview === null && avatarUrl !== null) {
      finalAvatarUrl = null;
    }

    const trimmedUsername = username.trim().toLowerCase() || null;
    if (trimmedUsername && !/^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/.test(trimmedUsername)) {
      setProfileError('Kullanıcı adı geçersiz. Sadece küçük harf, rakam, - ve _ kullanabilirsiniz (2-30 karakter).');
      setSavingProfile(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: trimmedUsername,
        avatar_url: finalAvatarUrl,
        title,
        bio,
        twitter,
        instagram,
        linkedin,
        website,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      if (error.code === '23505') {
        setProfileError('Bu kullanıcı adı zaten alınmış. Başka bir tane deneyin.');
      } else {
        setProfileError('Profil kaydedilemedi.');
      }
    } else {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
    setSavingProfile(false);
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    if (!newPassword || !confirmPassword) {
      setPasswordError('Tüm alanları doldurun.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Yeni şifre en az 8 karakter olmalı.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }

    setSavingPassword(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setSavingPassword(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError('Mevcut şifre hatalı.');
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError('Şifre güncellenirken hata oluştu.');
    } else {
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 2500);
    }
    setSavingPassword(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb',
    borderRadius: 8, fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#111',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: '0.4rem',
  };
  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#c8f542';
  };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#e5e7eb';
  };

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OB';

  return (
    <>
    {cropFile && (
      <AvatarCrop
        file={cropFile}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropFile(null)}
      />
    )}
    <div>
      <AdminPageHeader
        title="Profilim"
        subtitle="Profil bilgilerinizi ve şifrenizi güncelleyin"
      />

      <div style={{ padding: '1.5rem 2rem', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Profile Section */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f5f5f5', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', margin: 0 }}>Profil Bilgileri</h2>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: profileSaved ? '#dcfce7' : '#c8f542',
                color: profileSaved ? '#16a34a' : '#111',
                border: 'none', borderRadius: 8, padding: '0.5rem 1rem',
                fontSize: '0.85rem', fontWeight: 700, cursor: savingProfile ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif', opacity: savingProfile ? 0.7 : 1,
              }}
            >
              {profileSaved ? <Check size={14} /> : <Save size={14} />}
              {savingProfile ? 'Kaydediliyor...' : profileSaved ? 'Kaydedildi!' : 'Kaydet'}
            </button>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
                  />
                ) : (
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: '#111',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', fontWeight: 700, color: '#c8f542', letterSpacing: '-0.02em',
                    border: '2px solid #e5e7eb',
                  }}>
                    {initials}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#555', margin: 0 }}>JPG, PNG, WebP — maks. 10MB · WebP'ye dönüştürülür</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      background: '#f5f5f5', color: '#333', border: '1px solid #e5e7eb',
                      borderRadius: 7, padding: '0.45rem 0.9rem', fontSize: '0.82rem',
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <Upload size={13} /> Fotoğraf Yükle
                  </button>
                  {avatarPreview && (
                    <button
                      onClick={handleRemoveAvatar}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca',
                        borderRadius: 7, padding: '0.45rem 0.9rem', fontSize: '0.82rem',
                        fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <Trash2 size={13} /> Kaldır
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label style={labelStyle}>Ad Soyad</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Orhan Balcı"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>

            {/* Username */}
            <div>
              <label style={labelStyle}>
                Kullanıcı Adı <span style={{ color: '#aaa', fontWeight: 400 }}>(kısa link — ör: @orhanbalci)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '0.95rem', fontWeight: 600, color: '#9ca3af', pointerEvents: 'none', userSelect: 'none',
                }}>@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => {
                    const v = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                    setUsername(v);
                    setUsernameStatus('idle');
                  }}
                  placeholder="orhanbalci"
                  maxLength={30}
                  style={{ ...inputStyle, paddingLeft: '1.75rem' }}
                  onFocus={focusHandler}
                  onBlur={blurHandler}
                />
              </div>
              <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Küçük harf, rakam, tire ve alt çizgi. Profil linki:
                {username
                  ? <strong style={{ color: '#374151' }}> #{`@${username}`}</strong>
                  : <span style={{ color: '#d1d5db' }}> #@kullaniciadiniz</span>
                }
              </p>
              {usernameStatus === 'taken' && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>Bu kullanıcı adı zaten alınmış.</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label style={labelStyle}>Unvan / Rol</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Girişimci & Yazar"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>

            {/* Bio */}
            <div>
              <label style={labelStyle}>Hakkımda <span style={{ color: '#aaa', fontWeight: 400 }}>(kısa biyografi)</span></label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Kendiniz hakkında kısa bir tanıtım yazın..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 } as React.CSSProperties}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label style={labelStyle}>E-posta <span style={{ color: '#aaa', fontWeight: 400 }}>(değiştirilemez)</span></label>
              <input
                type="email"
                value={email}
                readOnly
                style={{ ...inputStyle, background: '#f8f9fa', color: '#999', cursor: 'not-allowed' }}
              />
            </div>

            {profileError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.875rem', color: '#dc2626' }}>
                {profileError}
              </div>
            )}
          </div>
        </div>

        {/* Social Media Section */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f5f5f5', background: '#fafafa' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', margin: 0 }}>Sosyal Medya</h2>
            <p style={{ fontSize: '0.8rem', color: '#888', margin: '0.25rem 0 0' }}>Yazar profilinizde görünecek bağlantılar</p>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {([
              { label: 'Twitter / X', value: twitter, setter: setTwitter, Icon: Twitter, placeholder: 'https://twitter.com/kullanici' },
              { label: 'Instagram', value: instagram, setter: setInstagram, Icon: Instagram, placeholder: 'https://instagram.com/kullanici' },
              { label: 'LinkedIn', value: linkedin, setter: setLinkedin, Icon: Linkedin, placeholder: 'https://linkedin.com/in/kullanici' },
              { label: 'Web Sitesi', value: website, setter: setWebsite, Icon: Globe, placeholder: 'https://orhanbalci.tr' },
            ] as const).map(({ label, value, setter, Icon, placeholder }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    <Icon size={15} />
                  </div>
                  <input
                    type="url"
                    value={value}
                    onChange={e => setter(e.target.value)}
                    placeholder={placeholder}
                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                  />
                </div>
              </div>
            ))}
            <p style={{ fontSize: '0.78rem', color: '#bbb', margin: 0 }}>Sosyal medya linkleri "Profil Bilgileri" Kaydet butonu ile kaydedilir.</p>
          </div>
        </div>

        {/* Password Section */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f5f5f5', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', margin: 0 }}>Şifre Değiştir</h2>
            <button
              onClick={handleSavePassword}
              disabled={savingPassword}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: passwordSaved ? '#dcfce7' : '#c8f542',
                color: passwordSaved ? '#16a34a' : '#111',
                border: 'none', borderRadius: 8, padding: '0.5rem 1rem',
                fontSize: '0.85rem', fontWeight: 700, cursor: savingPassword ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif', opacity: savingPassword ? 0.7 : 1,
              }}
            >
              {passwordSaved ? <Check size={14} /> : <Save size={14} />}
              {savingPassword ? 'Güncelleniyor...' : passwordSaved ? 'Güncellendi!' : 'Güncelle'}
            </button>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {(['Mevcut Şifre', 'Yeni Şifre', 'Yeni Şifre Tekrar'] as const).map((lbl, i) => {
              const values = [currentPassword, newPassword, confirmPassword];
              const setters = [setCurrentPassword, setNewPassword, setConfirmPassword];
              const shows = [showCurrent, showNew, showConfirm];
              const toggles = [() => setShowCurrent(v => !v), () => setShowNew(v => !v), () => setShowConfirm(v => !v)];

              return (
                <div key={lbl}>
                  <label style={labelStyle}>{lbl}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={shows[i] ? 'text' : 'password'}
                      value={values[i]}
                      onChange={e => setters[i](e.target.value)}
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: '2.8rem' }}
                      onFocus={focusHandler}
                      onBlur={blurHandler}
                    />
                    <button
                      type="button"
                      onClick={toggles[i]}
                      style={{
                        position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0,
                      }}
                    >
                      {shows[i] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}

            {passwordError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.875rem', color: '#dc2626' }}>
                {passwordError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
