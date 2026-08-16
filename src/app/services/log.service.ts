import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, of, tap } from "rxjs";
import { CreateLogRequest, Log } from "../models/dashboard.models";

@Injectable({
    providedIn: 'root' 
})
export class LogService {
    private apiUrl = 'http://localhost:8080/logs';
    private logsSubject = new BehaviorSubject<Log[]>([]);
    public logs$ = this.logsSubject.asObservable();

    constructor(private http: HttpClient) {}

    /**
     * Get all logs
     */
    getAllLogs(): Observable<Log[]> {
        return this.http.get<{ logs: Log[] }>(this.apiUrl).pipe(
            map(response => response.logs || []),
            tap(logs => this.logsSubject.next(logs)),
            catchError(error => {
                console.error('Error fetching logs:', error);
                return of([]);
            })
        );
    }

    /**
     * Create a new log
     */
    createLog(data: CreateLogRequest): Observable<any> {
        return this.http.post(this.apiUrl, data).pipe(
            tap(() => this.getAllLogs().subscribe()),
            catchError(error => {
                console.error('Error creating log:', error);
                throw error;
            })
        );
    }
}   