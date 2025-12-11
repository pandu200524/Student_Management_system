import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student, StudentStatus } from '../../models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {
  form!: FormGroup;
  title = 'Add Student';
  studentId: string | null = null;
  loading = false;
  error = '';
  statusOptions: StudentStatus[] = ['Active', 'Completed', 'Dropped', 'OnLeave', 'Suspended'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      course: ['', [Validators.required]],
      enrollmentDate: [''],
      status: ['Active', [Validators.required]]
    });

    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.title = 'Edit Student';
      this.loadStudent(this.studentId);
    }
  }

  loadStudent(id: string): void {
    this.loading = true;
    this.error = '';
    
    this.studentService.getStudent(id).subscribe({
      next: (student: Student) => {
        this.form.patchValue({
          name: student.name,
          email: student.email,
          phone: student.phone,
          course: student.course,
          enrollmentDate: student.enrollmentDate ? (student.enrollmentDate as string).substring(0, 10) : '',
          status: student.status
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Failed to load student';
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Student = this.form.value;
    this.loading = true;
    this.error = '';

    if (this.studentId) {
      this.studentService.updateStudent(this.studentId, payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/students']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || 'Failed to update student';
        }
      });
    } else {
      this.studentService.createStudent(payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/students']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || 'Failed to create student';
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors || !control.touched) return '';
    
    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email';
    return 'Invalid value';
  }
}