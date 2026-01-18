import api from "./api.js";

export default {
  async getMyWallet() {
    return await api.get("/wallet");
  },
  async deposit({ amount }) {
    return await api.post("/wallet/deposit", { amount });
  },
  async withdraw({ amount }) {
    return await api.post("/wallet/withdraw", { amount });
  }
};
