import express from 'express';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';

const router = express.Router();

router.route('/')
    .get(getEmployees)
    .post(createEmployee);

router.route('/:id')
    .put(updateEmployee)
    .delete(deleteEmployee);

export default router;