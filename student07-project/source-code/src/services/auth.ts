export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => !!localStorage.getItem("token");
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};