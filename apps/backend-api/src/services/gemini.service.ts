import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import type { StockAnalysis, GroundingChunk } from '@ai-stock-analyser/shared';

/**
 * Gemini AI service for generating stock analysis using Google's Gemini API
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string = 'gemini-2.0-flash-exp';

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  /**
   * Generate the analysis prompt for a given ticker
   */
  private generatePrompt(ticker: string): string {
    return `
      You are an expert financial analyst AI. Your task is to provide a detailed, real-time analysis for a given stock ticker.
      Use your search tool to get the latest stock price, recent performance, breaking news, today's opening price, and today's high price for the ticker: ${ticker}.
      Also, provide historical prices for yesterday, one week ago, and one month ago. Finally, predict the price for tomorrow and one month from now.

      Analyze all the gathered information and provide a coherent summary and recommendation.

      Your final output MUST be a single, valid JSON object and nothing else. Do not wrap it in markdown backticks or any other text.
      The JSON object must conform to the following structure:
      {
        "ticker": "string (the stock ticker you analyzed)",
        "companyName": "string (the full company name)",
        "currentPrice": "string (the latest price with currency symbol, e.g., '$175.20')",
        "prediction": "'Bullish' | 'Bearish' | 'Neutral' (your prediction for the day's trend)",
        "recommendation": "'Buy' | 'Sell' | 'Hold'",
        "confidenceScore": "number (a score from 1 to 10 on how confident you are in your recommendation)",
        "analysisSummary": "string (a detailed 2-3 paragraph summary of your analysis, explaining the reasons for your prediction and recommendation. Use markdown for formatting.)",
        "keyNews": [
          {
            "title": "string (title of a key news article)",
            "summary": "string (a brief summary of the news article and its impact on the stock)"
          }
        ],
        "historicalPrices": {
          "yesterday": "string (price from yesterday with currency symbol)",
          "week_ago": "string (price from one week ago with currency symbol)",
          "month_ago": "string (price from one month ago with currency symbol)"
        },
        "futurePredictions": {
          "tomorrow": "string (predicted price for tomorrow with currency symbol)",
          "month_after": "string (predicted price for one month from now with currency symbol)"
        },
        "dailyStats": {
          "todaysOpen": "string (today's opening price with currency symbol)",
          "todaysHigh": "string (today's high price with currency symbol)"
        }
      }
    `;
  }

  /**
   * Parse JSON response from Gemini, handling markdown code blocks
   */
  private parseJsonResponse(responseText: string): StockAnalysis {
    let jsonString = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7);
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.substring(3);
    }

    if (jsonString.endsWith('```')) {
      jsonString = jsonString.substring(0, jsonString.length - 3);
    }

    jsonString = jsonString.trim();

    try {
      const parsed: StockAnalysis = JSON.parse(jsonString);
      return parsed;
    } catch (error) {
      console.error('JSON Parsing Error:', error);
      console.error('Raw Response Text:', responseText);
      throw new Error('Failed to parse stock analysis JSON from Gemini response');
    }
  }

  /**
   * Extract grounding sources from response metadata
   */
  private extractSources(candidates: any[]): GroundingChunk[] {
    if (!candidates || candidates.length === 0) {
      return [];
    }

    const groundingChunks =
      (candidates[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) ||
      [];

    // Filter to only include chunks with valid web URIs
    return groundingChunks.filter(
      (chunk) => chunk.web && chunk.web.uri && chunk.web.title
    );
  }

  /**
   * Generate stock analysis for a given ticker using Gemini API
   * @param ticker - Stock ticker symbol (e.g., "AAPL", "GOOGL")
   * @returns Stock analysis with sources
   * @throws Error if API call fails or response parsing fails
   */
  async generateStockAnalysis(
    ticker: string
  ): Promise<{ analysis: StockAnalysis; sources: GroundingChunk[] }> {
    const normalizedTicker = ticker.toUpperCase().trim();

    if (!normalizedTicker) {
      throw new Error('Ticker symbol is required');
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.model,
      });

      // Call Gemini API with Google Search grounding tool
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: this.generatePrompt(normalizedTicker) }],
          },
        ],
        tools: [
          {
            googleSearch: {},
          },
        ],
      });

      const response = result.response;
      const responseText = response.text();

      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      // Parse the JSON response
      const analysis = this.parseJsonResponse(responseText);

      // Extract sources from grounding metadata
      const sources = this.extractSources(response.candidates || []);

      return {
        analysis,
        sources,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Gemini API Error:', error.message);
        throw new Error(`Failed to generate stock analysis: ${error.message}`);
      }
      throw new Error('Failed to generate stock analysis: Unknown error');
    }
  }
}

/**
 * Singleton instance of Gemini service
 */
export const geminiService = new GeminiService();
