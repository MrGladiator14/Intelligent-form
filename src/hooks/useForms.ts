import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot,
  query,
  orderBy,
  where,
  or
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, auth } from '../firebase';
import { FormDefinition, Submission, OperationType, FormField } from '../types';
import { ADMIN_EMAIL } from '../constants';
import { 
  handleFirestoreError,
  createNewForm as createFormInDb, 
  updateForm as updateFormInDb, 
  deleteForm as deleteFormInDb,
  updateSubmissionStatus
} from '../services/firebaseService';

export function useForms(user: User | null) {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [activeForm, setActiveForm] = useState<FormDefinition | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen for forms
    let formsQuery;
    if (user.email === ADMIN_EMAIL) {
      formsQuery = query(collection(db, 'forms'), orderBy('createdAt', 'desc'));
    } else {
      formsQuery = query(
        collection(db, 'forms'), 
        or(
          where('allowedEmails', '==', []),
          where('allowedEmails', 'array-contains', user.email)
        ),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribeForms = onSnapshot(formsQuery, (snapshot) => {
      const formsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as FormDefinition))
        .filter(f => !f.deleted);
      setForms(formsData);
      if (formsData.length > 0 && !activeForm) {
        setActiveForm(formsData[0]);
      }
    }, (err) => {
      console.error("Forms listener error:", err);
      if (user.email !== ADMIN_EMAIL) {
        setError("You may not have permission to view some forms or a database index is missing.");
      }
      handleFirestoreError(err, OperationType.LIST, 'forms', auth);
    });

    // Listen for submissions if admin
    let unsubscribeSubmissions = () => {};
    if (user.email === ADMIN_EMAIL) {
      const submissionsQuery = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
      unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
        setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'submissions', auth));
    }

    return () => {
      unsubscribeForms();
      unsubscribeSubmissions();
    };
  }, [user]);

  const createNewForm = async (title: string, description: string, fields: FormField[], allowedEmails: string[], flaggingThreshold: number) => {
    await createFormInDb(db, user, title, description, fields, allowedEmails, flaggingThreshold, auth);
  };

  const updateForm = async (formId: string, title: string, description: string, fields: FormField[], allowedEmails: string[], flaggingThreshold: number) => {
    await updateFormInDb(db, formId, title, description, fields, allowedEmails, flaggingThreshold, auth);
  };

  const deleteForm = async (formId: string) => {
    await deleteFormInDb(db, formId, auth);
  };

  const updateStatus = async (id: string, status: 'accepted' | 'rejected' | 'pending') => {
    await updateSubmissionStatus(db, id, status, auth);
  };

  return { forms, activeForm, setActiveForm, submissions, error, createNewForm, updateForm, deleteForm, updateStatus };
}
