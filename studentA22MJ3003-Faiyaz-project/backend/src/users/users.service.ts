import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }
    
    findAll() {
        return this.prisma.user.findMany();
    }

    create(data: { name: string, email: string }) { 
        return this.prisma.user.create({ 
            data: {
                name: data.name,
                email: data.email,
                passwordHash: 'temporary-password-hash',
            },
         });
    }
}
