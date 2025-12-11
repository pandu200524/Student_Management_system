import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: '<h1>Dashboard</h1><p>Welcome to the dashboard</p>'
})
export class DashboardComponent {}