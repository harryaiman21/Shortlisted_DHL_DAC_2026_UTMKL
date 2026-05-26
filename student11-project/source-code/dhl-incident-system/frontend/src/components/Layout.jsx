import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, UploadCloud, Bell, ServerCrash, LogOut, Users, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ResoBotChat from './ResoBotChat';
import dhlLogo from '../assets/DHL_Express_logo_rgb.svg';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { unreadCount } = useNotifications();

    // ---> RBAC SECURITY: Check if user is an Admin <---
    const isAdmin = user?.role === 'Admin';

    // Added an "adminOnly" flag to restrict sensitive routes
    const navigation = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, adminOnly: false },
        { name: 'Incident Vault', path: '/admin/vault', icon: FileText, adminOnly: false },
        { name: 'Upload & Draft', path: '/admin/draft', icon: UploadCloud, adminOnly: false }, // Employees can still upload/draft
        { name: 'Departments', path: '/admin/departments', icon: Briefcase, adminOnly: true },
        { name: 'Team Directory', path: '/admin/employees', icon: Users, adminOnly: true },
        { name: 'Bot Control', path: '/admin/bot-control', icon: ServerCrash, adminOnly: true },
    ];

    // Filter the navigation array based on user role
    const allowedNavigation = navigation.filter(item => isAdmin || !item.adminOnly);

    // Helper to generate initials from the user's name
    const getInitials = (name) => {
        if (!name) return 'AD';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-[#FFCC00] flex flex-col shadow-lg z-10">

                <div className="h-16 flex items-center justify-center bg-yellow-400 border-b border-gray-200 shrink-0">
                    <img src={dhlLogo} alt="DHL Logo" className="h-8 w-auto" />
                    <span className="ml-2 font-bold text-gray-900 text-lg">ResoBot</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
                    {allowedNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/');

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-all font-semibold ${isActive ? 'bg-[#D40511] text-white shadow-md' : 'text-gray-900 hover:bg-black/10'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & LOGOUT Area */}
                <div className="p-4 border-t border-yellow-600/20 bg-[#FFCC00] shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-gray-900 truncate">
                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center font-bold text-[#D40511] shadow-sm shrink-0">
                                {getInitials(user?.name)}
                            </div>
                            <div className="truncate">
                                <p className="font-bold text-sm truncate">{user?.name || 'Admin Desk'}</p>
                                <p className="text-xs font-medium opacity-80 truncate">{user?.department || user?.role || 'Support Team'}</p>
                            </div>
                        </div>

                        {/* The Logout Button */}
                        <button
                            onClick={() => navigate('/logout')}
                            title="Sign Out"
                            className="p-2.5 bg-white/40 hover:bg-white text-gray-900 hover:text-[#D40511] rounded-lg transition-all shadow-sm"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-[#FFCC00] border-b border-yellow-500 flex items-center justify-between px-8 shadow-sm z-0 shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {allowedNavigation.find(n => n.path === location.pathname || (n.path === '/admin' && location.pathname === '/'))?.name || 'Workspace'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/admin/notifications')}
                            className="text-gray-900 hover:text-[#D40511] transition-colors relative p-2"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-4 w-4 bg-[#D40511] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FFCC00]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-gray-50 relative">
                    <Outlet />
                </main>
            </div>

            <ResoBotChat />
        </div>
    );
}