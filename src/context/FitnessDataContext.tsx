import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CoachingPlan,
  Exercise,
  WorkoutTemplate,
  AssignedWorkout,
  WeeklyCheckIn,
  NutritionPlan,
  ChatMessage,
  CMSContent,
  IntakeFormData,
  ClientRosterItem,
  InAppNotification,
  CoachMember,
  ProgressMetricPoint,
  ProgressPhotoRecord
} from '../types';
import {
  INITIAL_COACHING_PLANS,
  INITIAL_EXERCISES,
  INITIAL_TEMPLATES,
  INITIAL_ASSIGNED_WORKOUT,
  INITIAL_NUTRITION_PLAN,
  INITIAL_CHECKINS,
  INITIAL_MESSAGES,
  INITIAL_CMS_CONTENT,
  INITIAL_CLIENTS,
  INITIAL_COACHES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROGRESS_METRICS,
  INITIAL_PROGRESS_PHOTOS
} from '../data/seedData';
import { useAuth } from './AuthContext';

interface FitnessDataContextType {
  clients: ClientRosterItem[];
  coachingPlans: CoachingPlan[];
  exercises: Exercise[];
  templates: WorkoutTemplate[];
  assignedWorkout: AssignedWorkout;
  nutritionPlan: NutritionPlan;
  checkIns: WeeklyCheckIn[];
  messages: ChatMessage[];
  cmsContent: CMSContent;
  intakeForms: IntakeFormData[];
  intakeSubmissions: IntakeFormData[]; // Compatibility alias
  coaches: CoachMember[];
  notifications: InAppNotification[];
  progressMetrics: ProgressMetricPoint[];
  progressPhotos: ProgressPhotoRecord[];
  
  // Actions
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  deleteExercise: (id: string) => void;
  addWorkoutTemplate: (template: Omit<WorkoutTemplate, 'id'>) => void;
  duplicateTemplate: (templateId: string) => void;
  assignTemplateToClient: (templateId: string, clientId: string) => void;
  assignWorkoutToClient: (clientId: string, workout: AssignedWorkout) => void;
  logWorkoutSet: (exerciseIndex: number, setIndex: number, weightKg: number, reps: number, rpe: number, completed: boolean) => void;
  updateExerciseClientNotes: (exerciseIndex: number, notes: string) => void;
  completeWorkout: (rating: number, feedback: string, durationMinutes: number) => void;
  submitWeeklyCheckIn: (checkIn: Omit<WeeklyCheckIn, 'id' | 'submissionDate' | 'reviewedByCoach'>) => void;
  submitIntakeForm: (data: Omit<IntakeFormData, 'id' | 'submittedAt' | 'status'>) => void;
  sendChatMessage: (text: string, recipientId: string) => void;
  updateNutritionPlan: (updates: Partial<NutritionPlan>) => void;
  provideCoachFeedback: (checkInId: string, feedback: string) => void;
  respondToCheckIn: (checkInId: string, feedback: string) => void; // Compatibility alias
  updateCMS: (updates: Partial<CMSContent>) => void;
  updateCMSContent: (updates: Partial<CMSContent>) => void; // Compatibility alias
  resetCMSToDefaults: () => void;
  updatePlanPrice: (planId: string, newPrice: number) => void;
  updatePlan: (planId: string, updates: Partial<CoachingPlan>) => void;
  addPlan: (plan: CoachingPlan) => void;
  deletePlan: (planId: string) => void;

  // Multi-Coach / Multi-tenant Actions
  addCoach: (coach: Omit<CoachMember, 'id' | 'joinedDate'>) => void;
  updateCoach: (id: string, updates: Partial<CoachMember>) => void;
  deleteCoach: (id: string) => void;
  assignCoachToClient: (clientId: string, coachId: string) => void;

