const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI with correct configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
    apiVersion: 'v1'
});

router.post('/analyze-food', async (req, res) => {
    try {
        const { foodItem, weight, userData } = req.body;

        // Validate input
        if (!foodItem || !weight) {
            return res.status(400).json({ error: 'Food item and weight are required' });
        }

        const prompt = `Analyze this food item and provide a detailed nutritional breakdown:
        Food: ${foodItem}
        Exact Portion: ${weight} grams
        User Age: ${userData?.age || 'Not specified'}
        User Weight: ${userData?.weight || 'Not specified'}
        Health Conditions: ${userData?.healthProblems || 'None specified'}

        Please provide a VERY SPECIFIC analysis with EXACT numbers in this format:
        1. Calories: Start with "Total calories:" followed by the exact calorie count
        2. Nutrients: ALWAYS include this section, and ALWAYS provide values for ALL of the following (even if you have to estimate): protein, fat, carbohydrates, fiber, sugar, sodium, cholesterol. Format as a bullet list, e.g.:
           - Protein: 25g
           - Fat: 8g
           - Carbohydrates: 2g
           - Fiber: 0g
           - Sugar: 1g
           - Sodium: 70mg
           - Cholesterol: 85mg
           Estimate the value based on typical recipes or food composition. Do not default to 0g unless it is truly negligible.
        3. Health Analysis: In 3–4 short bullet points or paragraphs, provide a concise, personalized analysis of how this food affects the user, specifically referencing their age, weight, and health conditions (e.g., diabetes, high blood pressure, etc.). Only discuss health risks and benefits for this user. Do NOT include alternatives or disclaimers in this section.
        4. Alternatives: Only list alternative food suggestions

        Keep each section focused on its specific topic without mixing information. If you do not know a value, say 'Not available', but do NOT skip any nutrient.`;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            }
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Basic parsing logic: split by section headers
        const sections = {
            calories: '',
            nutrients: '',
            healthAnalysis: '',
            alternatives: ''
        };
        let currentSection = null;
        text.split('\n').forEach(line => {
            const lower = line.toLowerCase();
            if (lower.includes('calories:')) {
                currentSection = 'calories';
                sections.calories += line.trim() + '\n';
            } else if (lower.includes('nutrients:')) {
                currentSection = 'nutrients';
            } else if (lower.includes('health analysis:') || lower.includes('health considerations:')) {
                currentSection = 'healthAnalysis';
            } else if (lower.includes('alternatives:') || lower.includes('alternative options:')) {
                currentSection = 'alternatives';
            } else if (currentSection) {
                sections[currentSection] += line.trim() + '\n';
            }
        });
        // Clean up
        Object.keys(sections).forEach(key => {
            sections[key] = sections[key].trim();
        });

        res.json(sections);
    } catch (error) {
        console.error('Food analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze food. Please try again.' });
    }
});

module.exports = router;

