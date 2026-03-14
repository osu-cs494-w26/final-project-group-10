/*
 * AuthPage.jsx Login, sign-up, and password-reset forms.
 * Rendered before the user is authenticated.
 */

import React, { useState } from 'react';

// mode: 'login' | 'signup' | 'forgot' | 'reset'

const S = {
  wrap: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--black)', padding: '2rem',
  },
  card: {
    width: '100%', maxWidth: '400px', background: 'var(--grey-900)',
    border: '1px solid var(--border)', padding: '2.5rem 2rem',
    animation: 'fadeIn 0.3s ease',
  },
  logo: {
    fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
    letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white)',
    textAlign: 'center', marginBottom: '0.25rem',
  },
  sub: {
    fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--grey-400)',
    textAlign: 'center', letterSpacing: '0.15em', marginBottom: '2.5rem', textTransform: 'uppercase',
  },
  tabRow: {
    display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--border)',
  },
  tab: (active) => ({
    flex: 1, background: 'transparent', border: 'none',
    borderBottom: active ? '2px solid var(--grey-200)' : '2px solid transparent',
    color: active ? 'var(--white)' : 'var(--grey-500)',
    fontFamily: 'var(--font-display)', fontSize: '14px', letterSpacing: '0.12em',
    textTransform: 'uppercase', padding: '10px 0', cursor: 'pointer',
    transition: 'all 0.15s', marginBottom: '-1px',
  }),
  label: {
    display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px',
    color: 'var(--grey-400)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px',
  },
  input: {
    width: '100%', background: 'var(--grey-800)', border: '1px solid var(--border)',
    color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: '14px',
    padding: '10px 12px', outline: 'none', marginBottom: '1.25rem', transition: 'border-color 0.15s',
  },
  btn: {
    width: '100%', background: 'var(--grey-700)', border: '1px solid var(--border-lt)',
    color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: '15px',
    letterSpacing: '0.15em', textTransform: 'uppercase', padding: '12px',
    cursor: 'pointer', transition: 'background 0.15s', marginTop: '0.5rem',
  },
  linkBtn: {
    background: 'none', border: 'none', color: 'var(--grey-500)',
    fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em',
    cursor: 'pointer', padding: '0', textDecoration: 'underline',
    transition: 'color 0.15s',
  },
  error: {
    background: 'rgba(192,48,48,0.15)', border: '1px solid rgba(192,48,48,0.4)',
    color: '#e07070', fontFamily: 'var(--font-mono)', fontSize: '12px',
    padding: '10px 12px', marginBottom: '1rem', lineHeight: 1.4,
  },
  success: {
    background: 'rgba(90,156,106,0.15)', border: '1px solid rgba(90,156,106,0.4)',
    color: '#7dc48d', fontFamily: 'var(--font-mono)', fontSize: '12px',
    padding: '10px 12px', marginBottom: '1rem', lineHeight: 1.4,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)', fontSize: '16px', letterSpacing: '0.15em',
    textTransform: 'uppercase', color: 'var(--white)', marginBottom: '0.5rem',
  },
  sectionSub: {
    fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--grey-500)',
    lineHeight: 1.5, marginBottom: '1.5rem',
  },
};

function ForgotPanel({ resetPassword, onBack }) {
  const [email, setEmail] = useState('');
  const [msg,   setMsg]   = useState('');
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);
  const [sent,  setSent]  = useState(false);

  const handleSubmit = async () => {
    if (!email) { setError('Please enter your email.'); return; }
    setBusy(true);
    setError('');
    const { error: err } = await resetPassword(email);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
      setMsg(`Reset link sent to ${email}. Check your inbox.`);
    }
    setBusy(false);
  };

  return (
    <>
      <div style={S.sectionTitle}>Reset Password</div>
      <div style={S.sectionSub}>
        Enter your email and we'll send you a link to set a new password.
      </div>

      {error && <div style={S.error}>{error}</div>}
      {msg   && <div style={S.success}>{msg}</div>}

      {!sent && (
        <>
          <label style={S.label}>Email</label>
          <input
            style={S.input} type="email" value={email}
            placeholder="trainer@example.com"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="email"
          />
          <button style={S.btn} onClick={handleSubmit} disabled={busy}>
            {busy ? 'Sending…' : 'Send Reset Link'}
          </button>
        </>
      )}

      <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
        <button style={S.linkBtn} onClick={onBack}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--grey-200)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--grey-500)'}>
          ← Back to login
        </button>
      </div>
    </>
  );
}

