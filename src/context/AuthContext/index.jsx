import React, { createContext, useState, useEffect } from 'react';

// Create the AuthContext
export const AuthContext = createContext(undefined);

// Default auth state
const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultAuthState.user);
  const [isAuthenticated, setIsAuthenticated] = useState(defaultAuthState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(defaultAuthState.isLoading);
  const [error, setError] = useState(defaultAuthState.error);

  // Check for existing authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is already authenticated (from localStorage or token)
  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call - replace with your actual API endpoint
      const response = await simulateLoginAPI(credentials);
      
      if (response.success) {
        const { user: userData, token } = response.data;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call - replace with your actual API endpoint
      const response = await simulateRegisterAPI(userData);
      
      if (response.success) {
        const { user: newUser, token } = response.data;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(newUser));
        
        // Update state
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true, user: newUser };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUser = (updatedUserData) => {
    try {
      const updatedUser = { ...user, ...updatedUserData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    updateUser,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Simulate API calls - Replace these with your actual API calls
const simulateLoginAPI = async (credentials) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful login
      if (credentials.username === 'admin' && credentials.password === 'password') {
        resolve({
          success: true,
          data: {
            user: {
              id: 1,
              username: credentials.username,
              email: 'admin@example.com',
              name: 'Admin User',
              role: 'administrator',
              avatar: '/images/users/1.jpg',
            },
            token: 'mock-jwt-token-' + Date.now(),
          },
        });
      } else {
        resolve({
          success: false,
          message: 'Invalid username or password',
        });
      }
    }, 1000); // Simulate network delay
  });
};

const simulateRegisterAPI = async (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful registration
      resolve({
        success: true,
        data: {
          user: {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            name: userData.name,
            role: 'user',
            avatar: '/images/users/default.jpg',
          },
          token: 'mock-jwt-token-' + Date.now(),
        },
      });
    }, 1000); // Simulate network delay
  });
};
