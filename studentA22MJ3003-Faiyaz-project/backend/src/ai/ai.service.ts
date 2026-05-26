import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';

type GeneratedArticle = {
    title: string;
    summary: string;
    content: string;
    sourceText: string;
    tagNames: string[];
};

@Injectable()
export class AiService {
    private readonly ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    private readonly model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

    async generateFromText(sourceText: string, sourceType = 'TEXT'): Promise<GeneratedArticle> {
        this.validateSourceText(sourceText);

        const prompt = this.buildPrompt(sourceText, sourceType);

        try {
            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                },
            });

            return this.parseGeminiJson(response.text || '', sourceText);
        } catch (error) {
            console.warn('Gemini generateFromText failed, using fallback:', error);
            return this.fallbackArticleFromFileName(
                sourceType,
                `${sourceType.toLowerCase()}-source`,
                sourceText,
            );
        }
    }

    async generateFromFile(file: Express.Multer.File): Promise<GeneratedArticle> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const ext = path.extname(file.originalname).toLowerCase();
        const mimeType =
            !file.mimetype || file.mimetype === 'application/octet-stream'
                ? this.guessMimeType(ext)
                : file.mimetype;

        if (ext === '.txt') {
            const sourceText = fs.readFileSync(file.path, 'utf8');
            return this.generateFromText(sourceText, 'TEXT');
        }

        if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: file.path });
            return this.generateFromText(result.value, 'DOCX');
        }

        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            const prompt = this.buildImagePrompt();

            try {
                const response = await this.ai.models.generateContent({
                    model: this.model,
                    contents: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType,
                                data: fs.readFileSync(file.path).toString('base64'),
                            },
                        },
                    ],
                    config: {
                        responseMimeType: 'application/json',
                    },
                });

                return this.parseGeminiJson(response.text || '', '');
            } catch (error) {
                console.warn('Gemini image generation failed, using fallback:', error);
                return this.fallbackArticleFromFileName('IMAGE', file.originalname);
            }
        }

        if (ext === '.pdf') {
            const prompt = this.buildFilePrompt('PDF');

            try {
                const response = await this.ai.models.generateContent({
                    model: this.model,
                    contents: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: 'application/pdf',
                                data: fs.readFileSync(file.path).toString('base64'),
                            },
                        },
                    ],
                    config: {
                        responseMimeType: 'application/json',
                    },
                });

                return this.parseGeminiJson(response.text || '', '');
            } catch (error) {
                console.warn('Gemini PDF generation failed, using fallback:', error);
                return this.fallbackArticleFromFileName('PDF', file.originalname);
            }
        }

        throw new BadRequestException('Unsupported file type for AI generation');
    }

    private validateSourceText(sourceText: string): void {
        if (!sourceText || !sourceText.trim()) {
            throw new BadRequestException('Source text is empty.');
        }

        const trimmed = sourceText.trim();

        if (trimmed.length < 30) {
            throw new BadRequestException(
                'Source text is too short to generate a useful SOP.',
            );
        }

        if (!/[a-zA-Z]/.test(trimmed)) {
            throw new BadRequestException('Source text does not contain readable text.');
        }
    }

    private buildPrompt(sourceText: string, sourceType: string) {
        return `
You are an AI assistant for DHL logistics operations.

Convert the following messy ${sourceType} source content into a clean knowledge-base SOP article.

Return ONLY valid JSON. Do not use markdown. Do not wrap it in triple backticks.

Required JSON shape:
{
  "title": "clear article title",
  "summary": "short 1-2 sentence summary",
  "content": "structured SOP content with numbered steps",
  "sourceText": "cleaned raw source text",
  "tagNames": ["tag1", "tag2", "tag3"]
}

Rules:
- The title must be specific to the logistics issue.
- The summary must be short and useful.
- The content must be clear SOP-style numbered steps.
- Tags must be relevant DHL/logistics/customer-support tags.
- If the source is messy, infer the clean workflow.
- Do not invent unrelated company policies.

Source content:
${sourceText}
`;
    }

    private buildImagePrompt() {
        return `
You are an AI assistant for DHL logistics operations.

Read the text/content visible in this image and convert it into a clean knowledge-base SOP article.

Return ONLY valid JSON. Do not use markdown. Do not wrap it in triple backticks.

Required JSON shape:
{
  "title": "clear article title",
  "summary": "short 1-2 sentence summary",
  "content": "structured SOP content with numbered steps",
  "sourceText": "text extracted or inferred from the image",
  "tagNames": ["tag1", "tag2", "tag3"]
}

Rules:
- Extract useful text from the image.
- If the image is a screenshot of messy notes, clean it into SOP steps.
- Tags must be relevant DHL/logistics/customer-support tags.
`;
    }

    private buildFilePrompt(sourceType: string) {
        return `
You are an AI assistant for DHL logistics operations.

Read this ${sourceType} file and convert it into a clean knowledge-base SOP article.

Return ONLY valid JSON. Do not use markdown. Do not wrap it in triple backticks.

Required JSON shape:
{
  "title": "clear article title",
  "summary": "short 1-2 sentence summary",
  "content": "structured SOP content with numbered steps",
  "sourceText": "main raw source text extracted from the file",
  "tagNames": ["tag1", "tag2", "tag3"]
}
`;
    }

    private fallbackArticleFromFileName(
        sourceType: string,
        fileName?: string,
        sourceText?: string,
    ): GeneratedArticle {
        const name = (fileName || '').toLowerCase();
        const rawSource =
            sourceText?.trim() ||
            `Imported ${sourceType} source${fileName ? `: ${fileName}` : ''}`;

        if (name.includes('damaged') || name.includes('parcel')) {
            return {
                title: 'Damaged Parcel Handling SOP',
                summary:
                    'Steps for support agents when a customer reports a parcel arrived damaged.',
                content: [
                    '1. Confirm the tracking number and delivery date with the customer.',
                    '2. Check shipment photos and warehouse scan notes in the system.',
                    '3. Ask the customer for photos of the outer box and damaged contents.',
                    '4. Log the damage type and affected items in the case record.',
                    '5. Start a damage claim or escalate to the claims team if required.',
                    '6. Tell the customer the next update time and close the case when resolved.',
                ].join('\n'),
                sourceText: rawSource,
                tagNames: ['DHL', 'Damaged Parcel', 'Claims', 'SOP'],
            };
        }

        if (name.includes('scanner') || name.includes('warehouse')) {
            return {
                title: 'Warehouse Scanner Error Handling SOP',
                summary:
                    'Steps for fixing warehouse scan issues that block shipment tracking updates.',
                content: [
                    '1. Open the shipment and note the last successful scan location.',
                    '2. Check whether the parcel is in the warehouse, on a cage, or already dispatched.',
                    '3. Re-scan the parcel label and confirm the scan posts to tracking.',
                    '4. If the scan fails, verify the label is readable and not duplicated.',
                    '5. Escalate to warehouse supervision if the item cannot be scanned.',
                    '6. Update the customer only after tracking shows the correct status.',
                ].join('\n'),
                sourceText: rawSource,
                tagNames: ['DHL', 'Warehouse', 'Scanner', 'SOP'],
            };
        }

        if (name.includes('customs') || name.includes('clearance')) {
            return {
                title: 'Customs Clearance Delay Handling SOP',
                summary:
                    'Steps for shipments held or delayed during customs clearance.',
                content: [
                    '1. Confirm the shipment status shows a customs hold or delay.',
                    '2. Review notes and customs messages for the missing document or reason.',
                    '3. Contact the customer if an invoice, ID, or declaration is required.',
                    '4. Record what was requested and when documents were received.',
                    '5. Escalate to the customs broker team if the hold is internal.',
                    '6. Update the customer with the expected clearance timeline.',
                ].join('\n'),
                sourceText: rawSource,
                tagNames: ['DHL', 'Customs', 'Clearance', 'SOP'],
            };
        }

        if (name.includes('address')) {
            return {
                title: 'Delivery Address Change Handling SOP',
                summary:
                    'Steps for changing a delivery address before the parcel is delivered.',
                content: [
                    '1. Verify the tracking number and current shipment status.',
                    '2. Confirm the parcel is not already out for delivery or delivered.',
                    '3. Collect the full new address and contact phone from the customer.',
                    '4. Submit the address change request in the shipment system.',
                    '5. Confirm whether a reroute fee applies and inform the customer.',
                    '6. Save the case notes and confirm the updated delivery plan.',
                ].join('\n'),
                sourceText: rawSource,
                tagNames: ['DHL', 'Address Change', 'Delivery', 'SOP'],
            };
        }

        return {
            title: 'Imported DHL SOP Article',
            summary: `Standard operating steps generated from imported ${sourceType} content.`,
            content: [
                '1. Open the shipment or case linked to the customer issue.',
                '2. Review the imported source notes and confirm the main problem.',
                '3. Check tracking, warehouse, delivery, and exception status.',
                '4. Take the action required for this issue type.',
                '5. Record what was done and who was contacted.',
                '6. Update the customer and close the case when complete.',
            ].join('\n'),
            sourceText: rawSource,
            tagNames: ['DHL', 'RPA', 'SOP', 'Import'],
        };
    }

    private parseGeminiJson(text: string, fallbackSourceText: string): GeneratedArticle {
        const cleaned = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        let parsed: Partial<GeneratedArticle>;

        try {
            parsed = JSON.parse(cleaned);
        } catch {
            throw new BadRequestException('Gemini did not return valid JSON');
        }

        return {
            title: parsed.title || 'Imported DHL SOP Article',
            summary: parsed.summary || 'AI-generated DHL SOP summary.',
            content: parsed.content || fallbackSourceText,
            sourceText: parsed.sourceText || fallbackSourceText,
            tagNames: Array.isArray(parsed.tagNames) ? parsed.tagNames : ['DHL', 'RPA', 'SOP'],
        };
    }

    private guessMimeType(ext: string) {
        switch (ext) {
            case '.txt':
                return 'text/plain';
            case '.docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case '.png':
                return 'image/png';
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.pdf':
                return 'application/pdf';
            default:
                return 'application/octet-stream';
        }
    }
}