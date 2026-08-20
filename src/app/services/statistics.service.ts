import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StudyTimeByDay, StudyTimeBySubject } from '../models/dashboard.models';
import { Observable, map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/statistics';
    constructor(private http: HttpClient) {}

    /**
     * getTotalHoursStudied fetches the total hours studied for all subjects.
     */
    getTotalHoursStudied(): Observable<StudyTimeBySubject[]> {
        return this.http.get<{ subjects: StudyTimeBySubject[] }>(`${this.apiUrl}/study-time-by-subject`).pipe(
            map(response => response.subjects)
        );
    }

    /**
     * getTotalHoursStudiedByDay fetches the total hours studied by day.
     */
    getTotalHoursStudiedByDay(): Observable<StudyTimeByDay[]> {
        return this.http.get<{ days: StudyTimeByDay[] }>(`${this.apiUrl}/study-time-by-day`).pipe(
            map(response => response.days)
        );
    }
}