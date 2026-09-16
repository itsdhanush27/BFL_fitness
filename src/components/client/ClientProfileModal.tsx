import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Check, 
  Save, 
  Award,
  Phone,
  Dumbbell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFitnessData } from '../../context/FitnessDataContext';

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout?: (planId?: string) => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenCheckout
}) => {
  const { user, updateProfile } = useAuth();
  const { coachingPlans, coaches } = useFitnessData();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find assigned coach
  const assignedCoach = coaches.find(c => c.id === user?.assignedCoachId) || coaches[0];
  const activePlan = coachingPlans.find(p => p.id === user?.activePlanId) || coachingPlans[1];

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      photoURL: photoURL || undefined
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Client Account Profile</h2>
              <p className="text-xs text-neutral-500">Manage your coaching subscription, credentials, and biometrics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subscription Banner */}
        <div className="bg-gradient-to-r from-red-50/80 via-neutral-50 to-red-50/80 border border-red-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Active Subscription</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                Active &bull; Auto-renews
              </span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mt-1">{activePlan?.name || '1-on-1 Elite Coaching'}</h3>
            <p className="text-xs text-neutral-500">${activePlan?.price || 349}/month &bull; Next billing April 15, 2026</p>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenCheckout?.('plan_contest');
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 rounded-lg text-xs font-bold border border-neutral-200 transition-colors self-start sm:self-auto cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Change Plan</span>
          </button>
        </div>

        {/* Assigned Coach Card */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mb-2 block">
            Assigned Lead Coach
          </span>
          <div className="flex items-center gap-3">
            <img
              src={assignedCoach.avatarUrl}
              alt={assignedCoach.name}
              className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                {assignedCoach.name}
                <ShieldCheck className="w-4 h-4 text-red-600" />
              </h4>
              <p className="text-xs text-red-600 font-semibold">{assignedCoach.specialty}</p>
              <p className="text-[11px] text-neutral-500 truncate">{assignedCoach.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Full Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'alex.rivera@example.com'}
                className="w-full bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:border-red-600 focus:outline-none placeholder:text-neutral-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Phone Number (SMS Workout Reminders)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Intake Form Status
              </label>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700 font-bold flex items-center gap-1.5 h-10">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Onboarding Form Approved</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            {saveSuccess ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile saved successfully!
              </span>
            ) : (
              <span className="text-xs text-neutral-500">
                Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md shadow-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
