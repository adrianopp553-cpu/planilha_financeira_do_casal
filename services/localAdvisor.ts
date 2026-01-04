
import { Transaction, TransactionType, Category, AIAnalysisResult } from "../types";
import { translations } from "../translations";

export const getLocalAnalysis = (transactions: Transaction[], type: 'quick' | 'deep' | 'market', lang: 'pt' | 'en' | 'es'): AIAnalysisResult => {
  const t = transactions;
  const income = t.filter(x => x.type === TransactionType.INCOME).reduce((acc, x) => acc + x.amount, 0);
  const expenses = t.filter(x => x.type === TransactionType.EXPENSE).reduce((acc, x) => acc + x.amount, 0);
  const balance = income - expenses;
  
  const categoryTotals = t.reduce((acc, x) => {
    if (x.type === TransactionType.EXPENSE) {
      acc[x.category] = (acc[x.category] || 0) + x.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const mainExpense = sortedCategories[0];

  const messages = {
    pt: {
      noData: "Adicione algumas transações para que eu possa analisar o perfil do casal.",
      quick: {
        healthy: `✅ <b>Saúde Financeira:</b> O saldo está positivo em R$ ${balance.toFixed(2)}. Bom trabalho!`,
        warning: `⚠️ <b>Atenção:</b> Vocês gastaram R$ ${expenses.toFixed(2)}, o que representa ${(expenses/income*100).toFixed(1)}% da renda.`,
        tip: mainExpense ? `💡 <b>Dica:</b> A categoria <b>${mainExpense[0]}</b> é o maior ralo de dinheiro hoje. Que tal um desafio de redução de 10% nela?` : ""
      },
      deep: {
        title: "<b>Plano Estratégico (Regra 50/30/20)</b>",
        reserve: `• <b>Reserva de Emergência:</b> Com base nos gastos de R$ ${expenses.toFixed(2)}, vocês precisam de <b>R$ ${(expenses * 6).toFixed(2)}</b> guardados para 6 meses de segurança.`,
        ratio: `• <b>Análise de Proporção:</b> Seus gastos fixos devem idealmente ser R$ ${(income * 0.5).toFixed(2)}. Atualmente estão em R$ ${expenses.toFixed(2)}.`
      },
      market: {
        title: "<b>Guia de Sobrevivência Econômica</b>",
        tips: "• A inflação corrói o dinheiro parado. Considere investimentos atrelados ao IPCA.<br/>• Diversificar é a regra de ouro: nunca coloque todos os ovos na mesma cesta.<br/>• Juros compostos trabalham para quem poupa e contra quem deve."
      }
    },
    // Adicionar versões simplificadas para en/es se necessário, ou usar pt como fallback
  };

  const m = messages[lang] || messages.pt;

  if (t.length === 0) return { text: m.noData };

  if (type === 'quick') {
    return { text: `${balance >= 0 ? m.quick.healthy : m.quick.warning}<br/><br/>${m.quick.tip}` };
  }

  if (type === 'deep') {
    return { text: `${m.deep.title}<br/><br/>${m.deep.reserve}<br/>${m.deep.ratio}` };
  }

  return { text: `${m.market.title}<br/><br/>${m.market.tips}` };
};
