
import React, { lazy, Suspense } from 'react';
import { Transaction, FinancialSummary, TransactionType } from '../types';
import SummaryCards from './SummaryCards';

const FinancialCharts = lazy(() => import('./FinancialCharts'));

interface ResultsViewProps {
  transactions: Transaction[];
  summary: FinancialSummary;
  onBack: () => void;
  language: 'pt' | 'en' | 'es';
  lightMode: boolean; 
}

const ResultsView: React.FC<ResultsViewProps> = ({ transactions, summary, onBack, language, lightMode }) => {
  const themeOrWhite = !lightMode ? 'text-white' : 'text-theme';
  const textContrast = !lightMode ? 'text-slate-300' : 'text-slate-600';
  const labelSecondary = !lightMode ? 'text-slate-500' : 'text-slate-400';

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { 
      style: 'currency', 
      currency: language === 'pt' ? 'BRL' : 'USD' 
    }).format(val);

  const topExpenses = [...transactions]
    .filter(t => t.type === TransactionType.EXPENSE)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const handleExportPDF = () => {
    const oldTitle = document.title;
    const dateStr = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US').replace(/\//g, '-');
    document.title = `Relatorio_FinControl_${dateStr}`;
    setTimeout(() => {
      window.print();
      document.title = oldTitle;
    }, 100);
  };

  return (
    <main className="pt-32 pb-40 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-theme font-black text-xs uppercase tracking-widest mb-4 hover:gap-3 transition-all no-print">
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
        <div className="flex gap-3 no-print">
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

      <SummaryCards summary={summary} language={language} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
        <div className="bg-white/95 dark:bg-white/5 p-10 rounded-[40px] shadow-sm border border-slate-200 dark:border-white/10 page-break-inside-avoid">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-black transition-colors duration-300 ${themeOrWhite}`}>
              {language === 'pt' ? 'Distribuição de Gastos' : 'Expense Distribution'}
            </h2>
            <div className="w-10 h-10 bg-theme/10 rounded-xl flex items-center justify-center text-theme no-print border border-theme/10">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
               </svg>
            </div>
          </div>
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-theme/40 text-xs font-black uppercase tracking-widest">Carregando Gráficos...</div>}>
            <FinancialCharts transactions={transactions} language={language} />
          </Suspense>
        </div>

        <div className="bg-white/95 dark:bg-white/5 p-10 rounded-[40px] shadow-sm border border-slate-200 dark:border-white/10 page-break-inside-avoid">
           <h2 className={`text-2xl font-black mb-8 transition-colors duration-300 ${themeOrWhite}`}>
             {language === 'pt' ? 'Top 5 Maiores Gastos' : 'Top 5 Expenses'}
           </h2>
           <div className="space-y-6">
             {topExpenses.length === 0 ? (
               <div className="text-center py-20 text-slate-400 font-bold italic">
                 {language === 'pt' ? 'Nenhum gasto registrado.' : 'No expenses recorded.'}
               </div>
             ) : (
               topExpenses.map((t, idx) => (
                 <div key={t.id} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-theme/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center font-black text-theme group-hover:bg-theme group-hover:text-white transition-all duration-300 border border-slate-200 dark:border-transparent">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{t.description}</p>
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

      <div className="mt-10 bg-white/95 dark:bg-white/5 p-12 rounded-[48px] shadow-sm border border-slate-200 dark:border-white/10 page-break-inside-avoid transition-all duration-300">
        <h2 className={`text-3xl font-black mb-10 tracking-tight ${themeOrWhite}`}>{language === 'pt' ? 'Consolidado Geral' : 'Overall Consolidation'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[32px] border border-slate-100 dark:border-white/10">
              <p className={`font-black uppercase text-[10px] tracking-[0.25em] mb-4 ${labelSecondary}`}>
                {language === 'pt' ? 'Total Entradas' : 'Total Income'}
              </p>
              <p className="text-4xl font-black text-emerald-600 tabular-nums">{formatCurrency(summary.totalIncome)}</p>
           </div>
           <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[32px] border border-slate-100 dark:border-white/10">
              <p className={`font-black uppercase text-[10px] tracking-[0.25em] mb-4 ${labelSecondary}`}>
                {language === 'pt' ? 'Total Saídas' : 'Total Expenses'}
              </p>
              <p className="text-4xl font-black text-rose-600 tabular-nums">{formatCurrency(summary.totalExpense)}</p>
           </div>
           <div className="bg-theme p-8 rounded-[32px] shadow-2xl shadow-theme/30 ring-1 ring-white/20">
              <p className="text-white/60 font-black uppercase text-[10px] tracking-[0.25em] mb-4">
                {language === 'pt' ? 'Resultado' : 'Result'}
              </p>
              <p className="text-4xl font-black text-white tabular-nums">{formatCurrency(summary.balance)}</p>
           </div>
        </div>
      </div>
    </main>
  );
};

export default ResultsView;
