// src/services/aiService.ts
// Calls OpenAI to evaluate a submission and return a numeric score (0–10).

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
    // dangerouslyAllowBrowser is set to true for hackathon demo purposes.
    // In production, move this call to a backend / edge function.
    dangerouslyAllowBrowser: true,
});

/**
 * Sends the submission title+description to GPT and returns a score (0-10).
 * The prompt instructs the model to return ONLY a numeric score.
 */
export async function evaluateSubmission(title: string, description: string): Promise<number> {
    const prompt = `You are an expert hackathon judge. Evaluate the following project idea based on:
1. Originality (is it creative and novel?)
2. Usefulness (does it solve a real problem?)
3. Technical quality (is the technical approach sound?)

Project Title: "${title}"
Project Description: "${description}"

Respond with ONLY a single number between 0 and 10 (decimals allowed, e.g. 7.5).
Do not include any other text, explanation, or punctuation.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // cost-effective for hackathons
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '0';
    const score = parseFloat(raw);

    // Validate the score is within range
    if (isNaN(score) || score < 0 || score > 10) {
        console.warn(`AI returned unexpected score: "${raw}", defaulting to 0`);
        return 0;
    }

    return Math.round(score * 10) / 10; // one decimal place
}
