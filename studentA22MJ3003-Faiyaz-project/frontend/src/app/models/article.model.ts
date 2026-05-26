export type ArticleStatus = 'DRAFT' | 'REVIEWED' | 'PUBLISHED' | 'ARCHIVED';

export type SourceType = 'TEXT' | 'PDF' | 'DOCX' | 'IMAGE' | 'EMAIL' | 'CHAT' | 'OTHER';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'EDITOR' | 'REVIEWER' | 'ADMIN' | 'RPA_BOT';
}

export interface Tag {
    id: number;
    name: string;
    createdAt: string;
}

export interface ArticleTag {
    articleId: number;
    tagId: number;
    tag: Tag;
}

export interface Attachment {
    id: number;
    articleId: number;
    fileName: string;
    fileType: string;
    filePath: string;
    fileSize?: number;
    uploadedAt: string;
}

export interface ArticleVersion {
    id: number;
    articleId: number;
    versionNo: number;
    title: string;
    summary: string;
    content: string;
    status: ArticleStatus;
    changeNote?: string;
    createdAt: string;
}

export interface ArticleStatusHistory {
    id: number;
    articleId: number;
    fromStatus?: ArticleStatus;
    toStatus: ArticleStatus;
    note?: string;
    changedAt: string;
    changedBy: User;
}

export interface Article {
    id: number;
    title: string;
    summary: string;
    content: string;
    sourceText?: string;
    sourceType: SourceType;
    status: ArticleStatus;
    sourceHash?: string;
    isDuplicate: boolean;
    createdById: number;
    reviewedById?: number;
    publishedById?: number;
    createdAt: string;
    updatedAt: string;
    reviewedAt?: string;
    publishedAt?: string;
    createdBy?: User;
    reviewedBy?: User;
    publishedBy?: User;
    articleTags?: ArticleTag[];
    attachments?: Attachment[];
    versions?: ArticleVersion[];
    statusHistories?: ArticleStatusHistory[];
}

export interface CreateArticleDto {
    title: string;
    summary: string;
    content: string;
    sourceText?: string;
    sourceType?: SourceType;
    sourceHash?: string;
    createdById: number;
    tagNames?: string[];
}

export interface UpdateArticleStatusDto {
    status: ArticleStatus;
    changedById: number;
    note?: string;
}