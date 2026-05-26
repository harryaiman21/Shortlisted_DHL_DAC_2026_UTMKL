import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import {
    Clock, Play, AlertTriangle, TrendingUp, TrendingDown,
    Package, Truck, AlertOctagon, Download, Zap, Server,
    FileText, CheckCircle, RefreshCw, Bell, Info
} from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [botStatus, setBotStatus] = useState('Idle');
    const [timeRange, setTimeRange] = useState('Today');

    // Live Data State
    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const isAdmin = user?.role === 'Admin';

    const fetchDashboardData = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            // Because we secured the backend, this fetch will automatically 
            // return ALL data for Admins, and ONLY departmental data for regular staff.
            const response = await fetch('http://localhost:5001/api/incidents', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            const data = await response.json();
            setIncidents(data);
            setError(null);

            generateSmartNotifications(data);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const socket = io('http://localhost:5001');

        socket.on('database_updated', (data) => {
            console.log("Live update received via WebSocket:", data);

            // Create notification for live updates
            const newNotif = {
                id: Date.now(),
                type: data.message.toLowerCase().includes('escalated') ? 'critical' : 'update',
                message: `AI Alert: ${data.message}`,
                time: 'Just now'
            };
            setNotifications(prev => [newNotif, ...prev].slice(0, 8));

            fetchDashboardData(); // Refresh the numbers
        });

        return () => socket.disconnect();
    }, [token]);

    const generateSmartNotifications = (data) => {
        const notifs = [];
        const criticals = data.filter(i => i.priority === 'Critical');
        const resolved = data.filter(i => i.status === 'Resolved');

        if (criticals.length > 0) {
            notifs.push({
                id: 'init-1', type: 'critical',
                message: `AI Watchdog: ${criticals.length} critical SLA risk(s) require immediate assignment.`,
                time: 'System'
            });
        }
        if (resolved.length > 0) {
            notifs.push({
                id: 'init-2', type: 'completed',
                message: `Summary: ${resolved.length} incidents successfully resolved.`,
                time: 'System'
            });
        }

        if (isAdmin) {
            notifs.push({
                id: 'init-3', type: 'update',
                message: 'RPA Bot is active and monitoring incoming pipelines.',
                time: 'System'
            });
        }

        setNotifications(notifs);
    };

    const handleForceRun = () => {
        setBotStatus('Running...');
        setTimeout(() => setBotStatus('Idle'), 4000);
    };

    const handleExport = () => {
        if (incidents.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = ['Ticket ID', 'Incident ID', 'Department', 'Category', 'Priority', 'Status', 'Creator', 'Created At'];

        const csvRows = incidents.map(inc => [
            inc.ticketId || '',
            inc.incidentId || '',
            inc.department || '',
            inc.category || '',
            inc.priority || '',
            inc.status || '',
            inc.creator || '',
            new Date(inc.createdAt).toLocaleString() || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.map(item => `"${item}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `DHL_${user?.department || 'System'}_Export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalIncidents = incidents.length;
    const pendingReview = incidents.filter(i => i.status === 'Draft' || i.status === 'Reviewed').length;
    const criticalIncidents = incidents.filter(i => i.priority === 'Critical').length;

    const kpis = [
        { title: 'Total Incidents', value: totalIncidents, trend: '+12%', isUp: true, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Pending Action', value: pendingReview, trend: '-5%', isUp: false, icon: Zap, color: 'text-[#FFCC00]', bg: 'bg-yellow-100' },
        { title: 'Critical / SLA Risk', value: criticalIncidents, trend: '+2%', isUp: true, icon: AlertOctagon, color: 'text-[#D40511]', bg: 'bg-red-100' },
        { title: 'Avg. Resolution', value: '2.4h', trend: '-18%', isUp: false, icon: Clock, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    const categoryCounts = incidents.reduce((acc, inc) => {
        acc[inc.category] = (acc[inc.category] || 0) + 1;
        return acc;
    }, {});

    const categories = Object.keys(categoryCounts).map(name => ({
        name,
        count: categoryCounts[name],
        percent: totalIncidents > 0 ? Math.round((categoryCounts[name] / totalIncidents) * 100) : 0,
        color: name.includes('Late') ? 'bg-blue-500' : name.includes('Damage') ? 'bg-[#D40511]' : name.includes('Address') ? 'bg-[#FFCC00]' : 'bg-gray-700'
    })).sort((a, b) => b.count - a.count);

    const priorityQueue = incidents
        .filter(inc => inc.status === 'Draft' || inc.status === 'Reviewed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const getNotifIcon = (type) => {
        if (type === 'critical') return <AlertTriangle size={18} className="text-[#D40511]" />;
        if (type === 'completed') return <CheckCircle size={18} className="text-green-600" />;
        return <Info size={18} className="text-blue-500" />;
    };

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Page Header (Dynamic Title based on Role) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isAdmin ? 'System Command Center' : `${user?.department} Dashboard`}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isAdmin ? 'Real-time overview of DHL incident reports and RPA operations.' : 'Real-time overview of your department\'s active incidents.'}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={fetchDashboardData} className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg shadow-sm hover:bg-gray-50 transition">
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFCC00]">
                        <option>All Time</option>
                        <option>Today</option>
                        <option>Last 7 Days</option>
                    </select>
                    <button onClick={handleExport} className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition">
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center rounded-lg shadow-sm">
                    <AlertTriangle className="mr-2" size={20} />
                    Failed to load live data: {error}
                </div>
            )}

            {/* Top Row: KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                        {isLoading ? "..." : stat.value}
                                    </h3>
                                </div>
                                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
                                    <Icon className={stat.color} size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                {stat.isUp ? <TrendingUp size={16} className={`${stat.color === 'text-[#D40511]' ? 'text-red-500' : 'text-green-500'} mr-1`} /> : <TrendingDown size={16} className={`${stat.color === 'text-green-600' ? 'text-green-500' : 'text-red-500'} mr-1`} />}
                                <span className={`font-medium ${stat.color === 'text-[#D40511]' && stat.isUp ? 'text-red-500' : stat.color === 'text-green-600' && !stat.isUp ? 'text-green-500' : 'text-gray-500'}`}>
                                    {stat.trend} vs last period
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Middle Row: Analytics & Conditional Bot Control */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Analytics block dynamically expands if Bot panel is hidden */}
                <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">AI Categorization Breakdown</h3>
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 py-1 px-2 rounded-full">Live Database</span>
                    </div>
                    <div className="space-y-5">
                        {isLoading ? <div className="text-center py-8 text-gray-500">Loading analysis...</div> : categories.length === 0 ? <div className="text-center py-8 text-gray-500">No incident data available yet.</div> : categories.map((cat, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="flex items-center text-gray-700">
                                        {cat.name.includes('Late') && <Clock size={14} className="mr-2 text-gray-400" />}
                                        {cat.name.includes('Damage') && <Package size={14} className="mr-2 text-gray-400" />}
                                        {cat.name.includes('Address') && <Truck size={14} className="mr-2 text-gray-400" />}
                                        {!cat.name.includes('Late') && !cat.name.includes('Damage') && !cat.name.includes('Address') && <Server size={14} className="mr-2 text-gray-400" />}
                                        {cat.name}
                                    </span>
                                    <span className="text-gray-900">{cat.count} reports ({cat.percent}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-2.5 rounded-full ${cat.color}`} style={{ width: `${cat.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Only render Bot Control Panel if user is Admin */}
                {isAdmin && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFCC00]/10 rounded-bl-full z-0"></div>
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-gray-800">RPA Bot Status</h3>
                                <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center"><Zap size={16} className="text-blue-600" /></div>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Ingesting emails, Telegram, and Drive files.</p>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="relative flex h-3 w-3">
                                        {botStatus === 'Running...' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${botStatus === 'Idle' ? 'bg-gray-400' : 'bg-green-500'}`}></span>
                                    </div>
                                    <span className="font-semibold text-gray-800 uppercase tracking-wider text-sm">{botStatus}</span>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">Last sync: Just now</span>
                            </div>
                        </div>
                        <button onClick={handleForceRun} disabled={botStatus !== 'Idle'} className="w-full flex items-center justify-center space-x-2 bg-[#D40511] hover:bg-red-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg transition-colors font-bold shadow-md relative z-10">
                            <Play size={18} fill="currentColor" /><span>Force Bot Execution</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Row: Split between Queue and Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Priority Action Queue (Takes up 2/3) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2 flex flex-col h-full">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Priority Action Queue</h3>
                            <p className="text-sm text-gray-500 mt-1">Pending items requiring final human approval.</p>
                        </div>
                        <button onClick={() => navigate('/admin/vault')} className="text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg shadow-sm transition">
                            View Entire Vault
                        </button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-white text-xs uppercase tracking-wider text-gray-500">
                                    <th className="p-4 font-semibold">ID</th>
                                    <th className="p-4 font-semibold">Category</th>
                                    <th className="p-4 font-semibold">Priority</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {isLoading ? <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading queue...</td></tr> : priorityQueue.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-gray-500">No pending actions required.</td></tr> : priorityQueue.map(inc => (
                                    <tr key={inc._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-bold text-blue-600">{inc.incidentId}</td>
                                        <td className="p-4 font-medium text-gray-900">{inc.category}</td>
                                        <td className="p-4">
                                            <span className={`py-1 px-3 rounded-full text-xs font-bold w-max flex items-center ${inc.priority === 'Critical' ? 'bg-red-100 text-[#D40511]' : inc.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {inc.priority === 'Critical' && <AlertTriangle size={12} className="mr-1" />} {inc.priority}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`py-1 px-3 rounded-md text-xs font-bold border ${inc.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>{inc.status}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => navigate('/admin/vault')} className="text-blue-600 hover:text-blue-800 font-semibold">Review</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Notification Feed (Takes up 1/3) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                        <div className="flex items-center space-x-2">
                            <Bell size={20} className="text-[#D40511]" />
                            <h3 className="text-lg font-bold text-gray-800">Live AI Feed</h3>
                        </div>
                        <span className="bg-red-100 text-[#D40511] text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">Live</span>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50/30">
                        {notifications.length === 0 ? (
                            <p className="text-center text-sm text-gray-500 mt-4">No new notifications.</p>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-start space-x-3 transition-all hover:border-[#FFCC00]">
                                    <div className="mt-0.5 shrink-0">
                                        {getNotifIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800 font-medium leading-snug">{notif.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}