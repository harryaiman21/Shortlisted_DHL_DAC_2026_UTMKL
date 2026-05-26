<?php

namespace App\Livewire;

use App\Models\Article;
use App\Models\ArticleDraft;
use Illuminate\Support\Str;
use Livewire\Component;

class DraftEditor extends Component
{
    public ArticleDraft $draft;

    public string $title = '';
    public string $summary = '';
    public array $sections = [];

    public function mount(ArticleDraft $draft)
    {
        $this->draft = $draft;
        $this->title = $draft->title ?? '';
        $this->summary = $draft->summary ?? '';

        $this->sections = $this->normalizeSections(
            data_get($draft->body_json, 'sections', [])
        );

        if (empty($this->sections)) {
            $this->sections = [
                ['heading' => 'Purpose', 'content' => ''],
                ['heading' => 'Procedure', 'content' => ''],
                ['heading' => 'Notes', 'content' => ''],
            ];
        }
    }

    public function addSection()
    {
        $this->sections[] = [
            'heading' => 'New Section',
            'content' => '',
        ];
    }

    public function removeSection(int $index)
    {
        unset($this->sections[$index]);
        $this->sections = array_values($this->sections);
    }

    public function save()
    {
        $this->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string|max:2000',
            'sections' => 'array',
        ]);

        $this->draft->update([
            'title' => $this->title,
            'summary' => $this->summary,
            'body_json' => [
                'sections' => $this->sections,
            ],
            'status' => 'reviewed',
            'reviewed_by' => auth()->id(),
        ]);

        session()->flash('success', 'Draft saved successfully.');
    }

    public function publish()
    {
        $this->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string|max:2000',
            'sections' => 'array',
        ]);

        $this->draft->update([
            'title' => $this->title,
            'summary' => $this->summary,
            'body_json' => [
                'sections' => $this->sections,
            ],
            'status' => 'reviewed',
            'reviewed_by' => auth()->id(),
        ]);

        $contentHtml = $this->sectionsToHtml($this->sections);
        $slug = Str::slug($this->title) . '-' . $this->draft->id;

        $article = Article::create([
            'article_draft_id' => $this->draft->id,
            'title' => $this->title,
            'slug' => $slug,
            'content_html' => $contentHtml,
            'tags_json' => [],
            'published_by' => auth()->id(),
            'published_at' => now(),
        ]);

        $this->draft->update([
            'status' => 'published',
        ]);

        session()->flash('success', 'Article published successfully.');

        return redirect()->route('articles.show', $article);
    }

protected function normalizeSections(array $sections): array
{
    $normalized = [];

    foreach ($sections as $section) {
        $heading = $section['heading'] ?? 'Section';
        $content = $section['content'] ?? '';

        // If the content is an array (list of steps), join them with newlines
        if (is_array($content)) {
            $content = implode("\n", $content);
        }

        $normalized[] = [
            'heading' => $heading,
            'content' => (string) $content, // Ensure it's a string for the textarea
        ];
    }

    return $normalized;
}

    protected function sectionsToHtml(array $sections): string
    {
        $html = '';

        foreach ($sections as $section) {
            $heading = e($section['heading'] ?? 'Section');
            $content = $section['content'] ?? '';

            $html .= "<h2>{$heading}</h2>";

            if (is_array($content)) {
                $html .= '<ol>';
                foreach ($content as $item) {
                    $html .= '<li>' . e($item) . '</li>';
                }
                $html .= '</ol>';
            } else {
                $html .= '<p>' . nl2br(e($content)) . '</p>';
            }
        }

        return $html;
    }

    public function render()
    {
        return view('livewire.draft-editor');
    }
}