import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap } from "rxjs";
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
     * 
     * Fetch from the backend and update the shared cache.
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
     * Create a new log and refresh the cached logs.
     */
    createLog(data: CreateLogRequest): Observable<any> {
        return this.http.post(this.apiUrl, data).pipe(
            switchMap(() => this.getLogs(5)),
            catchError(error => {
                console.error('Error creating log:', error);
                throw error;
            })
        );
    }
}   