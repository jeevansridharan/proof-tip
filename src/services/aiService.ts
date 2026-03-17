// src/services/aiService.ts
// Uses Groq's ultra-fast inference API to evaluate a submission and return a score (0–10).
// Model: llama-3.3-70b-versatile (fast, free-tier friendly — great for hackathons)

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
  // dangerouslyAllowBrowser is needed because this runs in the browser.
  // For production, move this call to a backend / Supabase Edge Function.
  dangerouslyAllowBrowser: true,
});

/**
 * Sends the submission title + description to Groq (LLaMA 3.3 70B)
 * and returns a numeric score between 0 and 10.
 *
 * The prompt instructs the model to return ONLY a number — no extra text.
 */
export async function evaluateSubmission(title: string, description: string): Promise<number> {
  const prompt = `You are an expert hackathon judge. Evaluate the following project idea based on:
1. Originality – is it creative and novel?
2. Usefulness – does it solve a real problem?
3. Technical quality – is the technical approach sound and feasible?

Project Title: "${title}"
Project Description: "${description}"

Respond with ONLY a single number between 0 and 10 (decimals are allowed, e.g. 7.5).
Do not include any other text, explanation, or punctuation — just the number.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // blazing fast on Groq hardware
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 10,
    temperature: 0.2, // low temp = more deterministic score
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? '0';
  const score = parseFloat(raw);

  // Clamp and validate
  if (isNaN(score) || score < 0 || score > 10) {
    console.warn(`⚠️ Groq returned unexpected score: "${raw}", defaulting to 0`);
    return 0;
  }

  return Math.round(score * 10) / 10; // one decimal place
}
