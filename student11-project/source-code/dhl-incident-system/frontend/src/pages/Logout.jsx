import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Clear the global user session securely
        logout();

        // 2. Redirect to the login page after a short 1.5s delay for UX
        const timer = setTimeout(() => {
            navigate('/login');
        }, 1500);

        return () => clearTimeout(timer);
    }, [logout, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center space-y-4 max-w-sm w-full mx-4">
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <LogOut size={32} className="text-[#D40511]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Signed Out Securely</h2>
                <p className="text-gray-500 text-sm">
                    You have successfully logged out of the DHL ResoBot Portal.
                </p>

                <div className="mt-6 flex justify-center items-center space-x-2 text-sm text-gray-400 font-medium">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#D40511] rounded-full animate-spin"></div>
                    <span>Redirecting to login...</span>
                </div>
            </div>
        </div>
    );
}