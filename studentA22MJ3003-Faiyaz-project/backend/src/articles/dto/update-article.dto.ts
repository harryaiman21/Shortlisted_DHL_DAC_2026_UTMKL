import { ArticleStatus, SourceType } from '@prisma/client';

export class UpdateArticleDto {
  title?: string;
  summary?: string;
  content?: string;
  sourceText?: string;
  sourceType?: SourceType;
  status?: ArticleStatus;
  reviewedById?: number;
  publishedById?: number;
  tagNames?: string[];
}