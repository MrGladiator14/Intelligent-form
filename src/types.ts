import { User } from 'firebase/auth';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'file' | 'email';
  required: boolean;
  validation?: {
    regex?: string;
    min?: number;
    max?: number;
    isSoftRule?: boolean;
    errorMessage?: string;
    warningMessage?: string;
  };
}

export interface FormDefinition {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  allowedEmails?: string[];
  flaggingThreshold: number; // Configurable threshold for exceptions
  createdAt: any;
  createdBy: string;
  deleted?: boolean;
}

export interface Submission {
  id: string;
  formId: string;
  formTitle: string;
  data: Record<string, any>;
  exceptions?: {
    field: string;
    rationale: string;
  }[];
  exceptionCount: number;
  isFlagged: boolean;
  status: 'pending' | 'accepted' | 'rejected';
  userId: string;
  userEmail: string;
  submittedAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
  };
}
