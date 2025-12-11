import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, forkJoin, from } from 'rxjs';
import { catchError, map, tap, switchMap, retry, timeout, shareReplay, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Student, StudentFilter, PaginationParams, ApiResponse, PaginationInfo, DashboardStats, BulkOperationResult, ExportOptions } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:3000/api/students';
  private cache = new Map<string, any>();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  private selectedStudentSubject = new BehaviorSubject<Student | null>(null);

  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  students$ = this.studentsSubject.asObservable();
  selectedStudent$ = this.selectedStudentSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeCache();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Network Error: Unable to connect to server';
          break;
        case 400:
          errorMessage = `Bad Request: ${error.error?.message || 'Invalid data'}`;
          break;
        case 401:
          errorMessage = 'Unauthorized: Please login again';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 409:
          errorMessage = 'Conflict: Resource already exists';
          break;
        case 422:
          errorMessage = 'Validation Error';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later';
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later';
          break;
        case 503:
          errorMessage = 'Service Unavailable: Server is under maintenance';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    this.errorSubject.next(errorMessage);
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  private buildQueryParams(filter?: StudentFilter, pagination?: PaginationParams): HttpParams {
    let params = new HttpParams();
    
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params = params.set(key, value.toISOString());
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }
    
    if (pagination) {
      params = params.set('page', pagination.page.toString());
      params = params.set('limit', pagination.limit.toString());
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortOrder', pagination.sortOrder);
    }
    
    return params;
  }

  getStudents(filter?: StudentFilter, pagination?: PaginationParams): Observable<ApiResponse<Student[]>> {
    const cacheKey = `students_${JSON.stringify(filter)}_${JSON.stringify(pagination)}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }
    
    this.setLoading(true);
    const params = this.buildQueryParams(filter, pagination);
    
    return this.http.get<ApiResponse<Student[]>>(this.baseUrl, { params })
      .pipe(
        timeout(10000),
        retry(2),
        tap(response => {
          this.studentsSubject.next(response.data);
          this.cache.set(cacheKey, response);
          this.errorSubject.next(null);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false)),
        shareReplay(1)
      );
  }

  getStudent(id: string, forceRefresh = false): Observable<Student> {
    const cacheKey = `student_${id}`;
    
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      this.selectedStudentSubject.next(cached);
      return of(cached);
    }
    
    this.setLoading(true);
    return this.http.get<ApiResponse<Student>>(`${this.baseUrl}/${id}`)
      .pipe(
        timeout(5000),
        map(response => response.data),
        tap(student => {
          this.selectedStudentSubject.next(student);
          this.cache.set(cacheKey, student);
          this.errorSubject.next(null);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  createStudent(student: Student): Observable<Student> {
    this.setLoading(true);
    return this.http.post<ApiResponse<Student>>(this.baseUrl, student)
      .pipe(
        timeout(10000),
        map(response => response.data),
        tap(newStudent => {
          const currentStudents = this.studentsSubject.value;
          this.studentsSubject.next([newStudent, ...currentStudents]);
          this.clearCache('students');
          this.errorSubject.next(null);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  updateStudent(id: string, student: Student): Observable<Student> {
    this.setLoading(true);
    return this.http.put<ApiResponse<Student>>(`${this.baseUrl}/${id}`, student)
      .pipe(
        timeout(10000),
        map(response => response.data),
        tap(updatedStudent => {
          const currentStudents = this.studentsSubject.value;
          const index = currentStudents.findIndex(s => s._id === id);
          if (index !== -1) {
            currentStudents[index] = updatedStudent;
            this.studentsSubject.next([...currentStudents]);
          }
          this.selectedStudentSubject.next(updatedStudent);
          this.clearCache();
          this.errorSubject.next(null);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  deleteStudent(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(
        timeout(5000),
        tap(() => {
          const currentStudents = this.studentsSubject.value;
          const filtered = currentStudents.filter(s => s._id !== id);
          this.studentsSubject.next(filtered);
          this.clearCache();
          this.errorSubject.next(null);
        }),
        map(() => undefined),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  bulkDeleteStudents(ids: string[]): Observable<BulkOperationResult> {
    this.setLoading(true);
    const deleteRequests = ids.map(id => 
      this.http.delete(`${this.baseUrl}/${id}`).pipe(
        map(() => ({ success: true, id })),
        catchError(() => of({ success: false, id }))
      )
    );
    
    return forkJoin(deleteRequests).pipe(
      map(results => {
        const success = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const errors = results.filter(r => !r.success).map(r => `Failed to delete student ${r.id}`);
        
        if (success > 0) {
          const currentStudents = this.studentsSubject.value;
          const filtered = currentStudents.filter(s => !ids.includes(s._id || ''));
          this.studentsSubject.next(filtered);
          this.clearCache();
        }
        
        return { success, failed, errors };
      }),
      finalize(() => this.setLoading(false))
    );
  }

  importStudents(students: Student[]): Observable<BulkOperationResult> {
    this.setLoading(true);
    const importRequests = students.map(student =>
      this.createStudent(student).pipe(
        map(() => ({ success: true })),
        catchError(() => of({ success: false }))
      )
    );
    
    return forkJoin(importRequests).pipe(
      map(results => {
        const success = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const errors = failed > 0 ? [`Failed to import ${failed} students`] : [];
        
        if (success > 0) {
          this.clearCache('students');
        }
        
        return { success, failed, errors };
      }),
      finalize(() => this.setLoading(false))
    );
  }

  getDashboardStats(): Observable<DashboardStats> {
    const cacheKey = 'dashboard_stats';
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }
    
    this.setLoading(true);
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/dashboard/stats`)
      .pipe(
        timeout(5000),
        map(response => response.data),
        tap(stats => this.cache.set(cacheKey, stats)),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  exportStudents(options: ExportOptions): Observable<Blob> {
    const params = this.buildQueryParams(options.filters);
    return this.http.get(`${this.baseUrl}/export`, {
      params: params.set('format', options.format),
      responseType: 'blob'
    }).pipe(
      timeout(30000),
      catchError(this.handleError.bind(this))
    );
  }

  searchStudents(query: string): Observable<Student[]> {
    return of(query).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) {
          return of([]);
        }
        const params = new HttpParams().set('q', q);
        return this.http.get<ApiResponse<Student[]>>(`${this.baseUrl}/search`, { params })
          .pipe(
            map(response => response.data),
            catchError(() => of([]))
          );
      })
    );
  }

  validateEmail(email: string): Observable<boolean> {
    if (!email) return of(false);
    
    const params = new HttpParams().set('email', email);
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/validate/email`, { params })
      .pipe(
        map(response => !response.exists),
        catchError(() => of(true))
      );
  }

  getStudentCountByStatus(): Observable<Map<string, number>> {
    return this.getStudents().pipe(
      map(response => {
        const counts = new Map<string, number>();
        response.data.forEach(student => {
          counts.set(student.status, (counts.get(student.status) || 0) + 1);
        });
        return counts;
      })
    );
  }

  clearCache(pattern?: string) {
    if (pattern) {
      Array.from(this.cache.keys())
        .filter(key => key.includes(pattern))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
      this.initializeCache();
    }
  }

  private initializeCache() {
    this.cache.set('dashboard_stats', null);
  }

  refreshAll() {
    this.clearCache();
    this.getStudents().subscribe();
  }

  getActiveStudents(): Observable<Student[]> {
    return this.getStudents({ status: 'Active' }).pipe(
      map(response => response.data)
    );
  }

  getStudentsByCourse(course: string): Observable<Student[]> {
    return this.getStudents({ course }).pipe(
      map(response => response.data)
    );
  }
}