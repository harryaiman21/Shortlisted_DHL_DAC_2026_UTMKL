import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleStatus } from '@prisma/client';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UpdateArticleStatusDto } from './dto/update-article-status.dto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CheckDuplicateDto } from './dto/check-duplicate.dto';

@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.REVIEWER)
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: ArticleStatus,
    @Query('tag') tag?: string,
    @Query('creatorId') creatorId?: string,
  ) {
    return this.articlesService.findAll({
      search,
      status,
      tag,
      creatorId,
    });
  }

  @Post('check-duplicate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.RPA_BOT)
  checkDuplicate(@Body() body: CheckDuplicateDto) {
    return this.articlesService.checkDuplicate(body.sourceHash);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.REVIEWER)
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(Number(id));
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.RPA_BOT)
  create(@Body() body: CreateArticleDto) {
    return this.articlesService.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  update(@Param('id') id: string, @Body() body: UpdateArticleDto) {
    return this.articlesService.update(Number(id), body);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.REVIEWER)
  updateStatus(@Param('id') id: string, @Body() body: UpdateArticleStatusDto) {
    return this.articlesService.updateStatus(Number(id), body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.articlesService.remove(Number(id));
  }
}