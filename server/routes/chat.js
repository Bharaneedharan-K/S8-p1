import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are an AI Assistant for the 'Blockchain-Based Land Registry & Farmer Scheme Portal'. 
            Your role is to help Farmers, Officers, and Admins navigation the platform.
            
            Key Information:
            1. **Platform Purpose**: Secure land verification using Blockchain and easy access to Government Schemes.
            2. **For Farmers**:
               - **Add Land**: Go to 'My Lands' > 'Add New Land'. Upload Adangal/Pahani. Select an Officer.
               - **Apply Schemes**: Go to 'Schemes'. Click 'Apply' (e.g., Rythu Bandhu, PM-KISAN).
               - **Transfer Land**: Go to 'My Lands' > Select Land > 'Transfer Ownership'. Enter Buyer ID.
            3. **For Officers**: Verify land documents and schedule field visits.
            4. **For Admins**: Manage users, approve final land records, and handle scheme creation.
            
            Tone: Professional, helpful, and concise.
            Language: Respond in the language the user asks in (English, Hindi, Telugu, etc.).`
        });

        // Gemini requires history to start with a 'user' role
        let validHistory = history || [];
        // Remove leading model messages if any
        while (validHistory.length > 0 && validHistory[0].role !== 'user') {
            validHistory.shift();
        }

        const chat = model.startChat({
            history: validHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

export default router;
