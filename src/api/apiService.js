//Adjust the endpoint paths (/auth/login, /userdetails, /leaves, etc.) to match your actual backend

// src/api/apiService.js
import api from "./apiConfig";

// ---------- AUTH ----------
export const authService = {
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    // adjust according to your backend response shape
    return response.data;
  },

  async register(name, email, password, confirmPassword) {
    const response = await api.post("/auth/register", {
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
    const response = await api.get(`/userdetails/${encodeURIComponent(email)}`);
    return response.data;
  },

  async getAll() {
    const response = await api.get("/userdetails");
    return response.data;
  },

  async updateSelf(details) {
    const response = await api.put("/userdetails/self", details);
    return response.data;
  },

  async updateAdmin(email, details) {
    const response = await api.put(
      `/userdetails/admin/${encodeURIComponent(email)}`,
      details
    );
    return response.data;
  },

  async delete(email) {
    const response = await api.delete(
      `/userdetails/${encodeURIComponent(email)}`
    );
    return response.data;
  },
};

// ---------- LEAVE SERVICE ----------
export const leaveService = {
  // year = "2025", month = "03" etc.
  async getByYearMonth(year, month) {
    const response = await api.get("/leaves", {
      params: {
        year,
        month, // backend should accept "01".."12" or convert as needed
      },
    });
    return response.data; // expected: array of leave records
  },

    async update(userId, payload) {
    const res = await api.put(`/leaves/${userId}`, payload);
    return res.data;
  },

delete(userId, year, month) {
  return api.delete(`/leaves/${userId}`, {
    params: { year, month },
  });
}

};
