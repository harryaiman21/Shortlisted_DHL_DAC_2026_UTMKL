import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Article, ArticleStatus, Tag } from '../../models/article.model';
import { ArticlesService } from '../../services/articles.service';
import { TagsService } from '../../services/tags.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-articles',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './articles.html',
  styleUrl: './articles.scss',
})
export class Articles implements OnInit {
  articles: Article[] = [];
  tags: Tag[] = [];

  search = '';
  selectedStatus: ArticleStatus | '' = '';
  selectedTag = '';

  loading = false;
  errorMessage = '';

  constructor(
    private articlesService: ArticlesService,
    private tagsService: TagsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) { }

  hasRole(roles: string[]): boolean {
    return this.authService.hasRole(roles);
  }

  ngOnInit() {
    this.loadTags();
    this.loadArticles();
  }

  loadTags() {
    this.tagsService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load tags.';
        this.cdr.detectChanges();
      },
    });
  }

  loadArticles() {
    this.loading = true;
    this.errorMessage = '';

    this.articlesService
      .getArticles({
        search: this.search,
        status: this.selectedStatus,
        tag: this.selectedTag,
      })
      .subscribe({
        next: (articles) => {
          this.articles = articles;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to load knowledge articles.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  resetFilters() {
    this.search = '';
    this.selectedStatus = '';
    this.selectedTag = '';
    this.loadArticles();
  }

  getTagsText(article: Article) {
    return article.articleTags?.map((item) => item.tag.name).join(', ') || 'No tags';
  }

  getStatusClass(status: ArticleStatus) {
    return status.toLowerCase();
  }
}