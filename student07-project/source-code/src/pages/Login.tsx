import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { loginUser } from "../services/authService";
import { useEffect } from "react";
import { isAuthenticated } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

    useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await loginUser(email, password);

      const token = res.data.token;

      // save token
      localStorage.setItem("token", token);

      // save user
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // go to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="bg-[#d40511] px-6 py-3 rounded-lg">
                <span className="text-white font-bold text-2xl">DHL</span>
              </div>
            </div>

            <h2 className="text-gray-900 mb-2">
              Knowledge Base System
            </h2>

            <p className="text-gray-600 text-sm">
              Sign in to manage articles
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d40511] focus:border-transparent"
                  placeholder="your.email@dhl.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d40511] focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#d40511] text-white py-3 rounded-lg hover:bg-[#b00410] transition-colors mt-6"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Forgot password? Contact IT Support
          </p>
        </div>
      </div>
    </div>
  );
}