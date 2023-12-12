import React, {createContext, useContext, useState, ReactNode} from 'react';

interface AuthContextProps {
  id: number;
  email: string;

  setAuthEmail: (newEmail: string) => void;
  setAuthId: (newId: number) => void; // Added setAuthId
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [email, setEmail] = useState<string>('');
  const [id, setId] = useState<number>(0); // Changed setid to setId
  const setAuthEmail = (newEmail: string) => {
    setEmail(newEmail);
  };
  const setAuthId = (newId: number) => {
    setId(newId);
  };

  return (
    <AuthContext.Provider value={{id, setAuthId, email, setAuthEmail}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
