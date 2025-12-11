import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private requests: Set<string> = new Set();

  constructor(private loading: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.shouldSkipLoading(req.url)) return next.handle(req);
    
    const requestId = this.generateRequestId(req);
    this.requests.add(requestId);
    
    if (this.requests.size === 1) {
      this.loading.show(this.getLoadingMessage(req));
    }
    
    return next.handle(req).pipe(
      finalize(() => {
        this.requests.delete(requestId);
        if (this.requests.size === 0) {
          this.loading.hideAll();
        }
      })
    );
  }

  private shouldSkipLoading(url: string): boolean {
    const skipUrls = ['/auth/refresh'];
    return skipUrls.some(skip => url.includes(skip));
  }

  private generateRequestId(req: HttpRequest<any>): string {
    return `${req.method}-${req.url}`;
  }

  private getLoadingMessage(req: HttpRequest<any>): string {
    switch (req.method) {
      case 'GET': return 'Loading...';
      case 'POST': return 'Saving...';
      case 'PUT': return 'Updating...';
      case 'DELETE': return 'Deleting...';
      default: return 'Processing...';
    }
  }
}