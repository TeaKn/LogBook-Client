export interface Assessment {
  id: number;
  subject_name: string;
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
  dueDate?: string;
  doneOn?: string;
  grade?: string | number;
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

export interface ActivityFeedItem {
  type: 'blue' | 'green' | 'orange';
  title: string;
  subtitle: string;
  timeAgo: string;
}