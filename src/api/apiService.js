import api from './apiConfig';
 
// Authentication APIs
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },
  
  register: async (name, email, password, confirmPassword) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword
    });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
 
// User Details APIs
export const userDetailsService = {
  // Get all user details (admin view)
  getAll: async () => {
    const response = await api.get('/userdetails/all');
    return response.data;
  },
  
  // Get current user's details by email (from session)
  getByEmail: async (email) => {
    const response = await api.get(`/userdetails/${email}`);
    return response.data;
  },
  
  // Create new user details
  create: async (userDetailsData) => {
    const response = await api.post('/userdetails/add-or-update', userDetailsData);
    return response.data;
  },
  
  // Update user details by email
  update: async (email, userDetailsData) => {
    const response = await api.put(`/userdetails/add-or-update`, userDetailsData);
    return response.data;
  },
  
  // Delete user details
  delete: async (email) => {
    const response = await api.delete(`/userdetails/${email}`);
    return response.data;
  },
//update all users
  update: async(email, userDetailsData) => {
    const response = await api.put(`/userdetails/admin/${email}`, userDetailsData);
    return response.data;
  },
    
};
 
// Dashboard Statistics API
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/userdetails/all');
    return response.data;
  },
};