import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  total = 0;
  active = 0;
  completed = 0;
  dropped = 0;
  recentStudents: Student[] = [];
  loading = false;
  error = '';

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';
    
    this.studentService.getStudents().subscribe({
      next: (response) => {
        const students = response.data || [];
        this.total = students.length;
        this.active = students.filter(s => s.status === 'Active').length;
        this.completed = students.filter(s => s.status === 'Completed').length;
        this.dropped = students.filter(s => s.status === 'Dropped').length;
        
        this.recentStudents = students
          .sort((a, b) => {
            const da = a.enrollmentDate ? new Date(a.enrollmentDate).getTime() : 0;
            const db = b.enrollmentDate ? new Date(b.enrollmentDate).getTime() : 0;
            return db - da;
          })
          .slice(0, 5);
        
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Failed to load statistics';
      }
    });
  }
}