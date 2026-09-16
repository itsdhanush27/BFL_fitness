import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useFitnessData } from '../../context/FitnessDataContext';
import { useAuth } from '../../context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
  onSuccess: (generatedEmail: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlanId = 'plan_elite',
  onSuccess
}) => {
  const fitnessData = useFitnessData();
  const coachingPlans = fitnessData?.coachingPlans || [];
  const { signUp } = useAuth();

  const [activePlanId, setActivePlanId] = useState(selectedPlanId);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const fallbackPlan = {
    id: 'plan_elite',
    name: '1-on-1 Elite Coaching',
    price: 249,
    period: '/month',
    features: ['Weekly video audits', 'Custom periodization']
  };

  const currentPlan = coachingPlans.find(p => p.id === activePlanId) || coachingPlans[0] || fallbackPlan;

  const handlePayAndCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsProcessing(true);

    // Simulate payment clearance & automated account generation
    setTimeout(async () => {
      try {
        const defaultPassword = 'BflPassword123!';
        await signUp(email, defaultPassword, fullName, 'client', activePlanId);
        setIsProcessing(false);
        setSuccess(true);
        setTimeout(() => {
          onSuccess(email);
        }, 1200);
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-500 text-red-600 flex items-center justify-center mx-auto animate-bounce shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-neutral-900 uppercase font-display">Payment Approved!</h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Your BFL Fitness Coaching account has been automatically provisioned for <span className="font-bold text-neutral-900">{email}</span>.
            </p>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600">
              Launching your Comprehensive Intake Form...
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-red-600" /> Instant Enrollment & Account Setup
            </div>
            <h3 className="text-2xl font-black text-neutral-900 uppercase font-display">
              BFL Coaching Checkout
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-6">
              Complete payment to immediately unlock your client portal & access the intake form.
            </p>

            {/* Plan selector pills */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {coachingPlans.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePlanId(p.id)}
                  className={`p-3 rounded-xl text-left border cursor-pointer transition-all ${
                    activePlanId === p.id 
                      ? 'bg-red-50 border-red-500 text-neutral-900 shadow-xs' 
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{p.name}</p>
                  <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">${p.price}<span className="text-[10px] text-neutral-500 font-normal">/mo</span></p>
                </button>
              ))}
            </div>

            {/* Order summary block */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Selected Coaching Tier</p>
                <p className="text-base font-bold text-neutral-900">{currentPlan.name}</p>
                <p className="text-xs text-red-600 mt-0.5">&bull; Includes customized workout split & macro coaching</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-neutral-900 font-mono">${currentPlan.price}</span>
                <span className="text-xs text-neutral-500 block">{currentPlan.period}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePayAndCreateAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Simulated Card Elements */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Card Information</span>
                  <span className="text-[10px] text-neutral-500 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-600" /> 256-Bit Encrypted
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm font-mono focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                  <CreditCard className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Expires
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm font-mono focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="CVC"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm font-mono focus:border-red-500 focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-md shadow-red-200 cursor-pointer flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-50 border border-red-500/40"
              >
                {isProcessing ? (
                  <span>Processing Payment & Generating Account...</span>
                ) : (
                  <>
                    <span>Confirm & Pay ${currentPlan.price}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> Cancel anytime with 30-day notice. 100% money-back satisfaction guarantee.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
