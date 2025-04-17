import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        
        if (userInfo) {
          const parsedUser = JSON.parse(userInfo);
          
          // Set the token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
          
          // Verify token is still valid by getting user profile
          const { data } = await api.get('/api/auth/me');
          setUser({ ...parsedUser, ...data });
        }
      } catch (error) {
        // If token is invalid, clear localStorage
        localStorage.removeItem('userInfo');
        api.defaults.headers.common['Authorization'] = '';
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      
      // Set user in state
      setUser(data);
      
      // Save to localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response && error.response.data.message 
          ? error.response.data.message 
          : 'Přihlášení selhalo. Zkuste to prosím znovu.' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      
      // Set user in state
      setUser(data);
      
      // Save to localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response && error.response.data.message 
          ? error.response.data.message 
          : 'Registrace selhala. Zkuste to prosím znovu.' 
      };
    }
  };

  const logout = () => {
    // Remove user from state
    setUser(null);
    
    // Remove from localStorage
    localStorage.removeItem('userInfo');
    
    // Remove token from axios headers
    api.defaults.headers.common['Authorization'] = '';
    
    // Redirect to login
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
