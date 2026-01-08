
import { GoogleGenAI } from "@google/genai";
import { Transaction, AIAnalysisResult } from "../types";

const getBasePrompt = (transactions: Transaction[]) => `
  Transações recentes do casal:
  ${transactions.map(t => `- ${t.date}: ${t.description} (${t.category}) - ${t.type}: R$ ${t.amount.toFixed(2)}`).join('\n')}
  
  Saldo total: R$ ${transactions.reduce((acc, t) => acc + (t.type === 'Entrada' ? t.amount : -t.amount), 0).toFixed(2)}
`;

export const analyzeFinances = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const prompt = `${getBasePrompt(transactions)}\nForneça uma análise rápida e 3 dicas curtas para este casal.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor financeiro ágil. Seja direto e prático.",
        temperature: 0.7,
      },
    });

    return { text: response.text || "" };
  } catch (error) {
    console.error("Error in analyzeFinances:", error);
    return { text: "Erro ao gerar análise rápida." };
  }
};

export const generateImprovementPlan = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const prompt = `
    ${getBasePrompt(transactions)}
    
    Como consultor financeiro estrategista, crie um "Plano de Melhoria de Resultados" para este casal.
    O plano deve ser estruturado em HTML simples (apenas tags <b>, <br>, <ul>, <li>) e conter:
    1. DIAGNÓSTICO: Onde eles mais estão errando.
    2. ONDE CORTAR: Liste 3 categorias ou itens específicos para reduzir imediatamente.
    3. ONDE INVESTIR/FOCAR: O que fazer com o saldo que sobrar.
    4. META DO MÊS: Uma meta financeira desafiadora mas possível.
    
    Seja motivador e técnico.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um mentor de liberdade financeira. Seu objetivo é fazer o casal prosperar cortando o supérfluo e focando no futuro.",
        thinkingConfig: { thinkingBudget: 15000 },
      },
    });

    return { text: response.text || "" };
  } catch (error) {
    console.error("Error in generateImprovementPlan:", error);
    return { text: "Não foi possível gerar o plano de estratégia no momento." };
  }
};

export const deepThinkingAnalysis = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const prompt = `
    ${getBasePrompt(transactions)}
    
    Como especialista financeiro, faça uma reflexão profunda sobre o comportamento de consumo deste casal. 
    Considere metas de longo prazo, possíveis gargalos invisíveis e estratégias de investimento baseadas no perfil de gastos deles.
    Forneça um plano de ação estruturado.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um mentor financeiro sênior. Use raciocínio profundo para ajudar o casal a prosperar.",
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    return { text: response.text || "" };
  } catch (error) {
    console.error("Error in deepThinkingAnalysis:", error);
    return { text: "Erro ao realizar análise profunda." };
  }
};

export const marketSearchAnalysis = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const prompt = `
    Baseado nos gastos do casal: ${transactions.slice(0, 5).map(t => t.category).join(', ')}.
    Pesquise tendências atuais de mercado no Brasil (inflação, preços de alimentos/transporte, taxas de juros) que afetem o bolso deste casal hoje. 
    Compare os gastos deles com a realidade econômica atual e sugira ajustes baseados em dados reais de mercado.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um analista de mercado. Use o Google Search para trazer dados reais e atualizados do Brasil.",
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { 
      text: response.text || "",
      sources: sources as any[]
    };
  } catch (error) {
    console.error("Error in marketSearchAnalysis:", error);
    return { text: "Erro ao buscar dados de mercado." };
  }
};
