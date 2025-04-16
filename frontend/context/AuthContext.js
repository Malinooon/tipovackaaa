import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Nastavení tokenu do hlavičky Axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Načtení uživatele při inicializaci
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/users/me');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Registrace uživatele
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      toast.success('Registrace byla úspěšná');
      return true;
    } catch (err) {
      const message = err.response?.data?.msg || 'Chyba při registraci';
      toast.error(message);
      return false;
    }
  };

  // Přihlášení uživatele
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      toast.success('Přihlášení bylo úspěšné');
      return true;
    } catch (err) {
      const message = err.response?.data?.msg || 'Chyba při přihlášení';
      toast.error(message);
      return false;
    }
  };

  // Odhlášení uživatele
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Byli jste odhlášeni');
  };

  // Aktualizace profilu uživatele
  const updateProfile = async (formData) => {
    try {
      const res = await axios.put('/api/users/me', formData);
      setUser(res.data);
      toast.success('Profil byl aktualizován');
      return true;
    } catch (err) {
      const message = err.response?.data?.msg || 'Chyba při aktualizaci profilu';
      toast.error(message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
