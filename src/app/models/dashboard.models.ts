import { Assessment } from "./assessment.model";

export interface Log {
    id: number;
    type: LogType | null;
    assessment: Assessment | null;
    title: string;
    description: string | null;
    notes: string | null;
    createdOn: string;
    trackedFrom: string | null;
    trackedTo: string | null;
}

export interface CurrentLog {
    id: number;
    type: LogType;
    assessmentId: number;
    logSubject: string;
    title: string;
    description: string | null;
    notes: string | null;
    createdOn: string;
    trackedFrom: string | null;
    trackedTo: string | null;
}

export interface LogType {
    id: number;
    type: string;
}

export interface FeedItem {
  typeId: number,
  itemType: 'blue' | 'green' | 'orange' | 'not-recognized',
  title: string,
  subjectName: string,
  createdOn: string
  description: string | null;
}

export interface CreateLogRequest {
    type: string;
    assessmentId: string;
    title: string;
    trackedFrom?: string;
    trackedTo?: string;
    description?: string;
    notes?: string;
}

export interface StudyTimeBySubject {
  name: string;
  hours: number;
}

export interface StudyTimeByDay {
  date: string;
  hours: number;
}

export interface AssessmentAggregate {
  subject_name: string;
  final_exam: number;
  oral_exam: number;
  midterm_exam: number;
  course_paper: number;
  homework: number;
  project: number;
  quiz: number;
  total: number;
}

export interface StatCard {
  label: string;
  value: string;
}

