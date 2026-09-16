import React from 'react';
import { ArrowRight, CheckCircle2, Flame, Award, Users, TrendingUp, Sparkles } from 'lucide-react';
import { useFitnessData } from '../../context/FitnessDataContext';

interface HeroSectionProps {
  onApply: (planId?: string) => void;
  onExplorePlans: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onApply, onExplorePlans }) => {
  const { cmsContent } = useFitnessData();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-neutral-50 to-white pt-12 pb-24 border-b border-neutral-200">
      {/* Background athletic red glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -top-10 right-0 w-[300px] h-[300px] bg-red-700/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Urgent Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold tracking-wide shadow-sm">
            <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" />
            <span>{cmsContent.bannerNotice}</span>
          </div>
        </div>

        {/* Hero Title & High-Conversion Copy */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-neutral-900 leading-[1.08] font-display uppercase">
            {(cmsContent.heroHeadline || '').includes('.') ? (
              cmsContent.heroHeadline.split('.').map((chunk, i) => {
                const trimmed = chunk.trim();
                if (!trimmed) return null;
                return (
                  <span key={i} className={i % 2 === 1 ? 'text-red-600 block' : 'block'}>
                    {trimmed}.
                  </span>
                );
              })
            ) : (
              <span>{cmsContent.heroHeadline}</span>
            )}
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
            {cmsContent.heroSubheadline}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onApply('plan_elite')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base tracking-wide uppercase shadow-md shadow-red-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer border border-red-500/40"
            >
              <span>Apply for 1-on-1 Coaching</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onExplorePlans}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-bold text-base tracking-wide shadow-xs transition-all cursor-pointer"
            >
              Explore Coaching Plans
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-600 font-medium">
            {(cmsContent.heroTrustPoints || [
              'Bespoke Macro Programming',
              'Weekly Video Lift Audits',
              'In-App Progressive Overload'
            ]).map((pt, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>{pt}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {(cmsContent.heroStats || [
            { count: '500+', label: 'Transformations Completed' },
            { count: '98.4%', label: 'Goal Adherence Rate' },
            { count: '12+ Yrs', label: 'Evidence-Based Coaching' },
            { count: '100%', label: 'Personalized Plans' }
          ]).map((stat, i) => {
            const icons = [Users, TrendingUp, Award, Sparkles];
            const Icon = icons[i % icons.length];
            return (
              <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 text-center shadow-xs hover:border-neutral-300 transition-colors">
                <Icon className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-3xl font-black text-neutral-900 font-display">{stat.count}</div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
