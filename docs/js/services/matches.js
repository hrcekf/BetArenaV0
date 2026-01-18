import api from "./api.js";

export default {
  async getUpcoming({ limit = 5 } = {}) {
    return await api.get(`/matches/upcoming?limit=${limit}`);
  },
  async getMatch(id) {
    return await api.get(`/matches/${id}`);
  }
};
