import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    if (username === "admin" && password === "1234") {
      setUser({ name: "관리자", role: "admin" });
    } else if (username === "user" && password === "1234") {
      setUser({ name: "사용자", role: "user" });
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}