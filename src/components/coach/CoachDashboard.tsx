import React, { useState } from 'react';
import { 
  Users, 
  Dumbbell, 
  CheckSquare, 
  MessageSquare, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  Award, 
  Send, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Edit, 
  Save, 
  Flame, 
  ShieldAlert,
  ArrowRight,
  FileText,
  UserCheck,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Lock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFitnessData, getDaysRemaining, isPlanExpired } from '../../context/FitnessDataContext';
import { WorkoutSession, WorkoutExercise, IntakeFormData, NutritionPlan, ClientRosterItem, ChatMessage, WeeklyCheckIn } from '../../types';
import { ProgressAnalyticsView } from '../client/ProgressAnalyticsView';
import { CoachTeamManagement } from './CoachTeamManagement';
import { CMSEditor } from '../admin/CMSEditor';
import { 
  subscribeToClientNutrition, 
  subscribeToMessages, 
  subscribeToClientCheckIns,
  subscribeToAthleteWorkouts
} from '../../services/firestoreService';

interface CoachDashboardProps {
  onNavigateToManageCoaches?: () => void;
  initialAdminMode?: 'admin' | 'coach';
  initialTab?: 'clients' | 'builder' | 'checkins' | 'intakes' | 'chat' | 'cms' | 'team' | 'progress';
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ 
  onNavigateToManageCoaches,
  initialAdminMode = 'admin',
  initialTab = 'clients'
}) => {
  const { user, currentUser } = useAuth();
  const fitnessData = useFitnessData();

  const clients = fitnessData?.clients || [];
  const coaches = fitnessData?.coaches || [];
  const intakeForms = fitnessData?.intakeForms || [];
  const intakeSubmissions = fitnessData?.intakeSubmissions ?? [];
  const updateIntakeStatus = fitnessData?.updateIntakeStatus;
  const checkIns = fitnessData?.checkIns || [];
  const messages = fitnessData?.messages || [];
  const nutritionPlan = fitnessData?.nutritionPlan;
  const cmsContent = fitnessData?.cmsContent;
  const sendChatMessage = fitnessData?.sendChatMessage;
  const respondToCheckIn = fitnessData?.respondToCheckIn || fitnessData?.provideCoachFeedback;
  const updateNutritionPlan = fitnessData?.updateNutritionPlan;
  const updateCMSContent = fitnessData?.updateCMSContent || fitnessData?.updateCMS;
  const assignWorkoutToClient = fitnessData?.assignWorkoutToClient;
  const assignCoachToClient = fitnessData?.assignCoachToClient;
  const submitIntakeForm = fitnessData?.submitIntakeForm;
  const approveAndInitializeClientPlan = fitnessData?.approveAndInitializeClientPlan;
  const setClientPlanExpired = fitnessData?.setClientPlanExpired;

  const [activeTab, setActiveTab] = useState<'clients' | 'builder' | 'checkins' | 'intakes' | 'chat' | 'cms' | 'team' | 'progress'>(initialTab);

  // Selected Client for detail viewing
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [clientSearch, setClientSearch] = useState('');

  // Program Builder State
  const [builderWorkoutTitle, setBuilderWorkoutTitle] = useState('');
  const [builderWorkoutDesc, setBuilderWorkoutDesc] = useState('');
  const [builderExercises, setBuilderExercises] = useState<WorkoutExercise[]>([]);
  const [programAssignedSuccess, setProgramAssignedSuccess] = useState(false);

  // Nutrition Builder Form State
  const [nutriCalories, setNutriCalories] = useState<number | ''>('');
  const [nutriProtein, setNutriProtein] = useState<number | ''>('');
  const [nutriCarbs, setNutriCarbs] = useState<number | ''>('');
  const [nutriFat, setNutriFat] = useState<number | ''>('');
  const [nutriWater, setNutriWater] = useState<number | ''>('');
  const [nutriNotes, setNutriNotes] = useState('');
  const [nutritionSaved, setNutritionSaved] = useState(false);

  // Check-In Response State
  const [activeCheckInId, setActiveCheckInId] = useState<string>(checkIns[0]?.id || '');
  const [coachFeedbackText, setCoachFeedbackText] = useState('');
  const [feedbackSentAlert, setFeedbackSentAlert] = useState(false);

  // Chat message state
  const [coachChatInput, setCoachChatInput] = useState('');

  // CMS Editor State
  const [cmsHeroHeadline, setCmsHeroHeadline] = useState(cmsContent?.heroHeadline ?? '');
  const [cmsHeroSubheadline, setCmsHeroSubheadline] = useState(cmsContent?.heroSubheadline ?? '');
  const [cmsBannerNotice, setCmsBannerNotice] = useState(cmsContent?.bannerNotice ?? '');
  const [cmsSaved, setCmsSaved] = useState(false);

  // Nutrition & Messenger real-time state per selected client
  const [clientNutritionPlan, setClientNutritionPlan] = useState<NutritionPlan | null>(null);
  const [coachClientMessages, setCoachClientMessages] = useState<ChatMessage[]>([]);
  const [firestoreCheckIns, setFirestoreCheckIns] = useState<WeeklyCheckIn[]>([]);
  const [isCheckInsLoaded, setIsCheckInsLoaded] = useState(false);
  const [checkInFilter, setCheckInFilter] = useState<'all' | 'selected'>('all');

  const fallbackClient: ClientRosterItem = {
    id: '',
    name: 'Awaiting Athletes',
    email: 'clients@bflfitness.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    status: 'pending',
    planName: '1-on-1 Elite Coaching',
    adherenceRate: 100,
    joinedDate: 'Today',
    primaryGoal: 'Pending Intake',
    startingWeightKg: 0,
    currentWeightKg: 0,
    targetWeightKg: 0,
    injuryNotes: 'No clients assigned yet.',
    daysPerWeek: 0,
    availableEquipment: []
  };

  const formatGoal = (goal?: string) => {
    if (!goal) return 'Custom Protocol';
    return goal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const currentUserId = currentUser?.id || currentUser?.uid || user?.id || user?.uid;
  const userRole = currentUser?.role || user?.role || 'coach';

  // Toggle state for Admins: switch between 'Admin Dashboard' (managing all staff/clients)
  // and personal 'Coach Dashboard' (managing only their assigned clients).
  const [adminDashboardMode, setAdminDashboardMode] = useState<'admin' | 'coach'>(() => {
    if (userRole === 'coach') return 'coach';
    return initialAdminMode;
  });

  // Synchronize state if initialAdminMode prop changes or role changes
  React.useEffect(() => {
    if (userRole === 'coach') {
      setAdminDashboardMode('coach');
    } else if (initialAdminMode) {
      setAdminDashboardMode(initialAdminMode);
    }
  }, [initialAdminMode, userRole]);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Fallback Handling: if activeTab is 'team' (Coaches & Staff) and mode is 'coach',
  // reset activeTab to 'clients' (Client Management Table / My Athletes)
  React.useEffect(() => {
    if (adminDashboardMode === 'coach' && activeTab === 'team') {
      setActiveTab('clients');
    }
  }, [adminDashboardMode, activeTab]);

  // Determine if active view is personal coach view (either coach role OR admin in coach view mode)
  const isPersonalCoachView = userRole === 'coach' || (userRole === 'admin' && adminDashboardMode === 'coach');

  // Role & Mode-based client filtering:
  // If in personal coach view (either coach role or admin switched to personal coach view),
  // only display clients where client.coachId === currentUserId
  // If in admin dashboard mode, display all clients in the system
  const visibleClients = React.useMemo(() => {
    return clients.filter((c) => {
      if (isPersonalCoachView) {
        const clientCoachId = c.coachId || c.assignedCoachId;
        return clientCoachId === currentUserId;
      }
      return true; // admin sees all
    });
  }, [clients, isPersonalCoachView, currentUserId]);

  const filteredClients = React.useMemo(() => {
    const q = clientSearch.toLowerCase();
    return visibleClients.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.planName || '').toLowerCase().includes(q)
    );
  }, [visibleClients, clientSearch]);

  const visibleClientIds = React.useMemo(() => visibleClients.map((c) => c.id).join(','), [visibleClients]);

  React.useEffect(() => {
    if (visibleClients.length > 0) {
      if (!selectedClientId || !visibleClients.some((c) => c.id === selectedClientId)) {
        setSelectedClientId(visibleClients[0].id);
      }
    } else if (selectedClientId) {
      setSelectedClientId('');
    }
  }, [visibleClientIds]);

  const selectedClient = visibleClients.find((c) => c.id === selectedClientId) || visibleClients[0] || fallbackClient;

  // Dynamically resolve actual onboarding intake submission for selected client
  const clientIntake = React.useMemo(() => {
    if (!selectedClient?.id && !selectedClient?.email) return null;
    const all = intakeForms.length > 0 ? intakeForms : intakeSubmissions;
    return (
      all.find((i) => {
        if (selectedClient.id && i.clientId === selectedClient.id) return true;
        if (selectedClient.email && i.clientEmail && i.clientEmail.toLowerCase() === selectedClient.email.toLowerCase()) return true;
        return false;
      }) || null
    );
  }, [selectedClient, intakeForms, intakeSubmissions]);

  // Real-time Firestore Nutrition subscription for the selected client
  React.useEffect(() => {
    if (!selectedClient?.id) {
      setClientNutritionPlan(null);
      setNutriCalories('');
      setNutriProtein('');
      setNutriCarbs('');
      setNutriFat('');
      setNutriWater('');
      setNutriNotes('');
      return;
    }
    const unsub = subscribeToClientNutrition(selectedClient.id, (plan) => {
      setClientNutritionPlan(plan);
      if (plan) {
        setNutriCalories(plan.calories || '');
        setNutriProtein(plan.proteinGrams || '');
        setNutriCarbs(plan.carbsGrams || '');
        setNutriFat(plan.fatGrams || '');
        setNutriWater(plan.waterLiters || '');
        setNutriNotes(plan.dailyNotes || '');
      } else {
        setNutriCalories('');
        setNutriProtein('');
        setNutriCarbs('');
        setNutriFat('');
        setNutriWater('');
        setNutriNotes('');
      }
    });
    return () => unsub();
  }, [selectedClient?.id]);

  // Real-time Firestore Workout subscription for the selected client
  React.useEffect(() => {
    if (!selectedClient?.id) {
      setBuilderWorkoutTitle('');
      setBuilderWorkoutDesc('');
      setBuilderExercises([]);
      return;
    }
    const unsub = subscribeToAthleteWorkouts(selectedClient.id, (workout) => {
      if (workout) {
        setBuilderWorkoutTitle(workout.title || '');
        setBuilderWorkoutDesc(workout.description || '');
        setBuilderExercises(workout.exercises || []);
      } else {
        setBuilderWorkoutTitle('');
        setBuilderWorkoutDesc('');
        setBuilderExercises([]);
      }
    });
    return () => unsub();
  }, [selectedClient?.id]);

  const handleAutoCalculateMacros = () => {
    if (!selectedClient?.id) return;
    const weight = Number(clientIntake?.currentWeightKg || selectedClient.currentWeightKg || 0);
    if (!weight || weight <= 0) {
      alert('No body weight recorded for this athlete yet. Please enter target macros manually or await client onboarding intake.');
      return;
    }
    const isCut = (selectedClient.primaryGoal || clientIntake?.primaryGoal || '').toLowerCase().includes('fat') || 
                  (selectedClient.primaryGoal || clientIntake?.primaryGoal || '').toLowerCase().includes('cut') || 
                  (selectedClient.primaryGoal || clientIntake?.primaryGoal || '').toLowerCase().includes('loss');
    const cal = isCut ? Math.round(weight * 26) : Math.round(weight * 32);
    const prot = Math.round(weight * 2.2);
    const fat = Math.round(weight * 0.8);
    const carb = Math.max(100, Math.round((cal - (prot * 4 + fat * 9)) / 4));
    setNutriCalories(cal);
    setNutriProtein(prot);
    setNutriCarbs(carb);
    setNutriFat(fat);
    setNutriWater(3.5);
    setNutriNotes(`Prescribed targets for ${selectedClient.name}. Prioritize lean protein with each feeding.`);
  };

  // Real-time Firestore Messages subscription for the selected client
  React.useEffect(() => {
    if (!selectedClient?.id) return;
    const unsub = subscribeToMessages(selectedClient.id, (list) => {
      setCoachClientMessages(list);
    });
    return () => unsub();
  }, [selectedClient?.id]);

  // Real-time Firestore Check-Ins subscription for Coach
  React.useEffect(() => {
    const unsub = subscribeToClientCheckIns(null, (list) => {
      setFirestoreCheckIns(list);
      setIsCheckInsLoaded(true);
    });
    return () => unsub();
  }, []);

  const allCheckIns = isCheckInsLoaded ? firestoreCheckIns : checkIns;
  const pendingCheckInsCount = React.useMemo(() => {
    return allCheckIns.filter((c) => !c.reviewedByCoach && !c.coachFeedback).length;
  }, [allCheckIns]);

  // Dynamically resolve latest weekly check-in for selected client
  const latestClientCheckIn = React.useMemo(() => {
    if (!selectedClient?.id) return null;
    const clientCheckIns = allCheckIns.filter((c) => c.clientId === selectedClient.id);
    return clientCheckIns[0] || null;
  }, [selectedClient?.id, allCheckIns]);

  const baselineStartingWeight = Number(clientIntake?.currentWeightKg || selectedClient.startingWeightKg || selectedClient.currentWeightKg || 0);
  const currentWeightDisplay = Number(latestClientCheckIn?.weightKg || selectedClient.currentWeightKg || clientIntake?.currentWeightKg || selectedClient.startingWeightKg || 0);
  const targetGoalWeightDisplay = Number(clientIntake?.targetWeightKg || selectedClient.targetWeightKg || (clientIntake?.currentWeightKg ? clientIntake.currentWeightKg - 5 : (selectedClient.currentWeightKg ? selectedClient.currentWeightKg - 5 : 0)));
  const availabilityDaysDisplay = clientIntake?.trainingDaysPerWeek || (selectedClient?.daysPerWeek && selectedClient.daysPerWeek > 0 ? selectedClient.daysPerWeek : null);
  const equipmentDisplay = (clientIntake?.availableEquipment && clientIntake.availableEquipment.length > 0)
    ? clientIntake.availableEquipment
    : (selectedClient?.availableEquipment && selectedClient.availableEquipment.length > 0 ? selectedClient.availableEquipment : []);
  const injuryNotesDisplay = clientIntake?.injuryHistory || clientIntake?.medicalNotes || (selectedClient.injuryNotes && selectedClient.injuryNotes !== 'None reported' && selectedClient.injuryNotes !== 'No clients assigned yet.' ? selectedClient.injuryNotes : (selectedClient?.id ? 'None reported. Cleared for all compound loads.' : 'No clients assigned yet.'));

  const visibleCheckIns = checkInFilter === 'selected' && selectedClient?.id
    ? allCheckIns.filter(c => c.clientId === selectedClient.id)
    : allCheckIns;
  const selectedCheckIn = visibleCheckIns.find(c => c.id === activeCheckInId) || visibleCheckIns[0];

  React.useEffect(() => {
    if (!activeCheckInId && visibleCheckIns.length > 0) {
      setActiveCheckInId(visibleCheckIns[0].id);
    }
  }, [visibleCheckIns, activeCheckInId]);

  const handleAddExerciseToBuilder = () => {
    const newEx: WorkoutExercise = {
      id: 'ex_builder_' + Date.now(),
      exerciseName: 'New Programmed Lift (e.g. Romanian Deadlift)',
      targetMuscle: 'Posterior Chain',
      equipment: 'Barbell',
      coachNotes: 'Hinge at hips, keep bar path tight against shins.',
      restSeconds: 90,
      sets: [
        { setNumber: 1, targetReps: '8-10', actualWeightKg: 80, actualReps: 8, completed: false },
        { setNumber: 2, targetReps: '8-10', actualWeightKg: 80, actualReps: 8, completed: false }
      ]
    };
    setBuilderExercises([...builderExercises, newEx]);
  };

  const handlePublishWorkout = () => {
    const targetId = selectedClientId || selectedClient.id;
    if (!targetId || visibleClients.length === 0) return;
    const newSession: WorkoutSession = {
      id: 'workout_' + Date.now(),
      clientId: targetId,
      assignedDate: 'Today',
      title: builderWorkoutTitle || 'Daily Workout Protocol',
      description: builderWorkoutDesc,
      exercises: builderExercises,
      isCompleted: false
    };
    if (assignWorkoutToClient) {
      assignWorkoutToClient(targetId, newSession);
    }
    setProgramAssignedSuccess(true);
    setTimeout(() => setProgramAssignedSuccess(false), 2000);
  };

  const handleSaveNutrition = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedClientId || selectedClient.id;
    if (!targetId || visibleClients.length === 0) return;
    if (updateNutritionPlan) {
      updateNutritionPlan({
        ...(clientNutritionPlan || {}),
        clientId: targetId,
        calories: Number(nutriCalories) || 0,
        proteinGrams: Number(nutriProtein) || 0,
        carbsGrams: Number(nutriCarbs) || 0,
        fatGrams: Number(nutriFat) || 0,
        waterLiters: Number(nutriWater) || 0,
        dailyNotes: nutriNotes,
        updatedAt: new Date().toISOString().split('T')[0]
      });
      setNutritionSaved(true);
      setTimeout(() => setNutritionSaved(false), 2000);
    }
  };

  const handleSendCheckInFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachFeedbackText.trim() || !activeCheckInId) return;
    if (respondToCheckIn) {
      respondToCheckIn(activeCheckInId, coachFeedbackText.trim());
    }
    setFeedbackSentAlert(true);
    setCoachFeedbackText('');
    setTimeout(() => setFeedbackSentAlert(false), 2000);
  };

  const handleSendCoachMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachChatInput.trim()) return;
    const targetId = selectedClientId || selectedClient.id;
    if (sendChatMessage && targetId) {
      sendChatMessage(coachChatInput.trim(), targetId);
    }
    setCoachChatInput('');
  };

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateCMSContent) {
      updateCMSContent({
        heroHeadline: cmsHeroHeadline,
        heroSubheadline: cmsHeroSubheadline,
        bannerNotice: cmsBannerNotice
      });
    }
    setCmsSaved(true);
    setTimeout(() => setCmsSaved(false), 2000);
  };

  const formatIntakeDate = (dateVal: any) => {
    if (!dateVal) return 'Recently';
    if (typeof dateVal === 'string') {
      return dateVal.includes('T') ? dateVal.split('T')[0] : dateVal;
    }
    if (dateVal.seconds) {
      return new Date(dateVal.seconds * 1000).toISOString().split('T')[0];
    }
    return 'Recently';
  };

  const [initializingIntakeId, setInitializingIntakeId] = useState<string | null>(null);

  const handleInitializeProgram = async (intake: IntakeFormData) => {
    setInitializingIntakeId(intake.id);

    // 1. Select client for program builder & prefill block title/description
    if (intake.clientId) {
      setSelectedClientId(intake.clientId);
    }
    if (intake.primaryGoal) {
      setBuilderWorkoutTitle(`${intake.clientName.split(' ')[0]}'s Initial ${formatGoal(intake.primaryGoal)} Block`);
      setBuilderWorkoutDesc(`Custom routine tailored to ${intake.trainingDaysPerWeek || 4} days/week split using available ${intake.availableEquipment?.slice(0, 3).join(', ') || 'gym equipment'}.`);
    }

    // 2. Trigger database mutation: updates status from PENDING_REVIEW to REVIEWED
    try {
      if (updateIntakeStatus) {
        await updateIntakeStatus(intake.id, intake.clientId, 'reviewed');
      }
    } catch (err) {
      console.error('[CoachDashboard] Error updating intake status:', err);
    } finally {
      setInitializingIntakeId(null);
    }

    // 3. Route to Program & Macro Builder tab
    setActiveTab('builder');
  };

  const handleSeedDemoIntake = () => {
    if (!submitIntakeForm) return;
    const demoId = 'client_demo_' + Date.now();
    submitIntakeForm({
      clientId: demoId,
      clientName: 'Julian Mercer',
      clientEmail: 'julian.mercer@example.com',
      age: 29,
      gender: 'Male',
      heightCm: 182,
      currentWeightKg: 85.5,
      targetWeightKg: 78.0,
      primaryGoal: 'hypertrophy',
      baselineMeasurements: {
        chestCm: 104,
        waistCm: 86,
        hipsCm: 98,
        bicepsCm: 38
      },
      startingPhotos: {
        front: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
      },
      injuryHistory: 'Mild left shoulder impingement during overhead barbell press. Retains full dumbbell mobility.',
      medicalNotes: 'Cleared for high-intensity progressive resistance training.',
      hasMedicalClearance: true,
      trainingDaysPerWeek: 5,
      trainingLocation: 'commercial_gym',
      availableEquipment: ['Barbells', 'Dumbbells', 'Cable Stations', 'Squat Rack', 'Leg Press'],
      workoutDurationMinutes: 65,
      dietaryPreference: 'flexible_dieting',
      foodAllergies: 'None',
      excludedFoods: 'Raw shellfish',
      mealsPerDay: 4,
      supplementHistory: 'Whey isolate (30g/day), Creatine Monohydrate (5g/day)'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-24">
      {/* Coach Header Bar */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-0.5 shadow-md shadow-red-500/20">
              <img
                src={currentUser?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt="Profile Avatar"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-neutral-900 uppercase font-display tracking-tight">
                  {currentUser?.displayName || user?.displayName || 'Lead Coach'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                  userRole === 'admin'
                    ? adminDashboardMode === 'admin'
                      ? 'bg-neutral-900 border-neutral-800 text-white'
                      : 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                }`}>
                  {userRole === 'admin' 
                    ? adminDashboardMode === 'admin'
                      ? 'Admin Dashboard (Staff & All Clients)' 
                      : 'Personal Coach Dashboard'
                    : 'Coach Dashboard'
                  }
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {userRole === 'admin' 
                  ? adminDashboardMode === 'admin'
                    ? `Full Administrative Access • Overseeing all staff & all ${clients.length} registered clients`
                    : `Personal Roster • Managing ${visibleClients.length} athlete(s) directly assigned to ${currentUser?.displayName}`
                  : `Dedicated Coaching Workspace • ${visibleClients.length} Assigned Athletes`
                }
              </p>
            </div>
          </div>

          {/* Quick Controls & Roster Status Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            {/* ADMIN DASHBOARD TOGGLE (Accessible when user is an admin) */}
            {userRole === 'admin' && (
              <div className="flex items-center p-1 bg-neutral-100 rounded-2xl border border-neutral-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setAdminDashboardMode('admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    adminDashboardMode === 'admin'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                  title="Switch to Admin Dashboard (Managing all staff and all clients)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  <span>Admin Dashboard</span>
                  <span className="text-[10px] opacity-80 font-mono">({clients.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminDashboardMode('coach');
                    if (activeTab === 'team') {
                      setActiveTab('clients');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    adminDashboardMode === 'coach'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                  title="Switch to Personal Coach Dashboard (Managing only my assigned clients)"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-white" />
                  <span>Personal Coach Dashboard</span>
                  <span className="text-[10px] opacity-90 font-mono">
                    ({clients.filter(c => (c.coachId || c.assignedCoachId) === currentUserId).length})
                  </span>
                </button>
              </div>
            )}

            {userRole === 'admin' && onNavigateToManageCoaches && (
              <button
                type="button"
                onClick={onNavigateToManageCoaches}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Open Dedicated Admin Dashboard (Recruit coaches and manage quotas)"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Manage Coaches</span>
              </button>
            )}

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-center shadow-sm">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                {isPersonalCoachView ? 'My Athletes' : 'Total Athletes'}
              </span>
              <span className="text-base font-black text-neutral-900 font-mono">
                {visibleClients.length} {isPersonalCoachView ? 'Assigned' : 'Total'}
              </span>
            </div>
            
            {!isPersonalCoachView && (
              <>
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-center shadow-sm">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Intake Queue</span>
                  <span className="text-base font-black text-amber-600 font-mono">{intakeSubmissions.length} Review</span>
                </div>
                {onNavigateToManageCoaches && (
                  <button
                    onClick={onNavigateToManageCoaches}
                    className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-red-500" />
                    <span>Manage Coaches</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Coach Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-6 overflow-x-auto">
          {[
            { id: 'clients', label: 'Client Management Table', icon: Users },
            { id: 'progress', label: 'Client Progress & Graphs', icon: TrendingUp },
            { id: 'builder', label: 'Program & Macro Builder', icon: Dumbbell },
            { id: 'checkins', label: 'Check-In Review Queue', icon: CheckSquare, badge: pendingCheckInsCount > 0 ? `${pendingCheckInsCount} Review${pendingCheckInsCount > 1 ? 's' : ''}` : undefined },
            { id: 'intakes', label: 'Intake Submissions', icon: FileText, badge: `${intakeSubmissions.length}` },
            ...(adminDashboardMode === 'admin'
              ? [{ id: 'team', label: 'Coaches & Staff', icon: ShieldCheck, badge: `${coaches.length}` }]
              : []),
            { id: 'chat', label: 'Client Messages', icon: MessageSquare },
            { id: 'cms', label: 'Website CMS & Copy', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200 shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Coach Tab Views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 1. CLIENT CRM & ROSTER */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            {/* Personal Coach View Banner for Admins */}
            {userRole === 'admin' && adminDashboardMode === 'coach' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-neutral-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                      <span>Personal Coach View Active</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-600 text-white font-mono uppercase">
                        {currentUser?.displayName}
                      </span>
                    </p>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Displaying only athletes assigned directly to you ({visibleClients.length} assigned). Reassigning controls are hidden. Switch to Admin Dashboard to manage all staff and clients.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminDashboardMode('admin')}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>Switch to Admin Dashboard</span>
                </button>
              </div>
            )}

            {/* Top Table Card: Client Management Table */}
            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-neutral-900 uppercase font-display">
                      Client Management Table
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      !isPersonalCoachView
                        ? 'bg-neutral-900 text-white border border-neutral-800'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {!isPersonalCoachView ? 'Admin Mode • Full Roster' : 'Personal Assigned Roster'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {!isPersonalCoachView 
                      ? 'Link clients directly to founders or staff coaches using the Assigned Coach dropdown.'
                      : `Displaying ${visibleClients.length} athlete(s) assigned to ${currentUser?.displayName || 'your roster'}.`
                    }
                  </p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-72 relative">
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Filter clients..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:bg-white focus:border-red-600 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                      <th className="py-3.5 px-6">Client Name</th>
                      <th className="py-3.5 px-6">Email / Contact</th>
                      <th className="py-3.5 px-6">Program & Goal</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Adherence</th>
                      <th className="py-3.5 px-6">Assigned Coach</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-500">
                          <div className="max-w-sm mx-auto space-y-2">
                            <Users className="w-8 h-8 text-neutral-400 mx-auto" />
                            <p className="font-bold text-neutral-800">No clients found</p>
                            <p className="text-xs text-neutral-500">
                              {isPersonalCoachView 
                                ? userRole === 'admin'
                                  ? `No athletes are currently assigned directly to ${currentUser?.displayName}. Switch to the Admin Dashboard to assign clients to yourself.`
                                  : 'No athletes are currently assigned to your coach profile. Contact your administrator.'
                                : 'No clients match your search filter.'
                              }
                            </p>
                            {userRole === 'admin' && isPersonalCoachView && (
                              <button
                                type="button"
                                onClick={() => setAdminDashboardMode('admin')}
                                className="mt-2 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Switch to Admin Dashboard
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((c) => {
                        const isSelected = selectedClientId === c.id;
                        const assignedCoach = coaches.find(co => co.id === (c.coachId || c.assignedCoachId));

                        return (
                          <tr
                            key={c.id}
                            onClick={() => setSelectedClientId(c.id)}
                            className={`transition-colors cursor-pointer ${
                              isSelected ? 'bg-red-50/40' : 'hover:bg-neutral-50'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={c.avatarUrl}
                                  alt={c.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-neutral-200"
                                />
                                <div>
                                  <div className="font-bold text-neutral-900">{c.name}</div>
                                  <span className="text-[10px] text-neutral-500 font-mono">Joined {c.joinedDate}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6 font-mono text-neutral-600">
                              {c.email}
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-semibold text-neutral-900">{c.activePlanName || c.planName}</div>
                              <span className="text-[11px] text-neutral-500">{c.primaryGoal}</span>
                              {c.renewalRequestedPlanName && (
                                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                                  <Clock className="w-2.5 h-2.5 text-amber-600" />
                                  <span>Renew: {c.renewalRequestedPlanName} (${c.renewalRequestedPlanPrice})</span>
                                </div>
                              )}
                              {c.planExpiresAt && !c.renewalRequestedPlanName && (
                                <div className="text-[10px] font-mono mt-0.5">
                                  {isPlanExpired(c) || c.status === 'expired' ? (
                                    <span className="text-red-600 font-bold">Expired on {new Date(c.planExpiresAt).toLocaleDateString()}</span>
                                  ) : (
                                    <span className="text-neutral-500">Expires {new Date(c.planExpiresAt).toLocaleDateString()} ({getDaysRemaining(c.planExpiresAt)}d left)</span>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              {c.subscriptionStatus === 'pending_approval' || (c as any).renewalRequestedPlanId || c.status === 'pending' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>{c.renewalRequestedPlanName ? 'Renewal Pending' : 'Awaiting Plan'}</span>
                                </span>
                              ) : isPlanExpired(c) || c.status === 'expired' || c.subscriptionStatus === 'expired' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200 shadow-2xs">
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  <span>Expired</span>
                                </span>
                              ) : c.status === 'active' ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700 border border-neutral-200">
                                  {c.status || 'Pending'}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              <div className="w-28">
                                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                                  <span className="font-bold text-red-600">{c.adherenceRate}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-red-600 rounded-full"
                                    style={{ width: `${c.adherenceRate}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* ASSIGNED COACH COLUMN */}
                            <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                              {!isPersonalCoachView ? (
                                /* Admin View: Render Select Dropdown to link client to coach or founder */
                                <div className="space-y-1">
                                  <select
                                    value={c.coachId || c.assignedCoachId || ''}
                                    onChange={(e) => {
                                      if (assignCoachToClient) {
                                        assignCoachToClient(c.id, e.target.value);
                                      }
                                    }}
                                    className="w-full max-w-[210px] px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 text-xs font-semibold focus:border-red-600 focus:outline-none shadow-xs cursor-pointer"
                                  >
                                    <option value="" disabled>Select Coach</option>
                                    {coaches.map((coach) => (
                                      <option key={coach.id} value={coach.id}>
                                        {coach.name} ({coach.role === 'admin' ? 'Founder & Admin' : coach.role === 'nutritionist' ? 'Nutritionist' : 'Coach'})
                                      </option>
                                    ))}
                                  </select>
                                  {assignedCoach && (
                                    <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                                      <span>Current:</span>
                                      <span className="font-semibold text-neutral-800">{assignedCoach.name}</span>
                                      {assignedCoach.role === 'admin' && (
                                        <span className="text-[9px] font-bold text-red-600 uppercase bg-red-50 px-1 rounded">Founder</span>
                                      )}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                /* Personal Coach View: Dropdown is completely hidden */
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>{assignedCoach?.name || 'Assigned to You'}</span>
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {(c.subscriptionStatus === 'pending_approval' || (c as any).renewalRequestedPlanId || c.status === 'pending') ? (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (approveAndInitializeClientPlan) {
                                        await approveAndInitializeClientPlan(c.id);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                                    title="Approve re-enrollment and initialize routine for this package"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                    <span>Approve & Initialize</span>
                                  </button>
                                ) : (isPlanExpired(c) || c.status === 'expired' || c.subscriptionStatus === 'expired') ? (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (approveAndInitializeClientPlan) {
                                        await approveAndInitializeClientPlan(c.id);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                                    title="Re-activate package and initialize routine"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                    <span>Re-Activate & Initialize</span>
                                  </button>
                                ) : c.status !== 'active' ? (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (approveAndInitializeClientPlan) {
                                        await approveAndInitializeClientPlan(c.id);
                                      } else if (updateIntakeStatus) {
                                        await updateIntakeStatus('', c.id, 'active');
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                                    title="Approve client enrollment and activate plan"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                    <span>Approve & Initialize</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (setClientPlanExpired) {
                                        await setClientPlanExpired(c.id);
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-neutral-500 hover:text-red-600 hover:bg-red-50 border border-neutral-200 hover:border-red-200 transition-colors cursor-pointer"
                                    title="Simulate package timeline expiration for testing"
                                  >
                                    Simulate Expire
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedClientId(c.id)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-red-600 text-white shadow-xs'
                                      : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                                  }`}
                                >
                                  {isSelected ? 'Selected' : 'Inspect'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom: Detailed Selected Client Profile & Biofeedback Snapshot */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              {visibleClients.length > 0 && selectedClient?.id ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedClient.avatarUrl}
                        alt={selectedClient.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-red-600/50"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                            Client Profile &bull; Joined {selectedClient.joinedDate}
                          </span>
                          {clientIntake ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Intake Form Linked ({clientIntake.submittedAt ? clientIntake.submittedAt.split('T')[0] : 'Completed'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Onboarding Intake
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 uppercase font-display">
                          {selectedClient.name}
                        </h2>
                        <p className="text-xs text-neutral-500">{selectedClient.email} &bull; Goal: <strong className="text-neutral-900">{formatGoal(clientIntake?.primaryGoal || selectedClient.primaryGoal)}</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('builder');
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>Build Program</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 cursor-pointer"
                        title="Direct Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subscription Timeline & Renewal Review Banner */}
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    selectedClient.subscriptionStatus === 'pending_approval' || (selectedClient as any).renewalRequestedPlanId
                      ? 'bg-amber-50/80 border-amber-300'
                      : isPlanExpired(selectedClient) || selectedClient.status === 'expired' || selectedClient.subscriptionStatus === 'expired'
                      ? 'bg-red-50/80 border-red-300'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                          Package Subscription:
                        </span>
                        <strong className="text-xs font-extrabold text-red-600 uppercase">
                          {selectedClient.activePlanName || selectedClient.planName}
                        </strong>
                        {(selectedClient.subscriptionStatus === 'pending_approval' || (selectedClient as any).renewalRequestedPlanId) ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                            Renewal Pending Review
                          </span>
                        ) : isPlanExpired(selectedClient) || selectedClient.status === 'expired' || selectedClient.subscriptionStatus === 'expired' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-300">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-3">
                        {selectedClient.renewalRequestedPlanName && (
                          <span className="font-bold text-amber-800">
                            Requested Renewal: {selectedClient.renewalRequestedPlanName} (${selectedClient.renewalRequestedPlanPrice})
                          </span>
                        )}
                        {selectedClient.packageStartedAt && (
                          <span>Started: <strong className="text-neutral-800">{new Date(selectedClient.packageStartedAt).toLocaleDateString()}</strong></span>
                        )}
                        {selectedClient.planExpiresAt && (
                          <span>
                            Expires: <strong className={isPlanExpired(selectedClient) ? 'text-red-600 font-bold' : 'text-neutral-800'}>
                              {new Date(selectedClient.planExpiresAt).toLocaleDateString()}
                            </strong>
                            {' '}({getDaysRemaining(selectedClient.planExpiresAt)}d remaining)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(selectedClient.subscriptionStatus === 'pending_approval' || (selectedClient as any).renewalRequestedPlanId || isPlanExpired(selectedClient) || selectedClient.status === 'expired') && (
                        <button
                          onClick={async () => {
                            if (approveAndInitializeClientPlan) {
                              await approveAndInitializeClientPlan(selectedClient.id);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-white" />
                          <span>Approve & Initialize Plan</span>
                        </button>
                      )}
                      {selectedClient.status === 'active' && !isPlanExpired(selectedClient) && (
                        <button
                          onClick={async () => {
                            if (setClientPlanExpired) {
                              await setClientPlanExpired(selectedClient.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:border-red-300 hover:bg-red-50 text-neutral-600 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer"
                          title="Simulate package expiration to test client portal lockdown"
                        >
                          Simulate Expire
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Composition Tracking */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                        Weight & Metric Trajectory
                      </h3>
                      {clientIntake && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          ✓ Sourced from athlete intake submission
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-center">
                        <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Baseline Starting</span>
                        <span className="text-lg font-black text-neutral-900 font-mono">{baselineStartingWeight} kg</span>
                      </div>
                      <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-center">
                        <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Current Weight</span>
                        <span className="text-lg font-black text-red-600 font-mono">{currentWeightDisplay} kg</span>
                      </div>
                      <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-center">
                        <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Target Goal</span>
                        <span className="text-lg font-black text-emerald-600 font-mono">{targetGoalWeightDisplay} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical History & Equipment Notes from Intake */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase mb-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Injury Constraints</span>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed">
                        {injuryNotesDisplay}
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase mb-1">
                        <Clock className="w-3.5 h-3.5 text-red-600" />
                        <span>Logistics & Availability</span>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed">
                        {availabilityDaysDisplay
                          ? `${availabilityDaysDisplay} days/week${equipmentDisplay.length > 0 ? ` • Equipment: ${equipmentDisplay.join(', ')}` : ''}`
                          : (equipmentDisplay.length > 0
                              ? `Equipment: ${equipmentDisplay.join(', ')}`
                              : 'Pending client onboarding intake submission')}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab('progress')}
                      className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                      <span>View Biometrics & Photos &rarr;</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('checkins')}
                      className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 border border-neutral-200 uppercase tracking-wider cursor-pointer"
                    >
                      Audit Latest Check-In &rarr;
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 border border-neutral-200 uppercase tracking-wider cursor-pointer"
                    >
                      Send Motivational Check &rarr;
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-neutral-800 uppercase font-display">No Athlete Selected</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    When athletes register or are assigned to you, select a client from the roster above to inspect their profile and training program.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. PROGRAM & MACRO BUILDER */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            {/* Active Athlete Programming Target Selector */}
            <div className="bg-white border border-neutral-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div>
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                  Active Athlete Programming Target:
                </span>
                <span className="text-xs text-neutral-500">
                  Target client for exercise protocol push and prescribed macronutrient targets.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-600 font-medium">Programming For:</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={visibleClients.length === 0}
                  className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs text-neutral-900 focus:border-red-600 focus:outline-none font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {visibleClients.length === 0 ? (
                    <option value="" disabled>No athletes registered yet</option>
                  ) : (
                    visibleClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.planName || 'Elite Athlete'})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {visibleClients.length === 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs text-amber-800">
                  <span className="font-bold">No active athletes found in roster.</span> All client records were cleared from Firestore. Once an athlete registers or completes onboarding intake, select them here to compile custom workout sessions and metabolic targets.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Routine & Exercise Sequence Builder */}
              <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                  <div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Exercise Program Designer</span>
                    <h2 className="text-2xl font-black text-neutral-900 uppercase font-display">
                      Custom Workout Session Builder
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Assigning to client: <strong className="text-neutral-900">{visibleClients.length > 0 && selectedClient.id ? selectedClient.name : 'No athlete selected'}</strong>
                    </p>
                  </div>

                  <button
                    onClick={handlePublishWorkout}
                    disabled={!selectedClient?.id || visibleClients.length === 0}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-500/20 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish & Push to Client</span>
                  </button>
                </div>

                {programAssignedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Workout successfully compiled and pushed to {selectedClient.name}'s daily schedule!</span>
                  </div>
                )}

                {/* Workout Title & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Session Name / Split Focus
                    </label>
                    <input
                      type="text"
                      value={builderWorkoutTitle}
                      onChange={(e) => setBuilderWorkoutTitle(e.target.value)}
                      placeholder="e.g. Day 1: Push Hypertrophy & Chest/Delt Specialization"
                      className="w-full px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm focus:border-red-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Session Coaching Goal
                    </label>
                    <input
                      type="text"
                      value={builderWorkoutDesc}
                      onChange={(e) => setBuilderWorkoutDesc(e.target.value)}
                      placeholder="e.g. Progressive overload focus, 3-sec eccentrics, clavicular recruitment"
                      className="w-full px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm focus:border-red-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Exercises list in builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-900 uppercase font-display">
                      Prescribed Exercises ({builderExercises.length})
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddExerciseToBuilder}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lift</span>
                    </button>
                  </div>

                  {builderExercises.length === 0 ? (
                    <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                      <Dumbbell className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">No Exercises Programmed Yet</h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                        Click "+ Add Lift" to begin configuring exercises, set volumes, and biomechanical cues for this session.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddExerciseToBuilder}
                        className="mt-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Lift</span>
                      </button>
                    </div>
                  ) : (
                    builderExercises.map((ex, exIdx) => (
                    <div key={ex.id} className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold font-mono">
                            {exIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={ex.exerciseName}
                            onChange={(e) => {
                              const updated = [...builderExercises];
                              updated[exIdx].exerciseName = e.target.value;
                              setBuilderExercises(updated);
                            }}
                            className="bg-transparent text-sm font-bold text-neutral-900 border-b border-transparent hover:border-neutral-300 focus:border-red-600 focus:outline-none px-1"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-neutral-500">Rest:</span>
                          <input
                            type="number"
                            value={ex.restSeconds || 90}
                            onChange={(e) => {
                              const updated = [...builderExercises];
                              updated[exIdx].restSeconds = Number(e.target.value);
                              setBuilderExercises(updated);
                            }}
                            className="w-16 px-2 py-1 rounded bg-white border border-neutral-300 text-neutral-900 font-mono text-xs"
                          />
                          <span className="text-[11px] text-neutral-500">sec</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Target Muscle Group</label>
                          <input
                            type="text"
                            value={ex.targetMuscle}
                            onChange={(e) => {
                              const updated = [...builderExercises];
                              updated[exIdx].targetMuscle = e.target.value;
                              setBuilderExercises(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Cues & Biomechanical Focus</label>
                          <input
                            type="text"
                            value={ex.coachNotes || ''}
                            onChange={(e) => {
                              const updated = [...builderExercises];
                              updated[exIdx].coachNotes = e.target.value;
                              setBuilderExercises(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-900"
                          />
                        </div>
                      </div>

                      {/* Sets configuration */}
                      <div className="border-t border-neutral-200 pt-3">
                        <div className="flex items-center justify-between text-[11px] text-neutral-600 uppercase font-bold mb-2">
                          <span>Sets & Rep Ranges</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...builderExercises];
                              const nextSetNum = updated[exIdx].sets.length + 1;
                              updated[exIdx].sets.push({
                                setNumber: nextSetNum,
                                targetReps: '8-10',
                                actualWeightKg: updated[exIdx].sets[0]?.actualWeightKg || 20,
                                actualReps: 8,
                                completed: false
                              });
                              setBuilderExercises(updated);
                            }}
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            + Add Set
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {ex.sets.map((set, setIdx) => (
                            <div key={setIdx} className="bg-white p-2 rounded-xl border border-neutral-200 flex items-center justify-between text-xs shadow-sm">
                              <span className="font-bold text-neutral-600 font-mono">Set {set.setNumber}</span>
                              <input
                                type="text"
                                value={set.targetReps}
                                onChange={(e) => {
                                  const updated = [...builderExercises];
                                  updated[exIdx].sets[setIdx].targetReps = e.target.value;
                                  setBuilderExercises(updated);
                                }}
                                className="w-16 px-1.5 py-0.5 rounded bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono text-center"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </div>

              {/* Right Column: Nutrition & Macro Targets Preset */}
              <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Metabolic Prescription</span>
                  <h3 className="text-xl font-black text-neutral-900 uppercase font-display">
                    Macronutrient Targets
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Configured for {visibleClients.length > 0 && selectedClient.id ? selectedClient.name : 'No athlete selected'}
                  </p>
                </div>

                {visibleClients.length > 0 && selectedClient.id && (
                  <button
                    type="button"
                    onClick={handleAutoCalculateMacros}
                    className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>Auto-Calculate From Intake & Weight</span>
                  </button>
                )}

                {nutritionSaved && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Macronutrient targets updated successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSaveNutrition} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Total Calories (kcal/day)
                    </label>
                    <input
                      type="number"
                      value={nutriCalories}
                      onChange={(e) => setNutriCalories(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 2400"
                      className="w-full px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono text-base focus:border-red-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Protein (g)</label>
                      <input
                        type="number"
                        value={nutriProtein}
                        onChange={(e) => setNutriProtein(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 180"
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        value={nutriCarbs}
                        onChange={(e) => setNutriCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 220"
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Fat (g)</label>
                      <input
                        type="number"
                        value={nutriFat}
                        onChange={(e) => setNutriFat(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 60"
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono text-xs focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Water Hydration (Liters / Day)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={nutriWater}
                      onChange={(e) => setNutriWater(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 3.5"
                      className="w-full px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono text-xs focus:border-red-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Coach Nutrition Directives
                    </label>
                    <textarea
                      rows={3}
                      value={nutriNotes}
                      onChange={(e) => setNutriNotes(e.target.value)}
                      placeholder="Prescribe daily nutritional directives, meal timing, hydration protocols..."
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:border-red-600 focus:bg-white focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedClient?.id || visibleClients.length === 0}
                    className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Macros</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 3. CHECK-IN REVIEW QUEUE */}
        {activeTab === 'checkins' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* List of check-ins */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-neutral-900 uppercase font-display">
                  Weekly Biofeedback ({visibleCheckIns.length})
                </h2>
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-[10px] font-bold">
                  <button
                    onClick={() => setCheckInFilter('all')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      checkInFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    All Athletes
                  </button>
                  <button
                    onClick={() => setCheckInFilter('selected')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      checkInFilter === 'selected' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {selectedClient.name.split(' ')[0]}
                  </button>
                </div>
              </div>

              {visibleCheckIns.length > 0 ? (
                visibleCheckIns.map((ci) => {
                  const isSelected = activeCheckInId === ci.id;
                  const isPending = !ci.coachFeedback;
                  return (
                    <div
                      key={ci.id}
                      onClick={() => setActiveCheckInId(ci.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white border-red-600 shadow-md ring-1 ring-red-600/20'
                          : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-900">{ci.clientName}</span>
                          <span className="text-xs text-neutral-500">&bull; Week #{ci.weekNumber}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isPending ? 'Needs Audit' : 'Audited'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono">
                        <span>Weight: <strong className="text-neutral-900">{ci.weightKg} kg</strong></span>
                        <span>Adherence: <strong className="text-red-600">{ci.adherenceRating}/10</strong></span>
                        <span>Sleep: {ci.sleepHours}h</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-white border border-neutral-200 rounded-2xl">
                  <CheckSquare className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-neutral-800 uppercase font-display">No Check-Ins Found</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    {checkInFilter === 'selected'
                      ? `No weekly check-in forms submitted yet by ${selectedClient.name}.`
                      : 'When athletes submit their weekly biofeedback, submissions will populate here for review.'}
                  </p>
                </div>
              )}
            </div>

            {/* Audit & Coach Response Form */}
            <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              {selectedCheckIn ? (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                    <div>
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                        Biofeedback Audit &bull; {selectedCheckIn.submissionDate}
                      </span>
                      <h3 className="text-2xl font-black text-neutral-900 uppercase font-display">
                        {selectedCheckIn.clientName} &bull; Week {selectedCheckIn.weekNumber}
                      </h3>
                    </div>
                  </div>

                  {/* Submitted Metrics Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">Weight</span>
                      <span className="text-base font-black text-neutral-900 font-mono">{selectedCheckIn.weightKg} kg</span>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">Adherence</span>
                      <span className="text-base font-black text-red-600 font-mono">{selectedCheckIn.adherenceRating}/10</span>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">Sleep Avg</span>
                      <span className="text-base font-black text-neutral-900 font-mono">{selectedCheckIn.sleepHours} hrs</span>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">Gym Energy</span>
                      <span className="text-base font-black text-amber-600 font-mono">{selectedCheckIn.energyRating}/10</span>
                    </div>
                  </div>

                  {/* Client Submitted Notes */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <span className="text-xs font-bold text-neutral-600 uppercase block mb-1">
                      Client Reported Experience:
                    </span>
                    <p className="text-sm text-neutral-800 italic leading-relaxed">
                      &ldquo;{selectedCheckIn.winsAndStruggles}&rdquo;
                    </p>
                  </div>

                  {/* Existing Coach Feedback if any */}
                  {selectedCheckIn.coachFeedback && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs">
                      <span className="text-red-700 font-bold uppercase block mb-1">
                        Current Coach Feedback Given:
                      </span>
                      <p className="text-neutral-800">{selectedCheckIn.coachFeedback}</p>
                    </div>
                  )}

                  {feedbackSentAlert && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Check-in feedback transmitted to client portal!</span>
                    </div>
                  )}

                  {/* Coach Response Box */}
                  <form onSubmit={handleSendCheckInFeedback} className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Write Coach Audit, Video Notes & Macro Adjustments
                    </label>
                    <textarea
                      rows={4}
                      value={coachFeedbackText}
                      onChange={(e) => setCoachFeedbackText(e.target.value)}
                      placeholder="e.g. Tremendous adherence Alex! Bench press form looked crisp. Let's hold calories at 2,450 for one more week..."
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs sm:text-sm focus:border-red-600 focus:bg-white focus:outline-none resize-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-500/20 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Publish Feedback to Client</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  Select a check-in from the queue to start review.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. INTAKE SUBMISSIONS QUEUE */}
        {activeTab === 'intakes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 uppercase font-display">
                  Client Intake Form Pipeline
                </h2>
                <p className="text-xs text-neutral-500">
                  Data submitted through client onboarding routed for initial split programming and baseline biometrics review.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleSeedDemoIntake}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-red-500" />
                  <span>Seed Demo Intake</span>
                </button>
              </div>
            </div>

            {intakeSubmissions.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-neutral-900">No Pending Client Intake Submissions</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    When new clients complete onboarding, their complete health history, baseline body metrics, and training availability will appear here in this queue.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleSeedDemoIntake}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-red-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Seed Demo Athlete Intake</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs uppercase tracking-wider border border-neutral-300 cursor-pointer"
                  >
                    Inspect Client Roster
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {intakeSubmissions.map((intake) => (
                  <div key={intake.id} className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg">
                          {intake.clientName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-neutral-900 uppercase font-display">{intake.clientName}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                              {intake.status}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 flex flex-wrap items-center gap-2 mt-0.5">
                            <span>{intake.clientEmail} &bull; Submitted {formatIntakeDate(intake.submittedAt)}</span>
                            {intake.selectedPlanName && (
                              <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-[11px]">
                                Plan: {intake.selectedPlanName} (${intake.selectedPlanPrice})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-left sm:text-right">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                            Lead Coach
                          </label>
                          <select
                            value={(intake as any).coachId || (intake as any).assignedCoachId || 'admin_mass_narimanian'}
                            onChange={(e) => {
                              if (assignCoachToClient && intake.clientId) {
                                assignCoachToClient(intake.clientId, e.target.value);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs font-semibold focus:border-red-600 focus:outline-none shadow-xs cursor-pointer"
                          >
                            {coaches.map((coach) => (
                              <option key={coach.id} value={coach.id}>
                                {coach.name} ({coach.role === 'admin' ? 'Founder' : coach.role === 'nutritionist' ? 'Nutritionist' : 'Coach'})
                              </option>
                            ))}
                          </select>
                        </div>

                        {intake.status !== 'active' && (
                          <button
                            onClick={async () => {
                              if (updateIntakeStatus) {
                                await updateIntakeStatus(intake.id, intake.clientId, 'active');
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-200 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Activate</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleInitializeProgram(intake)}
                          disabled={initializingIntakeId === intake.id}
                          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-red-500/20 transition-all"
                        >
                          {initializingIntakeId === intake.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Dumbbell className="w-4 h-4" />
                          )}
                          <span>{initializingIntakeId === intake.id ? 'Initializing...' : 'Initialize Program'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold">Goal</span>
                        <span className="text-xs font-bold text-neutral-900 uppercase">{formatGoal(intake.primaryGoal)}</span>
                      </div>
                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold">Age / Height</span>
                        <span className="text-xs font-bold text-neutral-900 font-mono">{intake.age} yrs &bull; {intake.heightCm} cm</span>
                      </div>
                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold">Weight (Cur &rarr; Target)</span>
                        <span className="text-xs font-bold text-red-600 font-mono">{intake.currentWeightKg}kg &rarr; {intake.targetWeightKg}kg</span>
                      </div>
                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold">Availability</span>
                        <span className="text-xs font-bold text-neutral-900 font-mono">{intake.trainingDaysPerWeek} Days / {intake.workoutDurationMinutes || 60} min</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                        <span className="font-bold text-red-600 uppercase block mb-1">Injury History & Medical Clearance</span>
                        <p className="text-neutral-700">{intake.injuryHistory || 'None noted.'}</p>
                        <p className="text-[11px] text-neutral-500 mt-1">{intake.medicalNotes}</p>
                        {intake.baselineMeasurements && (
                          <div className="mt-2 pt-2 border-t border-neutral-200 text-[11px] text-neutral-600 flex gap-3">
                            <span>Waist: <strong className="text-neutral-900">{intake.baselineMeasurements.waistCm || '—'}cm</strong></span>
                            <span>Chest: <strong className="text-neutral-900">{intake.baselineMeasurements.chestCm || '—'}cm</strong></span>
                            <span>Biceps: <strong className="text-neutral-900">{intake.baselineMeasurements.bicepsCm || '—'}cm</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                        <span className="font-bold text-red-600 uppercase block mb-1">Nutrition & Exclusions</span>
                        <p className="text-neutral-700">Pref: {intake.dietaryPreference ? intake.dietaryPreference.replace(/_/g, ' ') : 'Flexible'} &bull; Excluded: {intake.excludedFoods || 'None'}</p>
                        <p className="text-[11px] text-neutral-500 mt-1">Supplements: {intake.supplementHistory || 'None'}</p>
                        {intake.availableEquipment && intake.availableEquipment.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-neutral-200 text-[11px] text-neutral-600">
                            <span>Equipment: <strong className="text-neutral-900">{intake.availableEquipment.join(', ')}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. MESSAGES PORTAL */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[640px]">
            <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedClient.avatarUrl}
                  alt={selectedClient.name}
                  className="w-10 h-10 rounded-xl object-cover border border-neutral-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 uppercase font-display">{selectedClient.name}</h3>
                  <p className="text-[11px] text-neutral-500">{selectedClient.activePlanName || selectedClient.planName}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase">
                Coach Roster Channel
              </span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {coachClientMessages.length > 0 ? (
                coachClientMessages.map((msg) => {
                  const isMe = msg.senderRole === 'coach' || msg.senderRole === 'admin';
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
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7 text-neutral-400" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-800 uppercase font-display">
                    1-on-1 Chat with {selectedClient.name}
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-sm mt-1">
                    No messages exchanged yet with this athlete. Type a greeting or form cues below to initiate direct communication.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendCoachMessage} className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center gap-3">
              <input
                type="text"
                value={coachChatInput}
                onChange={(e) => setCoachChatInput(e.target.value)}
                placeholder={`Reply to ${selectedClient.name}...`}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-xs sm:text-sm focus:border-red-600 focus:outline-none shadow-sm"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 6. CMS CONTENT & PRICING MANAGER */}
        {activeTab === 'cms' && (
          <CMSEditor />
        )}

        {/* 7. PROGRESS & BIOMETRIC ANALYTICS */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            {/* Client Picker for Coach */}
            <div className="bg-white border border-neutral-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <span className="text-xs font-bold text-neutral-800 uppercase">
                Active Athlete Biometrics Inspector:
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-600 font-medium">Select Athlete:</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={clients.length === 0}
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:border-red-600 focus:outline-none font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {clients.length === 0 ? (
                    <option value="" disabled>No athletes registered yet</option>
                  ) : (
                    clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.activePlanName || c.planName})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <ProgressAnalyticsView clientId={selectedClientId} isCoachView={true} checkIns={allCheckIns} />
          </div>
        )}

        {/* 8. MULTI-COACH TEAM MANAGEMENT */}
        {activeTab === 'team' && adminDashboardMode === 'admin' && (
          <CoachTeamManagement />
        )}
      </main>
    </div>
  );
};
