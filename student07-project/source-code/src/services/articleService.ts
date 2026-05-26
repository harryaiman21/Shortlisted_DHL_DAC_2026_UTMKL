import api from "./api";

// GET all articles
export const getArticles = async () => {
  return await api.get("/articles");
};

// GET by ID
export const getArticleById = async (id: number) => {
  return await api.get(`/articles/${id}`);
};

// CREATE
export const createArticle = async (data: any) => {
  return await api.post("/articles", data);
};

// UPDATE
export const updateArticle = async (id: number, data: any) => {
  return await api.put(`/articles/${id}`, data);
};

// DELETE
export const deleteArticle = async (id: number) => {
  return await api.delete(`/articles/${id}`);
};

// SEARCH ARTICLES
export const searchArticles = async (params: any) => {
  return await api.get("/articles/search", { params });
};