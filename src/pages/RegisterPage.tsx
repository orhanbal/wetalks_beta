import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  navigate: (to: string) => void;
}

export default function RegisterPage({ navigate }: RegisterPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
      } else {
        setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-success-icon">✓</div>
          <div className="auth-header">
            <h1 className="auth-title">Hesabınız Oluşturuldu!</h1>
            <p className="auth-subtitle">
              Kaydınız başarıyla tamamlandı. Artık giriş yapabilirsiniz.
            </p>
          </div>
          <button className="auth-submit" onClick={() => navigate('login')}>
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-back" onClick={() => navigate('')}>
          <ArrowLeft size={16} />
          Ana Sayfaya Dön
        </button>

        <div className="auth-header">
          <h1 className="auth-title">Kayıt Ol</h1>
          <p className="auth-subtitle">Yeni bir hesap oluşturun.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Ad Soyad</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Adınız Soyadınız"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">E-posta</label>
            <input
              type="email"
              className="auth-input"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Şifre</label>
            <div className="auth-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input-padded"
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="auth-switch">
          Zaten hesabınız var mı?{' '}
          <button className="auth-switch-btn" onClick={() => navigate('login')}>
            Giriş Yap
          </button>
        </p>
      </div>
    </div>
  );
}
