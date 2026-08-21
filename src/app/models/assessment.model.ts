export interface Assessment {
  id: number;
  subject_name: string; // todo: why not pick this from the Subject interface? It is redundant to have both subject_name and subject_id
  subject: Subject;
  type: string;
  title: string;
  createdOn: string | null;
  dueDate: string | null;
  doneOn: string | null;
  grade: string | number | null;
}

export interface Subject {
  id: number;
  name: string;
}

export interface CreateAssessmentRequest {
  subject: string;
  type: string;
  title: string;
  dueDate: string;
}

export interface UpdateAssessmentRequest {
  title?: string;
  createdOn?: string;
  dueDate?: string | null;
  doneOn?: string | null;
  grade?: string | number | null;
}

export interface AssessmentCountdown {
  assessment: string;
  days_until: number;
  progress: number;
}

export interface StatCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}