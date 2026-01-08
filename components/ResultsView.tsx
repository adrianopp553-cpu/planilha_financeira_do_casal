
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

  const themeOrWhite = !lightMode ? 'text-white' : 'text-theme';
  const textContrast = !lightMode ? 'text-slate-300' : 'text-slate-600';
  const cardBg = !lightMode ? 'bg-white/5' : 'bg-white/95';

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
    document.title = `Relatorio_Financeiro_FinControl_${dateStr}`;
    setTimeout(() => {
      window.print();
      document.title = oldTitle;
    }, 100);
  };

  return (
    <main className="pt-32 pb-40 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* SEÇÃO DE IMPRESSÃO - DOCUMENTO DE ALTO NÍVEL (CONSULTORIA) */}
      <div className="hidden print:block w-full text-black bg-white font-sans">
        {/* Cabeçalho Executivo */}
        <div className="flex justify-between items-start border-b-[8px] border-theme pb-10 mb-12">
          <div className="flex items-center gap-8">
            <div className="text-theme">
              <FCLogo className="w-24 h-24" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-theme tracking-tighter leading-none uppercase">Relatório de Saúde Financeira</h1>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mt-3">Análise Prospectiva & Inteligência de Dados • Pro Edition</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-theme text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg mb-4">Certificação de Integridade</div>
            <p className="text-3xl font-black tabular-nums leading-none">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Dash de Resumo (Cards) */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="p-8 rounded-[32px] border-2 border-theme/20 bg-theme/5">
            <p className="text-[9px] font-black uppercase tracking-widest text-theme opacity-60 mb-2">Fluxo de Entrada</p>
            <p className="text-3xl font-black text-emerald-600 tabular-nums">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className="p-8 rounded-[32px] border-2 border-rose-100 bg-rose-50/30">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-2">Fluxo de Saída</p>
            <p className="text-3xl font-black text-rose-500 tabular-nums">{formatCurrency(summary.totalExpense)}</p>
          </div>
          <div className="p-8 rounded-[32px] border-2 border-theme bg-theme text-white shadow-xl">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">Resultado Líquido</p>
            <p className="text-3xl font-black tabular-nums">{formatCurrency(summary.balance)}</p>
          </div>
        </div>

        {/* Infográficos Nativos no PDF */}
        <div className="grid grid-cols-2 gap-10 mb-16">
          <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-theme mb-8 flex items-center gap-3">
              <span className="w-2 h-2 bg-theme rounded-full"></span> Composição de Despesas
            </h2>
            <div className="h-64">
              <Suspense fallback={null}>
                <FinancialCharts transactions={transactions} language={language} />
              </Suspense>
            </div>
          </div>

          <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-theme mb-8 flex items-center gap-3">
              <span className="w-2 h-2 bg-theme rounded-full"></span> Maiores Ofensores (Top 5)
            </h2>
            <div className="space-y-4">
              {topExpenses.map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-theme font-black text-sm">#0{idx+1}</span>
                    <div>
                      <p className="text-xs font-black text-slate-800">{t.description}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.category}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-rose-500">{formatCurrency(t.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights da Consultoria Gemini AI (Layout Visual) */}
        <div className="mb-16">
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-theme mb-10 flex items-center gap-4">
            <span className="flex-1 h-[2px] bg-theme/20"></span> ESTRATÉGIA RECOMENDADA <span className="flex-1 h-[2px] bg-theme/20"></span>
          </h2>
          <div className="grid grid-cols-1 gap-8">
            {aiPlan ? (
              <div 
                className="text-lg font-bold leading-relaxed text-slate-700 p-12 bg-theme/5 border-2 border-theme/10 rounded-[48px] relative overflow-hidden"
                dangerouslySetInnerHTML={{ 
                  __html: aiPlan.text
                    .replace(/<b>/g, '<b class="text-theme" style="font-weight:900; text-transform:uppercase; display:block; margin-top:2.5rem; margin-bottom:1rem; font-size:16px; letter-spacing:2px; border-bottom: 2px solid currentColor; width: fit-content; padding-bottom: 4px">')
                    .replace(/<li>/g, '<li style="margin-bottom: 1rem; list-style-type: none; background: white; padding: 1.25rem; border-radius: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05)">')
                }} 
              />
            ) : (
              <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[48px] text-slate-300 font-black uppercase tracking-widest">
                Gerando recomendações estratégicas...
              </div>
            )}
          </div>
        </div>

        {/* Dica de Ouro / Conclusão Estratégica */}
        <div className="mt-20 p-12 bg-slate-900 rounded-[48px] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-40 h-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-theme font-black uppercase tracking-[0.5em] text-[10px] mb-6">Dica de Ouro de Encerramento</h3>
          <p className="text-2xl font-black leading-tight italic max-w-2xl">
            {summary.balance >= 0 
              ? "O lucro não é o que resta, é o que você prioriza primeiro. Considere automatizar 15% deste saldo para investimentos de longo prazo hoje mesmo."
              : "Crises são oportunidades de simplificação. Foque nos 'Ofensores' listados acima; reduzir apenas a maior categoria em 20% mudará seu saldo para o azul no próximo ciclo."}
          </p>
        </div>

        {/* Footer de Autenticidade */}
        <div className="mt-24 pt-10 border-t-2 border-slate-100 flex justify-between items-center opacity-60">
           <div className="flex gap-12">
             <div>
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Hash de Auditoria</p>
               <p className="text-[10px] font-mono text-slate-900 font-bold">FCP-{Math.random().toString(36).substr(2, 6).toUpperCase()}-INF</p>
             </div>
             <div>
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status do Ciclo</p>
               <p className="text-[10px] font-black text-theme uppercase">Finalizado & Analisado</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[9px] font-black text-theme uppercase tracking-[0.2em]">FinControl Pro Enterprise Edition</p>
             <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Powered by Gemini Strategic AI Engine</p>
           </div>
        </div>
      </div>

      {/* TELA DE RESULTADOS (Interface Web - No Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 no-print">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-theme font-black text-xs uppercase tracking-widest mb-4 hover:gap-3 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {language === 'pt' ? 'Voltar ao Dashboard' : 'Back to Dashboard'}
          </button>
          <h1 className={`text-5xl md:text-6xl font-black tracking-tighter drop-shadow-sm transition-colors duration-300 ${themeOrWhite}`}>
            {language === 'pt' ? 'Resultados' : 'Results'}
          </h1>
          <p className={`font-bold mt-2 ${textContrast}`}>
            {language === 'pt' ? 'Análise detalhada do seu desempenho financeiro.' : 'Detailed analysis of your financial performance.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className={`px-6 py-4 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/20 transition flex items-center gap-2 shadow-sm`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {language === 'pt' ? 'Exportar PDF' : 'Export PDF'}
          </button>
          <button onClick={() => window.print()} className="px-6 py-4 bg-theme text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-theme/20 hover:brightness-110 transition flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {language === 'pt' ? 'Imprimir' : 'Print'}
          </button>
        </div>
      </div>

      <div className="no-print">
        <SummaryCards summary={summary} language={language} />

        {/* PLANO DE AÇÃO COM IA (Interface Web) */}
        <section className={`${cardBg} mt-12 p-8 md:p-12 rounded-[48px] border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-theme/10`}>
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 text-theme" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
             </svg>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-theme rounded-2xl flex items-center justify-center text-white shadow-lg shadow-theme/30 ring-4 ring-theme/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-3xl font-black tracking-tight ${themeOrWhite}`}>
                    {language === 'pt' ? 'Plano de Evolução Financeira' : 'Financial Evolution Plan'}
                  </h2>
                  <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${textContrast} mt-1`}>
                    Powered by Gemini 3.0 Pro AI
                  </p>
                </div>
              </div>
              <button 
                onClick={fetchAIPlan}
                disabled={loadingPlan}
                className="px-8 py-4 bg-theme/10 hover:bg-theme/20 border border-theme/20 rounded-2xl text-[11px] font-black text-theme uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {loadingPlan ? 'Gerando Plano...' : 'Recalcular Estratégia'}
              </button>
            </div>

            {loadingPlan ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-theme/5 rounded-full w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-full w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-full w-5/6"></div>
              </div>
            ) : aiPlan ? (
              <div className={`prose prose-invert max-w-none text-lg transition-all duration-700 ${!lightMode ? 'text-slate-300' : 'text-slate-700'}`}>
                 <div 
                   className="plan-content"
                   dangerouslySetInnerHTML={{ __html: aiPlan.text }} 
                 />
                 <style>{`
                   .plan-content b { color: var(--primary); font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 1.1em; display: block; margin-top: 1.5rem; }
                   .plan-content ul { list-style: none; padding-left: 0; margin-top: 1rem; display: grid; grid-template-cols: 1fr; gap: 0.5rem; }
                   @media (min-width: 768px) { .plan-content ul { grid-template-cols: 1fr 1fr; } }
                   .plan-content li { background: rgba(var(--primary-rgb), 0.05); padding: 1rem 1.5rem; border-radius: 1.5rem; border-left: 4px solid var(--primary); font-size: 0.9em; font-weight: 600; }
                   .dark-mode .plan-content li { background: rgba(255,255,255, 0.03); }
                 `}</style>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 font-black italic uppercase tracking-widest">
                Adicione transações para receber seu plano estratégico.
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
          <div className={`${cardBg} p-10 rounded-[40px] shadow-sm border border-slate-200 dark:border-white/10`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-2xl font-black transition-colors duration-300 ${themeOrWhite}`}>
                {language === 'pt' ? 'Distribuição de Gastos' : 'Expense Distribution'}
              </h2>
            </div>
            <Suspense fallback={<div className="h-64 flex items-center justify-center text-theme/40 text-xs font-black uppercase tracking-widest">Carregando...</div>}>
              <FinancialCharts transactions={transactions} language={language} />
            </Suspense>
          </div>

          <div className={`${cardBg} p-10 rounded-[40px] shadow-sm border border-slate-200 dark:border-white/10`}>
             <h2 className={`text-2xl font-black mb-8 transition-colors duration-300 ${themeOrWhite}`}>
               {language === 'pt' ? 'Maiores Saídas' : 'Top Expenses'}
             </h2>
             <div className="space-y-6">
               {topExpenses.length === 0 ? (
                 <div className="text-center py-20 text-slate-400 font-bold italic">{language === 'pt' ? 'Nenhuma despesa para listar.' : 'No expenses to list.'}</div>
               ) : (
                 topExpenses.map((t, idx) => (
                   <div key={t.id} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-theme/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center font-black text-theme border border-slate-200 dark:border-transparent">
                          {idx + 1}
                        </div>
                        <div>
                          <p className={`font-bold ${!lightMode ? 'text-white' : 'text-slate-900'}`}>{t.description}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{t.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-rose-500">{formatCurrency(t.amount)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t.date}</p>
                      </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResultsView;
