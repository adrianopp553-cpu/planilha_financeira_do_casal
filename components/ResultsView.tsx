
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
    document.title = `FinControl_Report_${dateStr}`;
    setTimeout(() => {
      window.print();
      document.title = oldTitle;
    }, 100);
  };

  return (
    <main className="pt-32 pb-40 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* SEÇÃO DE IMPRESSÃO - DOCUMENTO OFICIAL ÚNICO */}
      <div className="hidden print:block w-full text-black bg-white font-sans">
        {/* Cabeçalho de Auditoria */}
        <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
          <div className="flex items-center gap-6">
            <FCLogo className="w-16 h-16 text-black" />
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Relatório de Gestão</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Plataforma FinControl Pro v2.5 • Auditoria Digital de Fluxo</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="bg-black text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest mb-3">Documento Original</span>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Referência de Emissão</p>
            <p className="text-xl font-black tabular-nums">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Resumo Consolidado (Bordas fortes para contraste) */}
        <div className="grid grid-cols-3 gap-0 mb-12 border-2 border-black divide-x-2 divide-black">
          <div className="p-8 text-center bg-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Total Receitas</p>
            <p className="text-3xl font-black text-emerald-600 tabular-nums">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className="p-8 text-center bg-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Total Despesas</p>
            <p className="text-3xl font-black text-rose-600 tabular-nums">{formatCurrency(summary.totalExpense)}</p>
          </div>
          <div className="p-8 text-center bg-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Saldo Final</p>
            <p className={`text-3xl font-black tabular-nums ${summary.balance >= 0 ? 'text-black' : 'text-rose-700'}`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        {/* Plano da IA (Formatação de Documento) */}
        <div className="mb-12 border-l-8 border-black pl-8 py-2">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-black rounded-full"></span> Análise Estratégica Gemini AI
          </h2>
          {aiPlan ? (
            <div 
              className="text-base font-bold leading-relaxed text-slate-800 space-y-4"
              dangerouslySetInnerHTML={{ __html: aiPlan.text.replace(/<b>/g, '<b class="text-black font-black uppercase block mt-6 mb-2 text-sm tracking-wide">') }} 
            />
          ) : (
            <p className="italic text-slate-400">Análise de IA não disponível para este ciclo.</p>
          )}
        </div>

        {/* Tabela de Transações (Minimalismo de Contraste) */}
        <div className="mt-16">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-6 text-black">Extrato de Movimentação</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y-2 border-black bg-slate-50">
                <th className="py-4 px-4 text-left text-[9px] font-black uppercase text-slate-500">Data</th>
                <th className="py-4 px-4 text-left text-[9px] font-black uppercase text-slate-500">Descrição Técnica</th>
                <th className="py-4 px-4 text-left text-[9px] font-black uppercase text-slate-500">Categoria</th>
                <th className="py-4 px-4 text-right text-[9px] font-black uppercase text-slate-500">Valor Operacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.map(tx => (
                <tr key={tx.id} className="page-break-inside-avoid">
                  <td className="py-4 px-4 text-[10px] font-bold text-slate-400 tabular-nums">{tx.date}</td>
                  <td className="py-4 px-4 text-xs font-black text-black">{tx.description}</td>
                  <td className="py-4 px-4 text-[9px] font-black text-slate-500 uppercase">{tx.category}</td>
                  <td className={`py-4 px-4 text-right text-xs font-black tabular-nums ${tx.type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'Entrada' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Autenticidade Digital */}
        <div className="mt-20 pt-10 border-t border-slate-200 flex justify-between items-center opacity-60">
           <div className="flex gap-10">
             <div>
               <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">Hash de Integridade</p>
               <p className="text-[9px] font-mono text-slate-900">FC-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
             </div>
             <div>
               <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">Protocolo</p>
               <p className="text-[9px] font-mono text-slate-900">DGT-992.001-X</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[8px] font-black uppercase tracking-[0.3em] text-black">FinControl Pro Certified Report</p>
             <p className="text-[7px] font-bold text-slate-400 mt-1 uppercase">Este documento possui validade informativa e gerencial.</p>
           </div>
        </div>
      </div>

      {/* DASHBOARD DE TELA (NO-PRINT) */}
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {language === 'pt' ? 'Imprimir' : 'Print'}
          </button>
        </div>
      </div>

      <div className="no-print">
        <SummaryCards summary={summary} language={language} />

        {/* PLANO DE AÇÃO COM IA NA TELA */}
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
               {topExpenses.map((t, idx) => (
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
               ))}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResultsView;
