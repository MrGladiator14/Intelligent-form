import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDocFromServer,
  doc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  where,
  or,
  Firestore,
  getDocs
} from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FormDefinition, Submission, OperationType, FirestoreErrorInfo, FormField } from '../types';
import { ADMIT_GUARD_FORM } from '../constants';

export const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null, auth: Auth) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export const testConnection = async (db: Firestore) => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
      throw error;
    }
  }
};

export const saveSubmission = async (db: Firestore, user: any, activeForm: FormDefinition, data: any, auth: Auth, exceptions: any[] = []) => {
  const path = 'submissions';
  try {
    const threshold = activeForm.flaggingThreshold || 3;
    await addDoc(collection(db, path), {
      formId: activeForm.id,
      formTitle: activeForm.title,
      data,
      exceptions,
      exceptionCount: exceptions.length,
      isFlagged: exceptions.length >= threshold,
      status: 'pending',
      userId: user.uid,
      userEmail: user.email,
      submittedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path, auth);
  }
};

export const seedAdmitGuardForm = async (db: Firestore, user: any, auth: Auth) => {
  const path = 'forms';
  try {
    const q = query(collection(db, path), where('title', '==', ADMIT_GUARD_FORM.title));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(collection(db, path), {
        ...ADMIT_GUARD_FORM,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
      console.log("AdmitGuard form seeded.");
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
};

export const createNewForm = async (db: Firestore, user: any, title: string, description: string, fields: FormField[], allowedEmails: string[], flaggingThreshold: number, auth: Auth) => {
  const path = 'forms';
  try {
    await addDoc(collection(db, path), {
      title,
      description,
      fields,
      allowedEmails,
      flaggingThreshold,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path, auth);
  }
};

export const updateForm = async (db: Firestore, formId: string, title: string, description: string, fields: FormField[], allowedEmails: string[], flaggingThreshold: number, auth: Auth) => {
  const path = `forms/${formId}`;
  try {
    await setDoc(doc(db, 'forms', formId), {
      title,
      description,
      fields,
      allowedEmails,
      flaggingThreshold,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path, auth);
  }
};

export const updateSubmissionStatus = async (db: Firestore, submissionId: string, status: 'accepted' | 'rejected' | 'pending', auth: Auth) => {
  const path = `submissions/${submissionId}`;
  try {
    await setDoc(doc(db, 'submissions', submissionId), {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: auth.currentUser?.uid,
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path, auth);
  }
};

export const deleteForm = async (db: Firestore, formId: string, auth: Auth) => {
  const path = `forms/${formId}`;
  try {
    await setDoc(doc(db, 'forms', formId), { deleted: true }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path, auth);
  }
};
