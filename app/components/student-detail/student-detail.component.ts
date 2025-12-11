import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student, StudentStatus } from '../../models/student.model';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.css']
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/students']);
      return;
    }
    this.loadStudent(id);
  }

  loadStudent(id: string): void {
    this.loading = true;
    this.error = '';
    
    this.studentService.getStudent(id).subscribe({
      next: (student) => {
        this.student = student;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Failed to load student';
      }
    });
  }

  edit(): void {
    if (!this.student || !this.student._id) return;
    this.router.navigate(['/students', this.student._id, 'edit']);
  }

  backToList(): void {
    this.router.navigate(['/students']);
  }

  getStatusClass(status: StudentStatus): string {
    const classes: Record<StudentStatus, string> = {
      'Active': 'status-active',
      'Completed': 'status-completed',
      'Dropped': 'status-dropped',
      'OnLeave': 'status-onleave',
      'Suspended': 'status-suspended'
    };
    return classes[status] || '';
  }
}