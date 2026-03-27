import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi } from "../api/auth";
import type { User } from "../types/user";

interface AuthContextValue {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken) {
            setToken(storedToken);
        }

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser) as User);
            } catch {
                localStorage.removeItem(USER_KEY);
            }
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await loginApi(email, password);

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            token,
            user,
            isAuthenticated: Boolean(token),
            login,
            logout,
        }),
        [token, user],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}
