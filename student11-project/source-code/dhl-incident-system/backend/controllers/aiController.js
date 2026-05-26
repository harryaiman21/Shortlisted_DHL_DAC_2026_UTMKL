import fs from 'fs';
import { createRequire } from 'module';
import OpenAI from 'openai';
import Department from '../models/Department.js'; // <-- Dynamic Departments

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// @desc    Process unstructured data (files/images) using GPT-4o
// @route   POST /api/incidents/ai-process
// @access  Private (Requires Token)
export const processUnstructuredData = async (req, res) => {
    try {
        // ---> SECURITY & AUDIT TRAIL <---
        const requestedBy = req.user ? req.user.name : 'System/RPA Bot';
        console.log(`\n🤖 AI Processing Triggered by: ${requestedBy}`);

        // 1. DYNAMIC INPUT PARSING
        let extractedText = req.body.rawText || '';
        let base64Images = [];

        const filesToProcess = req.files ? req.files : (req.file ? [req.file] : []);

        for (const file of filesToProcess) {
            const fileType = file.mimetype;
            const filePath = file.path;

            if (fileType.startsWith('image/')) {
                const imageBuffer = fs.readFileSync(filePath);
                const base64Data = imageBuffer.toString('base64');
                base64Images.push(`data:${fileType};base64,${base64Data}`);
            }
            else if (fileType === 'application/pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(dataBuffer);
                extractedText += `\n${pdfData.text}`;
            }
            else if (fileType === 'text/plain') {
                extractedText += `\n${fs.readFileSync(filePath, 'utf8')}`;
            }
            else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const docxResult = await mammoth.extractRawText({ path: filePath });
                extractedText += `\n${docxResult.value}`;
            }

            fs.unlinkSync(filePath); // Clean up temp file to prevent server bloat
        }

        if (!extractedText && base64Images.length === 0) {
            return res.status(400).json({ message: 'No text or images provided for analysis.' });
        }

        // ---> FETCH REAL DEPARTMENTS FROM MONGODB <---
        // Grab all departments to tell the AI what the valid options are
        const activeDepartments = await Department.find({}, 'name');

        // Convert them into a comma-separated list (e.g., "IT Support, Warehouse Operations")
        const dynamicDepartmentNames = activeDepartments.map(d => d.name).join(', ');

        // Fallback just in case the database is completely empty
        const validDepartments = dynamicDepartmentNames || "Warehouse Operations, Customer Service, IT & Automation, Hub Operations";

        // 2. CONSTRUCT SYSTEM PROMPT (Dynamic Routing)
        const systemPrompt = `
      You are an AI Incident Router for DHL Customer Support. 
      Analyze the provided incident report (which may be text, images of damage, or both).
      
      Extract the details and return ONLY a valid JSON object matching this exact structure:
      {
        "title": "A concise 5-7 word title",
        "category": "Must be exactly one of: Late Delivery, Damaged Parcel, Address Issue, System Error, Customer Complaint",
        "priority": "Must be exactly one of: Low, Medium, High, Critical",
        "department": "Must be exactly one of the following active departments: ${validDepartments}. If unsure, pick the closest match.",
        "aiSummary": "A clear, professional 2-3 sentence executive summary of the issue.",
        "tags": ["Array", "of", "3", "keywords"],
        "confidenceScore": Number between 0 and 100
      }
    `;

        let userContentArray = [];

        if (base64Images.length > 0) {
            console.log(`👁️ Routing to OpenAI (GPT-4o) analyzing ${base64Images.length} image(s)...`);
            userContentArray.push({
                type: "text",
                text: `Customer Description: ${extractedText}\nAnalyze the provided images and description to extract incident details.`
            });
            base64Images.forEach(imageUrl => userContentArray.push({ type: "image_url", image_url: { url: imageUrl } }));
        } else {
            console.log("🧠 Routing to OpenAI (GPT-4o) for Text Analysis...");
            userContentArray.push({ type: "text", text: `Raw Incident Input:\n"""\n${extractedText}\n"""` });
        }

        // 3. CALL OPENAI
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContentArray }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
        });

        const structuredData = JSON.parse(aiResponse.choices[0].message.content);

        // Auto-flag low confidence extractions for human review
        const suggestedStatus = structuredData.confidenceScore >= 85 ? 'Reviewed' : 'Draft';

        console.log(`✅ AI Extraction Complete. Confidence: ${structuredData.confidenceScore}% | Routed to: ${structuredData.department}`);

        // 4. RETURN DATA TO REACT
        res.status(200).json({
            success: true,
            extractedData: {
                ...structuredData,
                status: suggestedStatus
            },
            rawText: extractedText
        });

    } catch (error) {
        console.error("❌ OpenAI Processing Error:", error);
        res.status(500).json({ message: "Failed to process file with AI.", error: error.message });
    }
};