
import React from 'react';
import { FinancialSummary } from '../types';
import { translations } from '../translations';

interface SummaryCardsProps {
  summary: FinancialSummary;
  language: 'pt' | 'en' | 'es';
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, language }) => {
  const t = translations[language];
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { 
      style: 'currency', 
      currency: language === 'pt' ? 'BRL' : 'USD' 
    }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card de Entradas */}
      <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] shadow-sm border border-black/5 dark:border-white/10 flex items-center transition hover:shadow-md">
        <div className="bg-emerald-500/10 p-4 rounded-2xl mr-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </div>
        <div>
          <span className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">{t.income}</span>
          <span className="text-2xl font-black text-emerald-500 tabular-nums">{formatCurrency(summary.totalIncome)}</span>
        </div>
      </div>

      {/* Card de Saídas */}
      <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] shadow-sm border border-black/5 dark:border-white/10 flex items-center transition hover:shadow-md">
        <div className="bg-rose-500/10 p-4 rounded-2xl mr-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        </div>
        <div>
          <span className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">{t.expenses}</span>
          <span className="text-2xl font-black text-rose-500 tabular-nums">{formatCurrency(summary.totalExpense)}</span>
        </div>
      </div>

      {/* Card de Saldo Total - DESTAQUE MÁXIMO (OPACIDADE 100%) */}
      <div className={`p-8 rounded-[40px] shadow-2xl flex items-center transition-all duration-500 hover:scale-[1.03] ring-offset-4 ring-offset-white dark:ring-offset-black ring-4 ${
        summary.balance >= 0 
          ? 'bg-theme text-white ring-theme/20 shadow-theme/40' 
          : 'bg-rose-600 text-white ring-rose-600/20 shadow-rose-600/40'
      }`}>
        <div className="bg-white/20 p-4 rounded-2xl mr-6 backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <span className="text-white/60 text-[11px] font-black uppercase tracking-[0.3em] block mb-1">{t.coupleBalance}</span>
          <span className="text-3xl md:text-4xl font-black tabular-nums tracking-tighter">
            {formatCurrency(summary.balance)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
