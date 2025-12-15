import api from "./apiConfig";

// ---------- AUTH ----------
export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password
    });
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
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout request failed:", err);
    }
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
      params: { 
        month: `${month}`, 
        year: `${year}`
      },
    });
    return response.data;
  },

  async applyLeave(payload) {
    // Handle multiple leave entries - send each separately
    if (payload.leaveEntries && Array.isArray(payload.leaveEntries)) {
      const promises = payload.leaveEntries.map(entry => 
        api.post("/LeavePlan/apply", {
          email: payload.email,
          dateFrom: entry.dateFrom,
          dateTo: entry.dateTo,
          breakdowns: entry.breakdowns
        })
      );
      
      const responses = await Promise.all(promises);
      return responses[responses.length - 1].data; // Return last response
    }
    
    // Single entry format (backward compatibility)
    const response = await api.post("/LeavePlan/apply", payload);
    return response.data;
  },

  async update(email, payload) {
    // For update, send updated leave balances
    const updatePayload = {
      email: payload.email,
      leavesInHandFL: payload.leavesInHandFL,
      leavesInHandPL: payload.leavesInHandPL,
      leavesInHandUL: payload.leavesInHandUL,
    };
    
    // If there are new leave entries, apply them
    if (payload.leaveEntries && Array.isArray(payload.leaveEntries)) {
      // First update balances
      await api.put(`/LeavePlan/${encodeURIComponent(email)}`, updatePayload);
      
      // Then apply new leave entries if any
      const applyPromises = payload.leaveEntries.map(entry => 
        api.post("/LeavePlan/apply", {
          email: payload.email,
          dateFrom: entry.dateFrom,
          dateTo: entry.dateTo,
          breakdowns: entry.breakdowns
        })
      );
      
      const responses = await Promise.all(applyPromises);
      return responses[responses.length - 1].data;
    }
    
    const response = await api.put(`/LeavePlan/${encodeURIComponent(email)}`, updatePayload);
    return response.data;
  },

  async delete(email, year, month) {
    const response = await api.delete(`/LeavePlan/${encodeURIComponent(email)}`, {
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