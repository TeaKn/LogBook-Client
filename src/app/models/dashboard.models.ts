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

export interface LogType {
    id: number;
    type: string;
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

