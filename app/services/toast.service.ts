import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { take } from 'rxjs/operators';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  position: ToastPosition;
  dismissible: boolean;
  timestamp: Date;
  onDismiss?: () => void;
  onTap?: Subject<void>;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
  progress?: number;
  data?: any;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  position?: ToastPosition;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  private maxToasts = 5;
  private defaultDuration = 5000;
  private defaultPosition: ToastPosition = 'top-right';
  
  toasts$ = this.toastsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  success(message: string, title?: string, options?: ToastOptions): Toast {
    return this.show('success', message, title, options);
  }

  error(message: string, title?: string, options?: ToastOptions): Toast {
    return this.show('error', message, title, { ...options, duration: options?.duration || 10000 });
  }

  warning(message: string, title?: string, options?: ToastOptions): Toast {
    return this.show('warning', message, title, options);
  }

  info(message: string, title?: string, options?: ToastOptions): Toast {
    return this.show('info', message, title, options);
  }

  loading(message: string, title?: string, options?: ToastOptions): Toast {
    return this.show('loading', message, title, { ...options, duration: 0, dismissible: false });
  }

  show(type: ToastType, message: string, title?: string, options?: ToastOptions): Toast {
    const toast: Toast = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: options?.duration ?? this.defaultDuration,
      position: options?.position ?? this.defaultPosition,
      dismissible: options?.dismissible ?? true,
      timestamp: new Date(),
      onDismiss: options?.onDismiss,
      onTap: new Subject<void>(),
      action: options?.action,
      icon: options?.icon,
      data: options?.data
    };

    this.addToast(toast);
    this.autoDismiss(toast);
    
    return toast;
  }

  private addToast(toast: Toast): void {
    this.toasts.unshift(toast);
    
    if (this.toasts.length > this.maxToasts) {
      this.removeToast(this.toasts[this.maxToasts].id);
    }
    
    this.toastsSubject.next([...this.toasts]);
    
    if (this.isBrowser()) {
      this.playSound(toast.type);
      this.triggerHapticFeedback(toast.type);
    }
  }

  removeToast(id: string): void {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      const toast = this.toasts[index];
      toast.onDismiss?.();
      this.toasts.splice(index, 1);
      this.toastsSubject.next([...this.toasts]);
    }
  }

  clearAll(): void {
    this.toasts.forEach(toast => toast.onDismiss?.());
    this.toasts = [];
    this.toastsSubject.next([]);
  }

  clearByPosition(position: ToastPosition): void {
    this.toasts = this.toasts.filter(t => t.position !== position);
    this.toastsSubject.next([...this.toasts]);
  }

  clearByType(type: ToastType): void {
    this.toasts = this.toasts.filter(t => t.type !== type);
    this.toastsSubject.next([...this.toasts]);
  }

  updateProgress(toastId: string, progress: number): void {
    const toast = this.toasts.find(t => t.id === toastId);
    if (toast) {
      toast.progress = progress;
      this.toastsSubject.next([...this.toasts]);
    }
  }

  updateMessage(toastId: string, message: string): void {
    const toast = this.toasts.find(t => t.id === toastId);
    if (toast) {
      toast.message = message;
      this.toastsSubject.next([...this.toasts]);
    }
  }

  updateType(toastId: string, type: ToastType): void {
    const toast = this.toasts.find(t => t.id === toastId);
    if (toast) {
      toast.type = type;
      this.toastsSubject.next([...this.toasts]);
    }
  }

  dismissLoading(toastId: string, type: ToastType = 'success', message?: string): void {
    const toast = this.toasts.find(t => t.id === toastId);
    if (toast) {
      if (message) {
        toast.message = message;
      }
      toast.type = type;
      toast.dismissible = true;
      toast.duration = this.defaultDuration;
      this.toastsSubject.next([...this.toasts]);
      this.autoDismiss(toast);
    }
  }

  getToasts(): Toast[] {
    return [...this.toasts];
  }

  getToastsByPosition(position: ToastPosition): Toast[] {
    return this.toasts.filter(t => t.position === position);
  }

  getToastsByType(type: ToastType): Toast[] {
    return this.toasts.filter(t => t.type === type);
  }

  getToastCount(): number {
    return this.toasts.length;
  }

  getToastCountByType(type: ToastType): number {
    return this.toasts.filter(t => t.type === type).length;
  }

  hasToasts(): boolean {
    return this.toasts.length > 0;
  }

  setMaxToasts(max: number): void {
    this.maxToasts = max;
    if (this.toasts.length > max) {
      this.toasts = this.toasts.slice(0, max);
      this.toastsSubject.next([...this.toasts]);
    }
  }

  setDefaultPosition(position: ToastPosition): void {
    this.defaultPosition = position;
  }

  setDefaultDuration(duration: number): void {
    this.defaultDuration = duration;
  }

  private autoDismiss(toast: Toast): void {
    if (toast.duration > 0) {
      timer(toast.duration).pipe(take(1)).subscribe(() => {
        this.removeToast(toast.id);
      });
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private playSound(type: ToastType): void {
    if (!this.isBrowser() || !window.Audio) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    let frequency = 800;
    let duration = 0.3;

    switch (type) {
      case 'success':
        frequency = 1000;
        break;
      case 'error':
        frequency = 500;
        break;
      case 'warning':
        frequency = 700;
        break;
      case 'info':
        frequency = 900;
        break;
    }

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  private triggerHapticFeedback(type: ToastType): void {
    if (!this.isBrowser() || !navigator.vibrate) return;

    let pattern: number[] = [];
    
    switch (type) {
      case 'success':
        pattern = [50, 50, 50];
        break;
      case 'error':
        pattern = [100, 50, 100];
        break;
      case 'warning':
        pattern = [100];
        break;
    }

    if (pattern.length > 0) {
      navigator.vibrate(pattern);
    }
  }

  createPersistentToast(type: ToastType, message: string, title?: string): Toast {
    return this.show(type, message, title, { duration: 0, dismissible: false });
  }

  createActionToast(message: string, actionLabel: string, action: () => void): Toast {
    return this.show('info', message, undefined, {
      action: {
        label: actionLabel,
        onClick: action
      },
      duration: 10000
    });
  }

  createProgressToast(message: string, progress: number): Toast {
    const toast = this.show('info', message, undefined, { duration: 0, dismissible: false });
    this.updateProgress(toast.id, progress);
    return toast;
  }

  createConfirmationToast(message: string, confirmAction: () => void, cancelAction?: () => void): Toast {
    const toast = this.show('warning', message, 'Confirm Action', {
      duration: 15000,
      action: {
        label: 'Confirm',
        onClick: () => {
          confirmAction();
          this.removeToast(toast.id);
        }
      }
    });

    if (cancelAction) {
      toast.onTap?.subscribe(() => {
        cancelAction();
        this.removeToast(toast.id);
      });
    }

    return toast;
  }

  trackToastEvents(): Observable<ToastEvent> {
    const subject = new Subject<ToastEvent>();
    
    this.toasts$.subscribe(toasts => {
      toasts.forEach(toast => {
        toast.onTap?.subscribe(() => {
          subject.next({
            type: 'tap',
            toast
          });
        });
      });
    });

    return subject.asObservable();
  }
}

export interface ToastEvent {
  type: 'show' | 'dismiss' | 'tap' | 'action';
  toast: Toast;
}