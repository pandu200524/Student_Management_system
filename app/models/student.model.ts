export interface Student {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  enrollmentDate?: Date | string;
  status: StudentStatus;
  createdAt?: Date;
  updatedAt?: Date;
  address?: Address;
  dateOfBirth?: Date;
  guardianName?: string;
  guardianPhone?: string;
  academicYear?: string;
  semester?: number;
  feesPaid?: boolean;
  attendance?: number;
  grades?: Grade[];
  notes?: string[];
  profileImage?: string;
}

export type StudentStatus = 'Active' | 'Completed' | 'Dropped' | 'OnLeave' | 'Suspended';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Grade {
  subject: string;
  score: number;
  maxScore: number;
  grade: string;
  semester: number;
}

export interface StudentFilter {
  name?: string;
  email?: string;
  course?: string;
  status?: StudentStatus;
  minEnrollmentDate?: Date;
  maxEnrollmentDate?: Date;
  academicYear?: string;
  semester?: number;
  feesPaid?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  timestamp: Date;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  droppedStudents: number;
  averageAttendance: number;
  courses: CourseStats[];
  monthlyEnrollments: MonthlyEnrollment[];
}

export interface CourseStats {
  course: string;
  count: number;
  percentage: number;
}

export interface MonthlyEnrollment {
  month: string;
  count: number;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeFields: string[];
  filters?: StudentFilter;
}