import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { AuthContext } from "./authContext.js";

const USER_KEY = "report-manager-user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    client
      .get("/auth/me")
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const authenticate = async (endpoint, credentials) => {
    setIsLoading(true);
    try {
      const { data } = await client.post(endpoint, credentials);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      toast.success(
        endpoint.includes("register")
          ? "Your workspace is ready."
          : "Welcome back.",
      );
      return data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "We could not complete that request.",
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await client.post("/auth/logout");
    } catch {
      /* clear local state even if the session already expired */
    }
    localStorage.removeItem(USER_KEY);
    setUser(null);
    toast.success("You have been signed out.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: (data) => authenticate("/auth/login", data),
        register: (data) => authenticate("/auth/register", data),
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
