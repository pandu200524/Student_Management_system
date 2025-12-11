import { Request, Response } from 'express';
import Student, { IStudent } from '../models/Student';

// Get all students
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get single student
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

// Create student
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentData: IStudent = req.body;
    const student = new Student(studentData);
    await student.save();
    res.status(201).json(student);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Update student
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStudent) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.status(200).json(updatedStudent);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Delete student
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
};