function ResetPanel({ updatePassword }) {
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [msg,       setMsg]       = useState('');
  const [error,     setError]     = useState('');
  const [busy,      setBusy]      = useState(false);
  const [done,      setDone]      = useState(false);

  const handleSubmit = async () => {
    if (!password || !password2) { setError('Please fill in both fields.'); return; }
    if (password.length < 6)     { setError('Password must be at least 6 characters.'); return; }
    if (password !== password2)  { setError('Passwords do not match.'); return; }
    setBusy(true);
    setError('');
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err.message);
    } else {
      setDone(true);
      setMsg('Password updated! You are now logged in.');
    }
    setBusy(false);
  };

  return (
    <>
      <div style={S.sectionTitle}>Set New Password</div>
      <div style={S.sectionSub}>Choose a new password for your account.</div>

      {error && <div style={S.error}>{error}</div>}
      {msg   && <div style={S.success}>{msg}</div>}

      {!done && (
        <>
          <label style={S.label}>New Password</label>
          <input
            style={S.input} type="password" value={password}
            placeholder="••••••••" onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="new-password"
          />
          <label style={S.label}>Confirm Password</label>
          <input
            style={S.input} type="password" value={password2}
            placeholder="••••••••" onChange={e => setPassword2(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="new-password"
          />
          <button style={S.btn} onClick={handleSubmit} disabled={busy}>
            {busy ? 'Updating…' : 'Update Password'}
          </button>
        </>
      )}
    </>
  );
}

// Renders the correct auth form based on current mode.
export default function AuthPage({ signIn, signUp, resetPassword, updatePassword, resetMode }) {
  const [mode,     setMode]     = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [msg,      setMsg]      = useState('');
  const [busy,     setBusy]     = useState(false);

  const switchMode = (m) => {
    setMode(m); setError(''); setMsg(''); setEmail(''); setPassword('');
  };

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setBusy(true); setError(''); setMsg('');
    if (mode === 'signup') {
      const { error: err } = await signUp(email, password);
      if (err) { setError(err.message); }
      else { setMsg('Account created! Check your email to confirm, then log in.'); switchMode('login'); }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) setError(err.message);
    }
    setBusy(false);
  };

  // If user arrived via password reset email link
  if (resetMode) {
    return (
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={S.logo}>PokePortal</div>
          <div style={S.sub}>Battle · Explore · Compete</div>
          <ResetPanel updatePassword={updatePassword} />
        </div>
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.logo}>PokePortal</div>
        <div style={S.sub}>Battle · Explore · Compete</div>

        {mode === 'forgot' ? (
          <ForgotPanel resetPassword={resetPassword} onBack={() => switchMode('login')} />
        ) : (
          <>
            <div style={S.tabRow}>
              <button style={S.tab(mode === 'login')}  onClick={() => switchMode('login')}>Login</button>
              <button style={S.tab(mode === 'signup')} onClick={() => switchMode('signup')}>Sign Up</button>
            </div>

            {error && <div style={S.error}>{error}</div>}
            {msg   && <div style={S.success}>{msg}</div>}

            <label style={S.label}>Email</label>
            <input style={S.input} type="email" value={email} placeholder="trainer@example.com"
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete="email" />

            <label style={S.label}>Password</label>
            <input style={S.input} type="password" value={password} placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />

            <button style={S.btn} onClick={handleSubmit} disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>

            {mode === 'login' && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button style={S.linkBtn} onClick={() => switchMode('forgot')}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--grey-200)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--grey-500)'}>
                  Forgot your password?
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
