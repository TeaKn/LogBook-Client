import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Assessment, CreateAssessmentRequest, UpdateAssessmentRequest, AssessmentCountdown } from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private apiUrl = 'http://localhost:8080/assessments';
  private assessmentsSubject = new BehaviorSubject<Assessment[]>([]);
  public assessments$ = this.assessmentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all assessments
   */
  getAllAssessments(): Observable<Assessment[]> {
    return this.http.get<{ assessments: Assessment[] }>(this.apiUrl).pipe(
      map(response => {
        // Extract assessments array from response
        const assessments = response.assessments || [];
        // Normalize the data
        return assessments.map(a => this.normalizeAssessment(a));
      }),
      tap(assessments => this.assessmentsSubject.next(assessments)),
      catchError(error => {
        console.error('Error fetching assessments:', error);
        return of([]);
      })
    );
  }

  /**
   * Get current assessments (for countdown)
   */
  getCurrentAssessments(): Observable<AssessmentCountdown[]> {
    return this.http.get<{ assessments: AssessmentCountdown[] }>(`${this.apiUrl}/current`).pipe(
      map(response => response.assessments || []),

      catchError(error => {
        console.error('Error fetching current assessments:', error);
        return of([]);
      })
    );
  }

  /**
   * Create a new assessment
   */
  createAssessment(data: CreateAssessmentRequest): Observable<any> {
    return this.http.post(this.apiUrl, data).pipe(
      tap(() => this.getAllAssessments().subscribe()),
      catchError(error => {
        console.error('Error creating assessment:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing assessment
   */
  updateAssessment(id: number, data: UpdateAssessmentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.getAllAssessments().subscribe()),
      catchError(error => {
        console.error('Error updating assessment:', error);
        throw error;
      })
    );
  }

  /**
   * Delete an assessment
   */
  deleteAssessment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getAllAssessments().subscribe()),
      catchError(error => {
        console.error('Error deleting assessment:', error);
        throw error;
      })
    );
  }

  /**
   * Get current assessments from cache
   */
  getCurrentAssessmentsCache(): Assessment[] {
    return this.assessmentsSubject.value;
  }

    /**
   * Normalize assessment data - handle various date/null formats
   */
  private normalizeAssessment(assessment: any): Assessment {
    return {
      id: Number(assessment.id),
      subject_name: assessment.subject_name || '',
      subject: assessment.subject || { id: 0, name: assessment.subject_name || '' },
      type: assessment.type || '',
      title: assessment.title || '',
      createdOn: this.normalizeDate(assessment.createdOn),
      dueDate: this.normalizeDate(assessment.dueDate),
      doneOn: this.normalizeDate(assessment.doneOn),
      grade: this.normalizeGrade(assessment.grade)
    };
  }

    /**
   * Normalize date strings - handle various formats and "None"/"None" strings
   */
  private normalizeDate(dateValue: any): string | null {
    if (!dateValue || dateValue === 'None' || dateValue === '' || dateValue === 'null') {
      return null;
    }
    
    // Try to parse and format the date
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      console.warn('Could not parse date:', dateValue);
    }
    
    return null;
  }

    /**
   * Normalize grade - handle "None", "Done", numbers, and empty strings
   */
  private normalizeGrade(gradeValue: any): string | number | null {
    if (!gradeValue || gradeValue === 'None' || gradeValue === '' || gradeValue === 'null') {
      return null;
    }
    
    // If it's "Done", return it as is
    if (gradeValue === 'Done') {
      return 'Done';
    }
    
    // Try to convert to number
    const numGrade = Number(gradeValue);
    if (!isNaN(numGrade)) {
      return numGrade;
    }
    
    // Return as string
    return gradeValue;
  }

    /**
   * Calculate countdown data for an assessment
   */
  private calculateCountdown(assessment: any): AssessmentCountdown {
    const normalized = this.normalizeAssessment(assessment);
    const dueDate = normalized.dueDate ? new Date(normalized.dueDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let daysUntil = 0;
    let progress = 0;
    
    if (dueDate) {
      const dueDateNormalized = new Date(dueDate);
      dueDateNormalized.setHours(0, 0, 0, 0);
      const timeDiff = dueDateNormalized.getTime() - today.getTime();
      daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      const monthDays = 30;
      progress = Math.max(0, Math.min(100, (1 - daysUntil / monthDays) * 100));
    }
    
    return {
      assessment: `${normalized.title} ${normalized.subject_name}`,
      days_until: daysUntil,
      progress: progress
    };
  }
}