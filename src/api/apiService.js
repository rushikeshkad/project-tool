//Adjust the endpoint paths (/auth/login, /userdetails, /leaves, etc.) to match your actual backend

// src/api/apiService.js
import api from "./apiConfig";

// ---------- AUTH ----------
export const authService = {
  async login(email, password) {
    const response = await api.post("/api/[controller]/login", { email, password });
    // adjust according to your backend response shape
    return response.data;
  },

  async register(name, email, password, confirmPassword) {
    const response = await api.post("/api/[controller]/register", {
      name,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  },

  async logout() {
    await api.post("/api/[controller]/logout");
  },
};

// ---------- USER DETAILS ----------
export const userDetailsService = {
  async getByEmail(email) {
    const response = await api.get(`/api/[controller]/${encodeURIComponent(email)}`);
    return response.data;
  },

  async getAll() {
    const response = await api.get("/api/[controller]/all");
    return response.data;
  },

  async updateSelf(details) {
    const response = await api.put("/api/[controller]/add-or-update", details);
    return response.data;
  },

  async updateAdmin(email, details) {
    const response = await api.put(
      `/api/[controller]/admin/${encodeURIComponent(email)}`,
      details
    );
    return response.data;
  },

  async delete(email) {
    const response = await api.delete(
      `/api/[controller]/${encodeURIComponent(email)}`
    );
    return response.data;
  },
};

// ---------- LEAVE SERVICE ----------
export const leaveService = {
  // year = "2025", month = "03" etc.
  async getByYearMonth(year, month) {
    const response = await api.get("api/[controller]", {
      params: {
        year,
        month, // backend should accept "01".."12" or convert as needed
      },
    });
    return response.data; // expected: array of leave records
  },

    async update(userId, payload) {
    const res = await api.put(`api/[controller]/${userId}`, payload);
    return res.data;
  },

  async delete(userId, year, month) {
  return api.delete(`api/[controller]/${userId}`, {
    params: { year, month },
  });
},
 async applyLeave(payload) {
    const res = await api.post("api/[controller]/apply", payload);
    return res.data;
  }



};
// ---------- ASSET SERVICE ----------
export const assetService = {
  // GET /assets
  async getAll() {
    const response = await api.get("api/[controller]");
    // be defensive: return an array to avoid `.length` on undefined
    return Array.isArray(response.data) ? response.data : [];
  },

  // GET /assets/:id
  async getById(id) {
    const response = await api.get(`api/[controller]/assets/${encodeURIComponent(id)}`);
    return response.data ?? null;
  },

  // POST /assets
  async create(asset) {
    const response = await api.post("api/[controller]", asset);
    return response.data;
  },

  // PUT /assets/:id
  async update(id, asset) {
    const response = await api.put(`api/[controller]/${encodeURIComponent(id)}`, asset);
    return response.data;
  },

  // DELETE /assets/:id
  async delete(id) {
    const response = await api.delete(`api/[controller]/${encodeURIComponent(id)}`);
    return response.data;
  },
};

