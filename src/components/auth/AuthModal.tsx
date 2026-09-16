import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Dumbbell, 
  Sparkles, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Target,
  ArrowRight
} from 'lucide-react';
import { 
  useAuth, 
  COACH_CREDENTIALS, 
  ADMIN_CREDENTIALS,
  ADMIN_MASS_CREDENTIALS,
  ADMIN_POUYA_CREDENTIALS 
} from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: (role?: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('hypertrophy');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode whenever initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleFillMass = () => {
    setEmail(ADMIN_MASS_CREDENTIALS.email);
    setPassword(ADMIN_MASS_CREDENTIALS.password);
    setError(null);
    setMode('login');
  };

  const handleFillPouya = () => {
    setEmail(ADMIN_POUYA_CREDENTIALS.email);
    setPassword(ADMIN_POUYA_CREDENTIALS.password);
    setError(null);
    setMode('login');
  };

  const handleFillCoach = () => {
    setEmail(COACH_CREDENTIALS.email);
    setPassword(COACH_CREDENTIALS.password);
    setError(null);
    setMode('login');
  };

  const handleFillDemoClient = () => {
    setEmail('alex.rivera@example.com');
    setPassword('password123');
    setError(null);
    setMode('login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await signIn(email, password);
        setSuccessMessage(
          user.role === 'admin'
            ? 'Master Administrator authenticated. Entering portal...'
            : user.role === 'coach'
            ? 'Coach authenticated. Redirecting to Coach Dashboard...'
            : 'Client verified. Redirecting to your Training Portal...'
        );
        setTimeout(() => {
          onSuccess?.(user.role);
          onClose();
        }, 600);
      } else {
        // Validation for client registration
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-enter your password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters in length.');
        }

        const newClient = await signUp(email, password, name, 'client', 'plan_elite', goal);
        setSuccessMessage('Client account created successfully! Entering portal...');
        setTimeout(() => {
          onSuccess?.(newClient.role);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Decorative subtle red glow background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mx-auto mb-3 shadow-md shadow-red-200 border border-red-500/30">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight font-display">
            {mode === 'login' ? 'Portal Authentication' : 'Client Registration'}
          </h3>
          <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
            {mode === 'login'
              ? 'Sign in to access your customized programs, macros, or coaching roster'
              : 'Register your client account to begin your personalized BFL coaching program'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl border border-neutral-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-red-600" />
            <span>Register (Client)</span>
          </button>
        </div>

        {/* Coach Bypass & Client Helper Pill */}
        {mode === 'login' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-600" /> Quick Credentials
              </span>
              <span className="text-[10px] text-neutral-400">Click to auto-populate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Founder 1: Mass Narimanian */}
              <button
                type="button"
                onClick={handleFillMass}
                className="p-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-red-400 text-left transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-neutral-900 tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-red-600" /> Mass (Founder &amp; Admin)
                  </span>
                  <span className="text-[9px] text-neutral-400 group-hover:text-red-600 font-bold">Fill &rarr;</span>
                </div>
                <p className="text-xs font-mono text-neutral-900 truncate">{ADMIN_MASS_CREDENTIALS.email}</p>
                <p className="text-[10px] font-mono text-neutral-500">Pass: {ADMIN_MASS_CREDENTIALS.password}</p>
              </button>

              {/* Founder 2: Pouya Marghzari */}
              <button
                type="button"
                onClick={handleFillPouya}
                className="p-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-red-400 text-left transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-neutral-900 tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-red-600" /> Pouya (Founder &amp; Admin)
                  </span>
                  <span className="text-[9px] text-neutral-400 group-hover:text-red-600 font-bold">Fill &rarr;</span>
                </div>
                <p className="text-xs font-mono text-neutral-900 truncate">{ADMIN_POUYA_CREDENTIALS.email}</p>
                <p className="text-[10px] font-mono text-neutral-500">Pass: {ADMIN_POUYA_CREDENTIALS.password}</p>
              </button>

              {/* Coach credentials helper */}
              <button
                type="button"
                onClick={handleFillCoach}
                className="p-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-red-300 text-left transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-red-600 tracking-wider flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-red-600" /> Coach (Marcus)
                  </span>
                  <span className="text-[9px] text-neutral-400 group-hover:text-neutral-700 font-bold">Fill &rarr;</span>
                </div>
                <p className="text-xs font-mono text-neutral-900 truncate">{COACH_CREDENTIALS.email}</p>
                <p className="text-[10px] font-mono text-neutral-500">Pass: {COACH_CREDENTIALS.password}</p>
              </button>

              {/* Client registered credentials helper */}
              <button
                type="button"
                onClick={handleFillDemoClient}
                className="p-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 text-left transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-neutral-700 tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-neutral-500" /> Demo Client
                  </span>
                  <span className="text-[9px] text-neutral-400 group-hover:text-neutral-700 font-bold">Fill &rarr;</span>
                </div>
                <p className="text-xs font-mono text-neutral-900 truncate">alex.rivera@example.com</p>
                <p className="text-[10px] font-mono text-neutral-500">Pass: password123</p>
              </button>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Authentication Notice</p>
              <p className="text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-3.5 mb-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
            <p className="font-semibold text-neutral-800">{successMessage}</p>
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-red-500 focus:outline-none transition-colors placeholder:text-neutral-400"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Email Address <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'login' ? 'bflfitness@gmail.com or client email' : 'you@example.com'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-red-500 focus:outline-none transition-colors placeholder:text-neutral-400"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Password <span className="text-red-600">*</span>
              </label>
              {mode === 'signup' && (
                <span className="text-[10px] text-neutral-400">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-red-500 focus:outline-none transition-colors placeholder:text-neutral-400"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-red-500 focus:outline-none transition-colors placeholder:text-neutral-400"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Primary Fitness Goal
                </label>
                <div className="relative">
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-xs focus:border-red-500 focus:outline-none transition-colors cursor-pointer appearance-none"
                  >
                    <option value="hypertrophy">Muscle Hypertrophy &amp; Aesthetics</option>
                    <option value="fat_loss">Aggressive Fat Loss &amp; Conditioning</option>
                    <option value="recomp">Body Recomposition (Simultaneous Fat Loss &amp; Muscle Gain)</option>
                    <option value="strength">Maximum Strength &amp; Powerlifting</option>
                    <option value="athletic_performance">Athletic Performance &amp; Movement</option>
                  </select>
                  <Target className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-red-200 transition-all cursor-pointer disabled:opacity-50 mt-2 border border-red-500/40 flex items-center justify-center gap-2 group"
          >
            <span>
              {loading
                ? 'Verifying...'
                : mode === 'login'
                ? 'Sign In to Portal'
                : 'Register Account & Enter'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className="mt-6 pt-4 border-t border-neutral-200 text-center text-xs text-neutral-600">
          {mode === 'login' ? (
            <span>
              New client?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="text-red-600 hover:underline font-bold cursor-pointer ml-1"
              >
                Register client account &rarr;
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-red-600 hover:underline font-bold cursor-pointer ml-1"
              >
                Sign in to your account &rarr;
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

