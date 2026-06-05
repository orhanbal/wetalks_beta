import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    console.log('Auth result:', authData, authError);
    if (authError) {
      setError(`${authError.message} (${authError.status ?? 'no status'})`);
    } else {
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8f9fa', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400,
        border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#aaa', marginBottom: '0.5rem' }}>Admin Panel</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>obtalks</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>Yönetim paneline giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: '0.4rem' }}>
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@obtalks.tr"
              style={{
                width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb',
                borderRadius: 8, fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#c8f542'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: '0.4rem' }}>
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb',
                borderRadius: 8, fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#c8f542'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#c8f542', color: '#111', border: 'none', borderRadius: 8,
              padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
