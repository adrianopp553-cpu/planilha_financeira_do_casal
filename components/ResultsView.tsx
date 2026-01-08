
import React, { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { Transaction, FinancialSummary, TransactionType, AIAnalysisResult } from '../types';
import { generateImprovementPlan } from '../services/geminiService';
import SummaryCards from './SummaryCards';

const FinancialCharts = lazy(() => import('./FinancialCharts'));

interface ResultsViewProps {
  transactions: Transaction[];
  summary: FinancialSummary;
  onBack: () => void;
  language: 'pt' | 'en' | 'es';
  lightMode: boolean; 
}

const FCLogo = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 35 H 58 V 42 H 40 V 48 H 55 V 55 H 40 V 70 H 32 V 35 Z" fill="currentColor" />
    <path d="M62 38 C 72 38, 78 45, 78 55 C 78 65, 72 72, 62 72 M 62 48 C 68 48, 70 52, 70 55 C 70 58, 68 62, 62 62" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
  </svg>
);

const ResultsView: React.FC<ResultsViewProps> = ({ transactions, summary, onBack, language, lightMode }) => {
  const [aiPlan, setAiPlan] = useState<AIAnalysisResult | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const themeOrWhite = !lightMode ? 'text-white' : 'text-slate-900';
  const textContrast = !lightMode ? 'text-slate-300' : 'text-slate-600';
  const cardBg = !lightMode ? 'bg-white/[0.03]' : 'bg-white/95';

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { 
      style: 'currency', 
      currency: language === 'pt' ? 'BRL' : 'USD' 
    }).format(val);

  // Filtro de Transações do Último Mês (30 dias) para o PDF
  const lastMonthTransactions = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return transactions.filter(t => {
      // Converte string DD/MM/AAAA para objeto Date
      const [day, month, year] = t.date.split('/').map(Number);
      const txDate = new Date(year, month - 1, day);
      return txDate >= thirtyDaysAgo;
    }).sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateB.getTime() - dateA.getTime();
    });
  }, [transactions]);

  const topExpenses = [...transactions]
    .filter(t => t.type === TransactionType.EXPENSE)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const fetchAIPlan = async () => {
    if (transactions.length === 0) return;
    setLoadingPlan(true);
    const plan = await generateImprovementPlan(transactions);
    setAiPlan(plan);
    setLoadingPlan(false);
  };

  useEffect(() => {
    if (transactions.length > 0 && !aiPlan) {
      fetchAIPlan();
    }
  }, [transactions]);

  const handleExportPDF = () => {
    const oldTitle = document.title;
    const dateStr = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US').replace(/\//g, '-');
    document.title = `FinControl_PRO_Report_${dateStr}`;
    setTimeout(() => {
      window.print();
      document.title = oldTitle;
    }, 100);
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* SEÇÃO DE IMPRESSÃO (PDF) - REESTRUTURADA */}
      <div className="hidden print:block w-full text-slate-900 bg-white font-sans">
        <div className="flex justify-between items-start border-b-[8px] border-theme pb-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="text-theme">
              <FCLogo className="w-16 h-16" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-theme tracking-tighter uppercase">Relatório Financeiro Estratégico</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Audit Log • Pro Edition v2.5</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-2xl font-black tabular-nums text-theme">{new Date().toLocaleDateString()}</p>
             <p className="text-[8px] font-black uppercase text-theme mt-1">Status: Consolidado</p>
          </div>
        </div>

        {/* Resumo Financeiro PDF */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-6 rounded-[24px] border border-emerald-100 bg-emerald-50/20">
            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-1">Créditos</p>
            <p className="text-2xl font-black text-emerald-600 tabular-nums">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className="p-6 rounded-[24px] border border-rose-100 bg-rose-50/20">
            <p className="text-[8px] font-black uppercase tracking-widest text-rose-500 mb-1">Débitos</p>
            <p className="text-2xl font-black text-rose-500 tabular-nums">{formatCurrency(summary.totalExpense)}</p>
          </div>
          <div className="p-6 rounded-[24px] bg-slate-900 text-white shadow-xl shadow-slate-200">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Disponível</p>
            <p className="text-2xl font-black tabular-nums">{formatCurrency(summary.balance)}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 mb-12">
          <div className="col-span-7 bg-slate-50 p-8 rounded-[32px] border border-slate-200">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 mb-6 border-l-4 border-theme pl-4">Distribuição Analítica</h2>
            <Suspense fallback={null}>
              <FinancialCharts transactions={transactions} language={language} />
            </Suspense>
          </div>

          <div className="col-span-5 bg-slate-900 p-8 rounded-[32px]">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8 border-l-4 border-theme pl-4">Maiores Ofensores</h2>
            <div className="space-y-3">
              {topExpenses.map((t, idx) => (
                <div key={t.id} className="w-full bg-white rounded-[20px] p-4 flex items-center justify-between border border-transparent shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg font-black text-[10px]">0{idx+1}</div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none mb-0.5">{t.description}</p>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{t.category}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-rose-600 tabular-nums pr-1">{formatCurrency(t.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HISTÓRICO MENSAL - NOVIDADE PDF */}
        <div className="mb-12 page-break-before">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 mb-6 border-l-4 border-theme pl-4">Histórico Operacional (Últimos 30 dias)</h2>
           <div className="border border-slate-100 rounded-[24px] overflow-hidden">
             <table className="w-full text-left text-[9px] border-collapse">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-100">
                   <th className="py-4 px-6 font-black uppercase tracking-wider text-slate-400">Data</th>
                   <th className="py-4 px-6 font-black uppercase tracking-wider text-slate-400">Descrição</th>
                   <th className="py-4 px-6 font-black uppercase tracking-wider text-slate-400">Categoria</th>
                   <th className="py-4 px-6 font-black uppercase tracking-wider text-slate-400 text-right">Valor</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {lastMonthTransactions.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest">Nenhuma transação no período.</td>
                   </tr>
                 ) : (
                   lastMonthTransactions.map((tx) => (
                     <tr key={tx.id} className="hover:bg-slate-50/50">
                       <td className="py-3 px-6 font-bold text-slate-500 tabular-nums">{tx.date}</td>
                       <td className="py-3 px-6 font-black text-slate-900 uppercase">{tx.description}</td>
                       <td className="py-3 px-6">
                         <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 rounded text-slate-400 uppercase">{tx.category}</span>
                       </td>
                       <td className={`py-3 px-6 text-right font-black tabular-nums ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {tx.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(tx.amount)}
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* CONSELHO DE EVOLUÇÃO - NOVIDADE PDF */}
        <div className="mt-12 pt-10 border-t-2 border-slate-100 text-center flex flex-col items-center">
           <div className="w-12 h-12 bg-theme/10 rounded-2xl flex items-center justify-center text-theme mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
           </div>
           <p className="text-[10px] font-black text-theme uppercase tracking-[0.5em] mb-3">Mindset de Prosperidade</p>
           <p className="text-lg font-black tracking-tight text-slate-900 max-w-xl italic leading-snug">
             "A disciplina financeira é a ponte entre seus objetivos e a sua liberdade. Continue monitorando, ajustando e evoluindo."
           </p>
           <div className="mt-8 w-20 h-1 bg-theme/20 rounded-full"></div>
           <p className="mt-6 text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">Gerado automaticamente por FinControl Pro AI Analytics</p>
        </div>
      </div>

      {/* INTERFACE WEB (NO-PRINT) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 no-print">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-theme font-black text-[9px] uppercase tracking-widest mb-3 hover:gap-3 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Voltar
          </button>
          <h1 className={`text-5xl font-black tracking-tighter ${themeOrWhite}`}>Resultados</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-white/80 hover:bg-slate-50 transition-all flex items-center gap-2">
             PDF
          </button>
          <button onClick={() => window.print()} className="px-6 py-4 bg-theme text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-theme/20 hover:scale-105 transition-all flex items-center gap-2">
             Imprimir
          </button>
        </div>
      </div>

      <div className="no-print space-y-10">
        <SummaryCards summary={summary} language={language} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`lg:col-span-7 ${cardBg} p-8 rounded-[40px] shadow-sm border border-slate-200 dark:border-white/10`}>
            <h2 className={`text-xl font-black mb-8 ${themeOrWhite}`}>Distribuição de Gastos</h2>
            <Suspense fallback={null}>
              <FinancialCharts transactions={transactions} language={language} />
            </Suspense>
          </div>

          <div className={`lg:col-span-5 ${cardBg} p-8 rounded-[40px] shadow-sm border border-slate-200 dark:border-white/10`}>
             <h2 className={`text-xl font-black mb-8 ${themeOrWhite}`}>Maiores Saídas</h2>
             <div className="space-y-3">
               {topExpenses.map((t, idx) => (
                 <div key={t.id} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-[24px] border border-transparent hover:border-theme/20 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-theme/10 rounded-xl flex items-center justify-center font-black text-theme text-[10px]">0{idx + 1}</div>
                      <div>
                        <p className={`font-black text-xs uppercase tracking-tight ${!lightMode ? 'text-white' : 'text-slate-900'}`}>{t.description}</p>
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{t.category}</p>
                      </div>
                    </div>
                    <p className="font-black text-base text-rose-500 tabular-nums">{formatCurrency(t.amount)}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <section className={`${cardBg} p-10 rounded-[48px] border border-slate-200 dark:border-white/10 relative overflow-hidden`}>
          <div className="relative z-10">
            <h2 className={`text-2xl font-black tracking-tight mb-8 flex items-center gap-4 ${themeOrWhite}`}>
              <div className="w-10 h-10 bg-theme rounded-xl flex items-center justify-center text-black shadow-lg shadow-theme/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
              Plano de Evolução AI
            </h2>
            {loadingPlan ? (
              <div className="flex items-center gap-3 py-6">
                <div className="w-4 h-4 border-2 border-theme border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-theme">O Gemini está analisando...</p>
              </div>
            ) : aiPlan ? (
              <div 
                className={`prose prose-invert max-w-none text-lg font-bold leading-relaxed transition-all duration-700 ${!lightMode ? 'text-slate-300' : 'text-slate-700'}`}
                dangerouslySetInnerHTML={{ __html: aiPlan.text }} 
              />
            ) : (
              <button onClick={fetchAIPlan} className="px-10 py-4 bg-theme text-black font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-theme/30 hover:scale-105 transition-all">Gerar Plano de Ação AI</button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResultsView;
