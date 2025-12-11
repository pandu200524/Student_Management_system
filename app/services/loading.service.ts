import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<string>('Loading...');
  
  active$ = this.loadingSubject.asObservable();
  message$ = this.messageSubject.asObservable();
  
  show(message?: string): void {
    if (message) {
      this.messageSubject.next(message);
    }
    this.loadingSubject.next(true);
  }
  
  hide(): void {
    this.loadingSubject.next(false);
  }
  
  hideAll(): void {
    this.loadingSubject.next(false);
  }
  
  isActive(): boolean {
    return this.loadingSubject.value;
  }
  
  getMessage(): string {
    return this.messageSubject.value;
  }
  
  initialize(): void {
    // Initialization logic
  }
}