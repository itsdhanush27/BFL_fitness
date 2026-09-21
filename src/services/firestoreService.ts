/**
 * firestoreService.ts
 * ---------------------------------------------------------------------------
 * Typed CRUD helpers and real-time subscriptions for Firestore collections:
 *   • users/{uid}      — client / coach / admin profiles
 *   • intakes/{id}     — onboarding intake submissions
 *   • workouts/{id}    — assigned workout routines & session logs
 * ---------------------------------------------------------------------------
 */

import {
  firebaseConfig,
  db,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from './firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

import type { 
  UserProfile, 
  IntakeFormData, 
  AssignedWorkout, 
  ClientRosterItem,
  NutritionPlan,
  WeeklyCheckIn,
  ChatMessage,
  CoachMember,
  ProgressMetricPoint,
  ProgressPhotoRecord
} from '../types';
import { INITIAL_COACHING_PLANS } from '../data/seedData';

// ───────────────────────────────────────────────────────────────────────────
// COLLECTION NAMES
// ───────────────────────────────────────────────────────────────────────────
const USERS_COL     = 'users';
const INTAKES_COL   = 'intakes';
const WORKOUTS_COL  = 'workouts';
const NUTRITION_COL = 'nutrition';
const CHECKINS_COL  = 'checkins';
const MESSAGES_COL  = 'messages';
const COACHES_COL   = 'coaches';
const NOTIFICATIONS_COL = 'notifications';
const METRICS_COL   = 'metrics';
const PROGRESS_PHOTOS_COL = 'progress_photos';

/** Recursively strips undefined properties so Firestore doesn't reject write payloads */
export function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanPayload(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = cleanPayload(value);
      }
    }
    return result as T;
  }
  return obj;
}

// ───────────────────────────────────────────────────────────────────────────
// USER PROFILE helpers
// ───────────────────────────────────────────────────────────────────────────

/** Read a single user document. Returns null if it doesn't exist. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, USERS_COL, uid));
    if (snap.exists()) {
      return { ...snap.data(), uid, id: uid } as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('[firestoreService] getUserProfile error:', err);
    return null;
  }
}

/**
 * Create or fully overwrite a user document.
 * Uses { merge: true } so partial updates don't destroy unset fields.
 */
export async function saveUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COL, uid), {
      ...profile,
      uid,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.error('[firestoreService] saveUserProfile error:', err);
    throw err;
  }
}

/** Partial field update on an existing user document. */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    await updateDoc(doc(db, USERS_COL, uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('[firestoreService] updateUserProfile error:', err);
    throw err;
  }
}

