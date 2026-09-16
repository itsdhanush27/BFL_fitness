import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Dumbbell, 
  Zap, 
  BookOpen, 
  HeartPulse, 
  ArrowRight, 
  Flame, 
  Crosshair, 
  Sparkles,
  Camera
} from 'lucide-react';
import { useFitnessData } from '../../context/FitnessDataContext';
import massStageImg from '../../assets/founders/mass-stage.png';
import massGymImg from '../../assets/founders/mass-gym.jpg';
import pouyaPowerliftingImg from '../../assets/founders/pouya-powerlifting.jpg';
import pouyaBoxingImg from '../../assets/founders/pouya-boxing.jpg';

export interface AboutCoachProps {
  onExplorePlans?: () => void;
  onApply?: () => void;
  massImage1?: string;
  massImage2?: string;
  pouyaImage1?: string;
  pouyaImage2?: string;
}

export const AboutCoach: React.FC<AboutCoachProps> = ({
  onExplorePlans,
  onApply,
  massImage1,
  massImage2,
  pouyaImage1,
  pouyaImage2
}) => {
  const { cmsContent } = useFitnessData();

  // Photo tab toggle states (0 = photo 1, 1 = photo 2)
  const [massPhotoIdx, setMassPhotoIdx] = useState(0);
  const [pouyaPhotoIdx, setPouyaPhotoIdx] = useState(0);

  // Fallback states in case custom local paths fail to load
  const [massImgError, setMassImgError] = useState<Record<number, boolean>>({});
  const [pouyaImgError, setPouyaImgError] = useState<Record<number, boolean>>({});

  const handleScrollToPlans = () => {
    if (onExplorePlans) {
      onExplorePlans();
    } else {
      const el = document.getElementById('plans');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplyClick = () => {
    if (onApply) {
      onApply();
    } else {
      handleScrollToPlans();
    }
  };

  // Mass Narimanian Photo Configurations
  const massPhotos = [
    {
      id: 'mass-photo-1',
      label: 'Stage Conditioning',
      subtitle: 'Australian Posing School • Stage Posing #33',
      src: massImage1 || massStageImg || '/assets/founders/mass-stage.png',
      objectPosition: 'object-[center_20%]',
      fallback: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80'
    },
    {
      id: 'mass-photo-2',
      label: 'Gym Hypertrophy',
      subtitle: 'Peak Hypertrophy & Muscularity',
      src: massImage2 || massGymImg || '/assets/founders/mass-gym.jpg',
      objectPosition: 'object-top',
      fallback: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&auto=format&fit=crop&q=80'
    }
  ];

  // Pouya Marghzari Photo Configurations
  const pouyaPhotos = [
    {
      id: 'pouya-photo-1',
      label: 'Powerlifting & Strength',
      subtitle: 'Barbell Deadlift Mechanics & Raw Strength',
      src: pouyaImage1 || pouyaPowerliftingImg || '/assets/founders/pouya-powerlifting.jpg',
      objectPosition: 'object-top',
      fallback: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80'
    },
    {
      id: 'pouya-photo-2',
      label: 'Boxing & Conditioning',
      subtitle: 'Competitive Boxing & High-Performance Conditioning',
      src: pouyaImage2 || pouyaBoxingImg || '/assets/founders/pouya-boxing.jpg',
      objectPosition: 'object-top',
      fallback: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&auto=format&fit=crop&q=80'
    }
  ];

  const currentMassPhoto = massPhotos[massPhotoIdx];
  const massDisplaySrc = massImgError[massPhotoIdx] ? currentMassPhoto.fallback : currentMassPhoto.src;

  const currentPouyaPhoto = pouyaPhotos[pouyaPhotoIdx];
  const pouyaDisplaySrc = pouyaImgError[pouyaPhotoIdx] ? currentPouyaPhoto.fallback : currentPouyaPhoto.src;

  return (
    <section 
      id="about" 
      className="py-24 bg-neutral-950 text-white border-b border-neutral-800 relative overflow-hidden"
    >
      {/* Background radial glow accents for depth */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-widest shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Meet The Founders</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase font-display tracking-tight text-white">
            {cmsContent.foundersHeadline || 'Built by Athletes. Engineered for Results.'}
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            {cmsContent.foundersSubheadline || 'BFL Fitness was founded on a singular standard: elite, stage-proven experience translated into scientifically calibrated biomechanical programming and metabolic precision.'}
          </p>
        </div>

        {/* Dual-Bio Alternating Zig-Zag Layout */}
        <div className="space-y-20 lg:space-y-28">

          {/* BIO 1: Mass Narimanian (Desktop: Image Left, Text Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Mass Image Block */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative group">
                {/* Thin red accent border and ambient shadow */}
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-red-600/40 bg-neutral-900 shadow-2xl shadow-black/80">
                  <img
                    src={massDisplaySrc}
                    alt="Mass Narimanian - Founder & Coach"
                    onError={() => {
                      setMassImgError(prev => ({ ...prev, [massPhotoIdx]: true }));
                    }}
                    className={`w-full h-[420px] sm:h-[490px] lg:h-[530px] object-cover ${currentMassPhoto.objectPosition || 'object-center'} transition-transform duration-700 group-hover:scale-105`}
                  />
                  
                  {/* Subtle dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent pointer-events-none" />

                  {/* Top Badge overlay */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-neutral-950/85 backdrop-blur-md text-neutral-200 border border-neutral-800 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      {cmsContent.massFounder?.badge || '15+ Years Elite Experience'}
                    </span>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-5 left-5 right-5 z-10 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-widest rounded shadow-sm">
                        Founder & Coach
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                      {cmsContent.massFounder?.title || 'Mass Narimanian'}
                    </h3>
                    <p className="text-xs text-neutral-300 font-medium">
                      {currentMassPhoto.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Switcher Selector (Image 1 & Image 2) */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-900/90 border border-neutral-800">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider pl-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-red-500" />
                  <span>Gallery</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {massPhotos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      onClick={() => setMassPhotoIdx(idx)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        massPhotoIdx === idx
                          ? 'bg-red-600 text-white shadow-sm shadow-red-900/40'
                          : 'bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      Photo {idx + 1} &bull; {idx === 0 ? 'Stage' : 'Gym'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mass Content Block */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-600/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-red-500" />
                <span>Founder & Coach</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase font-display tracking-tight">
                  {cmsContent.massFounder?.title || 'Mass Narimanian'}
                </h3>
                <p className="text-sm sm:text-base font-bold text-red-500 uppercase tracking-wider">
                  {cmsContent.massFounder?.subtitle || 'Founder & Coach • Hypertrophy & Stage Conditioning Specialist'}
                </p>
              </div>

              {/* DYNAMIC CMS FOUNDER COPY */}
              <div className="relative pl-5 border-l-2 border-red-600">
                <p className="text-base sm:text-lg text-neutral-200 leading-relaxed font-normal">
                  "{cmsContent.massFounder?.quote || 'With over 15 years of elite experience in the bodybuilding industry, Mass brings unparalleled expertise in muscle hypertrophy, stage conditioning, and elite body transformation. His hands-on experience on the stage translates to scientifically proven, results-driven programming for his clients.'}"
                </p>
              </div>

              {/* Core Pillars / Specialties */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {(cmsContent.massFounder?.pillars || [
                  { title: 'Muscle Hypertrophy', desc: 'Biomechanically optimized stimulus-to-fatigue programming.' },
                  { title: 'Stage Conditioning', desc: 'Peaking protocols, water manipulation & competition readiness.' },
                  { title: 'Body Transformation', desc: 'Proven physique rebuilding for athletes and executive clients.' }
                ]).map((pillar, pIdx) => {
                  const icons = [Crosshair, Flame, ShieldCheck];
                  const Icon = icons[pIdx % icons.length];
                  return (
                    <div key={pIdx} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-xs mb-2">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wider">{pillar.title}</h4>
                      <p className="text-[11px] text-neutral-400">{pillar.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleApplyClick}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <span>Train with Mass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleScrollToPlans}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  <span>View Programs</span>
                </button>
              </div>
            </div>
          </div>

          {/* BIO 2: Pouya Marghzari (Desktop: Text Left, Image Right - Alternating Zig-Zag) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Pouya Content Block (On desktop renders first on left via order-2 lg:order-1) */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-600/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-red-500" />
                <span>Founder & Coach</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase font-display tracking-tight">
                  {cmsContent.pouyaFounder?.title || 'Pouya Marghzari'}
                </h3>
                <p className="text-sm sm:text-base font-bold text-red-500 uppercase tracking-wider">
                  {cmsContent.pouyaFounder?.subtitle || 'Founder & Coach • Boxing & Powerlifting Specialist'}
                </p>
              </div>

              {/* DYNAMIC CMS FOUNDER COPY */}
              <div className="relative pl-5 border-l-2 border-red-600">
                <p className="text-base sm:text-lg text-neutral-200 leading-relaxed font-normal">
                  "{cmsContent.pouyaFounder?.quote || 'Bringing over 10 years of competitive experience in boxing and powerlifting, Pouya specializes in explosive power, raw strength mechanics, and high-performance athletic conditioning. His diverse competitive background provides clients with a unique, highly effective approach to achieving peak physical fitness.'}"
                </p>
              </div>

              {/* Core Pillars / Specialties */}
              {/* Core Pillars / Specialties */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {(cmsContent.pouyaFounder?.pillars || [
                  { title: 'Explosive Power', desc: 'Rotational force production & rapid rate of force development.' },
                  { title: 'Raw Strength Mechanics', desc: 'Powerlifting barbell technique, bracing & joint-friendly loading.' },
                  { title: 'Athletic Conditioning', desc: 'High-capacity energy systems for boxers, fighters & power athletes.' }
                ]).map((pillar, pIdx) => {
                  const icons = [Zap, Dumbbell, HeartPulse];
                  const Icon = icons[pIdx % icons.length];
                  return (
                    <div key={pIdx} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-xs mb-2">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wider">{pillar.title}</h4>
                      <p className="text-[11px] text-neutral-400">{pillar.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleApplyClick}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <span>Train with Pouya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleScrollToPlans}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  <span>View Programs</span>
                </button>
              </div>
            </div>

            {/* Pouya Image Block (On desktop renders second on right via order-1 lg:order-2) */}
            <div className="lg:col-span-5 space-y-3 order-1 lg:order-2">
              <div className="relative group">
                {/* Thin red accent border and ambient shadow */}
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-red-600/40 bg-neutral-900 shadow-2xl shadow-black/80">
                  <img
                    src={pouyaDisplaySrc}
                    alt="Pouya Marghzari - Founder & Coach"
                    onError={() => {
                      setPouyaImgError(prev => ({ ...prev, [pouyaPhotoIdx]: true }));
                    }}
                    className={`w-full h-[420px] sm:h-[490px] lg:h-[530px] object-cover ${currentPouyaPhoto.objectPosition || 'object-center'} transition-transform duration-700 group-hover:scale-105`}
                  />
                  
                  {/* Subtle dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent pointer-events-none" />

                  {/* Top Badge overlay */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-neutral-950/85 backdrop-blur-md text-neutral-200 border border-neutral-800 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Zap className="w-3.5 h-3.5 text-red-500" />
                      {cmsContent.pouyaFounder?.badge || '10+ Years Competitive Boxing & Powerlifting'}
                    </span>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-5 left-5 right-5 z-10 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-widest rounded shadow-sm">
                        Founder & Coach
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                      {cmsContent.pouyaFounder?.title || 'Pouya Marghzari'}
                    </h3>
                    <p className="text-xs text-neutral-300 font-medium">
                      {currentPouyaPhoto.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Switcher Selector (Image 3 & Image 4) */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-900/90 border border-neutral-800">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider pl-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-red-500" />
                  <span>Gallery</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {pouyaPhotos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      onClick={() => setPouyaPhotoIdx(idx)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        pouyaPhotoIdx === idx
                          ? 'bg-red-600 text-white shadow-sm shadow-red-900/40'
                          : 'bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      Photo {idx + 1} &bull; {idx === 0 ? 'Strength' : 'Boxing'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 4 Pillars of Coaching Architecture (Dark & Red theme) */}
        <div className="mt-24 pt-16 border-t border-neutral-800/80">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display tracking-tight">
              Our 4 Pillars of Coaching Architecture
            </h3>
            <p className="text-sm text-neutral-400">
              Every workout program, mechanical cue, and nutrition target is derived from these scientific cornerstones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cmsContent.trainingMethodologies.map((method, i) => {
              const icons = [Dumbbell, Zap, HeartPulse, BookOpen];
              const Icon = icons[i % icons.length];
              return (
                <div 
                  key={i} 
                  className="bg-neutral-900/90 border border-neutral-800 p-6 rounded-2xl space-y-3 hover:border-red-600/50 shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white uppercase font-display tracking-tight">
                    {method.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {method.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action (CTA) Section */}
        <div className="mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 to-black border border-red-600/30 p-8 sm:p-14 text-center shadow-2xl shadow-red-950/20">
            {/* Subtle top red line indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                <span>{cmsContent.founderApplicationsNotice || 'Limited Coaching Roster • Applications Open'}</span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-black text-white uppercase font-display tracking-tight">
                Work Directly with <span className="text-red-500">Mass & Pouya</span>
              </h3>

              <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                Whether you need maximum hypertrophy, elite body transformation, or explosive athletic conditioning — get custom programming calibrated specifically for your physiology.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  id="work-with-coaches-btn"
                  onClick={handleApplyClick}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-900/40 flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-105"
                >
                  <span>Work With Our Coaches</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="explore-tiers-btn"
                  onClick={handleScrollToPlans}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 font-bold text-sm uppercase tracking-wider cursor-pointer transition-colors"
                >
                  <span>Explore Coaching Tiers</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>Direct 1-on-1 Founder Oversight</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>Custom Biomechanical Programming</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>Weekly Video Form Audits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

