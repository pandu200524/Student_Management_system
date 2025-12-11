import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.shouldSkipAuth(req.url)) return next.handle(req);
    
    const token = this.auth.getToken();
    const authReq = token ? req.clone({ 
      headers: req.headers.set('Authorization', `Bearer ${token}`) 
    }) : req;
    
    return next.handle(authReq).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldSkipAuth(url: string): boolean {
    const skipUrls = ['/auth/login', '/auth/register'];
    return skipUrls.some(skip => url.includes(skip));
  }
}