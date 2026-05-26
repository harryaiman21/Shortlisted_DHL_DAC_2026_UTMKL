import api from "./api";

export const loginUser = async (email: string, password: string) => {
  return await api.post("/auth/login", {
    email,
    password,
  });
};