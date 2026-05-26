import Department from '../models/Department.js';

// @desc    Get all departments
// @route   GET /api/departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({});
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a department
// @route   POST /api/departments
export const createDepartment = async (req, res) => {
    try {
        const { name, inChargeName, email, phone, status } = req.body;
        const department = await Department.create({
            name, inChargeName, email, phone, status
        });
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
export const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!department) return res.status(404).json({ message: 'Department not found' });
        res.status(200).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
export const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });
        res.status(200).json({ message: 'Department deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};