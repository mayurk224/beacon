import { createContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  loginWithGoogleCredential,
  logoutUser,
} from "./authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthenticatedUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("isAuthenticated", "true");
  };

  const clearSession = () => {
    setUser(null);
    localStorage.removeItem("isAuthenticated");
  };

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    setAuthenticatedUser(currentUser);
    return currentUser;
  };

  const login = async (credentials) => {
    const nextUser = await loginUser(credentials);
    setAuthenticatedUser(nextUser);
    return nextUser;
  };

  const loginWithGoogle = async (credential) => {
    const nextUser = await loginWithGoogleCredential(credential);
    setAuthenticatedUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      clearSession();
    }
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setAuthenticatedUser(currentUser);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        loginWithGoogle,
        logout,
        refreshUser,
        setAuthenticatedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
