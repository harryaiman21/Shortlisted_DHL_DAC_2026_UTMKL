import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tag } from '../models/article.model';
import { API_BASE_URL } from './api';

@Injectable({
    providedIn: 'root',
})
export class TagsService {
    private apiUrl = `${API_BASE_URL}/tags`;

    constructor(private http: HttpClient) { }

    getTags() {
        return this.http.get<Tag[]>(this.apiUrl);
    }

    createTag(name: string) {
        return this.http.post<Tag>(this.apiUrl, { name });
    }
}