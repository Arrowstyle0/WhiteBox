import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface User {
    id: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Load guest identity from storage on mount
        const storedId = localStorage.getItem('guestUserId');
        const storedName = localStorage.getItem('guestUsername');

        if (storedId && storedName) {
            setUser({ id: storedId, username: storedName });
        }
    }, []);

    const login = (username: string) => {
        // Create or retrieve ID (if re-logging in with same name, maybe keep ID? 
        // For simplicity, if they "login", they are confirming their identity. 
        // If they already have an ID, keep it to maintain board ownership.
        let id = localStorage.getItem('guestUserId');
        if (!id) {
            id = uuidv4();
            localStorage.setItem('guestUserId', id);
        }

        localStorage.setItem('guestUsername', username);
        setUser({ id, username });
    };

    const logout = () => {
        // Clear identity
        localStorage.removeItem('guestUsername');
        // We probably shouldn't clear guestUserId so they can re-enter name and access boards?
        // But "logout" implies leaving. Let's clear name only from state effectively "locking" it until re-entry.
        // Actually, let's clear everything for a true reset if requested.
        localStorage.removeItem('guestUserId'); // Optional: keep this if we want persistence across sessions
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