/** Real-time listener for a single user profile. Returns an unsubscribe function. */
export function subscribeToUserProfile(
  uid: string,
  onUpdate: (profile: UserProfile | null) => void
): () => void {
  return onSnapshot(
    doc(db, USERS_COL, uid),
    (snap) => {
      if (snap.exists()) {
        onUpdate({ ...snap.data(), uid, id: uid } as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('[firestoreService] subscribeToUserProfile error:', err);
      onUpdate(null);
    }
  );
}

/**
 * Real-time listener for all clients assigned to a specific coach
 * (or ALL clients if no coachId filter is provided — for admins).
 * Returns an unsubscribe function.
 */
export function subscribeToClients(
  coachId: string | null,
  onUpdate: (clients: ClientRosterItem[]) => void
): () => void {
  const colRef = collection(db, USERS_COL);
  const q = query(colRef, where('role', '==', 'client'));

  return onSnapshot(
    q,
    (snap) => {
      let list: ClientRosterItem[] = snap.docs.map((d) => {
        const data = d.data();
        const assigned = data.assignedCoachId || data.coachId || '';
        
        const isPending = data.subscriptionStatus === 'pending_approval' || 
          data.approvalStatus === 'pending' || 
          data.status === 'pending' || 
          Boolean(data.renewalRequestedPlanId);

        const isExpired = !isPending && (
          data.subscriptionStatus === 'expired' || 
          data.status === 'expired' ||
          (data.planExpiresAt && new Date(data.planExpiresAt).getTime() <= Date.now())
        );

        const effectiveStatus: ClientRosterItem['status'] = isPending
          ? 'pending'
          : (isExpired ? 'expired' : (data.status || (data.hasCompletedIntake ? 'active' : 'pending')));

        const effectiveSubscriptionStatus: ClientRosterItem['subscriptionStatus'] = isPending
          ? 'pending_approval'
          : (isExpired ? 'expired' : (data.subscriptionStatus || 'active'));

        const matchingPlan = INITIAL_COACHING_PLANS.find(p => 
          p.id === data.activePlanId || 
          p.name?.toLowerCase() === data.activePlanName?.toLowerCase()
        );
        const resolvedPlanName = data.activePlanName 
          ? data.activePlanName 
          : (matchingPlan ? `${matchingPlan.name} ($${matchingPlan.price}${matchingPlan.period})` : (data.activePlanId || 'No Plan'));

        return {
          id: d.id,
          name: data.displayName || data.email || '',
          email: data.email || '',
          avatarUrl: data.photoURL || '',
          status: effectiveStatus,
          planName: resolvedPlanName,
          activePlanId: data.activePlanId,
          activePlanName: data.activePlanName || resolvedPlanName,
          activePlanPrice: data.activePlanPrice || matchingPlan?.price,
          adherenceRate: data.adherenceRate ?? 0,
          joinedDate: data.createdAt || '',
          primaryGoal: data.primaryGoal || '',
          startingWeightKg: data.startingWeightKg ?? (data.currentWeightKg ?? 0),
          currentWeightKg: data.currentWeightKg ?? 0,
          targetWeightKg: data.targetWeightKg ?? 0,
          injuryNotes: data.injuryNotes || '',
          daysPerWeek: data.daysPerWeek ?? (data.trainingDaysPerWeek ?? 0),
          availableEquipment: data.availableEquipment || [],
          assignedCoachId: assigned,
          coachId: assigned,
          intakeStatus: data.intakeStatus,
          planExpiresAt: data.planExpiresAt,
          packageStartedAt: data.packageStartedAt,
          packageDurationDays: data.packageDurationDays,
          subscriptionStatus: effectiveSubscriptionStatus,
          renewalRequestedPlanId: data.renewalRequestedPlanId,
          renewalRequestedPlanName: data.renewalRequestedPlanName,
          renewalRequestedPlanPrice: data.renewalRequestedPlanPrice,
          renewalRequestedAt: data.renewalRequestedAt,
        } as ClientRosterItem;
      });

      if (coachId) {
        list = list.filter((c) => c.assignedCoachId === coachId || c.coachId === coachId);
      }

      onUpdate(list);
    },
    (err) => {
      console.error('[firestoreService] subscribeToClients error:', err);
      onUpdate([]);
    }
  );
}

// ───────────────────────────────────────────────────────────────────────────
// INTAKE FORM helpers
// ───────────────────────────────────────────────────────────────────────────

/**
 * Submit intake form to Firestore `intakes` collection.
 * Also flips `hasCompletedIntake` and synchronizes baseline trajectory data on the client's user doc.
 */
export async function submitIntakeToFirestore(intakeData: IntakeFormData): Promise<string> {
  try {
    const cleaned = cleanPayload(intakeData);
    // 1. Write the intake document
    const docRef = await addDoc(collection(db, INTAKES_COL), {
      ...cleaned,
      submittedAt: serverTimestamp(),
      status: 'pending_review',
    });

    // 2. Mark user's intake as completed & sync baseline metrics to client profile
    await setDoc(doc(db, USERS_COL, intakeData.clientId), {
      hasCompletedIntake: true,
      primaryGoal: intakeData.primaryGoal || 'general_fitness',
      startingWeightKg: Number(intakeData.currentWeightKg) || 0,
      currentWeightKg: Number(intakeData.currentWeightKg) || 0,
      targetWeightKg: Number(intakeData.targetWeightKg) || 0,
      daysPerWeek: Number(intakeData.trainingDaysPerWeek) || 0,
      trainingDaysPerWeek: Number(intakeData.trainingDaysPerWeek) || 0,
      availableEquipment: intakeData.availableEquipment || [],
      injuryNotes: intakeData.injuryHistory || intakeData.medicalNotes || '',
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 3. Automatically record baseline Day 0 progress metric point
    try {
      await addDoc(collection(db, METRICS_COL), cleanPayload({
        clientId: intakeData.clientId,
        date: new Date().toISOString().split('T')[0],
        weightKg: Number(intakeData.currentWeightKg) || 0,
        waistCm: intakeData.baselineMeasurements?.waistCm,
        chestCm: intakeData.baselineMeasurements?.chestCm,
        bicepsCm: intakeData.baselineMeasurements?.bicepsCm,
        notes: 'Baseline recorded from Onboarding Intake',
        createdAt: serverTimestamp(),
      }));

      if (intakeData.startingPhotos?.front) {
        await addDoc(collection(db, PROGRESS_PHOTOS_COL), cleanPayload({
          clientId: intakeData.clientId,
          date: new Date().toISOString().split('T')[0],
          frontUrl: intakeData.startingPhotos.front,
          sideUrl: intakeData.startingPhotos.side || '',
          backUrl: intakeData.startingPhotos.back || '',
          weightKg: Number(intakeData.currentWeightKg) || 0,
          notes: 'Baseline Onboarding Physique',
          createdAt: serverTimestamp(),
        }));
      }
    } catch (metricErr) {
      console.warn('[firestoreService] Baseline metric recording note:', metricErr);
    }

    return docRef.id;
  } catch (err) {
    console.error('[firestoreService] submitIntakeToFirestore error:', err);
    throw err;
  }
}

/**
 * Real-time listener for intake forms.
 * Coaches / admins see all; clients see only their own.
 */
export function subscribeToIntakes(
  filterClientId: string | null,
  onUpdate: (intakes: IntakeFormData[]) => void
): () => void {
  const colRef = collection(db, INTAKES_COL);
  const q = filterClientId
    ? query(colRef, where('clientId', '==', filterClientId))
    : colRef;

  return onSnapshot(
    q,
    (snap) => {
      const list: IntakeFormData[] = snap.docs.map((d) => {
        const data = d.data();
        let submittedAtStr = '';
        if (data.submittedAt?.toDate) {
          submittedAtStr = data.submittedAt.toDate().toISOString();
        } else if (typeof data.submittedAt === 'string') {
          submittedAtStr = data.submittedAt;
        } else if (data.submittedAt?.seconds) {
          submittedAtStr = new Date(data.submittedAt.seconds * 1000).toISOString();
        } else {
          submittedAtStr = new Date().toISOString();
        }
        return {
          ...data,
          id: d.id,
          submittedAt: submittedAtStr
        } as IntakeFormData;
      });
      list.sort((a, b) => {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return timeB - timeA;
      });
      onUpdate(list);
    },
    (err) => {
      console.error('[firestoreService] subscribeToIntakes error:', err);
    }
  );
}

/**
 * Update intake status in Firestore ('intakes' collection and 'users' collection).
 * When coach initializes a program or marks intake as reviewed:
 * 1. Updates the intake document's status to 'reviewed' (or 'active') with timestamp.
 * 2. Updates any matching documents in `intakes` with clientId.
 * 3. Updates the client's user document in `users` with intakeStatus and active status.
 */
export async function updateIntakeStatusInFirestore(
  intakeId: string,
  clientId?: string,
  status: 'pending_review' | 'program_created' | 'reviewed' | 'active' = 'reviewed'
): Promise<void> {
  try {
    const promises: Promise<any>[] = [];

    // 1. Direct update by intakeId if provided and not purely a synthetic prefix
    if (intakeId && !intakeId.startsWith('intake_synth_')) {
      const intakeDocRef = doc(db, INTAKES_COL, intakeId);
      promises.push(
        setDoc(
          intakeDocRef,
          {
            status,
            reviewedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch((err) => console.warn('[firestoreService] update intakeDocRef note:', err))
      );
    }

    // 2. Query any documents in `intakes` collection where clientId == clientId
    if (clientId) {
      try {
        const q = query(collection(db, INTAKES_COL), where('clientId', '==', clientId));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          if (d.id !== intakeId) {
            promises.push(
              updateDoc(d.ref, {
                status,
                reviewedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              }).catch((err) => console.warn('[firestoreService] updateDoc on intake doc note:', err))
            );
          }
        });
      } catch (qErr) {
        console.warn('[firestoreService] query intakes by clientId note:', qErr);
      }

      // 3. Update client profile in `users` collection to reflect reviewed intake and active status
      try {
        const userDocRef = doc(db, USERS_COL, clientId);
        promises.push(
          setDoc(
            userDocRef,
            {
              intakeStatus: status,
              status: 'active',
              hasCompletedIntake: true,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          ).catch((userErr) => console.warn('[firestoreService] update client user doc note:', userErr))
        );
      } catch (userErr) {
        console.warn('[firestoreService] update client user doc note:', userErr);
      }
    }

    await Promise.all(promises);
  } catch (err) {
    console.error('[firestoreService] updateIntakeStatusInFirestore error:', err);
    throw err;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// WORKOUT helpers
// ───────────────────────────────────────────────────────────────────────────

/**
 * Publish / assign a workout to an athlete.
 * If the workout already has an `id` we update in-place, otherwise create new.
 */
export async function publishWorkoutToFirestore(
  workout: AssignedWorkout,
  coachId?: string
): Promise<string> {
  try {
    const cleaned = cleanPayload(workout);
    const payload: Record<string, any> = {
      ...cleaned,
      coachId: coachId || '',
      updatedAt: serverTimestamp(),
    };

    if (workout.id && workout.id.length > 5) {
      // Update existing document
      await setDoc(doc(db, WORKOUTS_COL, workout.id), payload, { merge: true });
      return workout.id;
    } else {
      // Create new document
      delete payload.id; // Let Firestore assign the ID
      const docRef = await addDoc(collection(db, WORKOUTS_COL), payload);
      return docRef.id;
    }
  } catch (err) {
    console.error('[firestoreService] publishWorkoutToFirestore error:', err);
    throw err;
  }
}

/**
 * Real-time listener for workouts assigned to a specific client.
 * Returns the most recent incomplete workout (or latest completed if none active).
 */
export function subscribeToAthleteWorkouts(
  clientId: string,
  onUpdate: (workout: AssignedWorkout | null) => void
): () => void {
  const q = query(
    collection(db, WORKOUTS_COL),
    where('clientId', '==', clientId)
  );

  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onUpdate(null);
        return;
      }
      const workouts = snap.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as AssignedWorkout[];

      // Sort in memory: newest updatedAt or assignedDate first
      workouts.sort((a: any, b: any) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
        if (timeA !== timeB) return timeB - timeA;
        return (b.assignedDate || '').localeCompare(a.assignedDate || '');
      });

      // Prefer the first incomplete workout, otherwise the latest
      const active = workouts.find((w) => !w.isCompleted);
      onUpdate(active || workouts[0] || null);
    },
    (err) => {
      console.error('[firestoreService] subscribeToAthleteWorkouts error:', err);
      // Keep existing workout state rather than wiping out on network interruption
    }
  );
}

/**
 * Permanently clears all previous workout assignments and nutrition records
 * for an athlete upon renewal or new package checkout.
 */
export async function clearAthleteWorkoutsAndNutrition(clientId: string): Promise<void> {
  if (!clientId) return;
  try {
    const promises: Promise<any>[] = [];
    
    // Clear workouts collection documents for this client
    try {
      const workoutQ = query(collection(db, WORKOUTS_COL), where('clientId', '==', clientId));
      const workoutSnap = await getDocs(workoutQ);
      workoutSnap.docs.forEach((d) => {
        promises.push(deleteDoc(d.ref).catch((err) => console.warn('[firestoreService] delete workout error:', err)));
      });
    } catch (wErr) {
      console.warn('[firestoreService] clearAthleteWorkouts error:', wErr);
    }

    // Clear nutrition collection documents for this client
    try {
      const nutritionDocRef = doc(db, NUTRITION_COL, clientId);
      promises.push(deleteDoc(nutritionDocRef).catch((err) => console.warn('[firestoreService] delete nutrition doc error:', err)));
    } catch (nErr) {
      console.warn('[firestoreService] clearAthleteNutrition error:', nErr);
    }

    await Promise.all(promises);
  } catch (err) {
    console.warn('[firestoreService] clearAthleteWorkoutsAndNutrition error:', err);
  }
}

/**
 * Real-time listener for ALL workouts (coach / admin view).
 */
export function subscribeToAllWorkouts(
  onUpdate: (workouts: AssignedWorkout[]) => void
): () => void {
  const q = query(
    collection(db, WORKOUTS_COL),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as AssignedWorkout[];
      onUpdate(list);
    },
    (err) => {
      console.error('[firestoreService] subscribeToAllWorkouts error:', err);
      onUpdate([]);
    }
  );
}

/**
 * Update a workout document (log sets, complete workout, rating, etc.).
 */
export async function updateWorkoutLog(
  workoutId: string,
  updates: Partial<AssignedWorkout>
): Promise<void> {
  try {
    await updateDoc(doc(db, WORKOUTS_COL, workoutId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('[firestoreService] updateWorkoutLog error:', err);
    throw err;
  }
}

/** Delete a workout document. */
export async function deleteWorkout(workoutId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, WORKOUTS_COL, workoutId));
  } catch (err) {
    console.error('[firestoreService] deleteWorkout error:', err);
    throw err;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// NUTRITION helpers
// ───────────────────────────────────────────────────────────────────────────

/** Real-time listener for athlete prescribed nutrition plan. */
export function subscribeToClientNutrition(
  clientId: string,
  onUpdate: (plan: NutritionPlan | null) => void
): () => void {
  return onSnapshot(
    doc(db, NUTRITION_COL, clientId),
    (snap) => {
      if (snap.exists()) {
        onUpdate({ ...snap.data(), clientId } as NutritionPlan);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('[firestoreService] subscribeToClientNutrition error:', err);
      onUpdate(null);
    }
  );
}

/** Save or update prescribed nutrition targets for an athlete. */
export async function savePrescribedNutrition(
  clientId: string,
  plan: Partial<NutritionPlan>
): Promise<void> {
  try {
    const cleaned = cleanPayload(plan);
    await setDoc(
      doc(db, NUTRITION_COL, clientId),
      {
        ...cleaned,
        clientId,
        updatedAt: new Date().toISOString().split('T')[0],
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[firestoreService] savePrescribedNutrition error:', err);
    throw err;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// WEEKLY CHECK-IN helpers
// ───────────────────────────────────────────────────────────────────────────

/** Real-time listener for check-ins submitted by a specific client (or all checkins for admin). */
export function subscribeToClientCheckIns(
  clientId: string | null,
  onUpdate: (checkins: WeeklyCheckIn[]) => void
): () => void {
  const colRef = collection(db, CHECKINS_COL);
  const q = clientId
    ? query(colRef, where('clientId', '==', clientId))
    : colRef;

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as WeeklyCheckIn[];
      // Sort descending by weekNumber or date
      list.sort((a, b) => {
        if (b.weekNumber !== undefined && a.weekNumber !== undefined && b.weekNumber !== a.weekNumber) {
          return (b.weekNumber || 0) - (a.weekNumber || 0);
        }
        const dateA = a.submissionDate ? new Date(a.submissionDate).getTime() : 0;
        const dateB = b.submissionDate ? new Date(b.submissionDate).getTime() : 0;
        return dateB - dateA;
      });
      onUpdate(list);
    },
    (err) => {
      console.error('[firestoreService] subscribeToClientCheckIns error:', err);
      onUpdate([]);
    }
  );
}

/** Submit a weekly check-in form to Firestore. */
export async function submitCheckInToFirestore(
  checkInData: Omit<WeeklyCheckIn, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, CHECKINS_COL), {
      ...checkInData,
      submissionDate: new Date().toISOString().split('T')[0],
      reviewedByCoach: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('[firestoreService] submitCheckInToFirestore error:', err);
    throw err;
  }
}

/** Save coach review and feedback on a check-in. */
export async function saveCoachCheckInFeedback(
  checkInId: string,
  feedback: string
): Promise<void> {
  try {
    await updateDoc(doc(db, CHECKINS_COL, checkInId), {
      coachFeedback: feedback,
      reviewedByCoach: true,
      reviewedAt: new Date().toISOString().split('T')[0],
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('[firestoreService] saveCoachCheckInFeedback error:', err);
    throw err;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// 1-ON-1 MESSAGING helpers
// ───────────────────────────────────────────────────────────────────────────

/** Real-time listener for messages in an athlete's thread. */
export function subscribeToMessages(
  clientId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  const colRef = collection(db, MESSAGES_COL);
  const q = query(
    colRef,
    where('clientId', '==', clientId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as ChatMessage[];
      // Sort ascending by timestamp
      list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      onUpdate(list);
    },
    (err) => {
      console.error('[firestoreService] subscribeToMessages error:', err);
      onUpdate([]);
    }
  );
}

/** Send a new message to Firestore. */
export async function sendMessageToFirestore(
  msgData: Omit<ChatMessage, 'id'> & { clientId: string }
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, MESSAGES_COL), {
      ...msgData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('[firestoreService] sendMessageToFirestore error:', err);
    throw err;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// COACHES & FOUNDERS DIRECTORY helpers
// ───────────────────────────────────────────────────────────────────────────

export const DEFAULT_FOUNDERS_AND_COACHES: CoachMember[] = [
  {
    id: 'admin_mass_narimanian',
    name: 'Mass Narimanian',
    email: 'mass@bflfitness.com',
    role: 'admin',
    isAdmin: true,
    avatarUrl: '/assets/founders/mass-gym.jpg',
    specialty: 'Co-Founder • Executive Physique & Hypertrophy Engineering',
    activeClientsCount: 0,
    maxClients: 25,
    status: 'active',
    joinedDate: 'Jan 2024',
    bio: 'Co-Founder & Administrator. Specializing in advanced hypertrophy mechanics, metabolic rate reconstruction, and high-performance physique transformations.'
  },
  {
    id: 'admin_pouya_marghzari',
    name: 'Pouya Marghzari',
    email: 'pouya@bflfitness.com',
    role: 'admin',
    isAdmin: true,
    avatarUrl: '/assets/founders/pouya-boxing.jpg',
    specialty: 'Co-Founder • Biomechanics & Strength Periodization',
    activeClientsCount: 0,
    maxClients: 25,
    status: 'active',
    joinedDate: 'Jan 2024',
    bio: 'Co-Founder & Administrator. Master of neuromuscular movement efficiency, injury rehabilitation, and systematic progressive overload modeling.'
  }
];

/** Real-time listener for coaches from Firestore. */
export function subscribeToCoaches(
  onUpdate: (coaches: CoachMember[]) => void
): () => void {
  const colRef = collection(db, COACHES_COL);
  const legacyMockIds = ['coach_marcus', 'coach_marcus_vance', 'coach_sarah', 'coach_sarah_jenkins', 'coach_elena', 'coach_elena_rostova'];

  return onSnapshot(
    colRef,
    (snap) => {
      const rawList = snap.docs
        .map((d) => ({
          ...d.data(),
          id: d.id,
        }))
        .filter((d: any) => !legacyMockIds.includes(d.id)) as CoachMember[];

      // Deduplicate by normalized email so founders or coaches with multiple Auth/seed records never duplicate
      const byEmail = new Map<string, CoachMember>();
      for (const c of rawList) {
        const emailKey = (c.email || '').toLowerCase().trim();
        if (!emailKey) {
          byEmail.set(c.id, c);
          continue;
        }
        if (!byEmail.has(emailKey)) {
          byEmail.set(emailKey, c);
        } else {
          // If duplicate, prefer the canonical founder ID (admin_mass_narimanian or admin_pouya_marghzari)
          const existing = byEmail.get(emailKey)!;
          if (c.id.startsWith('admin_') && !existing.id.startsWith('admin_')) {
            byEmail.set(emailKey, c);
          }
        }
      }

      const list = Array.from(byEmail.values());

      // Sort founders first, then alphabetically by name
      list.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        return (a.name || '').localeCompare(b.name || '');
      });

      onUpdate(list.length > 0 ? list : DEFAULT_FOUNDERS_AND_COACHES);
    },
    (err) => {
      console.error('[firestoreService] subscribeToCoaches error:', err);
      onUpdate(DEFAULT_FOUNDERS_AND_COACHES);
    }
  );
}

/** Save or update a coach in both 'coaches' and 'users' collections in Firestore. */
export async function saveCoachToFirestore(coach: CoachMember): Promise<void> {
  try {
    let coachId = coach.id || `coach_${Date.now()}`;
    const normEmail = (coach.email || '').toLowerCase().trim();
    if (normEmail === 'mass@bflfitness.com' || normEmail === 'mass.narimanian@bflfitness.com') {
      coachId = 'admin_mass_narimanian';
    } else if (normEmail === 'pouya@bflfitness.com' || normEmail === 'pouya.marghzari@bflfitness.com') {
      coachId = 'admin_pouya_marghzari';
    }

    const coachDoc = {
      ...coach,
      id: coachId,
      updatedAt: serverTimestamp(),
    };

    // Save to coaches collection
    await setDoc(doc(db, COACHES_COL, coachId), coachDoc, { merge: true });

    // Also synchronize user profile document for auth & security rules
    await setDoc(
      doc(db, USERS_COL, coachId),
      {
        uid: coachId,
        id: coachId,
        displayName: coach.name,
        email: coach.email,
        role: coach.role === 'admin' ? 'admin' : 'coach',
        photoURL: coach.avatarUrl,
        specialty: coach.specialty,
        bio: coach.bio,
        status: coach.status,
        coachId: coachId,
        assignedCoachId: coachId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[firestoreService] saveCoachToFirestore error:', err);
    throw err;
  }
}

/** Delete a coach from Firestore (protects founders). */
export async function deleteCoachFromFirestore(coachId: string): Promise<void> {
  if (coachId === 'admin_mass_narimanian' || coachId === 'admin_pouya_marghzari') {
    console.warn('[firestoreService] Cannot delete founders from Firestore.');
    return;
  }

  try {
    await deleteDoc(doc(db, COACHES_COL, coachId));
  } catch (err) {
    console.error('[firestoreService] deleteCoachFromFirestore error:', err);
    throw err;
  }
}

/** Assign a coach to a client in Firestore ('users' and 'intakes' collections). */
export async function assignCoachToClientInFirestore(
  clientId: string,
  coachId: string,
  coachName?: string
): Promise<void> {
  try {
    // 1. Update users/{clientId}
    await updateDoc(doc(db, USERS_COL, clientId), {
      coachId,
      assignedCoachId: coachId,
      coachName: coachName || '',
      updatedAt: serverTimestamp(),
    });

    // 2. Update any matching intake documents in intakes collection
    const q = query(collection(db, INTAKES_COL), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    const updatePromises = snap.docs.map((intakeDoc) =>
      updateDoc(intakeDoc.ref, {
        coachId,
        assignedCoachId: coachId,
        coachName: coachName || '',
        updatedAt: serverTimestamp(),
      })
    );
    await Promise.all(updatePromises);
  } catch (err) {
    console.error('[firestoreService] assignCoachToClientInFirestore error:', err);
    throw err;
  }
}

export interface CreateCoachAccountParams {
  name: string;
  email: string;
  password?: string;
  role: 'coach' | 'admin' | 'nutritionist';
  specialty: string;
  maxClients: number;
  avatarUrl?: string;
  bio?: string;
}

/**
 * Creates a new coach account in Firebase Authentication AND initializes
 * their profile in Firestore 'coaches' and 'users' collections.
 * Uses a temporary secondary FirebaseApp instance so the active admin session is not interrupted.
 */
export async function createCoachAccountInAuthAndFirestore(
  params: CreateCoachAccountParams
): Promise<CoachMember> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const password = params.password?.trim() || 'bflCoach2026!';
  const secondaryAppName = `SecondaryAuthApp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  let newUid = '';
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, normalizedEmail, password);
    newUid = cred.user.uid;
    await signOut(secondaryAuth);
  } catch (authErr: any) {
    console.error('[firestoreService] createCoachAccountInAuthAndFirestore auth error:', authErr);
    if (authErr.code === 'auth/email-already-in-use') {
      throw new Error('A user with this email address already exists in the system.');
    }
    if (authErr.code === 'auth/weak-password') {
      throw new Error('Password must be at least 6 characters.');
    }
    throw new Error(authErr.message || 'Failed to create coach account in Firebase Authentication.');
  } finally {
    try {
      await deleteApp(secondaryApp);
    } catch {}
  }

  const coachMember: CoachMember = {
    id: newUid,
    name: params.name.trim(),
    email: normalizedEmail,
    role: params.role,
    specialty: params.specialty.trim(),
    maxClients: Number(params.maxClients) || 20,
    activeClientsCount: 0,
    status: 'active',
    avatarUrl: params.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: params.bio?.trim() || 'Certified BFL Elite Transformation Specialist.',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };

  // Save to both 'coaches' and 'users' in Firestore
  await saveCoachToFirestore(coachMember);

  return coachMember;
}

/** Seed founders (Mass & Pouya) into Firestore if not present, and purge legacy mock coaches & duplicates. */
export async function seedFoundersAndCoachesToFirestore(): Promise<void> {
  const legacyMockIds = ['coach_marcus', 'coach_marcus_vance', 'coach_sarah', 'coach_sarah_jenkins', 'coach_elena', 'coach_elena_rostova'];
  for (const legId of legacyMockIds) {
    try {
      await deleteDoc(doc(db, COACHES_COL, legId));
      await deleteDoc(doc(db, USERS_COL, legId));
    } catch {}
  }

  // Purge any duplicate founder documents with non-canonical IDs
  try {
    const coachesSnap = await getDocs(collection(db, COACHES_COL));
    for (const docSnap of coachesSnap.docs) {
      const data = docSnap.data();
      const normEmail = (data.email || '').toLowerCase().trim();
      if (
        (normEmail === 'mass@bflfitness.com' && docSnap.id !== 'admin_mass_narimanian') ||
        (normEmail === 'pouya@bflfitness.com' && docSnap.id !== 'admin_pouya_marghzari')
      ) {
        await deleteDoc(docSnap.ref);
      }
    }
  } catch (cleanErr) {
    console.debug('[firestoreService] Note cleaning duplicate founder docs:', cleanErr);
  }

  for (const coach of DEFAULT_FOUNDERS_AND_COACHES) {
    try {
      const snap = await getDoc(doc(db, COACHES_COL, coach.id));
      if (!snap.exists()) {
        await saveCoachToFirestore(coach);
      }
    } catch (err) {
      // Gracefully continue to next coach if rules or network restrict this one
      console.debug(`[firestoreService] Note seeding coach ${coach.id}:`, err);
    }
  }
}
// ───────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS helpers (Firestore-backed bidirectional sync)
// ───────────────────────────────────────────────────────────────────────────

import type { InAppNotification } from '../types';

/** Persist a notification to the Firestore `notifications` collection. */
export async function saveNotificationToFirestore(
  notif: Omit<InAppNotification, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COL), {
      ...notif,
      read: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('[firestoreService] saveNotificationToFirestore error:', err);
    // Non-critical — notification will still exist in-memory
    return '';
  }
}

/** Real-time listener for notifications targeted at a specific user or role. */
export function subscribeToNotifications(
  userId: string | undefined,
  role: string | undefined,
  onUpdate: (notifications: InAppNotification[]) => void
): () => void {
  const colRef = collection(db, NOTIFICATIONS_COL);

  return onSnapshot(
    colRef,
    (snap) => {
      const all = snap.docs.map((d) => {
        const data = d.data();
        // Convert Firestore Timestamp to relative string
        let ts = 'Just now';
        if (data.createdAt && data.createdAt.toDate) {
          const created = data.createdAt.toDate() as Date;
          const diffMs = Date.now() - created.getTime();
          const diffMin = Math.floor(diffMs / 60000);
          if (diffMin < 1) ts = 'Just now';
          else if (diffMin < 60) ts = `${diffMin}m ago`;
          else if (diffMin < 1440) ts = `${Math.floor(diffMin / 60)}h ago`;
          else ts = `${Math.floor(diffMin / 1440)}d ago`;
        }
        return {
          ...data,
          id: d.id,
          timestamp: ts,
        } as InAppNotification;
      });

      // Filter to notifications relevant to this user
      const filtered = all.filter((n) => {
        if (n.userId && n.userId === userId) return true;
        if (n.recipientRole === role) return true;
        if (role === 'admin' || role === 'coach') {
          if (n.recipientRole === 'coach') return true;
        }
        // Global notifications (no userId and no recipientRole)
        if (!n.userId && !n.recipientRole) return true;
        return false;
      });

      // Sort by createdAt descending (newest first), limit to 50
      filtered.sort((a, b) => {
        // Parse relative timestamps back for sorting — but Firestore order is more reliable
        // We rely on doc ordering since createdAt is set by serverTimestamp
        return 0; // onSnapshot returns in natural order; we reverse below
      });

      // Reverse to get newest first (onSnapshot gives insertion order)
      const newest = filtered.slice(0, 50);
      onUpdate(newest);
    },
    (err) => {
      console.error('[firestoreService] subscribeToNotifications error:', err);
      onUpdate([]);
    }
  );
}

/** Mark a single notification as read in Firestore. */
export async function markNotificationReadInFirestore(
  notifId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COL, notifId), { read: true });
  } catch (err) {
    console.debug('[firestoreService] markNotificationReadInFirestore note:', err);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// PROGRESS METRICS & BIOMETRICS helpers
// ───────────────────────────────────────────────────────────────────────────

/** Save or log a progress metric data point into Firestore. */
export async function saveProgressMetricToFirestore(
  metric: Omit<ProgressMetricPoint, 'id'> & { id?: string }
): Promise<string> {
  try {
    const payload = {
      ...metric,
      date: metric.date || new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (metric.id && metric.id.length > 5) {
      await setDoc(doc(db, METRICS_COL, metric.id), payload, { merge: true });
      return metric.id;
    } else {
      const docRef = await addDoc(collection(db, METRICS_COL), payload);
      return docRef.id;
    }
  } catch (err) {
    console.error('[firestoreService] saveProgressMetricToFirestore error:', err);
    throw err;
  }
}

/** Real-time listener for progress metrics of a client (or all metrics if clientId is null). */
export function subscribeToProgressMetrics(
  clientId: string | null,
  onUpdate: (metrics: ProgressMetricPoint[]) => void
): () => void {
  const colRef = collection(db, METRICS_COL);
  const q = clientId
    ? query(colRef, where('clientId', '==', clientId))
    : colRef;

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as ProgressMetricPoint[];

      // Sort chronological (oldest to newest for graphs)
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      onUpdate(list);
    },
    (err) => {
      console.error('[firestoreService] subscribeToProgressMetrics error:', err);
      onUpdate([]);
    }
  );
}

// ───────────────────────────────────────────────────────────────────────────
// PROGRESS PHOTOS helpers
// ───────────────────────────────────────────────────────────────────────────

/** Save a progress physique photo record to Firestore. */
export async function saveProgressPhotoToFirestore(
  photo: Omit<ProgressPhotoRecord, 'id'> & { id?: string }
): Promise<string> {
  try {
    const payload = {
      ...photo,
      date: photo.date || new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (photo.id && photo.id.length > 5) {
      await setDoc(doc(db, PROGRESS_PHOTOS_COL, photo.id), payload, { merge: true });
      return photo.id;
    } else {
      const docRef = await addDoc(collection(db, PROGRESS_PHOTOS_COL), payload);
      return docRef.id;
    }
  } catch (err) {
    console.error('[firestoreService] saveProgressPhotoToFirestore error:', err);
    throw err;
  }
}

/** Real-time listener for progress photos of a client (or all photos if clientId is null). */
export function subscribeToProgressPhotos(
  clientId: string | null,
  onUpdate: (photos: ProgressPhotoRecord[]) => void
): () => void {
  const colRef = collection(db, PROGRESS_PHOTOS_COL);
  const q = clientId
    ? query(colRef, where('clientId', '==', clientId))
    : colRef;

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as ProgressPhotoRecord[];

      // Sort chronological
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      onUpdate(list);
    },
    (err) => {
      console.error('[firestoreService] subscribeToProgressPhotos error:', err);
      onUpdate([]);
    }
  );
}
