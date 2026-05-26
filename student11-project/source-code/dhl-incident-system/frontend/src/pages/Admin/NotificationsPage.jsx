import { Bell, AlertTriangle, Bot, CheckCircle2, Trash2, Clock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'error': return <AlertTriangle className="text-red-500" size={24} />;
            case 'bot': return <Bot className="text-blue-500" size={24} />;
            case 'incident': return <Bell className="text-yellow-500" size={24} />;
            default: return <Bell className="text-gray-400" size={24} />;
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                        <Bell className="text-[#D40511]" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Activity Center</h1>
                        <p className="text-sm text-gray-500">Real-time alerts from UiPath, system errors, and new tickets.</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button onClick={markAllAsRead} className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <CheckCircle2 size={16} /> <span>Mark All Read</span>
                    </button>
                    <button onClick={clearAll} className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 size={16} /> <span>Clear All</span>
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                        <CheckCircle2 size={48} className="mb-4 opacity-50 text-green-500" />
                        <p className="text-lg font-medium text-gray-600">You're all caught up!</p>
                        <p className="text-sm">No new notifications at this time.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`p-5 flex items-start space-x-4 transition-colors cursor-pointer hover:bg-gray-50 ${!notif.read ? 'bg-blue-50/30' : 'bg-white'}`}
                            >
                                <div className="shrink-0 mt-1">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-sm font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {notif.title}
                                        </h3>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Clock size={12} className="mr-1" />
                                            {formatTime(notif.time)}
                                        </div>
                                    </div>
                                    <p className={`text-sm mt-1 ${!notif.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                                {!notif.read && (
                                    <div className="shrink-0 mt-2">
                                        <div className="h-2.5 w-2.5 bg-blue-600 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}