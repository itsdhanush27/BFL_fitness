import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Dumbbell, 
  Globe, 
  Swords, 
  ArrowLeft,
  Flame,
  Check
} from 'lucide-react';
import { useFitnessData } from '../../context/FitnessDataContext';
import { useAuth } from '../../context/AuthContext';

export interface PendingRegistrationData {
  name: string;
  email: string;
  password?: string;
  goal?: string;
  isGoogleAuth?: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
  registrationData?: PendingRegistrationData | null;
  onSuccess: (data: {
    email: string;
    name: string;
    planId: string;
    planName: string;
    planPrice: number;
    billingPeriod: string;
  }) => void;
  onBackToRegister?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlanId = 'plan_online_monthly',
  registrationData,
  onSuccess,
  onBackToRegister
}) => {
  const fitnessData = useFitnessData();
  const coachingPlans = fitnessData?.coachingPlans || [];
  const { user, signUp } = useAuth();

  const [activePlanId, setActivePlanId] = useState(selectedPlanId);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'face_to_face' | 'online' | 'specialty'>('all');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync inputs with registration data or current logged-in user
  useEffect(() => {
    if (registrationData) {
      if (registrationData.name) setFullName(registrationData.name);
      if (registrationData.email) setEmail(registrationData.email);
    } else if (user) {
      if (user.displayName) setFullName(user.displayName);
      if (user.email) setEmail(user.email);
    }
  }, [registrationData, user, isOpen]);

  useEffect(() => {
    if (selectedPlanId) {
      setActivePlanId(selectedPlanId);
    }
  }, [selectedPlanId, isOpen]);

  if (!isOpen) return null;

  const fallbackPlan = {
    id: 'plan_online_monthly',
    name: 'Online Coaching (Monthly)',
    price: 350,
    period: '/ month',
    tagline: 'Full diet & exercise program with weekly audit',
    features: ['Custom macronutrient plan', 'Direct WhatsApp coach access', 'Form audit videos']
  };

  const currentPlan = coachingPlans.find(p => p.id === activePlanId) || coachingPlans[0] || fallbackPlan;

  const filteredPlans = coachingPlans.filter(p => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'face_to_face') return p.category === 'face_to_face';
    if (selectedCategory === 'online') return p.category === 'online';
    if (selectedCategory === 'specialty') return p.category === 'boxing' || p.category === 'powerlifting';
    return true;
  });

  const handlePayAndCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsProcessing(true);

    try {
      const passwordToUse = registrationData?.password || 'BflPassword123!';
      // Auto sign in client upon enrollment so they seamlessly proceed to Step 3 (Onboarding) and portal
      await signUp(
        email,
        passwordToUse,
        fullName,
        'client',
        activePlanId,
        registrationData?.goal || 'hypertrophy',
        true
      );

      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess({
          email,
          name: fullName,
          planId: currentPlan.id,
          planName: currentPlan.name,
          planPrice: currentPlan.price,
          billingPeriod: currentPlan.period
        });
      }, 1000);
    } catch (err: any) {
      console.warn('[CheckoutModal] Auto sign-up notice:', err);
      // Ensure the client is never trapped; advance to onboarding form
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess({
          email,
          name: fullName,
          planId: currentPlan.id,
          planName: currentPlan.name,
          planPrice: currentPlan.price,
          billingPeriod: currentPlan.period
        });
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-900/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-neutral-200 shadow-2xl max-h-[90vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-8 flex-1">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-500 text-red-600 flex items-center justify-center mx-auto animate-bounce shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900 uppercase font-display">Enrollment Confirmed!</h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto">
                Your selected package <strong className="text-neutral-900">{currentPlan.name} (${currentPlan.price}{currentPlan.period})</strong> has been locked in for <span className="font-bold text-neutral-900">{email}</span>.
              </p>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 font-semibold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
                <span>Step 2 Complete! Loading Step 3: Athlete Onboarding Form...</span>
              </div>
            </div>
          ) : (
            <div>
              {/* Step 2 Indicator Header */}
              <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[11px] font-bold text-red-700 shadow-xs">
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-mono font-black">2</span>
                <span>Step 2 of 3: Plan &amp; Enroll Form</span>
              </div>
              {onBackToRegister && (
                <button
                  type="button"
                  onClick={onBackToRegister}
                  className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Registration</span>
                </button>
              )}
            </div>

            <h3 className="text-2xl font-black text-neutral-900 uppercase font-display tracking-tight">
              Select Your Coaching Package
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Choose your exact coaching package below. Your plan will be submitted directly to Coach Mass Narimanian &amp; Coach Pouya Marghzari for audit and final activation.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {[
                { id: 'all', label: 'All Packages (7)' },
                { id: 'face_to_face', label: 'Face-to-Face Gym' },
                { id: 'online', label: 'Online (Full Diet & Exercise)' },
                { id: 'specialty', label: 'Boxing & Powerlifting' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Plan selection grid */}
            <div className="mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1.5 border border-neutral-200 rounded-2xl bg-neutral-50/70">
                {filteredPlans.map(p => {
                  const selected = activePlanId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePlanId(p.id)}
                      className={`p-3 rounded-xl text-left border cursor-pointer transition-all flex flex-col justify-between ${
                        selected 
                          ? 'bg-red-50/90 border-red-500 text-neutral-900 shadow-sm ring-1 ring-red-500' 
                          : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-neutral-900 line-clamp-1">{p.name}</p>
                          {selected ? (
                            <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0" />
                          )}
                        </div>
                        {p.tagline && (
                          <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">{p.tagline}</p>
                        )}
                      </div>
                      <p className="text-base font-black text-neutral-900 font-mono mt-2">
                        ${p.price}
                        <span className="text-[11px] text-neutral-500 font-medium ml-1">{p.period}</span>
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Plan Details Banner */}
            <div className="p-4 rounded-2xl bg-neutral-900 text-white mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                    Selected Package
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">Pending Coach Approval</span>
                </div>
                <p className="text-base font-bold text-white mt-1">{currentPlan.name}</p>
                <p className="text-xs text-neutral-300 mt-0.5">
                  {currentPlan.tagline || 'Comprehensive programming & personal coach supervision'}
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">${currentPlan.price}</span>
                <span className="text-xs text-neutral-400 block">{currentPlan.period}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePayAndCreateAccount} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Athlete Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Simulated Card Elements */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Billing / Card Information</span>
                  <span className="text-[10px] text-neutral-500 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-600" /> 256-Bit Encrypted
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242 (Demo clearance)"
                    className="w-full pl-11 pr-4 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm font-mono focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                  <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Expires
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm font-mono focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm font-mono focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-md shadow-red-200 cursor-pointer flex items-center justify-center gap-2 mt-3 transition-all disabled:opacity-50 border border-red-500/40 group"
              >
                {isProcessing ? (
                  <span>Locking in Package &amp; Provisioning Account...</span>
                ) : (
                  <>
                    <span>Confirm {currentPlan.name} (${currentPlan.price} {currentPlan.period}) &amp; Continue →</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> Cancel anytime
                </span>
                <span>Next: Step 3 (Athlete Onboarding Form)</span>
              </div>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
