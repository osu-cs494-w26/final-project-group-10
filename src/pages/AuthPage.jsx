/*
 * AuthPage.jsx Login, sign up, and password reset forms.
 * Rendered before the user is authenticated.
 */

import React, { useState } from 'react';
import PokedexBackground from '../components/PokedexBackground.jsx';
import LoadingScreen      from '../components/LoadingScreen.jsx';

// mode: 'login' | 'signup' | 'forgot' | 'reset'

const PASSWORD_MAX = 30;

const S = {
  wrap: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '3rem 2rem 2rem', position: 'relative', zIndex: 1,
  },
  card: {
    width: '100%', maxWidth: '400px', background: 'var(--grey-900)',
    border: '1px solid var(--border)', padding: '2.5rem 2rem',
    animation: 'fadeIn 0.3s ease', position: 'relative', zIndex: 2,
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
    padding: '10px 12px', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
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
    cursor: 'pointer', padding: '0', textDecoration: 'underline', transition: 'color 0.15s',
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
  hintList: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--grey-500)',
    letterSpacing: '0.04em', lineHeight: 1.8, marginTop: '6px', marginBottom: '1.25rem',
    paddingLeft: '0', listStyle: 'none',
  },
  hintItem: {
    display: 'flex', alignItems: 'flex-start', gap: '6px',
  },
};

// SVG eye icons — no emoji, clean line art matching the app aesthetic.
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// Reusable password field with show/hide eye toggle and optional max-length counter.
function PasswordInput({ value, onChange, onKeyDown, placeholder, autoComplete, showCounter, style }) {
  const [show, setShow] = useState(false);
  const near = showCounter && value.length >= PASSWORD_MAX - 5;

  return (
    <div style={{ marginBottom: style?.marginBottom ?? 0 }}>
      <div style={{ position: 'relative' }}>
        <input
          style={{ ...S.input, paddingRight: '42px' }}
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          maxLength={PASSWORD_MAX}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: '40px',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: show ? 'var(--grey-200)' : 'var(--grey-500)',
            transition: 'color 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--grey-200)'}
          onMouseLeave={e => e.currentTarget.style.color = show ? 'var(--grey-200)' : 'var(--grey-500)'}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {showCounter && near && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: value.length >= PASSWORD_MAX ? '#e07070' : 'var(--grey-500)', textAlign: 'right', marginTop: '4px', letterSpacing: '0.04em' }}>
          {value.length} / {PASSWORD_MAX}
        </div>
      )}
    </div>
  );
}

// The big PokePortal title that sits above the card, matching the HomePage version.
function PageTitle() {
  return (
    <div style={{ marginBottom: '2.5rem', textAlign: 'center', position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, animation: 'fadeIn 0.4s ease both' }}>
      <img src="/Pokeball.png" alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '180px', height: '180px', opacity: 0.6, pointerEvents: 'none' }} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,9vw,76px)', fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--white)', lineHeight: 1, position: 'relative', zIndex: 1 }}>
        PokePortal
      </div>
    </div>
  );
}

function ForgotPanel({ resetPassword, onBack }) {
  const [email, setEmail] = useState('');
  const [msg,   setMsg]   = useState('');
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);
  const [sent,  setSent]  = useState(false);

  const handleSubmit = async () => {
    if (!email) { setError('Please enter your email.'); return; }
    setBusy(true); setError('');
    const { error: err } = await resetPassword(email);
    if (err) { setError(err.message); }
    else { setSent(true); setMsg(`Reset link sent to ${email}. Check your inbox.`); }
    setBusy(false);
  };

  return (
    <>
      <div style={S.sectionTitle}>Reset Password</div>
      <div style={S.sectionSub}>Enter your email and we'll send you a link to set a new password.</div>
      {error && <div style={S.error}>{error}</div>}
      {msg   && <div style={S.success}>{msg}</div>}
      {!sent && (
        <>
          <label style={S.label}>Email</label>
          <input style={{ ...S.input, marginBottom: '1.25rem' }} type="email" value={email}
            placeholder="trainer@example.com" onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoComplete="email" />
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
    setBusy(true); setError('');
    const { error: err } = await updatePassword(password);
    if (err) { setError(err.message); }
    else { setDone(true); setMsg('Password updated! You are now logged in.'); }
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
          <PasswordInput value={password} placeholder="••••••••" showCounter
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="new-password" style={{ marginBottom: '1.25rem' }} />
          <label style={{ ...S.label, marginTop: '1.25rem' }}>Confirm Password</label>
          <PasswordInput value={password2} placeholder="••••••••"
            onChange={e => setPassword2(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="new-password" style={{ marginBottom: '1.25rem' }} />
          <button style={{ ...S.btn, marginTop: '1.25rem' }} onClick={handleSubmit} disabled={busy}>
            {busy ? 'Updating…' : 'Update Password'}
          </button>
        </>
      )}
    </>
  );
}

// Renders the correct auth form based on current mode.
export default function AuthPage({ signIn, signUp, resetPassword, updatePassword, resetMode }) {
  const [bgReady,  setBgReady]  = useState(false);
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [msg,      setMsg]      = useState('');
  const [busy,     setBusy]     = useState(false);

  const switchMode = (m) => { setMode(m); setError(''); setMsg(''); setEmail(''); setPassword(''); };

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
      <>
        <PokedexBackground onReady={() => setBgReady(true)} />
        {!bgReady ? <LoadingScreen title="PokePortal" /> : (
          <div style={S.wrap}>
            <PageTitle />
            <div style={S.card}>
              <div style={S.sub}>Battle · Explore · Compete</div>
              <ResetPanel updatePassword={updatePassword} />
            </div>
          </div>
        )}
      </>
    );
  }

  if (!bgReady) {
    return (
      <>
        <PokedexBackground onReady={() => setBgReady(true)} />
        <LoadingScreen title="PokePortal" />
      </>
    );
  }

  return (
    <>
      <PokedexBackground onReady={() => setBgReady(true)} />
      <div style={S.wrap}>
        <PageTitle />
        <div style={S.card}>
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
              <input style={{ ...S.input, marginBottom: '6px' }} type="email" value={email}
                placeholder="trainer@example.com" onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoComplete="email" />
              {mode === 'signup' ? (
                <ul style={S.hintList}>
                  <li style={S.hintItem}><span>·</span><span>Must be a valid email address</span></li>
                </ul>
              ) : (
                <div style={{ marginBottom: '1.25rem' }} />
              )}

              <label style={S.label}>Password</label>
              <PasswordInput
                value={password} placeholder="••••••••"
                showCounter={mode === 'signup'}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              {mode === 'signup' ? (
                <ul style={{ ...S.hintList, marginTop: '8px' }}>
                  <li style={S.hintItem}><span>·</span><span>At least 6 characters</span></li>
                  <li style={S.hintItem}><span>·</span><span>Maximum {PASSWORD_MAX} characters</span></li>
                  <li style={S.hintItem}><span>·</span><span>Use a mix of letters, numbers, and symbols for a stronger password</span></li>
                </ul>
              ) : (
                <div style={{ marginBottom: '1.25rem' }} />
              )}

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
    </>
  );
}
