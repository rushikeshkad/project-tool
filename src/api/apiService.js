// src/api/apiService.js
import api from "./apiConfig";

/*
  This example assumes your backend provides something like:

  POST   /auth/login
  POST   /auth/register
  POST   /auth/logout

  GET    /user-details/:email
  GET    /user-details
  PUT    /user-details/self          // update own details
  PUT    /user-details/:email        // admin updates any user
  DELETE /user-details/:email

  If your routes differ, just change the strings below.
*/

export const authService = {
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    // e.g. data = { email, name, token, ... }
    return data;
  },

  async register(name, email, password, confirmPassword) {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });
    return data;
  },

  async logout() {
    // if your backend needs a body or different route, adjust here
    await api.post("/auth/logout");
  },
};

export const userDetailsService = {
  async getByEmail(email) {
    const { data } = await api.get(
      `/user-details/${encodeURIComponent(email)}`
    );
    return data;
  },

  async getAll() {
    const { data } = await api.get("/user-details");
    return data;
  },

  // current logged-in user updates their own details
  async updateSelf(details) {
    const { data } = await api.put("/user-details/self", details);
    return data;
  },

  // admin updates another user's details
  async updateAdmin(email, details) {
    const { data } = await api.put(
      `/user-details/${encodeURIComponent(email)}`,
      details
    );
    return data;
  },

  async delete(email) {
    // returns axios response; caller usually doesn't need the body
    return api.delete(`/user-details/${encodeURIComponent(email)}`);
  },
};
