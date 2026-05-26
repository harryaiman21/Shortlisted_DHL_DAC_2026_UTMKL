import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, Shield, Mail, Briefcase, X, CheckCircle2, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // <-- IMPORT AUTH CONTEXT FOR SECURITY

export default function EmployeeManager() {
    const { token } = useAuth(); // <-- GRAB SECURE TOKEN

    // State Management
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]); // <-- NEW: State for dynamic departments
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Agent',
        department: '', // Will default to empty until selected
        status: 'Active'
    });

    const roles = ['Admin', 'Manager', 'Agent', 'Viewer'];

    // 1. REAL DATA FETCH: Pull Employees and Departments from MongoDB on load
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return; // Wait for token

            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch both employees and departments concurrently
                const [empRes, deptRes] = await Promise.all([
                    fetch('http://localhost:5001/api/employees', { headers }),
                    fetch('http://localhost:5001/api/departments', { headers })
                ]);

                if (empRes.ok) setEmployees(await empRes.json());
                if (deptRes.ok) setDepartments(await deptRes.json());

            } catch (error) {
                console.error("❌ Error fetching data:", error);
            }
        };

        fetchData();
    }, [token]);

    const openModal = (employee = null) => {
        if (employee) {
            // If editing, load data but KEEP PASSWORD BLANK for security
            setFormData({ ...employee, password: '' });
            setEditingId(employee._id);
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'Agent',
                department: departments.length > 0 ? departments[0].name : '',
                status: 'Active'
            });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    // 2. REAL SAVE LOGIC: POST for new, PUT for updates
    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.department) {
            alert("Please select a department.");
            setIsLoading(false);
            return;
        }

        try {
            const url = editingId
                ? `http://localhost:5001/api/employees/${editingId}`
                : 'http://localhost:5001/api/employees';

            const method = editingId ? 'PUT' : 'POST';

            // Clean the payload: Don't send empty password if we are just editing other details
            const payload = { ...formData };
            if (editingId && !payload.password) {
                delete payload.password;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <-- ATTACH TOKEN
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save employee');
            }

            const savedEmployee = await response.json();

            // Update the UI state instantly
            if (editingId) {
                setEmployees(employees.map(emp => emp._id === editingId ? savedEmployee : emp));
            } else {
                setEmployees([...employees, savedEmployee]);
            }

            closeModal();
        } catch (error) {
            console.error("❌ Error saving employee:", error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. REAL DELETE LOGIC: Remove from MongoDB
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this employee? They will lose system access.')) {
            try {
                const response = await fetch(`http://localhost:5001/api/employees/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` } // <-- ATTACH TOKEN
                });

                if (response.ok) {
                    setEmployees(employees.filter(emp => emp._id !== id));
                }
            } catch (error) {
                console.error("❌ Error deleting employee:", error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <Users className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Team Directory</h1>
                        <p className="text-sm text-gray-500">Manage system access, roles, passwords, and department routing.</p>
                    </div>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center space-x-2 bg-[#D40511] hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-colors"
                >
                    <UserPlus size={18} />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <th className="p-4">Employee Details</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">System Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {employees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold uppercase">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                    <Mail size={12} className="mr-1" /> {emp.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 font-medium">
                                        <div className="flex items-center">
                                            <Briefcase size={14} className="mr-2 text-gray-400" />
                                            {emp.department}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${emp.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            emp.role === 'Manager' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                            <Shield size={12} className="mr-1" />
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center space-x-1 ${emp.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                                            <CheckCircle2 size={16} />
                                            <span className="text-sm font-bold">{emp.status}</span>
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => openModal(emp)} className="text-gray-400 hover:text-blue-600 p-2 transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(emp._id)} className="text-gray-400 hover:text-red-600 p-2 transition-colors ml-1">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No employees found in the directory.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Modal for Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingId ? 'Edit Employee Profile' : 'Provision New Employee'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-800 focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] outline-none transition-all"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Corporate Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-800 focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] outline-none transition-all"
                                        placeholder="name@dhl.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2 flex justify-between">
                                        <span>Account Password</span>
                                        {editingId && <span className="text-gray-400 font-normal italic lowercase">(leave blank to keep current password)</span>}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            required={!editingId}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-gray-800 focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] outline-none transition-all"
                                            placeholder={editingId ? "Enter new password to override..." : "Assign a temporary password"}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Department</label>
                                        <select
                                            required
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-800 bg-white"
                                        >
                                            <option value="" disabled>Select Department...</option>
                                            {/* DYNAMIC DEPARTMENT RENDERING */}
                                            {departments.map(dept => (
                                                <option key={dept._id} value={dept.name}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">System Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-800 bg-white"
                                        >
                                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Account Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-800 bg-white"
                                    >
                                        <option value="Active">Active (Can Login)</option>
                                        <option value="Inactive">Inactive (Suspended)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-[#D40511] hover:bg-red-700 rounded-lg transition-colors disabled:opacity-70 flex items-center">
                                    {isLoading ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}