"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { loginUser, logoutUser, getUserProfile } from "./auth";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  token: string | null;
  refreshToken: string | null;
  isSuperuser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isSuperuser, setIsSuperuser] = useState<boolean>(false);

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const storedRefreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null;
    const storedIsSuperuser =
      typeof window !== "undefined"
        ? localStorage.getItem("is_superuser") === "true"
        : false;
    setToken(storedToken);
    setRefreshToken(storedRefreshToken);
    setIsSuperuser(storedIsSuperuser);
    setIsAuthenticated(!!storedToken && !!storedRefreshToken);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      setToken(data.token);
      setRefreshToken(data.refreshToken);
      setIsAuthenticated(true);
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("expiresIn", String(data.expiresIn));
      localStorage.setItem("auth_username", username);
      
      // Fetch user profile to get superuser status
      try {
        const profile = await getUserProfile(data.token);
        setIsSuperuser(profile.is_superuser);
        localStorage.setItem("is_superuser", String(profile.is_superuser));
      } catch (profileError) {
        console.error("[authContext] Failed to fetch user profile:", profileError);
        setIsSuperuser(false);
        localStorage.setItem("is_superuser", "false");
      }
    } catch (error) {
      console.error("[authContext] Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (logoutUser) logoutUser();
    setIsAuthenticated(false);
    setToken(null);
    setRefreshToken(null);
    setIsSuperuser(false);
    localStorage.removeItem("auth_username");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("is_superuser");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, loading, token, refreshToken, isSuperuser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
