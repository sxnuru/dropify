/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Mail, Lock, Phone, ArrowLeft, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthPagesProps {
  onSuccess: () => void;
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log("[handleLoginSubmit] Successfully authenticated via Firebase Auth.");
      console.log("- Firebase UID:", firebaseUser.uid);
      console.log("- email:", firebaseUser.email || email);
      setSuccess('Successfully authenticated! Redirecting to home...');
      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Incorrect email address or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('This account has been temporarily disabled due to too many failed login attempts. Please try again later.');
      } else {
        setError(err.message || 'Authentication error. Please check your credentials.');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: fullName });
      
      // Provision/write customer registration record in Firestore users collection
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          fullName: fullName,
          email: email,
          phoneNumber: phone,
          role: 'customer',
          createdAt: serverTimestamp()
        });
      }
      
      setSuccess('Account provisioned successfully. Logging you in...');
      setTimeout(() => {
        setIsLoading(false);
        console.log("[handleRegisterSubmit] Registered new user.");
        console.log("- Firebase UID:", firebaseUser.uid);
        console.log("- email:", email);
        console.log("- Default Firestore role set: customer");
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please check the structure of your email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password chosen is too weak. Please use a stronger password.');
      } else {
        setError(err.message || 'Error provisioning account. Please try again.');
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
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
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('A secure reset link has been dispatched to your email.');
      setIsLoading(false);
      setEmail('');
    } catch (err: any) {
      setIsLoading(false);
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account matches this email directory path.');
      } else {
        setError(err.message || 'Error processing reset request.');
      }
    }
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
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="e.g. Liam O'Connor"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                  required
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="tel"
                  placeholder="+44 7700 900123"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Establish Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  placeholder="•••••••• (6+ characters)"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider font-bold">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-800 font-medium"
                  required
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
