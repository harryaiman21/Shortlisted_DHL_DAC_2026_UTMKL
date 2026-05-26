import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Search, Filter, Eye, Calendar, FileText,
    AlertTriangle, Clock, X, LayoutTemplate,
    Terminal, Download, ChevronLeft, ChevronRight, GitBranch,
    Briefcase, User, Bot, Plus, Send, RefreshCw, Trash2, Image as ImageIcon,
    Edit2, Save // <-- NEW: Imported Edit and Save icons
} from 'lucide-react';

export default function Vault() {
    const { user, token } = useAuth();
    const isAdmin = user?.role === 'Admin';

    // Application State
    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal & Update State
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [viewMode, setViewMode] = useState('ai');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateComment, setUpdateComment] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');

    // NEW: Edit Details State
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [editFormData, setEditFormData] = useState({ category: '', priority: '', department: '', aiSummary: '' });

    // 1. Fetch Real Data with JWT Token
    const fetchIncidents = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/incidents', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch incidents');
            const data = await response.json();
            setIncidents(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching vault data:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, [token]);

    // 2. Filtering Logic 
    const filteredIncidents = useMemo(() => {
        return incidents.filter(inc => {
            const safeTicketId = inc.ticketId || '';
            const safeCategory = inc.category || '';

            const matchesSearch = safeTicketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                safeCategory.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || inc.priority === priorityFilter;
            const matchesDepartment = departmentFilter === 'All' || inc.department === departmentFilter;

            const incDate = new Date(inc.createdAt || Date.now());
            const isAfterStart = dateFrom === '' || incDate >= new Date(dateFrom);
            const isBeforeEnd = dateTo === '' || incDate <= new Date(dateTo);

            return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && isAfterStart && isBeforeEnd;
        });
    }, [searchQuery, statusFilter, priorityFilter, departmentFilter, dateFrom, dateTo, incidents]);

    // 3. Pagination Logic
    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        return filteredIncidents.slice(firstPageIndex, firstPageIndex + itemsPerPage);
    }, [currentPage, filteredIncidents]);

    useMemo(() => { setCurrentPage(1); }, [searchQuery, statusFilter, priorityFilter, departmentFilter, dateFrom, dateTo]);

    // 4. Handle Status Update with JWT Token
    const submitUpdate = async () => {
        const now = new Date();
        const timestamp = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const newStatus = updateStatus || selectedIncident.status;

        const trackingUpdate = {
            label: `Status updated to ${newStatus}`,
            timestamp: timestamp,
            status: 'current',
            ...(updateComment.trim() && { comment: updateComment.trim() }),
            author: user.name
        };

        try {
            const response = await fetch(`http://localhost:5001/api/incidents/${selectedIncident._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    trackingUpdate: trackingUpdate
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to update incident");
            }

            const updatedData = await response.json();
            setIncidents(prev => prev.map(inc => inc._id === updatedData._id ? updatedData : inc));
            setSelectedIncident(updatedData);
            setIsUpdating(false);
            setUpdateComment('');
            setUpdateStatus('');
        } catch (err) {
            alert(err.message);
        }
    };

    // 5. NEW: Handle Edit Details Update
    const submitDetailsUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/incidents/${selectedIncident._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: editFormData.category,
                    priority: editFormData.priority,
                    department: editFormData.department,
                    aiSummary: editFormData.aiSummary
                })
            });

            if (!response.ok) throw new Error("Failed to update incident details");

            const updatedData = await response.json();
            setIncidents(prev => prev.map(inc => inc._id === updatedData._id ? updatedData : inc));
            setSelectedIncident(updatedData);
            setIsEditingDetails(false);
        } catch (err) {
            alert(err.message);
        }
    };

    // 6. Handle Incident Deletion with JWT Token
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this incident?")) return;

        try {
            const response = await fetch(`http://localhost:5001/api/incidents/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to delete incident");
            }

            setIncidents(prev => prev.filter(inc => inc._id !== id));
            if (selectedIncident && selectedIncident._id === id) {
                setSelectedIncident(null);
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const formatDate = (isoString) => new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formatTime = (isoString) => new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const isVisualMedia = (incident) => {
        if (!incident) return false;
        const filename = incident.source || '';
        const text = incident.rawDescription || incident.rawText || '';

        if (filename !== 'Manual Entry' && /\.(jpg|jpeg|png|gif|webp|jfif|avif)$/i.test(filename)) {
            return true;
        }

        if (text.startsWith('RIFF') || text.includes('WEBP') || text.includes('PNG') || text.includes('JFIF') || text.includes('Exif')) {
            return true;
        }
        return false;
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-8rem)]">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Incident Vault</h1>
                    <p className="text-sm text-gray-500">Search, filter, and track real-time incident routing.</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={fetchIncidents} className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition">
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition">
                        <Download size={18} />
                        <span>Export Records</span>
                    </button>
                </div>
            </div>

            {/* Comprehensive Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text" placeholder="Search Ticket ID, Category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-lg flex-1 md:flex-none">
                            <Briefcase size={14} className="text-gray-500" />
                            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="bg-transparent border-none text-sm focus:outline-none text-gray-700 font-medium w-full">
                                <option value="All">All Departments</option>
                                <option value="Warehouse">Warehouse</option>
                                <option value="Customer Service">Customer Service</option>
                                <option value="IT Support">IT Support</option>
                                <option value="Hub Operations">Hub Operations</option>
                                <option value="Unassigned">Unassigned</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-lg flex-1 md:flex-none">
                            <Filter size={14} className="text-gray-500" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent border-none text-sm focus:outline-none text-gray-700 font-medium w-full">
                                <option value="All">All Statuses</option>
                                <option value="Draft">Draft (AI)</option>
                                <option value="Reviewed">Reviewed</option>
                                <option value="Published">Published</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-lg flex-1 md:flex-none">
                            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-transparent border-none text-sm focus:outline-none text-gray-700 font-medium w-full">
                                <option value="All">All Priorities</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0 shadow-sm z-10">
                                <th className="p-4 font-semibold w-1/3">Incident Details & File</th>
                                <th className="p-4 font-semibold">Department</th>
                                <th className="p-4 font-semibold">Priority</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Created By</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500"><RefreshCw className="animate-spin mx-auto mb-2 text-blue-500" size={24} /> Loading Data...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="p-8 text-center text-red-500">Error: {error}</td></tr>
                            ) : currentTableData.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No matching incidents found in database.</td></tr>
                            ) : (
                                currentTableData.map((inc) => (
                                    <tr key={inc._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">

                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-base">{inc.ticketId}</span>
                                                {inc.title && (
                                                    <span className="text-xs text-gray-700 font-medium mt-0.5">
                                                        {inc.title}
                                                    </span>
                                                )}
                                                <div className="flex items-center mt-1.5 text-[11px] text-blue-600 bg-blue-50 w-max px-2 py-0.5 rounded border border-blue-100">
                                                    <FileText size={10} className="mr-1 flex-shrink-0" />
                                                    <span className="truncate max-w-[200px]" title={inc.source}>
                                                        {inc.source}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800">{inc.department}</span>
                                                <span className="text-xs text-gray-400">{inc.category}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`py-1 px-3 rounded-full text-xs font-bold w-max flex items-center
                                                ${inc.priority === 'Critical' ? 'bg-red-100 text-[#D40511]' :
                                                    inc.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                        inc.priority === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {inc.priority === 'Critical' && <AlertTriangle size={12} className="mr-1" />} {inc.priority}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`py-1 px-3 rounded-md text-xs font-bold border flex items-center w-max
                                                ${inc.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    inc.status === 'Reviewed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                        inc.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                            'bg-green-50 text-green-600 border-green-200'}`}
                                            >
                                                {inc.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                {inc.isBot ? <Bot size={16} className="text-purple-500" /> : <User size={16} className="text-blue-500" />}
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{inc.creator}</span>
                                                    <span className="text-[10px] text-gray-500">{formatDate(inc.createdAt)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedIncident(inc);
                                                        setIsUpdating(false);
                                                        setIsEditingDetails(false); // Reset edit state on open
                                                        setEditFormData({
                                                            category: inc.category || '',
                                                            priority: inc.priority || '',
                                                            department: inc.department || '',
                                                            aiSummary: inc.aiSummary || ''
                                                        });
                                                    }}
                                                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 py-1.5 px-3 rounded-lg transition-colors"
                                                >
                                                    <Eye size={16} /><span>View details</span>
                                                </button>

                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(inc._id)}
                                                        className="inline-flex items-center text-red-600 hover:text-red-800 bg-red-50 py-1.5 px-2 rounded-lg transition-colors"
                                                        title="Delete Incident"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredIncidents.length > 0 && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 flex items-center justify-between shrink-0">
                        <p className="text-sm text-gray-500">Showing <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredIncidents.length)}</span> of <span className="font-bold">{filteredIncidents.length}</span> results</p>
                        <div className="flex space-x-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-100"><ChevronLeft size={16} /></button>
                            <div className="py-2 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg">Page {currentPage} of {totalPages || 1}</div>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-100"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Comprehensive Detail View Modal */}
            {selectedIncident && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedIncident(null)}></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-fade-in overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                            <div>
                                <div className="flex items-center space-x-3 mb-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedIncident.ticketId}</h2>
                                    <span className={`py-1 px-3 rounded-md text-xs font-bold border flex items-center
                                        ${selectedIncident.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                            selectedIncident.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                'bg-blue-100 text-blue-800 border-blue-200'}`}
                                    >
                                        {selectedIncident.status}
                                    </span>
                                    <span className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full text-xs font-bold flex items-center">
                                        {selectedIncident.isBot ? <Bot size={12} className="mr-1" /> : <User size={12} className="mr-1" />}
                                        Created by: {selectedIncident.creator}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 flex items-center mt-2">
                                    <Calendar size={14} className="mr-1" /> {formatDate(selectedIncident.createdAt)} {formatTime(selectedIncident.createdAt)} | Source: <span className="font-semibold text-gray-700 ml-1">{selectedIncident.source}</span>
                                </p>
                            </div>
                            <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X size={24} /></button>
                        </div>

                        {/* Modal Body - Two Column Layout */}
                        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                            {/* Left Column: Data Review */}
                            <div className="p-6 overflow-y-auto lg:w-3/5 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white relative">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex bg-gray-100 p-1 rounded-lg w-max">
                                        <button onClick={() => setViewMode('ai')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-bold transition-all ${viewMode === 'ai' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                            <LayoutTemplate size={16} /><span>AI Structured Output</span>
                                        </button>
                                        <button onClick={() => setViewMode('raw')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-bold transition-all ${viewMode === 'raw' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                            <Terminal size={16} /><span>Raw File / Data</span>
                                        </button>
                                    </div>

                                    {/* NEW: Edit Toggle Button */}
                                    {viewMode === 'ai' && (
                                        <div>
                                            {!isEditingDetails ? (
                                                <button onClick={() => setIsEditingDetails(true)} className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-bold bg-blue-50 py-1.5 px-3 rounded-lg transition-colors">
                                                    <Edit2 size={14} /><span>Edit</span>
                                                </button>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <button onClick={() => setIsEditingDetails(false)} className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 font-bold bg-gray-100 py-1.5 px-3 rounded-lg transition-colors">
                                                        <X size={14} /><span>Cancel</span>
                                                    </button>
                                                    <button onClick={submitDetailsUpdate} className="flex items-center space-x-1 text-sm text-white hover:bg-green-700 font-bold bg-green-600 py-1.5 px-3 rounded-lg transition-colors shadow-sm">
                                                        <Save size={14} /><span>Save</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {viewMode === 'ai' ? (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Issue Category</p>
                                                {isEditingDetails ? (
                                                    <input
                                                        type="text"
                                                        value={editFormData.category}
                                                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                                        className="w-full border border-gray-300 rounded p-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    />
                                                ) : (
                                                    <p className="text-lg font-semibold text-gray-900">{selectedIncident.category}</p>
                                                )}
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Priority Level</p>
                                                {isEditingDetails ? (
                                                    <select
                                                        value={editFormData.priority}
                                                        onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                                                        className="w-full border border-gray-300 rounded p-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                ) : (
                                                    <p className={`text-lg font-semibold ${selectedIncident.priority === 'Critical' ? 'text-[#D40511]' : 'text-gray-900'}`}>{selectedIncident.priority}</p>
                                                )}
                                            </div>
                                            {isEditingDetails && (
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Department</p>
                                                    <select
                                                        value={editFormData.department}
                                                        onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                                                        className="w-full border border-gray-300 rounded p-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    >
                                                        <option value="Warehouse">Warehouse</option>
                                                        <option value="Customer Service">Customer Service</option>
                                                        <option value="IT Support">IT Support</option>
                                                        <option value="Hub Operations">Hub Operations</option>
                                                        <option value="Unassigned">Unassigned</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">AI Executive Summary</p>
                                            {isEditingDetails ? (
                                                <textarea
                                                    rows="4"
                                                    value={editFormData.aiSummary}
                                                    onChange={(e) => setEditFormData({ ...editFormData, aiSummary: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                />
                                            ) : (
                                                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-gray-800 leading-relaxed font-medium">{selectedIncident.aiSummary}</div>
                                            )}
                                        </div>
                                        {!isEditingDetails && selectedIncident.tags && selectedIncident.tags.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Tags</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedIncident.tags.map((tag, idx) => (
                                                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="animate-fade-in h-full flex flex-col">
                                        {isVisualMedia(selectedIncident) ? (
                                            <div className="bg-gray-50 p-2 rounded-xl border border-gray-200 flex-1 flex flex-col items-center justify-center">
                                                <div className="w-full flex items-center space-x-2 mb-3 px-2">
                                                    <ImageIcon size={16} className="text-gray-500" />
                                                    <span className="text-sm font-bold text-gray-600">Attached Image Preview</span>
                                                </div>
                                                <img
                                                    src={`http://localhost:5001/uploads/${selectedIncident.source}`}
                                                    alt="Incident Document"
                                                    className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm border border-gray-100 bg-white"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-gray-900 text-green-400 font-mono p-6 rounded-xl text-sm leading-relaxed whitespace-pre-wrap shadow-inner min-h-[250px] overflow-y-auto max-h-[500px]">
                                                {selectedIncident.rawDescription || selectedIncident.rawText || "No raw data or file text was recorded for this incident."}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Tracking Timeline & Update Form */}
                            <div className="flex flex-col lg:w-2/5 bg-gray-50">
                                <div className="p-6 overflow-y-auto flex-1">
                                    <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center uppercase tracking-wider">
                                        <GitBranch size={16} className="mr-2 text-blue-600" /> Resolution Tracking
                                    </h3>

                                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                                        {selectedIncident.tracking && selectedIncident.tracking.map((step, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white 
                                                    ${step.status === 'completed' ? 'bg-green-500' : step.status === 'current' ? 'bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]' : 'bg-gray-300'}`}
                                                ></div>

                                                <p className={`text-sm font-bold ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>{step.label}</p>
                                                <p className={`text-xs mt-0.5 ${step.status === 'current' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{step.timestamp}</p>

                                                {step.comment && (
                                                    <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col relative">
                                                        <div className="absolute -left-2 top-3 w-3 h-3 bg-white border-t border-l border-gray-200 transform -rotate-45"></div>
                                                        <span className="text-xs text-gray-800 italic relative z-10">"{step.comment}"</span>
                                                        {step.author && <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">— {step.author}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Update Status Form / Action Area */}
                                <div className="p-6 border-t border-gray-200 bg-white shrink-0">
                                    {!isUpdating ? (
                                        <button
                                            onClick={() => { setIsUpdating(true); setUpdateStatus(selectedIncident.status); }}
                                            className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <Plus size={16} /><span>Update Status / Add Comment</span>
                                        </button>
                                    ) : (
                                        <div className="space-y-4 animate-fade-in">
                                            <h4 className="text-sm font-bold text-gray-800">Update Incident</h4>
                                            <select
                                                value={updateStatus}
                                                onChange={(e) => setUpdateStatus(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-[#FFCC00] focus:border-transparent font-medium"
                                            >
                                                <option value="Draft">Draft (Pending AI Review)</option>
                                                <option value="Reviewed">Reviewed (Pending Action)</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Published">Published (Active)</option>
                                                <option value="Resolved">Resolved (Closed)</option>
                                            </select>
                                            <textarea
                                                placeholder="Add context to the audit trail (optional)..."
                                                rows="3"
                                                value={updateComment}
                                                onChange={(e) => setUpdateComment(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-[#FFCC00] focus:border-transparent"
                                            ></textarea>
                                            <div className="flex space-x-2">
                                                <button onClick={() => setIsUpdating(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-sm transition-colors">Cancel</button>
                                                <button onClick={submitUpdate} className="flex-1 bg-[#D40511] hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1">
                                                    <Send size={14} /><span>Save Update</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}