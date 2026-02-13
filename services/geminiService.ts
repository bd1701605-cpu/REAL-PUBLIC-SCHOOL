
import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateRemarks(studentName: string, performance: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a professional academic remark for a student named ${studentName} based on this performance: ${performance}. Keep it constructive and under 40 words.`,
      });
      return response.text || "Keep up the good work.";
    } catch (error) {
      console.error("AI Remarks error:", error);
      return "Excellent effort displayed in all subjects.";
    }
  },

  async generateNotice(topic: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a formal school notice about ${topic}. Include date, subject, and body. Keep it professional.`,
      });
      return response.text || "Notice content unavailable.";
    } catch (error) {
      return "Notice content unavailable.";
    }
  }
};
