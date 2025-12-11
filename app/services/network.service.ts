import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  
  connectionStatus$ = this.onlineStatus.asObservable();
  
  constructor() {
    this.setupListeners();
  }
  
  private setupListeners(): void {
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
  }
  
  private updateStatus(online: boolean): void {
    this.onlineStatus.next(online);
  }
  
  isOnline(): boolean {
    return this.onlineStatus.value;
  }
  
  isOffline(): boolean {
    return !this.onlineStatus.value;
  }
  
  getConnectionType(): string {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  }
  
  getDownlinkSpeed(): number {
    const connection = (navigator as any).connection;
    return connection?.downlink || 0;
  }
  
  getRTT(): number {
    const connection = (navigator as any).connection;
    return connection?.rtt || 0;
  }
  
  initialize(): void {
    console.log('Network service initialized');
  }
}