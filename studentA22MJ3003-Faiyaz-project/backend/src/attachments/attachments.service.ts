import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
    constructor(private prisma: PrismaService) { }

    async create(articleId: number, file: Express.Multer.File) {
        const article = await this.prisma.article.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        return this.prisma.attachment.create({
            data: {
                articleId,
                fileName: file.originalname,
                fileType: file.mimetype,
                filePath: file.path,
                fileSize: file.size,
            },
        });
    }

    findByArticle(articleId: number) {
        return this.prisma.attachment.findMany({
            where: {
                articleId,
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });
    }

    async remove(id: number) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id },
        });

        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }

        return this.prisma.attachment.delete({
            where: { id },
        });
    }
}