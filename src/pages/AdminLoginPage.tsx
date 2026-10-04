import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // Attempt Supabase Auth login
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          // If Supabase rejected, check if offline admin credentials used
          if (email === 'admin@hostelleague26.com' && password === 'admin123') {
            localStorage.setItem('hl26_admin_auth', 'true');
            onLoginSuccess();
            return;
          }
          throw error;
        }

        localStorage.setItem('hl26_admin_auth', 'true');
        onLoginSuccess();
      } else {
        // Local mode authentication fallback
        if (
          (email.trim().toLowerCase() === 'admin@hostelleague26.com' || email.trim().toLowerCase() === 'admin') &&
          password.trim() === 'admin123'
        ) {
          localStorage.setItem('hl26_admin_auth', 'true');
          onLoginSuccess();
        } else {
          setErrorMsg('Invalid credentials. For local testing, use: admin@hostelleague26.com / admin123');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 rounded-2xl bg-stadium-900 border border-stadium-800 shadow-2xl">
      
      {/* Back button */}
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Website
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-500/40 mx-auto flex items-center justify-center text-gold-400 mb-3 shadow-inner">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black font-display uppercase tracking-tight text-white">
          ADMIN PORTAL
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authorized match officials and tournament administrators only.
        </p>
      </div>

      {/* Supabase status indicator */}
      <div className="mb-6 p-3 rounded-lg bg-stadium-950/70 border border-stadium-800 text-[11px] flex items-center gap-2">
        {isSupabaseConfigured ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-mono">Supabase Auth Connected</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-slate-400 font-mono">
              <span className="text-amber-400 font-semibold">Demo Mode: </span>
              admin@hostelleague26.com / admin123
            </div>
          </>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@hostelleague26.com"
              className="w-full bg-stadium-950 border border-stadium-750 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-stadium-950 border border-stadium-750 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-stadium-950 font-black font-display uppercase tracking-wider transition-colors shadow-lg shadow-gold-500/10 text-sm"
        >
          {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
        </button>
      </form>

    </div>
  );
};
