export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  GUEST = 'guest'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  bio?: string;
  address?: Address;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  emergency_contact?: EmergencyContact;
  
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_verified?: boolean;
  
  last_login?: Date;
  last_login_ip?: string;
  login_count: number;
  failed_login_attempts: number;
  
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  
  preferences: UserPreferences;
  permissions: string[];
  features: string[];
  
  subscription_active: boolean;
  subscription_type?: string;
  subscription_expires_at?: Date;
  subscription_expired: boolean;
  
  metadata?: Record<string, any>;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  security_alerts: boolean;
  course_updates: boolean;
  assignment_deadlines: boolean;
  grade_updates: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'connections';
  show_email: boolean;
  show_phone: boolean;
  show_last_login: boolean;
  search_engine_index: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
  two_factor_code?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  name: string;
  phone?: string;
  role?: UserRole;
  accept_terms: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface PasswordResetRequest {
  email: string;
  reset_url: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirm_password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
  address?: Address;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  emergency_contact?: EmergencyContact;
  preferences?: Partial<UserPreferences>;
}

export interface UserFilter {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  created_after?: Date;
  created_before?: Date;
  email_verified?: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  by_role: Record<UserRole, number>;
  by_department: Record<string, number>;
  daily_registrations: number[];
  monthly_registrations: number[];
}

export interface Session {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  platform: string;
  location?: string;
  is_current: boolean;
  last_activity: Date;
  created_at: Date;
  expires_at: Date;
}

export interface LoginHistory {
  id: string;
  user_id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  two_factor_used: boolean;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  module: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

export interface TwoFactorSetup {
  qr_code: string;
  secret: string;
  backup_codes: string[];
}