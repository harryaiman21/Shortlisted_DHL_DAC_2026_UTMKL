import { SourceType } from '@prisma/client';

export class CreateArticleDto {
  title: string;
  summary: string;
  content: string;
  sourceText?: string;
  sourceType?: SourceType;
  sourceHash?: string;
  createdById: number;
  tagNames?: string[];
}