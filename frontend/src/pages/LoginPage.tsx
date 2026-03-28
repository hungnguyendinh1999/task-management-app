import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setSubmitting(true);

        try {
            await login(email, password);
            navigate("/", { replace: true });
        } catch (error: any) {
            setErrorMessage(error?.error?.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alice@example.com"
                            required
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors disabled:opacity-50 mt-6"
                    >
                        {submitting ? "Logging in..." : "Login"}
                    </button>

                    {errorMessage && (
                        <p className="text-red-300 text-sm p-3 bg-red-900/30 border border-red-600 rounded text-center">
                            {errorMessage}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
