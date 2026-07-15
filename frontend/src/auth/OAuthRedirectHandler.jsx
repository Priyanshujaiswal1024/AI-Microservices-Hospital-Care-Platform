import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import api from '../api/axios';

/**
 * Handles redirect back from Google OAuth2.
 *
 * TWO flows supported:
 *
 * 1) BACKEND flow (legacy): auth-service redirects to:
 *      /oauth/callback?token=...&userId=...&role=...
 *
 * 2) FRONTEND flow (new): Google redirects to:
 *      /oauth/callback?code=...
 *    → Frontend sends code to backend for JWT exchange.
 */
export default function OAuthRedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const token  = searchParams.get('token');
    const role   = searchParams.get('role');
    const userId = searchParams.get('userId');
    const code   = searchParams.get('code');
    const error  = searchParams.get('error');

    // ── Error from Google or failure handler ─────────────────────────────
    if (error) {
      navigate('/login?error=oauth_failed');
      return;
    }

    // ── Flow 1: Backend already gave us the JWT (legacy redirect flow) ───
    if (token && role && userId) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      window.location.href = '/';
      return;
    }

    // ── Flow 2: Frontend flow — exchange Google code for JWT ─────────────
    if (code) {
      const redirectUri = `${window.location.origin}/oauth/callback`;

      api.get(`/auth/oauth2/google/exchange`, {
        params: { code, redirectUri },
      })
        .then(({ data }) => {
          if (data.token && data.userId && data.role) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', String(data.userId));
            window.location.href = '/';
          } else {
            setErrMsg('Authentication failed: invalid response from server');
            setTimeout(() => navigate('/login?error=oauth_failed'), 2500);
          }
        })
        .catch((err) => {
          console.error('OAuth exchange error:', err);
          setErrMsg(err?.response?.data || 'Authentication failed. Please try again.');
          setTimeout(() => navigate('/login?error=oauth_failed'), 2500);
        });

      return;
    }

    // ── No recognised params ─────────────────────────────────────────────
    navigate('/login?error=oauth_failed');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (errMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-4 font-sans">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <span className="text-sm font-semibold text-red-600">{errMsg}</span>
        <span className="text-xs text-slate-400">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-4 font-sans">
      <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
      <span className="text-xs font-semibold tracking-wider uppercase">Syncing Credentials</span>
    </div>
  );
}
