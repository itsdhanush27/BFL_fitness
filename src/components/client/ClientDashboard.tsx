import React, { useState } from 'react';
import { 
  Calendar, 
  Dumbbell, 
  Flame, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Activity, 
  Play, 
  Check, 
  ChevronRight, 
  FileText, 
  Camera, 
  Send, 
  Award,
  Sparkles,
  Info,
  Timer,
  Droplet,
  ExternalLink,
  ChevronDown,
  User as UserIcon,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFitnessData } from '../../context/FitnessDataContext';
import { RestTimer } from '../common/RestTimer';
import { WorkoutExercise } from '../../types';
import { ProgressAnalyticsView } from './ProgressAnalyticsView';
import { ClientProfileModal } from './ClientProfileModal';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    assignedWorkout, 
    nutritionPlan, 
    checkIns, 
    messages, 
    logWorkoutSet, 
    updateExerciseClientNotes, 
    completeWorkout, 
    submitWeeklyCheckIn, 
    sendChatMessage 
  } = useFitnessData();

  const [activeTab, setActiveTab] = useState<'schedule' | 'workout' | 'nutrition' | 'checkin' | 'chat' | 'progress'>('schedule');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  // Workout completion celebration state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [workoutRating, setWorkoutRating] = useState(5);
  const [workoutFeedback, setWorkoutFeedback] = useState('');
  
  // Weekly Check-in Form State
  const [checkInWeight, setCheckInWeight] = useState<number>(81.0);
  const [checkInAdherence, setCheckInAdherence] = useState<number>(9);
  const [checkInEnergy, setCheckInEnergy] = useState<number>(8);
  const [checkInSleep, setCheckInSleep] = useState<number>(7.5);
  const [checkInStress, setCheckInStress] = useState<number>(4);
  const [checkInHunger, setCheckInHunger] = useState<number>(5);
  const [checkInWaist, setCheckInWaist] = useState<number>(83.0);
  const [checkInWins, setCheckInWins] = useState<string>('');
  const [checkInSubmitted, setCheckInSubmitted] = useState(false);

  // Chat message state
  const [chatInput, setChatInput] = useState('');

  // Floating or active rest timer state
  const [showRestTimer, setShowRestTimer] = useState(true);

  const fallbackExercise: WorkoutExercise = {
    id: 'ex_fallback',
    exerciseName: 'Warm-up & Movement Prep',
    targetMuscle: 'Full Body',
    equipment: 'Bodyweight',
    coachNotes: 'Complete general movement prep before loading compound lifts.',
    clientNotes: '',
    videoUrl: 'https://youtube.com',
    restSeconds: 60,
    sets: [
      { setNumber: 1, targetReps: '10-12', actualWeightKg: 0, actualReps: 10, completed: false }
    ]
  };

  const workoutExercises = assignedWorkout?.exercises || [];
  const currentExercise = workoutExercises[activeExerciseIndex] || workoutExercises[0] || fallbackExercise;

  const totalSets = workoutExercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completedSets = workoutExercises.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.completed).length || 0), 0);
  const workoutProgressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    const targetExercise = workoutExercises[exIdx];
    if (!targetExercise) return;
    const targetSet = targetExercise.sets?.[setIdx];
    if (!targetSet) return;
    logWorkoutSet(
      exIdx,
      setIdx,
      targetSet.actualWeightKg,
      targetSet.actualReps,
      targetSet.actualRpe || 8,
      !targetSet.completed
    );
  };

  const handleFinishWorkout = () => {
    completeWorkout(workoutRating, workoutFeedback, 55);
    setShowCompletionModal(false);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitWeeklyCheckIn({
      clientId: user?.uid || 'client_alex',
      clientName: user?.displayName || 'Alex Rivera',
      weekNumber: checkIns.length + 1,
      weightKg: checkInWeight,
      adherenceRating: checkInAdherence,
      energyRating: checkInEnergy,
      sleepHours: checkInSleep,
      stressRating: checkInStress,
      hungerRating: checkInHunger,
      waistMeasurementCm: checkInWaist,
      winsAndStruggles: checkInWins || 'Hit all training targets, felt recovery was solid.'
    });
    setCheckInSubmitted(true);
    setTimeout(() => {
      setCheckInSubmitted(false);
      setActiveTab('schedule');
    }, 1500);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim(), 'coach_marcus');
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      {/* Top Client Header */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 p-0.5 shadow-md shadow-red-200">
              <img
                src={user?.photoURL || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'}
                alt={user?.displayName || 'Client'}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-neutral-900 uppercase font-display tracking-tight">
                  {user?.displayName || 'Alex Rivera'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                  Active Client
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                <span>Coach: <strong className="text-neutral-800">Marcus Vance</strong></span>
                <span>&bull;</span>
                <span>Plan: <strong className="text-red-600 font-semibold">1-on-1 Elite Coaching</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 hover:text-neutral-900 border border-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="View Account Profile & Subscription"
            >
              <UserIcon className="w-3.5 h-3.5 text-red-600" />
              <span>My Account</span>
            </button>
            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-center min-w-[95px] shadow-xs">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Weekly Target</span>
                <span className="text-base font-black text-neutral-900 font-mono">4 / 4 Days</span>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-center min-w-[95px] shadow-xs">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Calories</span>
                <span className="text-base font-black text-neutral-900 font-mono">{nutritionPlan.calories} kcal</span>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-center min-w-[95px] shadow-xs">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Next Check-In</span>
                <span className="text-base font-black text-red-600 font-mono">Sunday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-6 overflow-x-auto">
          {[
            { id: 'schedule', label: 'Daily Schedule', icon: Calendar },
            { id: 'workout', label: 'Workout Tracker', icon: Dumbbell, badge: assignedWorkout.isCompleted ? 'Done' : `${completedSets}/${totalSets}` },
            { id: 'progress', label: 'Progress & Graphs', icon: TrendingUp },
            { id: 'nutrition', label: 'Macros & Nutrition', icon: Flame },
            { id: 'checkin', label: 'Weekly Check-in', icon: Activity },
            { id: 'chat', label: 'Coach Messenger', icon: MessageSquare, badge: 'Direct' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-200'
                    : 'bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 border border-neutral-200 shadow-xs'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-red-600 font-bold'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 1. DAILY SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {/* Today's Hero Agenda Card */}
            <div className="bg-gradient-to-br from-white via-neutral-50 to-red-50/40 border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" /> Assigned for Today
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 uppercase font-display tracking-tight">
                    {assignedWorkout.title}
                  </h2>
                  <p className="text-sm text-neutral-600 max-w-2xl">
                    {assignedWorkout.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {assignedWorkout.isCompleted ? (
                    <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2 text-sm font-bold shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Workout Completed at {assignedWorkout.completedAt || 'Today'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveTab('workout')}
                      className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-200 cursor-pointer transition-transform hover:scale-102"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Workout ({completedSets}/{totalSets} Sets)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress meter */}
              <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs">
                  <p className="text-xs text-neutral-500 uppercase font-semibold">Exercise Count</p>
                  <p className="text-lg font-black text-neutral-900 font-mono">{workoutExercises.length} Exercises</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs">
                  <p className="text-xs text-neutral-500 uppercase font-semibold">Volume Target</p>
                  <p className="text-lg font-black text-neutral-900 font-mono">{totalSets} Total Working Sets</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs">
                  <p className="text-xs text-neutral-500 uppercase font-semibold">Estimated Duration</p>
                  <p className="text-lg font-black text-red-600 font-mono">55 - 65 Minutes</p>
                </div>
              </div>
            </div>

            {/* Daily Schedule Checklist (Workout, Nutrition, Check-in) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Today's Training */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      assignedWorkout.isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}>
                      {assignedWorkout.isCompleted ? 'Done' : 'Pending'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 uppercase font-display">Upper Hypertrophy</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Chest & Deltoid progressive overload. Log each set in real time with RPE.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('workout')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Open Workout</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2: Today's Nutrition */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-bold uppercase">
                      Target: {nutritionPlan.calories} kcal
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 uppercase font-display">Macro Adherence</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Protein: <strong className="text-neutral-800">{nutritionPlan.proteinGrams}g</strong> &bull; Carbs: <strong className="text-neutral-800">{nutritionPlan.carbsGrams}g</strong> &bull; Fats: <strong className="text-neutral-800">{nutritionPlan.fatGrams}g</strong>
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View Nutrition Plan</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 3: Weekly Check-In Alert */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase">
                      Weekly Biofeedback
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 uppercase font-display">Sunday Check-in</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Submit morning weight, tape measurements, and fatigue scores for coach video audit.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('checkin')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Submit Check-in</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. WORKOUT INTERFACE & TRACKING */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            {/* Header & completion trigger */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Active Session</span>
                <h2 className="text-2xl font-black text-neutral-900 uppercase font-display">
                  {assignedWorkout.title}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                  <span>Sets Completed: <strong className="text-neutral-900">{completedSets} / {totalSets}</strong></span>
                  <div className="w-32 bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${workoutProgressPercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCompletionModal(true)}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-200 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Mark Workout Complete</span>
                </button>
              </div>
            </div>

            {/* Inline Rest Timer */}
            <RestTimer inline initialSeconds={currentExercise.restSeconds || 90} />

            {/* Exercise Selector Horizontal Track */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {workoutExercises.map((ex, idx) => {
                const isSelected = activeExerciseIndex === idx;
                const completedInThisEx = (ex.sets || []).filter(s => s.completed).length;
                return (
                  <button
                    key={ex.id}
                    onClick={() => setActiveExerciseIndex(idx)}
                    className={`px-4 py-3 rounded-2xl text-left border shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-red-500 text-neutral-900 shadow-md ring-1 ring-red-500'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-red-600">
                        Ex {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-500">
                        {completedInThisEx}/{ex.sets?.length || 0}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-neutral-900 mt-1 max-w-[180px] truncate">
                      {ex.exerciseName}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Current Active Exercise Card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 mb-1">
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-mono">
                      Exercise {activeExerciseIndex + 1} of {workoutExercises.length}
                    </span>
                    <span>&bull;</span>
                    <span className="text-red-600 uppercase font-bold">{currentExercise.targetMuscle}</span>
                    <span>&bull;</span>
                    <span>Equipment: {currentExercise.equipment}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase font-display">
                    {currentExercise.exerciseName}
                  </h3>
                </div>

                {/* Video Demo Link */}
                {currentExercise.videoUrl && (
                  <a
                    href={currentExercise.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:border-red-500 transition-colors shrink-0 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-red-600" />
                    <span>View Form Cues & Video</span>
                  </a>
                )}
              </div>

              {/* Coach's specific biomechanical notes */}
              {currentExercise.coachNotes && (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
                  <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block mb-0.5">Coach's Technique Focus:</span>
                    {currentExercise.coachNotes}
                  </div>
                </div>
              )}

              {/* Set Logging Table with Historical Data */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-bold tracking-wider">
                      <th className="py-3 px-3">Set</th>
                      <th className="py-3 px-3 text-neutral-400">Previous Session</th>
                      <th className="py-3 px-3">Target Reps</th>
                      <th className="py-3 px-3">Weight (kg)</th>
                      <th className="py-3 px-3">Reps Completed</th>
                      <th className="py-3 px-3">RPE</th>
                      <th className="py-3 px-3 text-center">Complete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {currentExercise.sets.map((set, setIdx) => (
                      <tr 
                        key={setIdx}
                        className={`transition-colors ${set.completed ? 'bg-red-50/60' : 'hover:bg-neutral-50'}`}
                      >
                        <td className="py-3.5 px-3 font-bold text-neutral-900 font-mono">
                          #{set.setNumber}
                        </td>
                        <td className="py-3.5 px-3 text-neutral-500 font-mono text-xs">
                          {set.previousSession 
                            ? `${set.previousSession.weightKg}kg × ${set.previousSession.reps} @ RPE ${set.previousSession.rpe || 8}`
                            : 'First block'}
                        </td>
                        <td className="py-3.5 px-3 text-neutral-700 font-mono">
                          {set.targetReps}
                        </td>
                        <td className="py-3.5 px-3">
                          <input
                            type="number"
                            step="0.5"
                            value={set.actualWeightKg}
                            onChange={(e) => logWorkoutSet(
                              activeExerciseIndex,
                              setIdx,
                              Number(e.target.value),
                              set.actualReps,
                              set.actualRpe || 8,
                              set.completed
                            )}
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 font-mono text-sm focus:border-red-600 focus:outline-none"
                          />
                        </td>
                        <td className="py-3.5 px-3">
                          <input
                            type="number"
                            value={set.actualReps}
                            onChange={(e) => logWorkoutSet(
                              activeExerciseIndex,
                              setIdx,
                              set.actualWeightKg,
                              Number(e.target.value),
                              set.actualRpe || 8,
                              set.completed
                            )}
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 font-mono text-sm focus:border-red-600 focus:outline-none"
                          />
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={set.actualRpe || 8}
                            onChange={(e) => logWorkoutSet(
                              activeExerciseIndex,
                              setIdx,
                              set.actualWeightKg,
                              set.actualReps,
                              Number(e.target.value),
                              set.completed
                            )}
                            className="px-2 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 font-mono text-xs focus:border-red-600 focus:outline-none cursor-pointer"
                          >
                            <option value={7}>7 (3 reps left)</option>
                            <option value={7.5}>7.5</option>
                            <option value={8}>8 (2 reps left)</option>
                            <option value={8.5}>8.5</option>
                            <option value={9}>9 (1 rep left)</option>
                            <option value={9.5}>9.5</option>
                            <option value={10}>10 (Failure)</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSetComplete(activeExerciseIndex, setIdx)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-all cursor-pointer ${
                              set.completed
                                ? 'bg-red-600 text-white shadow-md shadow-red-200'
                                : 'bg-neutral-100 text-neutral-400 hover:text-neutral-700 border border-neutral-300'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Client Notes Box for feedback */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
                  Exercise Feedback & Joint Sensations (for Coach Review)
                </label>
                <textarea
                  rows={2}
                  value={currentExercise.clientNotes || ''}
                  onChange={(e) => updateExerciseClientNotes(activeExerciseIndex, e.target.value)}
                  placeholder="e.g. Right shoulder felt completely smooth at 34kg. Rest pause was 90 seconds."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-neutral-300 text-neutral-900 text-xs focus:border-red-600 focus:outline-none resize-none placeholder:text-neutral-400"
                />
              </div>

              {/* Exercise Navigation footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <button
                  disabled={activeExerciseIndex === 0}
                  onClick={() => setActiveExerciseIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-700 disabled:opacity-30 cursor-pointer transition-colors"
                >
                  Previous Exercise
                </button>

                <button
                  disabled={activeExerciseIndex === assignedWorkout.exercises.length - 1}
                  onClick={() => setActiveExerciseIndex(prev => Math.min(assignedWorkout.exercises.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-30 cursor-pointer shadow-md shadow-red-200 transition-colors"
                >
                  Next Exercise &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. MACROS & NUTRITION VIEW */}
        {activeTab === 'nutrition' && (
          <div className="space-y-8">
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Metabolic Targets</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase font-display">
                    Daily Nutrition & Macronutrient Prescription
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Prescribed by Coach Marcus Vance &bull; Last updated {nutritionPlan.updatedAt}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-neutral-900 font-mono">{nutritionPlan.calories}</span>
                  <span className="text-xs text-neutral-500 block font-semibold">Total Caloric Ceiling</span>
                </div>
              </div>

              {/* Macro Bars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Protein (4 kcal/g)</span>
                    <span className="text-xl font-black text-neutral-900 font-mono">{nutritionPlan.proteinGrams}g</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full w-[85%]" />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    Targets 2.4g/kg of lean body mass for maximal muscle protein synthesis.
                  </p>
                </div>

                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Carbohydrates</span>
                    <span className="text-xl font-black text-neutral-900 font-mono">{nutritionPlan.carbsGrams}g</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[70%]" />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    Focus ~60g before training and ~60g post-workout for glycogen replenishment.
                  </p>
                </div>

                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Fats (9 kcal/g)</span>
                    <span className="text-xl font-black text-neutral-900 font-mono">{nutritionPlan.fatGrams}g</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[60%]" />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    Essential fatty acids for endocrine health, testosterone, and joint mobility.
                  </p>
                </div>
              </div>

              {/* Water & Hydration Card */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between mb-8 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 uppercase">Daily Hydration Baseline</h4>
                    <p className="text-xs text-neutral-500">Essential for intramuscular hydration and creatine absorption.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-neutral-900 font-mono">{nutritionPlan.waterLiters} Liters</span>
                </div>
              </div>

              {/* Coach Guidelines & Supplement Protocols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
                    Meal Timing & Satiety Notes
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    {nutritionPlan.dailyNotes}
                  </p>
                </div>

                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
                    Supplement Protocol
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-700">
                    {nutritionPlan.supplementGuide.map((sup, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-red-600" />
                        <span>{sup}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. WEEKLY CHECK-IN FORM & HISTORY */}
        {activeTab === 'checkin' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Submission */}
              <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="mb-6">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Weekly Accountability</span>
                  <h2 className="text-2xl font-black text-neutral-900 uppercase font-display">
                    Submit Week {checkIns.length + 1} Check-In
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Coach Marcus uses this data to adjust your calories and training volume for the upcoming microcycle.
                  </p>
                </div>

                {checkInSubmitted ? (
                  <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-red-600 mx-auto animate-pulse" />
                    <h3 className="text-xl font-bold text-neutral-900 uppercase">Check-in Transmitted!</h3>
                    <p className="text-xs text-neutral-600">
                      Your metrics and notes have been logged for review. Coach Marcus will publish feedback within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleCheckInSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Morning Body Weight (kg) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={checkInWeight}
                          onChange={(e) => setCheckInWeight(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 font-mono text-sm focus:border-red-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Waist Measurement (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={checkInWaist}
                          onChange={(e) => setCheckInWaist(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 font-mono text-sm focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Nutrition Adherence (1-10)
                        </label>
                        <select
                          value={checkInAdherence}
                          onChange={(e) => setCheckInAdherence(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-xs focus:border-red-600 focus:outline-none cursor-pointer"
                        >
                          {[10, 9, 8, 7, 6, 5, 4, 3].map(n => (
                            <option key={n} value={n}>{n} / 10 {n >= 9 ? '(100% On Track)' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Average Sleep (Hours / Night)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={checkInSleep}
                          onChange={(e) => setCheckInSleep(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-900 font-mono text-xs focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Gym Energy & Drive (1-10)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={checkInEnergy}
                          onChange={(e) => setCheckInEnergy(Number(e.target.value))}
                          className="w-full accent-red-600"
                        />
                        <span className="text-xs text-neutral-500 block text-right font-mono">{checkInEnergy} / 10</span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Life Stress Level (1-10)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={checkInStress}
                          onChange={(e) => setCheckInStress(Number(e.target.value))}
                          className="w-full accent-red-600"
                        />
                        <span className="text-xs text-neutral-500 block text-right font-mono">{checkInStress} / 10</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Weekly Wins, Lift Progressions & Roadblocks
                      </label>
                      <textarea
                        rows={3}
                        value={checkInWins}
                        onChange={(e) => setCheckInWins(e.target.value)}
                        placeholder="Describe how strength felt on squats, any social dining events navigated, digestion notes, etc..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-xs focus:border-red-600 focus:outline-none resize-none placeholder:text-neutral-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-red-200 cursor-pointer transition-all"
                    >
                      Submit Weekly Check-In Form
                    </button>
                  </form>
                )}
              </div>

              {/* History & Coach Responses */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-lg font-black text-neutral-900 uppercase font-display">
                  Check-In History & Feedback
                </h3>

                {checkIns.map((ci) => (
                  <div key={ci.id} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-xs font-bold font-mono">
                        Week #{ci.weekNumber}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">{ci.submissionDate}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                        <span className="text-[10px] text-neutral-500 block">Weight</span>
                        <strong className="text-neutral-900 font-mono">{ci.weightKg} kg</strong>
                      </div>
                      <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                        <span className="text-[10px] text-neutral-500 block">Adherence</span>
                        <strong className="text-red-600 font-mono">{ci.adherenceRating}/10</strong>
                      </div>
                      <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                        <span className="text-[10px] text-neutral-500 block">Waist</span>
                        <strong className="text-neutral-900 font-mono">{ci.waistMeasurementCm || '--'} cm</strong>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 italic">
                      &ldquo;{ci.winsAndStruggles}&rdquo;
                    </p>

                    {ci.coachFeedback ? (
                      <div className="mt-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-red-600 uppercase tracking-wider text-[10px]">
                          <Award className="w-3.5 h-3.5" /> Coach Marcus Response:
                        </div>
                        <p className="text-neutral-800 leading-relaxed">{ci.coachFeedback}</p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Coach Review
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. DIRECT COACH MESSENGER */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[640px]">
            {/* Messenger Header */}
            <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-neutral-200">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                    alt="Coach Marcus"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 uppercase font-display">Coach Marcus Vance</h3>
                  <p className="text-[11px] text-neutral-500">Coach &bull; Online (Response &lt; 4h)</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                Direct 1-on-1 Channel
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
              {messages.map((msg) => {
                const isMe = msg.senderRole === 'client';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-neutral-500">{msg.senderName}</span>
                      <span className="text-[10px] text-neutral-400">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-red-600 text-white rounded-br-none shadow-sm'
                          : 'bg-neutral-100 text-neutral-800 rounded-bl-none border border-neutral-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask coach regarding exercise form, swap requests, or nutrition tweaks..."
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-xs sm:text-sm focus:border-red-600 focus:outline-none placeholder:text-neutral-400"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-200 cursor-pointer transition-all"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 6. PROGRESS & BIOMETRIC ANALYTICS */}
        {activeTab === 'progress' && (
          <ProgressAnalyticsView clientId={user?.uid} />
        )}
      </main>

      {/* Floating Rest Timer for quick access while working out */}
      {showRestTimer && activeTab === 'workout' && (
        <RestTimer initialSeconds={currentExercise.restSeconds || 90} />
      )}

      {/* Client Profile & Subscription Modal */}
      <ClientProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Workout Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-500 text-red-600 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-neutral-900 uppercase font-display">
              Session Concluded!
            </h3>
            <p className="text-xs text-neutral-500">
              Great job Alex! You completed {completedSets} working sets on {assignedWorkout.title}.
            </p>

            <div className="text-left space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  How did today's session feel? (Rating)
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setWorkoutRating(star)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold border cursor-pointer transition-colors ${
                        workoutRating >= star
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  General Session Feedback
                </label>
                <textarea
                  rows={2}
                  value={workoutFeedback}
                  onChange={(e) => setWorkoutFeedback(e.target.value)}
                  placeholder="e.g. Pump was great on incline DB bench, hit all prescribed reps."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-xs focus:border-red-600 focus:outline-none resize-none placeholder:text-neutral-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishWorkout}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-red-200 transition-all"
            >
              Log to Training History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
