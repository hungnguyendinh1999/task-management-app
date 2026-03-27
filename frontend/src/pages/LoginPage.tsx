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
        <div style={{ maxWidth: 400, margin: "80px auto", padding: 16 }}>
            <h1>Login</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alice@example.com"
                        style={{ width: "100%" }}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        style={{ width: "100%" }}
                        required
                    />
                </div>

                <button type="submit" disabled={submitting}>
                    {submitting ? "Logging in..." : "Login"}
                </button>

                {errorMessage && (
                    <p style={{ color: "red", margin: 0 }}>{errorMessage}</p>
                )}
            </form>
        </div>
    );
}
