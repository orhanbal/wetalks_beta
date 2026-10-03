import { useState } from 'react';
import { signInWithEmail } from '../lib/auth';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  navigate: (to: string) => void;
}

export default function LoginPage({ navigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await signInWithEmail(email, password);
      if (response.status === 'OK') {
        navigate('');
      } else {
        setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-back" onClick={() => navigate('')}>
          <ArrowLeft size={16} />
          Ana Sayfaya Dön
        </button>

        <div className="auth-header">
          <h1 className="auth-title">Giriş Yap</h1>
          <p className="auth-subtitle">Hesabınıza erişmek için bilgilerinizi girin.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="auth-switch">
          Hesabınız yok mu?{' '}
          <button className="auth-switch-btn" onClick={() => navigate('register')}>
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
}
