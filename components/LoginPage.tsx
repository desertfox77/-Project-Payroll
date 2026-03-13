
import React, { useState, useEffect } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP Logic
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(30);

  const VALID_EMAIL = 'agent123@example.com';
  const VALID_PASS = '12345678';
  const VALID_OTP = '111111';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0) {
      setIsLocked(false);
      setOtpAttempts(0);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockoutTimer]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email === VALID_EMAIL && password === VALID_PASS) {
        setStep('otp');
        setIsLoading(false);
      } else {
        setError('Invalid email or password');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const otpString = otp.join('');
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (otpString === VALID_OTP) {
        onLogin();
      } else {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockoutTimer(300); // 5 minutes
          setError('Too many incorrect attempts. Please try again in 5 minutes');
        } else {
          setError(`Incorrect OTP. ${3 - newAttempts} attempts remaining.`);
        }
        setIsLoading(false);
      }
    }, 800);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0 || isLocked) return;
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
    setError('');
    // Simulate resend
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-4">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">PayStream</h1>
          <p className="text-slate-500 font-medium mt-2">Secure Agent Portal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8">
            {step === 'login' ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
                  <p className="text-sm text-slate-500">Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        placeholder="agent@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-shake">
                      <AlertCircle size={16} />
                      <p className="text-xs font-bold">{error}</p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">Two-Step Verification</h2>
                  <p className="text-sm text-slate-500">We've sent a 6-digit code to your email</p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className="w-12 h-14 text-center text-2xl font-black bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={isLocked || isLoading}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-shake">
                      <AlertCircle size={16} />
                      <p className="text-xs font-bold">{error}</p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading || isLocked || otp.some(d => d === '')}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
                  </button>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Request a new OTP code in {resendTimer} seconds
                      </p>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLocked}
                        className="text-xs font-black text-blue-600 hover:underline flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50"
                      >
                        <RefreshCw size={14} />
                        Resend Code
                      </button>
                    )}
                  </div>
                </form>

                <button 
                  onClick={() => setStep('login')}
                  className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
          
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              Protected by PayStream Security
            </p>
          </div>
        </div>
        
        {/* Credentials Tip (for demo purposes) */}
        <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-blue-700">
            <div>
              <p className="opacity-60">Email</p>
              <p className="font-bold">agent123@example.com</p>
            </div>
            <div>
              <p className="opacity-60">Password</p>
              <p className="font-bold">12345678</p>
            </div>
            <div>
              <p className="opacity-60">OTP</p>
              <p className="font-bold tracking-widest">111111</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
