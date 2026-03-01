import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

function parseStored() {
  try {
    const raw = localStorage.getItem("npe_auth");
    return raw ? JSON.parse(raw) : { token: "", user: null };
  } catch {
    return { token: "", user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(parseStored);

  useEffect(() => {
    localStorage.setItem("npe_auth", JSON.stringify(auth));
  }, [auth]);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      setAuth,
      logout: () => setAuth({ token: "", user: null })
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
