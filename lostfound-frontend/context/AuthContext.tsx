import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext<{ isAdmin: boolean; setAdmin: (val: boolean) => void }>({
  isAdmin: false,
  setAdmin: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false); // Change to true to test admin tabs

  return (
    <AuthContext.Provider value={{ isAdmin, setAdmin: setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
