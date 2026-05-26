import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Edit, Trash2, Plus, ShieldCheck, AlertCircle, Clock, User } from 'lucide-react';

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]); // <-- UPGRADED: Store ALL employees
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', inChargeName: '', email: '', phone: '', status: 'Active'
    });

    // Fetch Departments and Employees from API
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch both lists simultaneously for speed
                const [deptRes, empRes] = await Promise.all([
                    fetch('http://localhost:5001/api/departments'),
                    fetch('http://localhost:5001/api/employees')
                ]);

                const deptData = await deptRes.json();
                const empData = await empRes.json();

                setDepartments(deptData);
                setAllEmployees(empData); // Save the entire employee roster
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Standalone refetch for departments after a save/delete
    const refetchDepartments = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/departments');
            const data = await res.json();
            setDepartments(data);
        } catch (err) {
            console.error("Failed to fetch departments", err);
        }
    };

    // Handle Form Submission (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId
            ? `http://localhost:5001/api/departments/${editingId}`
            : 'http://localhost:5001/api/departments';
        const method = editingId ? 'PUT' : 'POST';

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            refetchDepartments(); // Refresh data
            closeModal();
        } catch (err) {
            console.error("Failed to save department", err);
        }
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await fetch(`http://localhost:5001/api/departments/${id}`, { method: 'DELETE' });
                refetchDepartments();
            } catch (err) {
                console.error("Failed to delete", err);
            }
        }
    };

    // Auto-fill email when a supervisor is selected
    const handleSupervisorSelect = (e) => {
        const selectedName = e.target.value;
        const selectedEmp = allEmployees.find(emp => emp.name === selectedName);

        setFormData({
            ...formData,
            inChargeName: selectedName,
            email: selectedEmp ? selectedEmp.email : formData.email // Auto-fill the email!
        });
    };

    // Modal Helpers
    const openModal = (dept = null) => {
        if (dept) {
            setFormData(dept);
            setEditingId(dept._id);
        } else {
            setFormData({ name: '', inChargeName: '', email: '', phone: '', status: 'Active' });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    // Status UI Helper
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max"><ShieldCheck size={14} className="mr-1" /> Active</span>;
            case 'Busy': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max"><Clock size={14} className="mr-1" /> Busy</span>;
            case 'Offline': return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max"><AlertCircle size={14} className="mr-1" /> Offline</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Department Management</h1>
                    <p className="text-sm text-gray-500">Manage operational teams, supervisors, and contact info.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center space-x-2 bg-[#D40511] hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow-sm font-bold transition"
                >
                    <Plus size={18} /><span>Add Department</span>
                </button>
            </div>

            {/* Department Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p className="text-gray-500">Loading departments...</p>
                ) : departments.length === 0 ? (
                    <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                        No departments found. Click "Add Department" to create one.
                    </div>
                ) : (
                    departments.map((dept) => {
                        // Filter to find employees belonging to this specific department
                        const deptEmployees = allEmployees.filter(emp => emp.department === dept.name);

                        return (
                            <div key={dept._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                                    {getStatusBadge(dept.status)}
                                </div>

                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center text-sm text-gray-700">
                                        <Users size={16} className="text-gray-400 mr-3" />
                                        <span className="font-semibold mr-1">Head:</span> {dept.inChargeName}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <Mail size={16} className="text-gray-400 mr-3" />
                                        <a href={`mailto:${dept.email}`} className="text-blue-600 hover:underline">{dept.email}</a>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                        <Phone size={16} className="text-gray-400 mr-3" />
                                        {dept.phone}
                                    </div>
                                </div>

                                {/* NEW: Team Members Display */}
                                <div className="mt-5 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center">
                                        <User size={14} className="mr-1" /> Team Roster ({deptEmployees.length})
                                    </h4>
                                    {deptEmployees.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {deptEmployees.map(emp => (
                                                <span key={emp._id} className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-medium" title={emp.role}>
                                                    {emp.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No employees assigned to this team.</p>
                                    )}
                                </div>

                                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 py-1 px-2 rounded-md">
                                        {dept.activeIncidentsCount || 0} Active Incidents
                                    </span>
                                    <div className="flex space-x-2">
                                        <button onClick={() => openModal(dept)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(dept._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Department' : 'New Department'}</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Department Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Warehouse KUL-01" className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-[#FFCC00] outline-none" />
                            </div>

                            {/* Dynamic Supervisor Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">In-Charge Name (Supervisor)</label>
                                <select
                                    required
                                    value={formData.inChargeName}
                                    onChange={handleSupervisorSelect}
                                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-[#FFCC00] outline-none bg-white"
                                >
                                    <option value="" disabled>Select a Supervisor...</option>
                                    {/* Filter specifically for the dropdown to only show Managers/Admins */}
                                    {allEmployees.filter(emp => emp.role === 'Manager' || emp.role === 'Admin').map(emp => (
                                        <option key={emp._id} value={emp.name}>
                                            {emp.name} ({emp.department})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-[#FFCC00] outline-none bg-gray-50" readOnly title="Auto-filled from Employee Directory" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone</label>
                                    <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-[#FFCC00] outline-none" placeholder="+60 12-345-6789" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-[#FFCC00] font-medium outline-none bg-white">
                                    <option value="Active">Active</option>
                                    <option value="Busy">Busy (High Load)</option>
                                    <option value="Offline">Offline (Maintenance)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg transition hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="flex-1 bg-[#D40511] text-white font-bold py-2 rounded-lg transition hover:bg-red-700">Save Department</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}