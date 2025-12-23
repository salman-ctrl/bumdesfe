import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.auth.profile();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          // If token is invalid, clear it
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  /**
   * Login user
   * @param {Object} credentials - { username, password }
   * @returns {Promise}
   */
  const login = async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      const { user: userData, token: authToken } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(authToken);
      setUser(userData);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setToken(null);
    setUser(null);
  };

  /**
   * Update user profile in state
   * @param {Object} updatedUser - Updated user data
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  /**
   * Check if user has specific role(s)
   * @param {String|Array} roles - Single role or array of roles
   * @returns {Boolean}
   */
  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  /**
   * Check if user has specific division(s)
   * @param {String|Array} divisions - Single division or array of divisions
   * @returns {Boolean}
   */
  const hasDivisi = (...divisions) => {
    if (!user) return false;
    // Admin can access all divisions
    if (user.role === 'admin') return true;
    return divisions.includes(user.divisi);
  };

  /**
   * Check if user is admin
   * @returns {Boolean}
   */
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  /**
   * Check if user is pengurus (manager)
   * @returns {Boolean}
   */
  const isPengurus = () => {
    return user?.role === 'pengurus';
  };

  /**
   * Check if user can perform action (admin or pengurus)
   * @returns {Boolean}
   */
  const canManage = () => {
    return hasRole('admin', 'pengurus');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    hasRole,
    hasDivisi,
    isAdmin,
    isPengurus,
    canManage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;