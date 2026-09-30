'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  X,
  Store,
  Building2,
  Bike,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openAuthModal,
    login,
    register
  } = useApp();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    state: 'Uttar Pradesh',
    city: 'Varanasi',
    address: '',
    gstNumber: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const result = await login(loginIdentifier, loginPassword);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const result = await register(registerData);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Registration failed. Please check your inputs.');
    } else {
      setSuccessMsg('Account registered successfully! Welcome to VyaparHub.');
    }
  };

  // 1-Click Quick Demo Login Helper
  const handleQuickLogin = (identifier: string, pass: string) => {
    setLoginIdentifier(identifier);
    setLoginPassword(pass);
    setErrorMsg(null);
    setLoading(true);

    setTimeout(async () => {
      const res = await login(identifier, pass);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Quick login failed');
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-6 text-white">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-black tracking-tight">VyaparHub</h2>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20 text-white">
                  B2B Wholesale
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                {authModalTab === 'LOGIN'
                  ? 'Access your wholesale account, orders & Khata credit'
                  : 'Join the direct FMCG wholesale network & activate your Kirana credit line'}
              </p>
            </div>
          </div>

          {/* Tab Switcher Pills */}
          <div className="grid grid-cols-2 gap-1.5 mt-5 bg-black/20 p-1 rounded-2xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                openAuthModal('LOGIN');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authModalTab === 'LOGIN'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                openAuthModal('REGISTER');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authModalTab === 'REGISTER'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Register Kirana Store
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {authModalTab === 'LOGIN' && (
            <div className="space-y-4">
              {/* Demo quick-logins: only rendered when NEXT_PUBLIC_DEMO_MODE=true (never in production) */}
              {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-extrabold mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Click Quick Demo Logins:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ramesh@guptastores.com', 'retailer123')}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-xs transition-all text-left group"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      <Store className="w-3 h-3" />
                      <span>Kirana Retailer</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      Gupta General
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('dealer@vyaparhub.com', 'admin123')}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-xs transition-all text-left group"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Building2 className="w-3 h-3" />
                      <span>Wholesale Dealer</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      Master Wholesaler
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('sales@vyaparhub.com', 'sales123')}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:shadow-xs transition-all text-left group"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <Bike className="w-3 h-3" />
                      <span>Sales Rep</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      Rajesh Sharma
                    </div>
                  </button>
                </div>
              </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. 9876543210 or dealer@vyaparhub.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Don&apos;t have a retail store account yet? </span>
                <button
                  type="button"
                  onClick={() => openAuthModal('REGISTER')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Register Store Now
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {authModalTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Store / Kirana Name *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Mahavir Provisions"
                      value={registerData.businessName}
                      onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Owner Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Manoj Kumar"
                      value={registerData.ownerName}
                      onChange={(e) => setRegisterData({ ...registerData, ownerName: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    City *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Varanasi"
                      value={registerData.city}
                      onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Uttar Pradesh"
                    value={registerData.state}
                    onChange={(e) => setRegisterData({ ...registerData, state: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Store Address / Market Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop 14, Godowlia Market"
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  GSTIN (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. 09ABCDE1234F1Z5"
                    value={registerData.gstNumber}
                    onChange={(e) => setRegisterData({ ...registerData, gstNumber: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Credit Notice */}
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>New stores start with instant UPI ordering. Khata credit lines are activated after dealer store verification.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register & Open Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-400">Already registered? </span>
                <button
                  type="button"
                  onClick={() => openAuthModal('LOGIN')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign In instead
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
