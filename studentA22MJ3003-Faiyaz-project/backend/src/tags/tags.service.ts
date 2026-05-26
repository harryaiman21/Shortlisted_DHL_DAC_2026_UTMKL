import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.tag.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    create(name: string) {
        return this.prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
}