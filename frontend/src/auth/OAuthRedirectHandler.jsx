import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { RefreshCw } from 'lucide-react';

/**
 * Handles redirect back from Google OAuth2 login.
 *
 * Auth-service redirects to:
 *   /oauth/callback?token=...&userId=...&role=...
 * This handler parses those variables, initializes state, and navigates
 * the logged-in user to their correct dashboard page.
 */
export default function OAuthRedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');

    if (token && role && userId) {
      // Store identical to local login
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      // Force a reload or push state to context (simple reload syncs AuthProvider)
      window.location.href = '/';
    } else {
      // Authentication failed, push back to login
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-4 font-sans">
      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      <span className="text-xs font-semibold tracking-wider uppercase">Syncing Credentials</span>
    </div>
  );
}
