import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  User, 
  LogOut, 
  Calendar, 
  Menu, 
  X,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFitnessData } from '../../context/FitnessDataContext';
import { NotificationDropdown } from './NotificationDropdown';

export type AppView = 'marketing' | 'client_portal' | 'coach_portal' | 'admin_manage_coaches';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenCheckout?: (planId?: string) => void;
  setIsAuthModalOpen?: (isOpen: boolean) => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenAuth,
  onOpenCheckout,
  setIsAuthModalOpen,
  onSignOut
}) => {
  const navigate = useNavigate();
  const { user, currentUser, signOut } = useAuth();
  const { cmsContent } = useFitnessData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    // 1. Explicitly close any auth modal
    if (setIsAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
    setMobileMenuOpen(false);

    // 2. Clear user state
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }

    // 3. Programmatic navigation to root home page
    setCurrentView('marketing');
    navigate('/');

    // 4. Trigger optional onSignOut callback and ensure modal remains closed
    if (onSignOut) {
      onSignOut();
    }
    if (setIsAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-red-50 via-neutral-50 to-red-50 px-4 py-1.5 text-center text-xs font-medium text-neutral-700 flex items-center justify-center gap-2 border-b border-red-100">
        <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-sm shadow-red-300" />
        <span className="tracking-wide">{cmsContent?.topAnnouncementBar || 'BFL Coaching Portal MVP • Instant Access for Clients & Coaches'}</span>
        <button 
          onClick={() => onOpenCheckout?.('plan_elite')}
          className="underline font-bold text-red-700 hover:text-red-800 ml-2 cursor-pointer transition-colors"
        >
          View Coaching Tiers &rarr;
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentView('marketing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md shadow-red-200 group-hover:scale-105 transition-transform border border-red-400/30">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tighter text-neutral-900 font-display">BFL</span>
                <span className="text-red-600 font-extrabold text-2xl tracking-tighter font-display">FITNESS</span>
              </div>
              <p className="text-[10px] tracking-widest text-neutral-500 uppercase font-semibold -mt-1">
                Elite Coaching &bull; Science &bull; Results
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {(currentUser?.role === 'client' || currentUser?.role === 'admin' || currentUser?.role === 'coach') && (
            <nav className="hidden md:flex items-center gap-1.5">
              {currentUser?.role === 'client' && (
                <button
                  onClick={() => setCurrentView('client_portal')}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'client_portal' 
                      ? 'text-neutral-900 bg-neutral-100 border border-neutral-300/80 shadow-xs' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span>Client Portal</span>
                </button>
              )}

              {(currentUser?.role === 'coach' || currentUser?.role === 'admin') && (
                <button
                  onClick={() => setCurrentView('coach_portal')}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'coach_portal' 
                      ? 'text-neutral-900 bg-neutral-100 border border-neutral-300/80 shadow-xs' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <Dumbbell className="w-4 h-4 text-red-600" />
                  <span>Coach Portal</span>
                </button>
              )}

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin_manage_coaches')}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'admin_manage_coaches' 
                      ? 'text-neutral-900 bg-neutral-100 border border-neutral-300/80 shadow-xs' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>Admin Dashboard</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-700 border border-red-200 font-mono font-bold">
                    Admin
                  </span>
                </button>
              )}
            </nav>
          )}

          {/* User Controls & Profile */}
          <div className="hidden md:flex items-center gap-3">

            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Dropdown */}
                <NotificationDropdown
                  onNavigate={() => {
                    if (currentUser?.role === 'coach' || currentUser?.role === 'admin') {
                      setCurrentView('coach_portal');
                    } else {
                      setCurrentView('client_portal');
                    }
                  }}
                />

                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-300 overflow-hidden flex items-center justify-center">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <p className="text-xs font-bold text-neutral-900">{currentUser?.displayName}</p>
                    <span className="text-[10px] uppercase font-bold text-red-600">
                      {currentUser?.role === 'admin' 
                        ? 'Founder & Admin' 
                        : currentUser?.role === 'coach' 
                        ? 'Coach' 
                        : 'Active Client'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-300 hover:border-neutral-400 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-sm font-bold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3.5 py-2 text-sm font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                >
                  Register
                </button>
                <button
                  onClick={() => onOpenCheckout?.('plan_elite')}
                  className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm shadow-red-200 transition-all cursor-pointer flex items-center gap-1.5 border border-red-500/30"
                >
                  <CreditCard className="w-4 h-4" />
                  Join Coaching
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <NotificationDropdown
                onNavigate={() => {
                  if (currentUser?.role === 'coach' || currentUser?.role === 'admin') {
                    setCurrentView('coach_portal');
                  } else {
                    setCurrentView('client_portal');
                  }
                }}
              />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-neutral-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3">
          {currentUser?.role === 'client' && (
            <button
              onClick={() => {
                setCurrentView('client_portal');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer ${
                currentView === 'client_portal' ? 'bg-neutral-100 text-neutral-900 border border-neutral-300' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-red-600" />
              Client Coaching Portal
            </button>
          )}

          {(currentUser?.role === 'coach' || currentUser?.role === 'admin') && (
            <button
              onClick={() => {
                setCurrentView('coach_portal');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer ${
                currentView === 'coach_portal' ? 'bg-neutral-100 text-neutral-900 border border-neutral-300' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Dumbbell className="w-4 h-4 text-red-600" />
              Coach Portal
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => {
                setCurrentView('admin_manage_coaches');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer ${
                currentView === 'admin_manage_coaches' ? 'bg-neutral-100 text-neutral-900 border border-neutral-300' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              Manage Coaches (Admin Dashboard)
            </button>
          )}

          {user ? (
            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{currentUser?.displayName}</p>
                    <p className="text-[10px] text-red-600 uppercase font-bold">{currentUser?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-300 rounded-lg cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold rounded-lg text-xs text-center border border-neutral-300 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-white hover:bg-neutral-50 text-neutral-900 font-bold rounded-lg text-xs text-center border border-neutral-300 cursor-pointer"
                >
                  Register Client
                </button>
              </div>
              <button
                onClick={() => {
                  onOpenCheckout?.('plan_elite');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 font-bold text-white rounded-lg text-xs uppercase tracking-wider text-center shadow-md shadow-red-200 cursor-pointer border border-red-500/40"
              >
                Join BFL Coaching
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
