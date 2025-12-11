import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentFormComponent } from './components/student-form/student-form.component';
import { StudentDetailComponent } from './components/student-detail/student-detail.component';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'students', component: StudentListComponent, canActivate: [authGuard] },
  { path: 'students/new', component: StudentFormComponent, canActivate: [authGuard] },
  { path: 'students/:id/edit', component: StudentFormComponent, canActivate: [authGuard] },
  { path: 'students/:id', component: StudentDetailComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'students' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}