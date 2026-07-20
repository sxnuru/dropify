/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Lock, Phone, ArrowLeft, Shield, Sparkles, AlertCircle } from 'lucide-react';

interface AuthPagesProps {
  onSuccess: (user: UserProfile) => void;
  onCancel: () => void;
  initialView?: 'login' | 'register' | 'forgot';
}

export default function AuthPages({ onSuccess, onCancel, initialView = 'login' }: AuthPagesProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>(initialView);
  
  // Field States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Error / Success feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email address is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please provide a valid email structure.');
      return;
    }
    if (!password) {
      setError('Secure access password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Access credentials must exceed 5 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Let's sign them in with a mock user. If they logged in with the demo email, keep the same details
      const user: UserProfile = {
        fullName: fullName || (email === 'aria.malik@vanguard.co' ? 'Aria Malik' : 'Aesthetic Connoisseur'),
        email: email,
        phone: phone || '+92 333 4567890',
        status: 'Platinum Tier',
        memberSince: 'January 2026',
        loyaltyPoints: 1250
      };
      onSuccess(user);
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName) {
      setError('Full legal name is required.');
      return;
    }
    if (!email) {
      setError('Email address is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please provide a valid email structure.');
      return;
    }
    if (!phone) {
      setError('Contact phone coordinate is required.');
      return;
    }
    if (!password) {
      setError('Security password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Security credentials must be 6+ characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Credential validation mismatch.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('Account provisioned successfully. Logging you in...');
      setTimeout(() => {
        const user: UserProfile = {
          fullName: fullName,
          email: email,
          phone: phone,
          status: 'Gold Status',
          memberSince: 'July 2026',
          loyaltyPoints: 100 // Welcome points!
        };
        onSuccess(user);
      }, 1000);
    }, 1200);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email address is required to locate your credentials.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email directory path.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('A temporary credential recovery dispatch has been successfully routed to your email address.');
      setEmail('');
    }, 1000);
  };

  return (
    <div id="auth-portal-root" className="max-w-md mx-auto my-12 bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 md:p-10 font-sans text-left animate-fadeIn">
      {/* Back button with sleek minimalist style and hover animation */}
      <button 
        onClick={onCancel}
        className="group flex items-center gap-2 text-[10px] font-mono text-slate-400 hover:text-slate-900 font-bold uppercase tracking-wider mb-8 transition-all cursor-pointer"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
        <span>Back to Marketplace</span>
      </button>

      {/* View Switcher Panels */}
      {view === 'login' && (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">SECURE CREDENTIALS</span>
            <h2 className="font-sans font-black text-2xl uppercase tracking-tight text-slate-950 flex items-center gap-2">
              Lounge Sign In <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Unlock access to your premium private account, elite reward multipliers, and active shipment trackings.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">Email Directory</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Lounge Password</label>
                <button 
                  type="button"
                  onClick={() => { setView('forgot'); setError(''); setSuccess(''); }}
                  className="text-[9px] font-mono text-blue-600 font-bold uppercase tracking-wider hover:underline"
                >
                  Forgot Key?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-sans hover:bg-blue-600 active:scale-[0.98] transition-all cursor-pointer shadow-md mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'AUTHENTICATE ENTRY'
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill helper */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[10px] text-slate-500 space-y-1 font-mono">
            <div className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-600" /> Demo Account Blueprint
            </div>
            <div>Email: <span className="text-slate-800 font-semibold cursor-pointer underline" onClick={() => { setEmail('aria.malik@vanguard.co'); setPassword('password123'); }}>aria.malik@vanguard.co</span></div>
            <div>Pass: <span className="text-slate-800 font-semibold cursor-pointer underline" onClick={() => { setEmail('aria.malik@vanguard.co'); setPassword('password123'); }}>password123</span></div>
          </div>

          <div className="text-center pt-2">
            <p className="text-slate-400 text-[11px]">
              New to our premium ecosystem?{' '}
              <button 
                onClick={() => { setView('register'); setError(''); setSuccess(''); }}
                className="text-blue-600 font-bold hover:underline"
              >
                Register Lounge Account
              </button>
            </p>
          </div>
        </div>
      )}

      {view === 'register' && (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">MEMBERSHIP ENROLLMENT</span>
            <h2 className="font-sans font-black text-2xl uppercase tracking-tight text-slate-950">
              Create Account
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Register to receive 100 premium welcoming loyalty credits, complimentary express checkout routes, and secure history archives.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Aria Malik"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">Phone Directory Coordinate</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">Establish Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  placeholder="•••••••• (6+ characters)"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">Verify Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-sans hover:bg-blue-600 active:scale-[0.98] transition-all cursor-pointer shadow-md mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'REGISTER MEMBERSHIP'
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-slate-400 text-[11px]">
              Already recognized inside our Lounge?{' '}
              <button 
                onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                className="text-blue-600 font-bold hover:underline"
              >
                Sign In Instead
              </button>
            </p>
          </div>
        </div>
      )}

      {view === 'forgot' && (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">CREDENTIAL RECOVERY</span>
            <h2 className="font-sans font-black text-2xl uppercase tracking-tight text-slate-950">
              Recover Access
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Input your email coordinate and we will send you a secure bypass link to re-establish your private access credentials.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">Email Directory</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-sans hover:bg-blue-600 active:scale-[0.98] transition-all cursor-pointer shadow-md mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'DISPATCH RECOVERY DISK'
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => { setView('login'); setError(''); setSuccess(''); }}
              className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
