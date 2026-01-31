
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FinancialSummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFinancialInsights = async (
  transactions: Transaction[],
  summary: FinancialSummary
) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze the following financial data for a business. 
    Total Revenue: ₹${summary.totalRevenue}
    Total Expenses: ₹${summary.totalExpenses}
    Net Profit: ₹${summary.netProfit}
    Profit Margin: ${summary.profitMargin}%

    Transactions:
    ${transactions.map(t => `- ${t.date}: ${t.description} (${t.type}) - ₹${t.amount}`).join('\n')}

    Provide a professional analysis including:
    1. A summary of financial health.
    2. Identification of major spending patterns.
    3. Three actionable recommendations to increase profit.
    Return the response in a structured advice format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "I'm sorry, I couldn't analyze the data at this moment. Please check your internet connection and try again.";
  }
};
