import { ArticleStatus } from '@prisma/client';

export class UpdateArticleStatusDto {
  status: ArticleStatus;
  changedById: number;
  note?: string;
}