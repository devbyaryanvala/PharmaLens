/**
 * AI Routes - Provides AI-powered drug analysis using Ollama
 */

const express = require('express');
const { generateResponse, isOllamaAvailable, getModels, MODEL_NAME } = require('../services/ollamaService');

const router = express.Router();

// System prompt for drug analysis
// System prompt for drug analysis
const SYSTEM_PROMPT = `You are PharmaLens AI, a pharmaceutical analysis assistant. 
Your role is to analyze drug data deeply and provide helpful, accurate insights to help users choose the best option.

Guidelines:
- Act as a smart shopping assistant for medicines.
- Provide clear, concise analysis of the drug data provided.
- Highlight key information: uses, side effects, pricing, ratings, reviews, and detailed specs.
- Compare options when multiple drugs are shown (Price vs Quality vs Trust).
- If multiple generic versions exist, list them clearly and explain differences if any (or state they are identical).
- If the user asks a specific question, answer it directly using the provided drug data context.
- Always remind users to consult healthcare professionals.
- Format your response with clear sections using markdown.

Keep responses focused and under 600 words unless detail is requested.`;

/**
 * Format drug data for the AI prompt
 */
function formatDrugDataForAI(drugs) {
    // Top 50 drugs for deep context
    return drugs.slice(0, 50).map(drug => ({
        id: drug.id,
        name: drug.product_name,
        salt: drug.salt_composition,
        manufacturer: drug.manufacturer,
        price: drug.price,
        rating: drug.layer1_reviews?.avg_rating || 'N/A',
        review_count: drug.layer1_reviews?.total_reviews || 0,
        introduction: drug.introduction,
        uses: drug.uses || drug.description,
        side_effects: drug.side_effects,
        specifications: drug.specifications, // Full specs
        reviews: drug.layer1_reviews // Full review data
    }));
}

/**
 * POST /api/ai/analyze
 * Analyze drug data using AI
 */
router.post('/analyze', async (req, res) => {
    try {
        // Check if Ollama is running
        const ollamaAvailable = await isOllamaAvailable();
        if (!ollamaAvailable) {
            return res.status(503).json({
                error: 'Ollama service unavailable',
                message: 'Please ensure Ollama is running. Start with: ollama serve'
            });
        }

        const { drugs, query, question } = req.body;

        if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
            return res.status(400).json({
                error: 'Missing data',
                message: "Please provide 'drugs' array in the request body."
            });
        }

        // Format data for AI
        const formattedData = formatDrugDataForAI(drugs);

        // Build the user prompt
        const userPrompt = `
### DRUG DATA (JSON) ###
${JSON.stringify(formattedData, null, 2)}

### Analysis Request ###
${query ? `Search query: "${query}"` : 'General drug analysis'}
${question ? `\nUser Question: "${question}"` : ''}

${question ? `Please answer the user's question specifically using the provided drug data.` : `
Please analyze these drugs and provide a comprehensive guide:
1. **Overview**: Brief summary of the specific drugs listed.
2. **Options Available**: List distinct options found (generics, brands).
3. **Price Comparison**: Compare prices (Lowest vs Highest).
4. **Key Info**: Uses, Side Effects, and Warnings.
5. **Detailed Recommendation**: Help the user choose the best option based on:
   - Best Value (Low Price)
   - Highest Rated (Quality/Trust)
   - Verified Specs (if any)
`}
`;

        // Generate AI response
        const aiResponse = await generateResponse(SYSTEM_PROMPT, userPrompt);

        res.json({
            success: true,
            query,
            drugs_analyzed: formattedData.length,
            model: MODEL_NAME,
            analysis: aiResponse
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({
            error: 'AI Analysis Failed',
            message: error.message
        });
    }
});

/**
 * GET /api/ai/status
 * Check Ollama status and available models
 */
router.get('/status', async (req, res) => {
    try {
        const available = await isOllamaAvailable();
        const models = available ? await getModels() : [];

        res.json({
            ollama_available: available,
            configured_model: MODEL_NAME,
            available_models: models.map(m => m.name),
            message: available ? 'Ollama is running and ready' : 'Ollama is not running. Start with: ollama serve'
        });
    } catch (error) {
        res.status(500).json({
            ollama_available: false,
            error: error.message
        });
    }
});

module.exports = router;
