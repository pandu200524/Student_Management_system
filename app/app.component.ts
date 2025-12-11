import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, filter, takeUntil } from 'rxjs';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Student Management System';
  loading = false;
  currentRoute = '';
  
  private destroy$ = new Subject<void>();
  private routerSubscription?: Subscription;
  private isBrowser: boolean;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.setupRouterListener();
    this.setupLoadingListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.routerSubscription?.unsubscribe();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent): void {
    if (this.isBrowser) {
      this.authService.updateLastActivity();
    }
  }

  private setupRouterListener(): void {
    if (!this.isBrowser) return; // Don't setup router listener on server
    
    this.routerSubscription = this.router.events.pipe(
      filter((event: any): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.scrollToTop();
    });
  }

  private setupLoadingListener(): void {
    this.loadingService.active$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.loading = loading;
    });
  }

  private scrollToTop(): void {
    if (this.isBrowser && window) {
      // Use setTimeout to ensure it runs in the next tick
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
    }
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}