//Adjust the endpoint paths (/auth/login, /userdetails, /leaves, etc.) to match your actual backend

// src/api/apiService.js
import api from "./apiConfig";

// ---------- AUTH ----------
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

 async register(name, email, password, confirmPassword) {
    const response = await api.post("/Auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  },

  async logout() {
    await api.post("/auth/logout");
  },
};

// ---------- USER DETAILS ----------
export const userDetailsService = {
  async getByEmail(email) {
    const response = await api.get(`/UserDetails/${encodeURIComponent(email)}`);
    return response.data;
  },

  async getAll() {
    const response = await api.get("/UserDetails/all");
    return response.data;
  },

  async updateSelf(details) {
    const response = await api.post("/UserDetails/add-or-update", details);
    return response.data;
  },

  async updateAdmin(email, details) {
    const response = await api.put(
      `/UserDetails/admin/${encodeURIComponent(email)}`,
      details
    );
    return response.data;
  },

  async delete(email) {
    const response = await api.delete(
      `/UserDetails/${encodeURIComponent(email)}`
    );
    return response.data;
  },
};

// ---------- LEAVE SERVICE ----------
export const leaveService = {
  async getByYearMonth(year, month) {
    const response = await api.get("/LeavePlan", {
      params: { year, month },
    });
    return response.data;
  },

  async applyLeave(payload) {
    const response = await api.post("/LeavePlan/apply", payload);
    return response.data;
  },

  async update(userId, payload) {
    const response = await api.put(`/LeavePlan/${userId}`, payload);
    return response.data;
  },

  async delete(userId, year, month) {
    const response = await api.delete(`/LeavePlan/${userId}`, {
      params: { year, month },
    });
    return response.data;
  },
};
// ---------- ASSET SERVICE ----------
export const assetService = {
  async getAll() {
    const response = await api.get("/Assets");
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id) {
    const response = await api.get(`/Assets/${id}`);
    return response.data;
  },

  async create(asset) {
    const response = await api.post("/Assets", asset);
    return response.data;
  },

  async update(id, asset) {
    const response = await api.put(`/Assets/${id}`, asset);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/Assets/${id}`);
    return response.data;
  },
};

