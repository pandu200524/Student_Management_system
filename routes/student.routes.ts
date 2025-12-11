import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/student.controller';

const router = express.Router();

// Student routes
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;