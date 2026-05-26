import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, Loader2 } from 'lucide-react';


import dhlLogo from '../assets/DHL_Express_logo_rgb.svg'; // <-- NEW: Import the local logo image

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Auto-Redirect Security & UX Feature
    useEffect(() => {
        if (user) {
            navigate('/admin');
        }
    }, [user, navigate]);

    // Async function that waits for the backend
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* DHL Background Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFCC00] to-[#D40511]"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center bg-yellow-400 p-4 rounded-full w-24 h-24 mx-auto shadow-sm border border-gray-100">
                    {/* ---> UPGRADE: Use the imported local image variable here <--- */}
                    <img src={dhlLogo} alt="DHL" className="h-8 my-auto object-contain" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">ResoBot Portal</h2>
                <p className="mt-2 text-center text-sm text-gray-600">Enterprise Incident Management</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 p-3 rounded-md flex items-center space-x-2 text-red-700 text-sm border border-red-100 animate-fade-in">
                                <ShieldAlert size={16} className="shrink-0" /><span>{error}</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                                Corporate Email
                            </label>
                            <div className="mt-1 relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@dhl.com"
                                    className="block w-full pl-10 sm:text-sm border-gray-200 rounded-lg py-3 border-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] transition-colors outline-none text-gray-900 font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Password</label>
                            <div className="mt-1 relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-10 sm:text-sm border-gray-200 rounded-lg py-3 border-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] transition-colors outline-none text-gray-900 font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-colors bg-[#D40511] hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In to Workspace'
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}