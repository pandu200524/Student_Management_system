import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toast: ToastService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.getErrorMessage(error);
        
        if (!this.shouldSkipToast(error, req.url)) {
          this.toast.error(errorMessage);
        }
        
        if (error.status === 403) {
          this.router.navigate(['/unauthorized']);
        }
        
        return throwError(() => error);
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) return error.error.message;
    
    switch (error.status) {
      case 0: return 'Network error';
      case 400: return 'Invalid request';
      case 401: return 'Session expired';
      case 403: return 'Access denied';
      case 404: return 'Not found';
      case 500: return 'Server error';
      default: return `Error ${error.status}`;
    }
  }

  private shouldSkipToast(error: HttpErrorResponse, url: string): boolean {
    const skipUrls = ['/auth/login', '/auth/logout'];
    return skipUrls.some(skip => url.includes(skip));
  }
}