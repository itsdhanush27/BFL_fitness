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
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFitnessData } from '../../context/FitnessDataContext';
import { WorkoutSession, WorkoutExercise, IntakeFormData, NutritionPlan, ClientRosterItem } from '../../types';
import { ProgressAnalyticsView } from '../client/ProgressAnalyticsView';
import { CoachTeamManagement } from './CoachTeamManagement';
import { CMSEditor } from '../admin/CMSEditor';

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
  const intakeSubmissions = fitnessData?.intakeSubmissions || fitnessData?.intakeForms || [];
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

  const [activeTab, setActiveTab] = useState<'clients' | 'builder' | 'checkins' | 'intakes' | 'chat' | 'cms' | 'team' | 'progress'>(initialTab);

  // Selected Client for detail viewing
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'client_alex');
  const [clientSearch, setClientSearch] = useState('');

  // Program Builder State
  const [builderWorkoutTitle, setBuilderWorkoutTitle] = useState('Push Strength & Upper Chest Focus');
  const [builderWorkoutDesc, setBuilderWorkoutDesc] = useState('Emphasizing clavicular head recruitment and progressive bench overloading.');
  const [builderExercises, setBuilderExercises] = useState<WorkoutExercise[]>([
    {
      id: 'ex_builder_1',
      exerciseName: 'Incline Dumbbell Press (30° Angle)',
      targetMuscle: 'Upper Chest',
      equipment: 'Dumbbells & Adjustable Bench',
      coachNotes: 'Retract scapulae, 3-second eccentric stretch at the bottom.',
      videoUrl: 'https://youtube.com',
      restSeconds: 90,
      sets: [
        { setNumber: 1, targetReps: '8-10', actualWeightKg: 34, actualReps: 10, actualRpe: 8, completed: false },
        { setNumber: 2, targetReps: '8-10', actualWeightKg: 34, actualReps: 9, actualRpe: 8.5, completed: false },
        { setNumber: 3, targetReps: '8-10', actualWeightKg: 34, actualReps: 8, actualRpe: 9, completed: false }
      ]
    },
    {
      id: 'ex_builder_2',
      exerciseName: 'Standing Cable Lateral Raises',
      targetMuscle: 'Lateral Deltoid',
      equipment: 'Dual Cable Machine',
      coachNotes: 'Cuffs at wrist level, sweep out wide at 45° scapular plane.',
      videoUrl: 'https://youtube.com',
      restSeconds: 60,
      sets: [
        { setNumber: 1, targetReps: '12-15', actualWeightKg: 10, actualReps: 15, actualRpe: 8, completed: false },
        { setNumber: 2, targetReps: '12-15', actualWeightKg: 10, actualReps: 14, actualRpe: 9, completed: false },
        { setNumber: 3, targetReps: '12-15', actualWeightKg: 10, actualReps: 12, actualRpe: 10, completed: false }
      ]
    }
  ]);
  const [programAssignedSuccess, setProgramAssignedSuccess] = useState(false);

  // Nutrition Builder Form State
  const [nutriCalories, setNutriCalories] = useState(nutritionPlan?.calories ?? 2450);
  const [nutriProtein, setNutriProtein] = useState(nutritionPlan?.proteinGrams ?? 210);
  const [nutriCarbs, setNutriCarbs] = useState(nutritionPlan?.carbsGrams ?? 240);
  const [nutriFat, setNutriFat] = useState(nutritionPlan?.fatGrams ?? 65);
  const [nutriWater, setNutriWater] = useState(nutritionPlan?.waterLiters ?? 3.5);
  const [nutriNotes, setNutriNotes] = useState(nutritionPlan?.dailyNotes ?? '');
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

  const fallbackClient: ClientRosterItem = {
    id: 'client_alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    status: 'active',
    planName: '1-on-1 Elite Coaching',
    adherenceRate: 96,
    joinedDate: 'Jan 15, 2026',
    primaryGoal: 'Recomposition & Hypertrophy',
    startingWeightKg: 84.5,
    currentWeightKg: 81.2,
    targetWeightKg: 78.0,
    injuryNotes: 'Mild shoulder sensitivity with wide flat grip.',
    daysPerWeek: 4,
    availableEquipment: ['Barbells', 'Dumbbells', 'Cables']
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
  const visibleClients = clients.filter(c => {
    if (isPersonalCoachView) {
      const clientCoachId = c.coachId || c.assignedCoachId;
      return clientCoachId === currentUserId;
    }
    return true; // admin sees all
  });

  const filteredClients = visibleClients.filter(c => 
    (c.name || '').toLowerCase().includes(clientSearch.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.planName || '').toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectedClient = visibleClients.find(c => c.id === selectedClientId) || visibleClients[0] || fallbackClient;
  const selectedCheckIn = checkIns.find(c => c.id === activeCheckInId) || checkIns[0];

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
    const targetId = selectedClientId || selectedClient.id || 'client_alex';
    const newSession: WorkoutSession = {
      id: 'workout_' + Date.now(),
      clientId: targetId,
      assignedDate: 'Today',
      title: builderWorkoutTitle,
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
    if (updateNutritionPlan) {
      updateNutritionPlan({
        ...nutritionPlan,
        calories: nutriCalories,
        proteinGrams: nutriProtein,
        carbsGrams: nutriCarbs,
        fatGrams: nutriFat,
        waterLiters: nutriWater,
        dailyNotes: nutriNotes,
        updatedAt: 'Just now'
      });
    }
    setNutritionSaved(true);
    setTimeout(() => setNutritionSaved(false), 2000);
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
    const targetId = selectedClientId || selectedClient.id || 'client_alex';
    if (sendChatMessage) {
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
                  {currentUser?.displayName || user?.displayName || 'Coach Marcus Vance'}
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
            { id: 'checkins', label: 'Check-In Review Queue', icon: CheckSquare, badge: '1 Review' },
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
                              <div className="font-semibold text-neutral-900">{c.planName}</div>
                              <span className="text-[11px] text-neutral-500">{c.primaryGoal}</span>
                            </td>

                            <td className="py-4 px-6">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                c.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {c.status}
                              </span>
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
              {selectedClient ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedClient.avatarUrl}
                        alt={selectedClient.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-red-600/50"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                          Client Profile &bull; Joined {selectedClient.joinedDate}
                        </span>
                        <h2 className="text-2xl font-black text-neutral-900 uppercase font-display">
                          {selectedClient.name}
                        </h2>
                        <p className="text-xs text-neutral-500">{selectedClient.email} &bull; Goal: <strong className="text-neutral-900">{selectedClient.primaryGoal}</strong></p>
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

                  {/* Body Composition Tracking */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">
                      Weight & Metric Trajectory
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-center">
                        <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Baseline Starting</span>
                        <span className="text-lg font-black text-neutral-900 font-mono">{selectedClient.startingWeightKg} kg</span>
                      </div>
                      <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-center">
                        <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Current Weight</span>
                        <span className="text-lg font-black text-red-600 font-mono">{selectedClient.currentWeightKg} kg</span>
                      </div>
                      <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-center">
                        <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Target Goal</span>
                        <span className="text-lg font-black text-emerald-600 font-mono">{selectedClient.targetWeightKg} kg</span>
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
                        {selectedClient.injuryNotes || 'None reported. Cleared for all compound loads.'}
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase mb-1">
                        <Clock className="w-3.5 h-3.5 text-red-600" />
                        <span>Logistics & Availability</span>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed">
                        {selectedClient.daysPerWeek} days/week &bull; Equipment: {selectedClient.availableEquipment?.join(', ') || 'Commercial gym access'}
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
                  Select a client from the roster to inspect profile and program data.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. PROGRAM & MACRO BUILDER */}
        {activeTab === 'builder' && (
          <div className="space-y-8">
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
                      Assigning to client: <strong className="text-neutral-900">{selectedClient.name}</strong>
                    </p>
                  </div>

                  <button
                    onClick={handlePublishWorkout}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-500/20 cursor-pointer"
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

                  {builderExercises.map((ex, exIdx) => (
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
                  ))}
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
                    Configured for {selectedClient.name}
                  </p>
                </div>

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
                      onChange={(e) => setNutriCalories(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono text-base focus:border-red-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Protein (g)</label>
                      <input
                        type="number"
                        value={nutriProtein}
                        onChange={(e) => setNutriProtein(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        value={nutriCarbs}
                        onChange={(e) => setNutriCarbs(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Fat (g)</label>
                      <input
                        type="number"
                        value={nutriFat}
                        onChange={(e) => setNutriFat(Number(e.target.value))}
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
                      onChange={(e) => setNutriWater(Number(e.target.value))}
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
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:border-red-600 focus:bg-white focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
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
              <h2 className="text-xl font-black text-neutral-900 uppercase font-display mb-4">
                Incoming Weekly Submissions
              </h2>

              {checkIns.map((ci) => {
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
              })}
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 uppercase font-display">
                  Client Intake Form Pipeline
                </h2>
                <p className="text-xs text-neutral-500">
                  Data submitted through the public onboarding flow routed for initial split programming.
                </p>
              </div>
            </div>

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
                        <p className="text-xs text-neutral-500">{intake.clientEmail} &bull; Submitted {intake.submittedAt}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('builder');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-red-500/20"
                    >
                      <Dumbbell className="w-4 h-4" />
                      <span>Initialize Program</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">Goal</span>
                      <span className="text-xs font-bold text-neutral-900 uppercase">{intake.primaryGoal}</span>
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
                      <span className="text-xs font-bold text-neutral-900 font-mono">{intake.trainingDaysPerWeek} Days / {intake.workoutDurationMinutes} min</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                      <span className="font-bold text-red-600 uppercase block mb-1">Injury History & Medical Clearance</span>
                      <p className="text-neutral-700">{intake.injuryHistory || 'None noted.'}</p>
                      <p className="text-[11px] text-neutral-500 mt-1">{intake.medicalNotes}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                      <span className="font-bold text-red-600 uppercase block mb-1">Nutrition & Exclusions</span>
                      <p className="text-neutral-700">Pref: {intake.dietaryPreference} &bull; Excluded: {intake.excludedFoods || 'None'}</p>
                      <p className="text-[11px] text-neutral-500 mt-1">Supplements: {intake.supplementHistory || 'None'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                  <p className="text-[11px] text-neutral-500">{selectedClient.planName}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase">
                Coach Roster Channel
              </span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderRole === 'coach';
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
                  className="bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:border-red-600 focus:outline-none font-bold"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.planName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ProgressAnalyticsView clientId={selectedClientId} isCoachView={true} />
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
