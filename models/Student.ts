import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  phone: string;
  course: string;
  grade: string;
  enrollmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    enum: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Medicine']
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    enum: ['A', 'B', 'C', 'D', 'F']
  },
  enrollmentDate: {
    type: Date,
    required: [true, 'Enrollment date is required'],
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IStudent>('Student', StudentSchema);