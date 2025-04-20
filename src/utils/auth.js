import axios from 'axios';
import { addTransaction } from '@/services/TransactionsService';

// Token storage key
const TOKEN_KEY = 'slotjack_auth_token';
const USER_KEY = 'slotjack_user';

// API base URL
const API_URL = '/api/auth';

// Create axios instance with authentication
export const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Save auth token to localStorage
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// Get auth token from localStorage
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// Remove auth token from localStorage
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Save user data to localStorage
export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

// Get user data from localStorage
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// Remove user data from localStorage
export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
};

// Register a new user
export const register = async (email, password, name) => {
  try {
    const response = await authApi.post('/register', { email, password, name });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Registration failed';
  }
};

// Log in a user
export const login = async (email, password) => {
  try {
    const response = await authApi.post('/login', { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    
    // After setting up the user, create a test transaction to verify the system
    try {
      console.log('Creating test login transaction for user:', response.data.user);
      await addTransaction({
        userId: response.data.user.id,
        userEmail: response.data.user.email,
        userName: response.data.user.name || response.data.user.email.split('@')[0],
        amount: 10,
        description: 'Login bonus',
        timestamp: Date.now(),
        type: 'bonus'
      });
      console.log('Test transaction created successfully');
    } catch (txError) {
      console.error('Failed to create test transaction:', txError);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Login failed';
  }
};

// Log out a user
export const logout = () => {
  removeToken();
  removeUser();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await authApi.get('/me');
    return response.data.user;
  } catch (error) {
    removeToken();
    removeUser();
    throw error.response?.data?.error || 'Failed to get user profile';
  }
};

// Update user profile
export const updateProfile = async (data) => {
  try {
    const response = await authApi.put('/update-profile', data);
    setUser(response.data.user);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update profile';
  }
}; 