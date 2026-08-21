import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, of, tap } from "rxjs";
import { CreateLogRequest, FeedItem, Log } from "../models/dashboard.models";

@Injectable({
    providedIn: 'root' 
})
export class LogService {
    private apiUrl = 'http://localhost:8080/logs';
    private logsSubject = new BehaviorSubject<FeedItem[]>([]);
    public logs$ = this.logsSubject.asObservable();

    constructor(private http: HttpClient) {}

    /**
     * Get all logs
     */
    getLogs(limit: number | null): Observable<FeedItem[]> {
        const url = limit !== null ? `${this.apiUrl}?limit=${limit}` : this.apiUrl;
        return this.http.get<{ logs: FeedItem[] }>(url).pipe(
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
            tap(() => this.getLogs(null).subscribe()),
            catchError(error => {
                console.error('Error creating log:', error);
                throw error;
            })
        );
    }
}   