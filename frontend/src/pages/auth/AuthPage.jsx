import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  Mail, Key, Phone, User, Activity, AlertCircle,
  CheckCircle, RefreshCw, Eye, EyeOff, ShieldCheck, HeartPulse
} from 'lucide-react';
import api from '../../api/axios';
import RecruiterWarning from '../../components/RecruiterWarning';

/* -------------------------------------------------------------
   Design tokens — same system as LandingPage.jsx.
   Add fonts once in index.html <head> if not already added:

   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
--------------------------------------------------------------- */
const COLOR = {
  bone: '#F5F7F5',
  ink: '#12241F',
  inkSoft: '#4B5D57',
  inkFaint: '#8A9A94',
  teal: '#1F5F5B',
  tealDark: '#12302E',
  amber: '#C8862B',
  amberSoft: '#F6E8CC',
  line: '#DCE4DF',
  errorBg: '#F5E3D2',
  errorText: '#9A5B12',
  errorBorder: '#E7C696',
  successBg: '#E4F2EC',
  successText: '#1F5F5B',
  successBorder: '#BFDED0',
};

const fieldClass =
  'w-full px-4 py-3 text-sm rounded-xl border outline-none transition-colors focus:ring-2';

function Field({ label, action, children }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-[10px] font-extrabold uppercase tracking-wider" style={{ color: COLOR.inkFaint }}>
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

function Alert({ kind, children }) {
  const isError = kind === 'error';
  const Icon = isError ? AlertCircle : CheckCircle;
  return (
    <div
      className="flex items-start gap-2.5 p-3.5 rounded-xl text-xs font-medium border"
      style={{
        backgroundColor: isError ? COLOR.errorBg : COLOR.successBg,
        color: isError ? COLOR.errorText : COLOR.successText,
        borderColor: isError ? COLOR.errorBorder : COLOR.successBorder,
      }}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function PrimaryButton({ loading, children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-transform hover:-translate-y-px disabled:opacity-60 disabled:translate-y-0"
      style={{ backgroundColor: COLOR.amber, boxShadow: '0 6px 16px rgba(200,134,43,0.28)' }}
    >
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, verifyOtp } = useAuth();

  // Mode state: 'login' | 'signup' | 'verify_otp' | 'forgot_password' | 'reset_password'
  const [mode, setMode] = useState('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.role === 'PATIENT') navigate('/patient/profile');
      else if (res.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (res.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      if (err.message?.toLowerCase().includes('verify') || err.message?.toLowerCase().includes('otp')) {
        setError('Verification required. Sending OTP code...');
        setTimeout(() => {
          setMode('verify_otp');
        }, 1500);
      } else {
        setError(err.message || 'Authentication credentials invalid');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Signup field errors ──────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState({});

  const validateSignup = () => {
    const errs = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      errs.fullName = 'Full name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = 'Enter a valid email address (e.g. john@example.com)';
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid 10-digit Indian mobile number starting with 6-9';
    if (password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateSignup()) return;
    setLoading(true);
    try {
      await signup(email, password, fullName, phone);
      setMode('verify_otp');
    } catch (err) {
      setError(err.response?.data || err.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setMessage('Account verified successfully! Redirecting to login...');
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data || err.message || 'OTP code is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setMessage('Password reset code dispatched to email');
      setMode('reset_password');
    } catch (err) {
      setError('No registered profile matches this email address');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword
      });
      setMessage('Your password has been successfully reset.');
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data || err.message || 'Reset sequence failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    setMessage('');
    try {
      await api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
      setMessage('Verification code successfully resent');
    } catch (err) {
      setError('Resend attempt failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body" style={{ backgroundColor: COLOR.bone, color: COLOR.ink }}>
      <div className="flex-1 flex overflow-hidden">
        <style>{`
        @keyframes ecg-draw { to { stroke-dashoffset: -900; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .auth-ecg-line { fill:none; stroke:#C8862B; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:900; stroke-dashoffset:900; animation:ecg-draw 3.4s linear infinite; }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @media (prefers-reduced-motion: reduce) { .auth-ecg-line { animation:none; stroke-dashoffset:0; } }
      `}</style>

      {/* ── LEFT PANEL: BRAND / VITALS (desktop only) ─────────────────── */}
      <div
        className="hidden lg:flex lg:w-7/12 relative items-center justify-center p-14"
        style={{ backgroundColor: COLOR.tealDark }}
      >
        <div className="max-w-lg text-center space-y-9 relative z-10">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: COLOR.teal }}>
              <svg viewBox="0 0 24 16" className="w-8 h-5">
                <polyline points="0,8 6,8 9,1 13,15 16,8 24,8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="font-display font-semibold text-4xl xl:text-[44px] text-white leading-[1.1]">
              Welcome to <span style={{ color: COLOR.amber }}>Priyansh Care</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: '#B7CFCB' }}>
              Sign in to the clinical portal to review live availability, download prescriptions, and track active health charts.
            </p>
          </div>

          {/* Live pulse strip — same signature motif as the landing page */}
          <div className="rounded-2xl p-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="w-full h-[70px]">
              <polyline
                className="auth-ecg-line"
                points="0,35 30,35 42,35 50,10 58,60 66,20 74,35 110,35 122,35 130,15 138,55 146,25 154,35 300,35 330,35 342,35 350,10 358,60 366,20 374,35"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-5 rounded-2xl space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <ShieldCheck className="w-6 h-6" style={{ color: '#9FC9C4' }} />
              <div className="text-xs font-bold text-white">Highly secure</div>
              <div className="text-[10px] leading-normal" style={{ color: '#B7CFCB' }}>Encryption protocols keep every patient profile locked down.</div>
            </div>
            <div className="p-5 rounded-2xl space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <HeartPulse className="w-6 h-6" style={{ color: COLOR.amber }} />
              <div className="text-xs font-bold text-white">Real-time data</div>
              <div className="text-[10px] leading-normal" style={{ color: '#B7CFCB' }}>Synced across clinical, billing, and pharmacy records.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: AUTH WORKSPACE ────────────────────────────────── */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center lg:text-left space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <Link to="/landing" className="flex items-center gap-2.5 font-display font-bold text-lg" style={{ color: COLOR.tealDark }}>
                <span className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: COLOR.teal }}>
                  <svg viewBox="0 0 24 16" className="w-5 h-3.5">
                    <polyline points="0,8 6,8 9,1 13,15 16,8 24,8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Priyansh Care
              </Link>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold" style={{ color: COLOR.ink }}>
                {mode === 'login' && 'Sign in to dashboard'}
                {mode === 'signup' && 'Create patient profile'}
                {mode === 'verify_otp' && 'Verify registration code'}
                {mode === 'forgot_password' && 'Password recovery'}
                {mode === 'reset_password' && 'Configure new password'}
              </h2>
              <p className="text-xs mt-1.5" style={{ color: COLOR.inkSoft }}>
                {mode === 'login' && (
                  <>
                    First time visiting?{' '}
                    <button onClick={() => setMode('signup')} className="font-semibold hover:underline" style={{ color: COLOR.amber }}>
                      Create account
                    </button>
                  </>
                )}
                {mode === 'signup' && (
                  <>
                    Already have credentials?{' '}
                    <button onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: COLOR.amber }}>
                      Login instead
                    </button>
                  </>
                )}
                {mode === 'verify_otp' && `Check the code sent to ${email}`}
                {(mode === 'forgot_password' || mode === 'reset_password') && 'Recover access to your credentials'}
              </p>
            </div>
          </div>

          {/* Form card */}
          <div
            className="p-6 sm:p-8 space-y-6 rounded-2xl bg-white border"
            style={{ borderColor: COLOR.line, boxShadow: '0 20px 40px -28px rgba(18,36,31,0.25)' }}
          >
            {error && <Alert kind="error">{error}</Alert>}
            {message && <Alert kind="success">{message}</Alert>}

            {/* ── MODE: LOGIN ─────────────────────────────────────────── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="Email address">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.com"
                    className={fieldClass}
                    style={{ borderColor: COLOR.line }}
                  />
                </Field>

                <Field
                  label="Password"
                  action={
                    <button
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: COLOR.amber }}
                    >
                      Forgot?
                    </button>
                  }
                >
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${fieldClass} pr-10`}
                      style={{ borderColor: COLOR.line }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: COLOR.inkFaint }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>

                <PrimaryButton type="submit" loading={loading}>Log In</PrimaryButton>
              </form>
            )}

            {/* ── MODE: SIGNUP ────────────────────────────────────────── */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4" noValidate>

                {/* Full Name */}
                <Field label="Full name">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setFieldErrors(p => ({ ...p, fullName: '' })); }}
                    placeholder="Rahul Sharma"
                    className={fieldClass}
                    style={{ borderColor: fieldErrors.fullName ? '#E57373' : COLOR.line }}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-[10px] font-semibold mt-1 flex items-center gap-1" style={{ color: '#C0392B' }}>
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.fullName}
                    </p>
                  )}
                </Field>

                {/* Email */}
                <Field label="Email address">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                    placeholder="john@example.com"
                    className={fieldClass}
                    style={{ borderColor: fieldErrors.email ? '#E57373' : COLOR.line }}
                  />
                  {fieldErrors.email && (
                    <p className="text-[10px] font-semibold mt-1 flex items-center gap-1" style={{ color: '#C0392B' }}>
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                    </p>
                  )}
                </Field>

                {/* Phone */}
                <Field label="Phone number">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(v);
                      setFieldErrors(p => ({ ...p, phone: '' }));
                    }}
                    placeholder="9876543210"
                    className={fieldClass}
                    style={{ borderColor: fieldErrors.phone ? '#E57373' : COLOR.line }}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {fieldErrors.phone ? (
                      <p className="text-[10px] font-semibold flex items-center gap-1" style={{ color: '#C0392B' }}>
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.phone}
                      </p>
                    ) : (
                      <p className="text-[10px]" style={{ color: COLOR.inkFaint }}>Indian 10-digit number (starts 6-9)</p>
                    )}
                    <span className="text-[10px] font-mono" style={{ color: phone.length === 10 ? COLOR.successText : COLOR.inkFaint }}>
                      {phone.length}/10
                    </span>
                  </div>
                </Field>

                {/* Password */}
                <Field label="Password">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                    placeholder="Minimum 8 characters"
                    className={fieldClass}
                    style={{ borderColor: fieldErrors.password ? '#E57373' : COLOR.line }}
                  />
                  {/* Password strength bar */}
                  <div className="mt-1.5">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: password.length === 0 ? '#E8EDEB'
                              : password.length < 6 && i <= 1 ? '#E57373'
                              : password.length < 8 && i <= 2 ? '#F59E0B'
                              : password.length < 12 && i <= 3 ? '#4CAF50'
                              : i <= 4 ? '#1F5F5B'
                              : '#E8EDEB'
                          }}
                        />
                      ))}
                    </div>
                    {fieldErrors.password ? (
                      <p className="text-[10px] font-semibold mt-1 flex items-center gap-1" style={{ color: '#C0392B' }}>
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                      </p>
                    ) : (
                      <p className="text-[10px] mt-1" style={{ color: COLOR.inkFaint }}>
                        {password.length === 0 ? 'Min. 8 characters required'
                          : password.length < 6 ? 'Too weak — add more characters'
                          : password.length < 8 ? 'Almost — need at least 8 characters'
                          : password.length < 12 ? 'Good password ✓'
                          : 'Strong password ✓✓'}
                      </p>
                    )}
                  </div>
                </Field>

                <PrimaryButton type="submit" loading={loading}>Create Account</PrimaryButton>
              </form>
            )}


            {/* ── MODE: VERIFY OTP ────────────────────────────────────── */}
            {mode === 'verify_otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Field label="6-digit verification code">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className={`${fieldClass} text-center text-lg font-mono font-bold tracking-[0.4em]`}
                    style={{ borderColor: COLOR.line }}
                  />
                </Field>

                <PrimaryButton type="submit" loading={loading}>Verify Account</PrimaryButton>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-xs font-semibold hover:underline disabled:opacity-60"
                    style={{ color: COLOR.amber }}
                  >
                    {resending ? 'Resending code...' : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            {/* ── MODE: FORGOT PASSWORD ───────────────────────────────── */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <Field label="Enter email address">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.com"
                    className={fieldClass}
                    style={{ borderColor: COLOR.line }}
                  />
                </Field>

                <PrimaryButton type="submit" loading={loading}>Send Reset Code</PrimaryButton>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs font-medium hover:underline"
                    style={{ color: COLOR.inkSoft }}
                  >
                    Back to login
                  </button>
                </div>
              </form>
            )}

            {/* ── MODE: RESET PASSWORD ────────────────────────────────── */}
            {mode === 'reset_password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Field label="Reset OTP code">
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className={`${fieldClass} text-center font-mono font-bold tracking-wider`}
                    style={{ borderColor: COLOR.line }}
                  />
                </Field>

                <Field label="New password">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={fieldClass}
                    style={{ borderColor: COLOR.line }}
                  />
                </Field>

                <Field label="Confirm password">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={fieldClass}
                    style={{ borderColor: COLOR.line }}
                  />
                </Field>

                <PrimaryButton type="submit" loading={loading}>Reset Password</PrimaryButton>
              </form>
            )}

            {/* ── Separator / OAuth ────────────────────────────────────── */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t" style={{ borderColor: COLOR.line }} />
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="px-3 uppercase font-semibold tracking-wider bg-white" style={{ color: COLOR.inkFaint }}>
                      Or login with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // Frontend-direct OAuth flow:
                    // Google redirects back to our Vercel URL (HTTPS ✅, valid domain ✅)
                    // Then /oauth/callback?code=... exchanges the code with our backend
                    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                    const redirectUri = `${window.location.origin}/oauth/callback`;
                    const scope = 'email profile';
                    const googleAuthUrl =
                      `https://accounts.google.com/o/oauth2/v2/auth` +
                      `?client_id=${encodeURIComponent(clientId)}` +
                      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                      `&response_type=code` +
                      `&scope=${encodeURIComponent(scope)}` +
                      `&access_type=offline` +
                      `&prompt=consent`;
                    window.location.href = googleAuthUrl;
                  }}
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl bg-white text-xs font-bold transition-all active:scale-[0.98] border"
                  style={{ borderColor: COLOR.line, color: COLOR.ink }}
                >
                  <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  Google Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
      <RecruiterWarning />
    </div>
  );
}