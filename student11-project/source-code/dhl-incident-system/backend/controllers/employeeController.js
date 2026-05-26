import Employee from '../models/Employee.js';

// @desc    Get all employees (exclude passwords for security)
// @route   GET /api/employees
export const getEmployees = async (req, res) => {
    try {
        // select('-password') ensures we never send passwords to the frontend
        const employees = await Employee.find({}).select('-password').sort({ name: 1 });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
    }
};

// @desc    Create a new employee
// @route   POST /api/employees
export const createEmployee = async (req, res) => {
    try {
        // ---> ROLE BASED SECURITY <---
        if (req.user && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized. Only Admins can provision new employees.' });
        }

        const employeeExists = await Employee.findOne({ email: req.body.email });
        if (employeeExists) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }

        // Employee.create natively triggers the .save() middleware, so hashing works here
        const employee = await Employee.create(req.body);

        console.log(`👤 New employee provisioned: ${employee.email} by ${req.user ? req.user.name : 'System'}`);

        // Remove password from the returned object before sending it to React
        employee.password = undefined;

        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create employee', error: error.message });
    }
};

// @desc    Update an employee
// @route   PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
    try {
        // ---> ROLE BASED SECURITY <---
        if (req.user && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized. Only Admins can update employee records.' });
        }

        // Step 1: Find the employee first
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Step 2: Manually update the fields provided in the request
        if (req.body.name) employee.name = req.body.name;
        if (req.body.email) employee.email = req.body.email;
        if (req.body.role) employee.role = req.body.role;
        if (req.body.department) employee.department = req.body.department;
        if (req.body.status) employee.status = req.body.status;

        // Step 3: Check if the admin provided a new password. 
        if (req.body.password && req.body.password.trim() !== '') {
            employee.password = req.body.password;
        }

        // Step 4: Use .save() to trigger the bcrypt pre('save') hook in the model!
        const updatedEmployee = await employee.save();

        console.log(`🔄 Employee profile updated: ${updatedEmployee.email} by ${req.user ? req.user.name : 'System'}`);

        // Strip password before returning
        updatedEmployee.password = undefined;

        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update employee', error: error.message });
    }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
    try {
        // ---> ROLE BASED SECURITY <---
        if (req.user && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized. Only Admins can revoke employee access.' });
        }

        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        console.log(`🗑️ Employee access revoked: ${employee.email} by ${req.user ? req.user.name : 'System'}`);

        res.status(200).json({ message: 'Employee removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete employee', error: error.message });
    }
};