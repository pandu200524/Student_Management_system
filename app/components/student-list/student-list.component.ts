import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Student, StudentStatus } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule], // Removed RouterLink
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  loading = false;
  error = '';
  search = '';
  statusFilter: StudentStatus | 'All' = 'All';
  statusOptions: StudentStatus[] = ['Active', 'Completed', 'Dropped', 'OnLeave', 'Suspended'];

  constructor(
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.error = '';
    
    this.studentService.getStudents().subscribe({
      next: (response) => {
        this.students = response.data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Failed to load students';
      }
    });
  }

  applyFilters(): void {
    const term = this.search.toLowerCase().trim();
    
    this.filteredStudents = this.students.filter(s => {
      const matchesSearch = !term ||
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.course.toLowerCase().includes(term);
      
      const matchesStatus = this.statusFilter === 'All' || s.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.applyFilters();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as StudentStatus | 'All';
    this.applyFilters();
  }

  onAdd(): void {
    this.router.navigate(['/students/new']);
  }

  onEdit(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/students', id, 'edit']);
    }
  }

  onDelete(id: string | undefined): void {
    if (!id) return;
    
    const student = this.students.find(s => s._id === id);
    const name = student?.name || 'this student';
    
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          this.loadStudents();
        },
        error: () => {
          this.error = 'Failed to delete student';
        }
      });
    }
  }

  viewStudent(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/students', id]);
    }
  }

  addStudent(): void {
    this.router.navigate(['/students/new']);
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