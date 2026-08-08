import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Subject as SubjectModel } from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = 'http://localhost:8080/subjects';
  private subjectsSubject = new BehaviorSubject<SubjectModel[]>([]);
  public subjects$ = this.subjectsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllSubjects(): Observable<SubjectModel[]> {
    return this.http.get<{ subjects: SubjectModel[] }>(this.apiUrl).pipe(
      map(response => response.subjects || []),

      catchError(error => {
        console.error('Error fetching subjects:', error);
        return of([]);
      })
    );
  }

  getSubjectsCache(): SubjectModel[] {
    return this.subjectsSubject.value;
  }
}