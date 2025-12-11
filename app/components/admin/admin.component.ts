import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  title = 'Admin Panel';
  
  // Admin dashboard data
  stats = {
    totalUsers: 150,
    activeUsers: 120,
    totalStudents: 500,
    activeStudents: 450,
    courses: 25,
    revenue: 125000
  };
  
  recentActivities = [
    { user: 'John Doe', action: 'Added new student', time: '10 minutes ago' },
    { user: 'Jane Smith', action: 'Updated course details', time: '30 minutes ago' },
    { user: 'Admin User', action: 'Generated report', time: '1 hour ago' }
  ];
}