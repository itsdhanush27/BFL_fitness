import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check,
  AlertTriangle
} from 'lucide-react';
import { CoachingPlan } from '../../types';

interface RenewalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: CoachingPlan;
  clientName: string;
  clientEmail: string;
  onPaymentSuccess: () => Promise<void>;
}

export const RenewalPaymentModal: React.FC<RenewalPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  clientName,
  clientEmail,
  onPaymentSuccess
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setIsProcessing(true);

    try {
      // Simulate payment processing delay (replace with real Stripe/payment SDK later)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // On successful payment, trigger the renewal request
      await onPaymentSuccess();

      setPaymentSuccess(true);
    } catch (err: any) {
      setPaymentError(err?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setPaymentSuccess(false);
      setPaymentError(null);
      onClose();
    }
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry as MM/YY
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length > 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-900/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-neutral-200 shadow-2xl max-h-[90vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors z-30 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1">
          {paymentSuccess ? (
          /* ─── Payment Success State ─── */
          <div className="text-center py-12 px-6 space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-neutral-900 uppercase font-display tracking-tight">
                Payment Successful!
              </h3>
              <p className="text-sm text-neutral-600 max-w-sm mx-auto">
                Your payment of <strong className="text-neutral-900 font-mono">${plan.price}</strong> for{' '}
                <strong className="text-neutral-900">{plan.name}</strong> has been processed successfully.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 font-semibold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Renewal request sent to Coach for approval & routine initialization!</span>
            </div>

            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          /* ─── Payment Form ─── */
          <div>
            {/* Header */}
            <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-wider">
                  <CreditCard className="w-3 h-3" />
                  <span>Secure Payment Gateway</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight">
                  Complete Payment to Re-Enroll
                </h3>
                <p className="text-neutral-400 text-xs">
                  Your coaching portal will unlock immediately after Coach reviews your renewal.
                </p>
              </div>
            </div>

            {/* Plan Summary Card */}
            <div className="mx-6 -mt-3 relative z-20">
              <div className="bg-white border-2 border-red-200 rounded-2xl p-4 shadow-lg shadow-red-100/30 flex items-center justify-between gap-4">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    plan.category === 'boxing' ? 'bg-amber-100 text-amber-800' :
                    plan.category === 'powerlifting' ? 'bg-purple-100 text-purple-800' :
                    plan.category === 'face_to_face' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {plan.category ? plan.category.replace(/_/g, ' ') : 'Coaching'}
                  </span>
                  <p className="text-sm font-black text-neutral-900 uppercase font-display mt-1">{plan.name}</p>
                  <p className="text-[11px] text-neutral-500 line-clamp-1">{plan.tagline}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-neutral-900 font-mono">${plan.price}</span>
                  <span className="text-xs text-neutral-500 block">{plan.period}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmitPayment} className="p-6 sm:p-8 pt-5 space-y-4">
              {/* Client Info (Read-Only) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Athlete Name
                  </label>
                  <div className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm font-medium">
                    {clientName}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <div className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm font-medium truncate">
                    {clientEmail}
                  </div>
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Card Information</span>
                  <span className="text-neutral-500 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-600" /> 256-Bit Encrypted
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/10 focus:outline-none placeholder:text-neutral-400 transition-all"
                  />
                  <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Expiry / CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/10 focus:outline-none placeholder:text-neutral-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/10 focus:outline-none placeholder:text-neutral-400 transition-all"
                  />
                </div>
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Submit Payment Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-200 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-70 border border-red-500/40 group"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${plan.price} & Submit Renewal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Security Footer */}
              <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  Payments are securely processed
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-neutral-400" />
                  Cancel anytime
                </span>
              </div>

              {/* What Happens Next */}
              <div className="mt-2 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">After Payment</p>
                <div className="space-y-1.5">
                  {[
                    'Payment confirmation sent to your email',
                    'Renewal request submitted to Coach Mass & Coach Pouya',
                    'Coach reviews & initializes your custom routine',
                    'Portal unlocks automatically once approved'
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
