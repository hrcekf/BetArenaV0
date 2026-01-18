import api from "./api.js";

export default {
  async getMyRecent({ limit = 5 } = {}) {
    return await api.get(`/tickets?limit=${limit}`);
  },
  async createTicket(payload) {
    return await api.post("/tickets", payload);
  }
};
