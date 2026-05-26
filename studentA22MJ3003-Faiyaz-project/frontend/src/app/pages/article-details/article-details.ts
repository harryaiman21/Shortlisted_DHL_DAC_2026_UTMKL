import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article, ArticleStatus, SourceType } from '../../models/article.model';
import { ArticlesService } from '../../services/articles.service';
import { AttachmentsService } from '../../services/attachments.service';
import { AuthService } from '../../services/auth.service';
import { TagsService } from '../../services/tags.service';

@Component({
  selector: 'app-article-details',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './article-details.html',
  styleUrl: './article-details.scss',
})
export class ArticleDetails implements OnInit {
  article?: Article;
  loading = false;
  errorMessage = '';
  statusMessage = '';

  tags: any[] = [];
  editMode = false;
  saving = false;
  editModel = {
    title: '',
    summary: '',
    content: '',
    sourceText: '',
    sourceType: 'TEXT' as SourceType,
    tagNames: [] as string[],
  };

  get currentUser() {
    return this.authService.getUser();
  }

  hasRole(roles: string[]) {
    return this.authService.hasRole(roles);
  }

  constructor(
    private route: ActivatedRoute,
    private articlesService: ArticlesService,
    private attachmentsService: AttachmentsService,
    private tagsService: TagsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.loadArticle();
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  loadArticle() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid article ID.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.articlesService.getArticle(id).subscribe({
      next: (article) => {
        this.article = article;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load article details.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
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

  canEditArticle() {
    return this.hasRole(['ADMIN', 'EDITOR']);
  }

  startEdit() {
    if (!this.article) return;

    this.editModel = {
      title: this.article.title,
      summary: this.article.summary,
      content: this.article.content,
      sourceText: this.article.sourceText || '',
      sourceType: this.article.sourceType,
      tagNames:
        this.article.articleTags?.map((item) => item.tag.name) || [],
    };

    this.editMode = true;
    this.errorMessage = '';
    this.statusMessage = '';

    if (this.tags.length === 0) {
      this.loadTags();
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.errorMessage = '';
  }

  saveArticleDetails() {
    if (!this.article || this.saving) return;

    this.errorMessage = '';
    this.statusMessage = '';

    if (
      !this.editModel.title.trim() ||
      !this.editModel.summary.trim() ||
      !this.editModel.content.trim()
    ) {
      this.errorMessage = 'Title, summary, and content are required.';
      this.scrollToTop();
      return;
    }

    this.saving = true;

    this.articlesService
      .updateArticle(this.article.id, {
        title: this.editModel.title.trim(),
        summary: this.editModel.summary.trim(),
        content: this.editModel.content.trim(),
        sourceText: this.editModel.sourceText,
        sourceType: this.editModel.sourceType,
        tagNames: this.editModel.tagNames,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.editMode = false;
          this.statusMessage = 'Article details updated successfully.';
          this.scrollToTop();
          this.loadArticle();
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage =
            error?.error?.message || 'Failed to update article details.';
          this.scrollToTop();
          this.cdr.detectChanges();
        },
      });
  }

  isEditTagSelected(tagName: string) {
    return this.editModel.tagNames.includes(tagName);
  }

  toggleEditTag(tagName: string) {
    if (this.isEditTagSelected(tagName)) {
      this.editModel.tagNames = this.editModel.tagNames.filter(
        (name) => name !== tagName,
      );
    } else {
      this.editModel.tagNames = [...this.editModel.tagNames, tagName];
    }
  }

  updateStatus(status: ArticleStatus) {
    if (!this.article || this.editMode) return;

    this.statusMessage = '';
    this.errorMessage = '';

    const user = this.currentUser;

    if (!user) {
      this.errorMessage = 'You must be logged in to update article status.';
      return;
    }

    this.articlesService
      .updateArticleStatus(this.article.id, {
        status,
        changedById: user.id,
        note: `Status changed to ${status} from article details page`,
      })
      .subscribe({
        next: () => {
          this.statusMessage = `Article status updated to ${status}.`;
          this.scrollToTop();
          this.loadArticle();
        },

        error: (error) => {
          this.errorMessage =
            error?.error?.message || 'Failed to update article status.';
          this.scrollToTop();
          this.cdr.detectChanges();
        },
      });
  }

  onFileSelected(event: Event) {
    if (!this.article) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.attachmentsService.uploadAttachment(this.article.id, file).subscribe({
      next: () => {
        this.statusMessage = 'Attachment uploaded successfully.';
        this.scrollToTop();
        this.loadArticle();
        input.value = '';
      },
      error: () => {
        this.errorMessage = 'Failed to upload attachment.';
        this.scrollToTop();
        this.cdr.detectChanges();
      },
    });
  }

  getTagsText() {
    return (
      this.article?.articleTags?.map((item) => item.tag.name).join(', ') ||
      'No tags'
    );
  }

  getStatusClass(status?: ArticleStatus) {
    return status ? status.toLowerCase() : '';
  }

  canReview() {
    return (
      this.article?.status === 'DRAFT' &&
      this.hasRole(['ADMIN', 'REVIEWER'])
    );
  }

  canPublish() {
    return (
      this.article?.status === 'REVIEWED' &&
      this.hasRole(['ADMIN', 'REVIEWER'])
    );
  }

  canArchive() {
    return (
      this.article?.status !== 'ARCHIVED' &&
      this.hasRole(['ADMIN'])
    );
  }

  canRestore() {
    return (
      this.article?.status === 'ARCHIVED' &&
      this.hasRole(['ADMIN'])
    );
  }

  canUploadAttachment() {
    return this.hasRole(['ADMIN', 'EDITOR']);
  }
}