  // In-App Notification Actions
  addNotification: (notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Progress & Analytics Actions
  logProgressMetric: (metric: Omit<ProgressMetricPoint, 'id'>) => void;
  addProgressPhoto: (photo: Omit<ProgressPhotoRecord, 'id'>) => void;
}

const FitnessDataContext = createContext<FitnessDataContextType | undefined>(undefined);

export const FitnessDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [coachingPlans, setCoachingPlans] = useState<CoachingPlan[]>(() => {
    const saved = localStorage.getItem('bfl_plans');
    return saved ? JSON.parse(saved) : INITIAL_COACHING_PLANS;
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('bfl_exercises');
    return saved ? JSON.parse(saved) : INITIAL_EXERCISES;
  });

  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    const saved = localStorage.getItem('bfl_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [assignedWorkout, setAssignedWorkout] = useState<AssignedWorkout>(() => {
    const saved = localStorage.getItem('bfl_assigned_workout');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNED_WORKOUT;
  });

  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan>(() => {
    const saved = localStorage.getItem('bfl_nutrition_plan');
    return saved ? JSON.parse(saved) : INITIAL_NUTRITION_PLAN;
  });

  const [checkIns, setCheckIns] = useState<WeeklyCheckIn[]>(() => {
    const saved = localStorage.getItem('bfl_checkins');
    return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('bfl_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [cmsContent, setCmsContent] = useState<CMSContent>(() => {
    const saved = localStorage.getItem('bfl_cms');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CMS_CONTENT,
          ...parsed,
          massFounder: { ...INITIAL_CMS_CONTENT.massFounder!, ...(parsed.massFounder || {}) },
          pouyaFounder: { ...INITIAL_CMS_CONTENT.pouyaFounder!, ...(parsed.pouyaFounder || {}) }
        };
      } catch (e) {
        console.error('Error parsing bfl_cms:', e);
      }
    }
    return INITIAL_CMS_CONTENT;
  });

  const [clients, setClients] = useState<ClientRosterItem[]>(() => {
    const saved = localStorage.getItem('bfl_clients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: ClientRosterItem, idx: number) => {
          const fallback = INITIAL_CLIENTS.find(ic => ic.id === c.id) || INITIAL_CLIENTS[idx] || INITIAL_CLIENTS[0];
          // If the client previously had marcus or sarah, keep it, but ensure alex and jordan map to founders if not reassigned
          let coachId = c.coachId || c.assignedCoachId;
          if (!coachId || coachId === 'admin_marcus_vance') {
            coachId = fallback.coachId || fallback.assignedCoachId || 'admin_mass_narimanian';
          }
          return { ...c, coachId, assignedCoachId: coachId };
        });
      } catch (e) {
        return INITIAL_CLIENTS;
      }
    }
    return INITIAL_CLIENTS;
  });

  const [intakeForms, setIntakeForms] = useState<IntakeFormData[]>(() => {
    const saved = localStorage.getItem('bfl_intake_forms');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'intake_alex',
        clientId: 'client_alex',
        clientName: 'Alex Rivera',
        clientEmail: 'alex.rivera@example.com',
        submittedAt: '2026-02-15T14:30:00Z',
        age: 28,
        gender: 'Male',
        heightCm: 178,
        currentWeightKg: 83.5,
        targetWeightKg: 78.0,
        primaryGoal: 'recomp',
        baselineMeasurements: {
          chestCm: 104,
          waistCm: 86,
          hipsCm: 99,
          bicepsCm: 38,
          thighsCm: 60
        },
        injuryHistory: 'Mild left shoulder impingement 2 years ago during heavy flat bench press. Pain-free with proper scapular retraction.',
        medicalNotes: 'No cardiovascular conditions. Cleared by primary care physician for high-intensity resistance training.',
        hasMedicalClearance: true,
        trainingDaysPerWeek: 4,
        trainingLocation: 'commercial_gym',
        availableEquipment: ['Barbells', 'Dumbbells', 'Cables', 'Leg Press', 'Pull-up Bar', 'Adjustable Benches'],
        workoutDurationMinutes: 60,
        dietaryPreference: 'flexible_dieting',
        foodAllergies: 'None',
        excludedFoods: 'Grapefruit',
        mealsPerDay: 4,
        supplementHistory: 'Creatine monohydrate (5g/day), Whey protein isolate, Multivitamin',
        status: 'program_created'
      }
    ];
  });

  const [coaches, setCoaches] = useState<CoachMember[]>(() => {
    const saved = localStorage.getItem('bfl_coaches');
    let list: CoachMember[] = saved ? JSON.parse(saved) : INITIAL_COACHES;
    // Normalize any legacy 'head_coach' to 'coach'
    list = list.map(c => ((c.role as any) === 'head_coach' ? { ...c, role: 'coach' as const } : c));
    // Guarantee that both founders/admins (Mass Narimanian & Pouya Marghzari) are always included in available coaches
    INITIAL_COACHES.forEach((seedCoach) => {
      if (seedCoach.role === 'admin' && !list.some((c) => c.id === seedCoach.id)) {
        list = [seedCoach, ...list];
      }
    });
    return list;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('bfl_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [progressMetrics, setProgressMetrics] = useState<ProgressMetricPoint[]>(() => {
    const saved = localStorage.getItem('bfl_progress_metrics');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS_METRICS;
  });

  const [progressPhotos, setProgressPhotos] = useState<ProgressPhotoRecord[]>(() => {
    const saved = localStorage.getItem('bfl_progress_photos');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS_PHOTOS;
  });

  // Persist state updates
  useEffect(() => {
    localStorage.setItem('bfl_plans', JSON.stringify(coachingPlans));
  }, [coachingPlans]);

  useEffect(() => {
    localStorage.setItem('bfl_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('bfl_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('bfl_assigned_workout', JSON.stringify(assignedWorkout));
  }, [assignedWorkout]);

  useEffect(() => {
    localStorage.setItem('bfl_nutrition_plan', JSON.stringify(nutritionPlan));
  }, [nutritionPlan]);

  useEffect(() => {
    localStorage.setItem('bfl_checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('bfl_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('bfl_cms', JSON.stringify(cmsContent));
  }, [cmsContent]);

  useEffect(() => {
    localStorage.setItem('bfl_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('bfl_intake_forms', JSON.stringify(intakeForms));
  }, [intakeForms]);

  useEffect(() => {
    localStorage.setItem('bfl_coaches', JSON.stringify(coaches));
  }, [coaches]);

  useEffect(() => {
    localStorage.setItem('bfl_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bfl_progress_metrics', JSON.stringify(progressMetrics));
  }, [progressMetrics]);

  useEffect(() => {
    localStorage.setItem('bfl_progress_photos', JSON.stringify(progressPhotos));
  }, [progressPhotos]);

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newEx: Exercise = {
      ...exercise,
      id: 'ex_' + Date.now()
    };
    setExercises(prev => [newEx, ...prev]);
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const addWorkoutTemplate = (template: Omit<WorkoutTemplate, 'id'>) => {
    const newTpl: WorkoutTemplate = {
      ...template,
      id: 'tpl_' + Date.now()
    };
    setTemplates(prev => [...prev, newTpl]);
  };

  const duplicateTemplate = (templateId: string) => {
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;
    const duplicated: WorkoutTemplate = {
      ...tpl,
      id: 'tpl_' + Date.now(),
      name: `${tpl.name} (Copy)`
    };
    setTemplates(prev => [...prev, duplicated]);
  };

  const assignTemplateToClient = (templateId: string, _clientId: string) => {
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl || tpl.workouts.length === 0) return;
    const firstWorkout = tpl.workouts[0];
    const newAssigned: AssignedWorkout = {
      id: 'workout_' + Date.now(),
      clientId: _clientId,
      title: firstWorkout.title,
      description: `Assigned from template: ${tpl.name}`,
      dayOfWeek: firstWorkout.dayName || 'Day 1',
      assignedDate: new Date().toISOString().split('T')[0],
      isCompleted: false,
      exercises: firstWorkout.exercises.map((ex, idx) => ({
        ...ex,
        id: 'we_' + Date.now() + '_' + idx,
        sets: ex.sets.map(s => ({ ...s, completed: false }))
      }))
    };
    setAssignedWorkout(newAssigned);
  };

  const assignWorkoutToClient = (clientId: string, workout: AssignedWorkout) => {
    const formatted: AssignedWorkout = {
      ...workout,
      clientId,
      assignedDate: workout.assignedDate || new Date().toISOString().split('T')[0]
    };
    setAssignedWorkout(formatted);
    try {
      localStorage.setItem(`bfl_assigned_workout_${clientId}`, JSON.stringify(formatted));
    } catch {
      // ignore
    }

    // Trigger in-app notification for the client
    addNotification({
      userId: clientId,
      recipientRole: 'client',
      title: 'New Program Block Assigned',
      message: `Coach assigned: ${workout.title}`,
      type: 'workout_assigned',
      actionTab: 'workout'
    });
  };

  const logWorkoutSet = (
    exerciseIndex: number,
    setIndex: number,
    weightKg: number,
    reps: number,
    rpe: number,
    completed: boolean
  ) => {
    setAssignedWorkout(prev => {
      const updatedExercises = [...prev.exercises];
      const targetExercise = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...targetExercise.sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        actualWeightKg: weightKg,
        actualReps: reps,
        actualRpe: rpe,
        completed
      };
      
      targetExercise.sets = updatedSets;
      updatedExercises[exerciseIndex] = targetExercise;

      return {
        ...prev,
        exercises: updatedExercises
      };
    });
  };

  const updateExerciseClientNotes = (exerciseIndex: number, notes: string) => {
    setAssignedWorkout(prev => {
      const updated = [...prev.exercises];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        clientNotes: notes
      };
      return { ...prev, exercises: updated };
    });
  };

  const completeWorkout = (rating: number, feedback: string, durationMinutes: number) => {
    setAssignedWorkout(prev => {
      // Calculate total volume load
      let totalVolume = 0;
      prev.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.completed && s.actualWeightKg && s.actualReps) {
            totalVolume += s.actualWeightKg * s.actualReps;
          }
        });
      });

      if (totalVolume > 0) {
        logProgressMetric({
          clientId: prev.clientId || user?.uid || 'client_alex',
          date: new Date().toISOString().split('T')[0],
          weightKg: 81.2,
          volumeLoadKg: totalVolume,
          notes: `Workout session: ${prev.title}`
        });
      }

      return {
        ...prev,
        isCompleted: true,
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rating,
        clientGeneralFeedback: feedback,
        durationMinutes
      };
    });

    addNotification({
      recipientRole: 'coach',
      title: 'Workout Completed',
      message: `${user?.displayName || 'Client'} finished today's training session (Rating: ${rating}/5).`,
      type: 'workout_assigned',
      actionTab: 'clients'
    });
  };

  const submitWeeklyCheckIn = (checkInData: Omit<WeeklyCheckIn, 'id' | 'submissionDate' | 'reviewedByCoach'>) => {
    const newCheckIn: WeeklyCheckIn = {
      ...checkInData,
      id: 'chk_' + Date.now(),
      submissionDate: new Date().toISOString().split('T')[0],
      reviewedByCoach: false
    };
    setCheckIns(prev => [newCheckIn, ...prev]);

    // Automatically record progress metrics from check-in
    logProgressMetric({
      clientId: checkInData.clientId,
      date: new Date().toISOString().split('T')[0],
      weightKg: checkInData.weightKg,
      waistCm: checkInData.waistMeasurementCm,
      notes: `Week ${checkInData.weekNumber} check-in log`
    });

    addNotification({
      recipientRole: 'coach',
      title: 'Check-In Received',
      message: `${checkInData.clientName} submitted Week ${checkInData.weekNumber} check-in (${checkInData.weightKg}kg).`,
      type: 'checkin_feedback',
      actionTab: 'clients'
    });
  };

  const submitIntakeForm = (data: Omit<IntakeFormData, 'id' | 'submittedAt' | 'status'>) => {
    const newForm: IntakeFormData = {
      ...data,
      id: 'intake_' + Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'pending_review'
    };
    setIntakeForms(prev => [newForm, ...prev]);

    addNotification({
      recipientRole: 'coach',
      title: 'New Client Intake Form',
      message: `${data.clientName} submitted complete medical and training onboarding intake.`,
      type: 'system',
      actionTab: 'clients'
    });
  };

  const sendChatMessage = (text: string, recipientId: string) => {
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: user?.uid || 'client_alex',
      senderName: user?.displayName || 'Alex Rivera',
      senderRole: user?.role || 'client',
      recipientId,
      text,
      timestamp: 'Just now',
      read: false
    };
    setMessages(prev => [...prev, newMsg]);

    // Simulated instant reply if client is talking to coach
    if (user?.role === 'client') {
      setTimeout(() => {
        const coachReply: ChatMessage = {
          id: 'msg_' + (Date.now() + 1),
          senderId: 'coach_marcus',
          senderName: 'Coach Marcus Vance',
          senderRole: 'coach',
          recipientId: user.uid,
          text: `Got your message! I've logged this in your coaching file. Focus on keeping that eccentric control and recovery on point today. Let's get it! 💪`,
          timestamp: 'Just now',
          read: true
        };
        setMessages(current => [...current, coachReply]);

        addNotification({
          userId: user.uid,
          recipientRole: 'client',
          title: 'New Message from Coach Marcus',
          message: coachReply.text.slice(0, 75) + '...',
          type: 'message_received',
          actionTab: 'chat'
        });
      }, 1500);
    }
  };

  const updateNutritionPlan = (updates: Partial<NutritionPlan>) => {
    setNutritionPlan(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    }));

    if (user?.role === 'coach') {
      addNotification({
        userId: 'client_alex',
        recipientRole: 'client',
        title: 'Macro Targets Updated',
        message: `Your coach revised your daily macronutrient & hydration guidelines.`,
        type: 'nutrition_updated',
        actionTab: 'nutrition'
      });
    }
  };

  const provideCoachFeedback = (checkInId: string, feedback: string) => {
    const targetCheckin = checkIns.find(c => c.id === checkInId);
    setCheckIns(prev => prev.map(c => {
      if (c.id === checkInId) {
        return {
          ...c,
          coachFeedback: feedback,
          reviewedByCoach: true,
          reviewedAt: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));

    if (targetCheckin) {
      addNotification({
        userId: targetCheckin.clientId,
        recipientRole: 'client',
        title: 'Coach Feedback Received',
        message: `Coach Marcus reviewed your Week ${targetCheckin.weekNumber} check-in! Check out his guidance.`,
        type: 'checkin_feedback',
        actionTab: 'checkin'
      });
    }
  };

  const updateCMS = (updates: Partial<CMSContent>) => {
    setCmsContent(prev => ({
      ...prev,
      ...updates
    }));
  };

  const resetCMSToDefaults = () => {
    setCmsContent(INITIAL_CMS_CONTENT);
    localStorage.removeItem('bfl_cms');
  };

  const updatePlanPrice = (planId: string, newPrice: number) => {
    setCoachingPlans(prev => prev.map(p => p.id === planId ? { ...p, price: newPrice } : p));
  };

  const updatePlan = (planId: string, updates: Partial<CoachingPlan>) => {
    setCoachingPlans(prev => prev.map(p => p.id === planId ? { ...p, ...updates } : p));
  };

  const addPlan = (newPlan: CoachingPlan) => {
    setCoachingPlans(prev => [...prev, newPlan]);
  };

  const deletePlan = (planId: string) => {
    setCoachingPlans(prev => prev.filter(p => p.id !== planId));
  };

  // Multi-Coach / Multi-Tenant Scaling Handlers
  const addCoach = (coachData: Omit<CoachMember, 'id' | 'joinedDate'>) => {
    const newCoach: CoachMember = {
      ...coachData,
      id: 'coach_' + Date.now(),
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    setCoaches(prev => [...prev, newCoach]);
    addNotification({
      recipientRole: 'coach',
      title: 'New Coach Added',
      message: `${coachData.name} has joined the staff as ${coachData.role === 'nutritionist' ? 'Nutrition Specialist' : 'Coach'}.`,
      type: 'system',
      actionTab: 'clients'
    });
  };

  const updateCoach = (id: string, updates: Partial<CoachMember>) => {
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCoach = (id: string) => {
    // Protect Founders & Admins from deletion
    if (id === 'admin_mass_narimanian' || id === 'admin_pouya_marghzari') {
      return;
    }
    setCoaches(prev => prev.filter(c => c.id !== id));
  };

  const assignCoachToClient = (clientId: string, coachId: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedCoachId: coachId, coachId: coachId } : c));
    const targetCoach = coaches.find(co => co.id === coachId);
    if (targetCoach) {
      addNotification({
        userId: clientId,
        recipientRole: 'client',
        title: 'Assigned Coach Updated',
        message: `Your lead coach is now ${targetCoach.name} (${targetCoach.specialty}).`,
        type: 'system',
        actionTab: 'profile'
      });
    }
  };

  // In-App Notification Handlers
  const addNotification = (notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: InAppNotification = {
      ...notif,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Progress & Analytics Handlers
  const logProgressMetric = (metric: Omit<ProgressMetricPoint, 'id'>) => {
    const newPoint: ProgressMetricPoint = {
      ...metric,
      id: 'pm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
    };
    setProgressMetrics(prev => [...prev, newPoint]);
    setClients(prev => prev.map(c => c.id === metric.clientId ? { ...c, currentWeightKg: metric.weightKg } : c));
  };

  const addProgressPhoto = (photo: Omit<ProgressPhotoRecord, 'id'>) => {
    const newPhoto: ProgressPhotoRecord = {
      ...photo,
      id: 'photo_' + Date.now()
    };
    setProgressPhotos(prev => [newPhoto, ...prev]);
    addNotification({
      recipientRole: 'coach',
      title: 'New Progress Photo Uploaded',
      message: `${user?.displayName || 'Client'} uploaded new physique check-in photos (${photo.weightKg}kg).`,
      type: 'progress_logged',
      actionTab: 'clients'
    });
  };

  return (
    <FitnessDataContext.Provider
      value={{
        clients,
        coachingPlans,
        exercises,
        templates,
        assignedWorkout,
        nutritionPlan,
        checkIns,
        messages,
        cmsContent,
        intakeForms,
        intakeSubmissions: intakeForms,
        coaches,
        notifications,
        progressMetrics,
        progressPhotos,
        addExercise,
        deleteExercise,
        addWorkoutTemplate,
        duplicateTemplate,
        assignTemplateToClient,
        assignWorkoutToClient,
        logWorkoutSet,
        updateExerciseClientNotes,
        completeWorkout,
        submitWeeklyCheckIn,
        submitIntakeForm,
        sendChatMessage,
        updateNutritionPlan,
        provideCoachFeedback,
        respondToCheckIn: provideCoachFeedback,
        updateCMS,
        updateCMSContent: updateCMS,
        resetCMSToDefaults,
        updatePlanPrice,
        updatePlan,
        addPlan,
        deletePlan,
        addCoach,
        updateCoach,
        deleteCoach,
        assignCoachToClient,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        logProgressMetric,
        addProgressPhoto
      }}
    >
      {children}
    </FitnessDataContext.Provider>
  );
};

export const useFitnessData = () => {
  const context = useContext(FitnessDataContext);
  if (!context) {
    throw new Error('useFitnessData must be used within a FitnessDataProvider');
  }
  return context;
};
