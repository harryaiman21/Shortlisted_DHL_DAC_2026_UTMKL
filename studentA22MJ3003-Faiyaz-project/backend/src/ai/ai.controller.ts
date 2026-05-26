import {
    Body,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { UserRole } from '@prisma/client';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

const aiUploadDir = './uploads/ai-inputs';

if (!existsSync(aiUploadDir)) {
    mkdirSync(aiUploadDir, { recursive: true });
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate')
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.RPA_BOT)
    generateFromText(@Body() body: { sourceText: string; sourceType?: string }) {
        if (!body.sourceText) {
            throw new BadRequestException('sourceText is required');
        }

        return this.aiService.generateFromText(body.sourceText, body.sourceType || 'TEXT');
    }

    @Post('generate-file')
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.RPA_BOT)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: aiUploadDir,
                filename: (req, file, callback) => {
                    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    callback(null, uniqueName + extname(file.originalname));
                },
            }),
            fileFilter: (req, file, callback) => {
                const allowedExtensions = ['.txt', '.docx', '.png', '.jpg', '.jpeg', '.pdf'];
                const fileExtension = extname(file.originalname).toLowerCase();

                if (!allowedExtensions.includes(fileExtension)) {
                    return callback(
                        new BadRequestException('Only TXT, DOCX, PNG, JPG, JPEG, and PDF files are allowed'),
                        false,
                    );
                }

                callback(null, true);
            },
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
        }),
    )
    generateFromFile(@UploadedFile() file: Express.Multer.File) {
        return this.aiService.generateFromFile(file);
    }
}