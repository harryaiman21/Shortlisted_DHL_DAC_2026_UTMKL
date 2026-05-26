import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UpdateArticleStatusDto } from './dto/update-article-status.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) { }
  
  async checkDuplicate(sourceHash: string) {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const existingArticle = await this.prisma.article.findFirst({
      where: {
        sourceHash,
        createdAt: {
          gte: fourteenDaysAgo,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        sourceHash: true,
        createdAt: true,
      },
    });

    return {
      isDuplicate: !!existingArticle,
      article: existingArticle,
    };
  }

  async findAll(query: {
    search?: string;
    status?: ArticleStatus;
    tag?: string;
    creatorId?: string;
  }) {
    const { search, status, tag, creatorId } = query;

    return this.prisma.article.findMany({
      where: {
        status: status || undefined,
        createdById: creatorId ? Number(creatorId) : undefined,
        OR: search
          ? [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ]
          : undefined,
        articleTags: tag
          ? {
            some: {
              tag: {
                name: {
                  equals: tag,
                  mode: 'insensitive',
                },
              },
            },
          }
          : undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        publishedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        articleTags: {
          include: {
            tag: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        publishedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        articleTags: {
          include: {
            tag: true,
          },
        },
        attachments: true,
        versions: {
          orderBy: {
            versionNo: 'desc',
          },
        },
        statusHistories: {
          orderBy: {
            changedAt: 'desc',
          },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async create(dto: CreateArticleDto) {
    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        sourceText: dto.sourceText,
        sourceType: dto.sourceType || 'TEXT',
        sourceHash: dto.sourceHash,
        createdById: dto.createdById,
        articleTags: {
          create:
            dto.tagNames?.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })) || [],
        },
      },
      include: {
        articleTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    await this.prisma.articleVersion.create({
      data: {
        articleId: article.id,
        versionNo: 1,
        title: article.title,
        summary: article.summary,
        content: article.content,
        status: article.status,
        changedById: dto.createdById,
        changeNote: 'Initial draft created',
      },
    });

    await this.prisma.articleStatusHistory.create({
      data: {
        articleId: article.id,
        fromStatus: null,
        toStatus: article.status,
        changedById: dto.createdById,
        note: 'Article created as draft',
      },
    });

    return article;
  }

  async update(id: number, dto: UpdateArticleDto) {
    await this.findOne(id);

    if (dto.tagNames) {
      await this.prisma.articleTag.deleteMany({
        where: {
          articleId: id,
        },
      });
    }

    const latestVersion = await this.prisma.articleVersion.findFirst({
      where: {
        articleId: id,
      },
      orderBy: {
        versionNo: 'desc',
      },
    });

    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        sourceText: dto.sourceText,
        sourceType: dto.sourceType,
        status: dto.status,
        reviewedById: dto.reviewedById,
        publishedById: dto.publishedById,
        reviewedAt: dto.status === 'REVIEWED' ? new Date() : undefined,
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : undefined,
        articleTags: dto.tagNames
          ? {
            create: dto.tagNames.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          }
          : undefined,
      },
      include: {
        articleTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    await this.prisma.articleVersion.create({
      data: {
        articleId: id,
        versionNo: latestVersion ? latestVersion.versionNo + 1 : 1,
        title: updatedArticle.title,
        summary: updatedArticle.summary,
        content: updatedArticle.content,
        status: updatedArticle.status,
        changedById:
          dto.reviewedById || dto.publishedById || updatedArticle.createdById,
        changeNote: 'Article updated',
      },
    });

    return updatedArticle;
  }

  async updateStatus(id: number, dto: UpdateArticleStatusDto) {
    const article = await this.findOne(id);

    const allowedTransitions: Record<ArticleStatus, ArticleStatus[]> = {
      DRAFT: ['REVIEWED', 'ARCHIVED'],
      REVIEWED: ['PUBLISHED', 'DRAFT', 'ARCHIVED'],
      PUBLISHED: ['ARCHIVED'],
      ARCHIVED: ['DRAFT'],
    };

    const currentStatus = article.status as ArticleStatus;
    const nextStatus = dto.status;

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${nextStatus}`,
      );
    }

    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedById: dto.status === 'REVIEWED' ? dto.changedById : undefined,
        publishedById: dto.status === 'PUBLISHED' ? dto.changedById : undefined,
        reviewedAt: dto.status === 'REVIEWED' ? new Date() : undefined,
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : undefined,
      },
    });

    await this.prisma.articleStatusHistory.create({
      data: {
        articleId: id,
        fromStatus: article.status,
        toStatus: dto.status,
        changedById: dto.changedById,
        note: dto.note,
      },
    });

    const latestVersion = await this.prisma.articleVersion.findFirst({
      where: {
        articleId: id,
      },
      orderBy: {
        versionNo: 'desc',
      },
    });

    await this.prisma.articleVersion.create({
      data: {
        articleId: id,
        versionNo: latestVersion ? latestVersion.versionNo + 1 : 1,
        title: article.title,
        summary: article.summary,
        content: article.content,
        status: dto.status,
        changedById: dto.changedById,
        changeNote: dto.note || `Status changed to ${dto.status}`,
      },
    });

    return updatedArticle;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.article.delete({
      where: { id },
    });
  }
}