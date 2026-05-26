import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SourceType, Tag } from '../../models/article.model';
import { ArticlesService } from '../../services/articles.service';
import { AttachmentsService } from '../../services/attachments.service';
import { AuthService } from '../../services/auth.service';
import { TagsService } from '../../services/tags.service';
import { API_BASE_URL } from '../../services/api';

type AiGeneratedDraft = {
  title: string;
  summary: string;
  content: string;
  sourceText: string;
  tagNames: string[];
};

type DraftField = 'title' | 'summary' | 'sourceText' | 'content';

@Component({
  selector: 'app-upload-console',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './upload-console.html',
  styleUrl: './upload-console.scss',
})
export class UploadConsole implements OnInit, OnDestroy {
  title = '';
  summary = '';
  sourceText = '';
  content = '';
  sourceType: SourceType = 'TEXT';
  selectedFile?: File;

  tags: Tag[] = [];
  selectedTagNames: string[] = [];

  loading = false;
  aiLoading = false;
  aiStatusMessage = '';
  typingField: DraftField | null = null;
  errorMessage = '';
  successMessage = '';
  createdArticleId?: number;

  private typewriterRunId = 0;
  private aiGenerateSub?: Subscription;

  get currentUser() {
    return this.authService.getUser();
  }

  constructor(
    private articlesService: ArticlesService,
    private attachmentsService: AttachmentsService,
    private tagsService: TagsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadTags();
  }

  ngOnDestroy() {
    this.aiGenerateSub?.unsubscribe();
    this.cancelTypewriter();
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedFile = file;
    this.errorMessage = '';
    this.successMessage = '';
    this.createdArticleId = undefined;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      this.sourceType = 'PDF';
    } else if (fileName.endsWith('.docx')) {
      this.sourceType = 'DOCX';
    } else if (fileName.endsWith('.txt')) {
      this.sourceType = 'TEXT';
    } else if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      this.sourceType = 'IMAGE';
    } else {
      this.sourceType = 'OTHER';
    }

    this.startAiGeneration(file);
  }

  private startAiGeneration(file: File) {
    this.aiGenerateSub?.unsubscribe();
    this.cancelTypewriter();

    this.aiLoading = true;
    this.aiStatusMessage = 'AI is reading the uploaded source...';
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('file', file);

    this.aiGenerateSub = this.http
      .post<AiGeneratedDraft>(`${API_BASE_URL}/ai/generate-file`, formData)
      .subscribe({
        next: (draft) => {
          this.applyAiDraft(draft);
        },
        error: () => {
          this.aiLoading = false;
          this.aiStatusMessage = '';
          this.typingField = null;
          this.errorMessage =
            'AI draft generation failed. You can still fill the fields manually and create a draft.';
          this.cdr.detectChanges();
        },
      });
  }

  private applyAiDraft(draft: AiGeneratedDraft) {
    this.title = '';
    this.summary = '';
    this.sourceText = '';
    this.content = '';
    this.selectedTagNames = [];
    this.cdr.detectChanges();

    void this.runTypewriter(draft);
  }

  private cancelTypewriter() {
    this.typewriterRunId += 1;
    this.typingField = null;
  }

  private async runTypewriter(draft: AiGeneratedDraft): Promise<void> {
    const runId = ++this.typewriterRunId;
    const isCancelled = () => runId !== this.typewriterRunId;

    const fields: Array<[DraftField, string]> = [
      ['title', draft.title ?? ''],
      ['summary', draft.summary ?? ''],
      ['sourceText', draft.sourceText ?? ''],
      ['content', draft.content ?? ''],
    ];

    for (const [field, fullText] of fields) {
      if (isCancelled()) return;
      await this.typewriteInto(field, fullText, isCancelled);
    }

    if (isCancelled()) return;

    this.selectedTagNames = (draft.tagNames ?? []).filter((name) =>
      this.tags.some((tag) => tag.name === name),
    );

    this.aiLoading = false;
    this.aiStatusMessage = '';
    this.typingField = null;
    this.successMessage = 'AI draft generated successfully. Review it before saving.';
    this.cdr.detectChanges();
  }

  private typewriteInto(
    field: DraftField,
    fullText: string,
    isCancelled: () => boolean,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!fullText.length) {
        resolve();
        return;
      }

      this.typingField = field;
      let index = 0;
      const step = this.getTypewriterStep(fullText.length);
      const delayMs = 14;

      const tick = () => {
        if (isCancelled()) {
          resolve();
          return;
        }

        const nextIndex = Math.min(index + step, fullText.length);
        this[field] = fullText.slice(0, nextIndex);
        index = nextIndex;
        this.cdr.detectChanges();

        if (index < fullText.length) {
          setTimeout(tick, delayMs);
        } else {
          this.typingField = null;
          this.cdr.detectChanges();
          resolve();
        }
      };

      tick();
    });
  }

  private getTypewriterStep(textLength: number): number {
    if (textLength > 2500) return 6;
    if (textLength > 1200) return 4;
    if (textLength > 500) return 3;
    if (textLength > 150) return 2;
    return 1;
  }

  toggleTag(tagName: string) {
    if (this.aiLoading) return;

    if (this.selectedTagNames.includes(tagName)) {
      this.selectedTagNames = this.selectedTagNames.filter((name) => name !== tagName);
    } else {
      this.selectedTagNames = [...this.selectedTagNames, tagName];
    }
  }

  isTagSelected(tagName: string) {
    return this.selectedTagNames.includes(tagName);
  }

  generateSimpleHash(text: string): string {
    let hash = 0;

    const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');

    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return `upload-${Math.abs(hash)}`;
  }

  submitUpload() {
    if (this.loading || this.aiLoading) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.createdArticleId = undefined;

    if (!this.title.trim() || !this.summary.trim() || !this.content.trim()) {
      this.errorMessage = 'Title, summary, and structured SOP content are required.';
      return;
    }

    this.loading = true;

    const duplicateBaseText = `${this.title} ${this.summary} ${this.content} ${this.sourceText} ${this.selectedFile?.name || ''}`;
    const sourceHash = this.generateSimpleHash(duplicateBaseText);

    const user = this.currentUser;

    if (!user) {
      this.errorMessage = 'You must be logged in to use the upload console.';
      return;
    }

    this.articlesService
      .createArticle({
        title: this.title,
        summary: this.summary,
        content: this.content,
        sourceText: this.sourceText,
        sourceType: this.sourceType,
        sourceHash,
        createdById: user.id,
        tagNames: this.selectedTagNames,
      })
      .subscribe({
        next: (article) => {
          this.createdArticleId = article.id;

          if (this.selectedFile) {
            this.attachmentsService.uploadAttachment(article.id, this.selectedFile).subscribe({
              next: () => {
                this.finishSuccess(article.id);
              },
              error: () => {
                this.loading = false;
                this.errorMessage =
                  'Draft was created, but the attachment upload failed. You can upload the file again from the article details page.';
                this.cdr.detectChanges();
              },
            });
          } else {
            this.finishSuccess(article.id);
          }
        },
        error: () => {
          this.loading = false;
          this.errorMessage =
            'Failed to create draft from uploaded input. The same source may already exist.';
          this.cdr.detectChanges();
        },
      });
  }

  finishSuccess(articleId: number) {
    this.loading = false;
    this.createdArticleId = articleId;
    this.successMessage = `Upload processed successfully. Draft article #${articleId} was created.`;

    this.title = '';
    this.summary = '';
    this.sourceText = '';
    this.content = '';
    this.sourceType = 'TEXT';
    this.selectedFile = undefined;
    this.selectedTagNames = [];

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    this.cdr.detectChanges();
  }
}
