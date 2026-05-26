import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
    Article,
    ArticleStatus,
    CreateArticleDto,
    UpdateArticleStatusDto,
} from '../models/article.model';
import { API_BASE_URL } from './api';

@Injectable({
    providedIn: 'root',
})
export class ArticlesService {
    private apiUrl = `${API_BASE_URL}/articles`;

    constructor(private http: HttpClient) { }

    getArticles(filters?: {
        search?: string;
        status?: ArticleStatus | '';
        tag?: string;
        creatorId?: string;
    }) {
        let params = new HttpParams();

        if (filters?.search) params = params.set('search', filters.search);
        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.tag) params = params.set('tag', filters.tag);
        if (filters?.creatorId) params = params.set('creatorId', filters.creatorId);

        return this.http.get<Article[]>(this.apiUrl, { params });
    }

    getArticle(id: number) {
        return this.http.get<Article>(`${this.apiUrl}/${id}`);
    }

    createArticle(data: CreateArticleDto) {
        return this.http.post<Article>(this.apiUrl, data);
    }

    updateArticle(id: number, payload: any) {
        return this.http.patch<Article>(`${this.apiUrl}/${id}`, payload);
    }

    updateArticleStatus(id: number, data: UpdateArticleStatusDto) {
        return this.http.patch<Article>(`${this.apiUrl}/${id}/status`, data);
    }

    deleteArticle(id: number) {
        return this.http.delete<Article>(`${this.apiUrl}/${id}`);
    }
}