
import React, { lazy, Suspense, useState, useEffect } from 'react';
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
    <main className="pt-32 pb-40 px-6 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* SEÇÃO DE IMPRESSÃO - LAYOUT TÉCNICO PREMIUM */}
      <div className="hidden print:block w-full text-slate-900 bg-white font-sans">
        <div className="flex justify-between items-start border-b-[12px] border-theme pb-10 mb-10">
          <div className="flex items-center gap-8">
            <div className="text-theme">
              <FCLogo className="w-20 h-20" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-theme tracking-tighter leading-none uppercase">Relatório de Saúde Financeira</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Documentação Analítica Pro Edition</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-3xl font-black tabular-nums">{new Date().toLocaleDateString()}</p>
             <p className="text-[9px] font-black uppercase text-theme mt-1">Status: Consolidado</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="p-8 rounded-[32px] border-2 border-emerald-100 bg-emerald-50/30">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2">Créditos</p>
            <p className="text-3xl font-black text-emerald-600 tabular-nums">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className="p-8 rounded-[32px] border-2 border-rose-100 bg-rose-50/30">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-2">Débitos</p>
            <p className="text-3xl font-black text-rose-500 tabular-nums">{formatCurrency(summary.totalExpense)}</p>
          </div>
          <div className="p-8 rounded-[32px] border-2 border-slate-900 bg-slate-900 text-white">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Disponível</p>
            <p className="text-3xl font-black tabular-nums">{formatCurrency(summary.balance)}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-7 bg-slate-50 p-10 rounded-[48px] border border-slate-200">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 mb-10 border-l-4 border-theme pl-4">Distribuição Analítica</h2>
            <Suspense fallback={null}>
              <FinancialCharts transactions={transactions} language={language} />
            </Suspense>
          </div>

          <div className="col-span-5 bg-slate-900 p-10 rounded-[48px]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white mb-10 border-l-4 border-theme pl-4">Maiores Ofensores</h2>
            <div className="space-y-4">
              {topExpenses.map((t, idx) => (
                <div key={t.id} className="w-full bg-white rounded-[24px] p-5 flex items-center justify-between border border-transparent shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-xl font-black text-xs">0{idx+1}</div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{t.description}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.category}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-rose-600 tabular-nums pr-2">{formatCurrency(t.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* INTERFACE WEB - DESIGN PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6 no-print">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-theme font-black text-[10px] uppercase tracking-widest mb-4 hover:gap-3 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </button>
          <h1 className={`text-6xl font-black tracking-tighter ${themeOrWhite}`}>Resultados</h1>
          <p className={`font-bold mt-2 ${textContrast}`}>Métricas consolidadas de desempenho financeiro.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExportPDF} className="px-8 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white/80 hover:bg-slate-50 transition-all flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             PDF
          </button>
          <button onClick={() => window.print()} className="px-8 py-5 bg-theme text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-theme/30 hover:scale-105 transition-all flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2" /></svg>
             Imprimir
          </button>
        </div>
      </div>

      <div className="no-print space-y-16">
        <SummaryCards summary={summary} language={language} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Distribuição de Gastos */}
          <div className={`lg:col-span-7 ${cardBg} p-12 rounded-[56px] shadow-sm border border-slate-200 dark:border-white/10`}>
            <h2 className={`text-2xl font-black mb-12 ${themeOrWhite}`}>Distribuição de Gastos</h2>
            <Suspense fallback={null}>
              <FinancialCharts transactions={transactions} language={language} />
            </Suspense>
          </div>

          {/* Maiores Saídas - Cards Brancos Perfeitos */}
          <div className={`lg:col-span-5 ${cardBg} p-12 rounded-[56px] shadow-sm border border-slate-200 dark:border-white/10`}>
             <h2 className={`text-2xl font-black mb-12 ${themeOrWhite}`}>Maiores Saídas</h2>
             <div className="space-y-4">
               {topExpenses.map((t, idx) => (
                 <div key={t.id} className="flex items-center justify-between p-6 bg-white dark:bg-white/10 rounded-[32px] border border-black/[0.03] dark:border-white/10 shadow-sm transition-all hover:translate-x-2">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-theme/10 rounded-2xl flex items-center justify-center font-black text-theme text-sm">0{idx + 1}</div>
                      <div>
                        <p className={`font-black text-sm uppercase tracking-tight ${!lightMode ? 'text-white' : 'text-slate-900'}`}>{t.description}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{t.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-rose-500 tabular-nums">{formatCurrency(t.amount)}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Plano Gemini AI */}
        <section className={`${cardBg} p-16 rounded-[64px] border border-slate-200 dark:border-white/10 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 text-theme" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <div className="relative z-10">
            <h2 className={`text-3xl font-black tracking-tight mb-12 flex items-center gap-5 ${themeOrWhite}`}>
              <div className="w-12 h-12 bg-theme rounded-2xl flex items-center justify-center text-black"><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
              Plano de Evolução Financeira
            </h2>
            {loadingPlan ? (
              <div className="flex items-center gap-4 py-12">
                <div className="w-6 h-6 border-2 border-theme border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-widest text-theme">O Gemini está traçando sua rota de prosperidade...</p>
              </div>
            ) : aiPlan ? (
              <div 
                className={`prose prose-invert max-w-none text-xl font-bold leading-relaxed transition-all duration-700 ${!lightMode ? 'text-slate-300' : 'text-slate-700'}`}
                dangerouslySetInnerHTML={{ __html: aiPlan.text }} 
              />
            ) : (
              <button onClick={fetchAIPlan} className="px-12 py-5 bg-theme text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-theme/30 hover:scale-105 transition-all">Gerar Plano de Ação AI</button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResultsView;
