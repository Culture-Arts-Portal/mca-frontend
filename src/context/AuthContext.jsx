import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, getCurrentUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
  // If there's a saved token, we need to check it before showing protected pages.
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem("token")));

  // When the app opens: if a token was saved earlier, ask the backend who it belongs to.
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    getCurrentUser()
      .then(setUser)
      .catch(() => localStorage.removeItem("token")) // expired or invalid token
      .finally(() => setChecking(false));
  }, []);

  async function login(email, password) {
    const { token, user } = await loginUser(email, password);
    localStorage.setItem("token", token);
    setUser(user);
    return user;
  }

  async function register(details) {
    const { token, user } = await registerUser(details);
    localStorage.setItem("token", token);
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  const value = { user, isLoggedIn: Boolean(user), checking, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Any component can call useAuth() to get the user and the login/logout functions.
export function useAuth() {
  return useContext(AuthContext);
}