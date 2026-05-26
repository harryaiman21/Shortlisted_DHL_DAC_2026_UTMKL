import Incident from '../models/Incident.js';
import OpenAI from 'openai'; // <-- Switched from ollama to openai

// Initialize OpenAI using your .env key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const chatWithAssistant = async (req, res) => {
    try {
        const { message, history } = req.body;

        // ---> ROLE BASED SECURITY & DATA SCOPING <---
        let query = { status: { $ne: 'Resolved' } };

        // If the user is an Employee (not an Admin), the bot should ONLY know about their department's tickets
        if (req.user && req.user.role !== 'Admin') {
            query.department = req.user.department;
        }

        // Fetch up to 20 recent active tickets based on the user's access level
        const activeIncidents = await Incident.find(query).sort({ createdAt: -1 }).limit(20);

        const dbContext = activeIncidents.map(inc =>
            `[ID: ${inc.incidentId} | Created: ${new Date(inc.createdAt).toLocaleString()} | Status: ${inc.status} | Priority: ${inc.priority} | Dept: ${inc.department} | Summary: ${inc.aiSummary}]`
        ).join('\n');

        // Extract user context from the secure JWT token
        const userName = req.user ? req.user.name : "a DHL Employee";
        const userRole = req.user ? req.user.role : "Agent";
        const userDept = req.user ? req.user.department : "General";

        // ==========================================
        // THE NEW "NATURAL DISPATCHER" SYSTEM PROMPT
        // ==========================================
        const systemPrompt = `
            You are ResoBot, an expert DHL dispatcher and Copilot. 
            You are currently assisting: ${userName} (Role: ${userRole}, Department: ${userDept}).
            
            Current System Time: ${new Date().toLocaleString()}
            
            PERSONALITY & RULES:
            1. Speak like a highly competent, natural human colleague. Be conversational but concise.
            2. NEVER use robotic filler phrases like "How can I assist you today?", "It seems like you asked...", or "As an AI...".
            3. If the user just says "hi", reply with a casual, quick greeting using their name.
            4. When asked about a specific incident, give the most critical info immediately: What it is, the priority, its status, and how long it has been sitting there.
            5. Do not offer to "keep an eye on it" (you don't have background tasks). Instead, suggest an action like "Should I flag this for review?" or just present the facts.
            6. Use formatting (bolding) to make IDs, Statuses, and Priorities easy to scan.
            7. VERY IMPORTANT: You only have access to the incidents listed below. Do not hallucinate tickets or information.

            LIVE DATABASE CONTEXT (Showing active tickets scoped to ${userDept}):
            ${dbContext || "No active incidents right now."}
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message }
        ];

        console.log(`🧠 Routing Copilot Chat to OpenAI (GPT-4o) for ${userName}...`);

        // Call the OpenAI API
        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-4o', // You can also use 'gpt-4o-mini' for faster/cheaper responses
            messages: messages,
            temperature: 0.4, // Slightly higher temperature makes it sound more natural
            top_p: 0.9
        });

        res.status(200).json({
            reply: aiResponse.choices[0].message.content
        });

    } catch (error) {
        console.error("❌ OpenAI Assistant Error:", error);
        res.status(500).json({ reply: "I'm offline right now. Please check my connection to the OpenAI servers." });
    }
};