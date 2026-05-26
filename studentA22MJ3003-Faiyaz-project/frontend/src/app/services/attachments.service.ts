import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Attachment } from '../models/article.model';
import { API_BASE_URL } from './api';

@Injectable({
    providedIn: 'root',
})
export class AttachmentsService {
    private apiUrl = `${API_BASE_URL}/attachments`;

    constructor(private http: HttpClient) { }

    getAttachmentsByArticle(articleId: number) {
        return this.http.get<Attachment[]>(`${this.apiUrl}/article/${articleId}`);
    }

    uploadAttachment(articleId: number, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<Attachment>(
            `${this.apiUrl}/article/${articleId}`,
            formData
        );
    }

    deleteAttachment(id: number) {
        return this.http.delete<Attachment>(`${this.apiUrl}/${id}`);
    }
}