
import { GoogleGenAI } from "@google/genai";
import { Transaction, AIAnalysisResult } from "../types";

const getBasePrompt = (transactions: Transaction[]) => {
  // Limitar para as transações mais recentes para evitar prompts gigantescos e lentidão
  const recentTxs = transactions.slice(0, 50);
  const totalIncome = transactions.filter(t => t.type === 'Entrada').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Saída').reduce((acc, t) => acc + t.amount, 0);

  return `
    DADOS FINANCEIROS CONSOLIDADOS:
    - Entradas Totais: R$ ${totalIncome.toFixed(2)}
    - Saídas Totais: R$ ${totalExpense.toFixed(2)}
    - Saldo Final: R$ ${(totalIncome - totalExpense).toFixed(2)}
    
    AMOSTRA DE TRANSAÇÕES RECENTES:
    ${recentTxs.map(t => `- ${t.date}: ${t.description} (${t.category}) - ${t.type}: R$ ${t.amount.toFixed(2)}`).join('\n')}
  `;
};

export const analyzeFinances = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const prompt = `${getBasePrompt(transactions)}\nForneça uma análise rápida da saúde financeira e 3 dicas curtas e práticas.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor financeiro ágil. Seja direto, use bullet points e linguagem motivadora.",
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
  const model = 'gemini-3-flash-preview'; 
  const prompt = `
    ${getBasePrompt(transactions)}
    
    Como mentor de liberdade financeira, crie um "PLANO DE EVOLUÇÃO ESTRATÉGICO".
    Estruture obrigatoriamente em HTML simples (tags <b>, <br>, <ul>, <li>) contendo:
    1. DIAGNÓSTICO: Onde estão os maiores vazamentos de capital.
    2. ONDE CORTAR: Liste 3 itens específicos para reduzir imediatamente.
    3. ONDE INVESTIR: Sugestão prática para o saldo remanescente.
    4. META DO MÊS: Uma meta financeira desafiadora.
    
    Seja técnico, assertivo e use a formatação HTML para destacar pontos importantes.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um estrategista financeiro focado em transformar dívidas em investimentos e gastos em patrimônio.",
        temperature: 0.7,
      },
    });

    return { text: response.text || "" };
  } catch (error) {
    console.error("Error in generateImprovementPlan:", error);
    return { text: "<b>Nota:</b> O sistema está com alta demanda. Não foi possível gerar o plano completo agora. Tente novamente em alguns segundos." };
  }
};

export const deepThinkingAnalysis = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const prompt = `
    ${getBasePrompt(transactions)}
    
    Faça uma reflexão profunda sobre os padrões de consumo. 
    Identifique comportamentos impulsivos e sugira uma mudança radical de mindset para prosperidade.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um mentor financeiro sênior especializado em psicologia do dinheiro.",
      },
    });

    return { text: response.text || "" };
  } catch (error) {
    console.error("Error in deepThinkingAnalysis:", error);
    return { text: "Erro ao realizar análise profunda no momento." };
  }
};

export const marketSearchAnalysis = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const prompt = `
    Baseado nestes gastos: ${transactions.slice(0, 10).map(t => t.category).join(', ')}.
    Pesquise o cenário econômico atual no Brasil e como a inflação ou taxas atuais afetam especificamente este perfil de consumo.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um analista de mercado. Use o Google Search para fundamentar sua resposta com dados reais do Brasil.",
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
    return { text: "Erro ao sincronizar dados de mercado atualizados." };
  }
};
