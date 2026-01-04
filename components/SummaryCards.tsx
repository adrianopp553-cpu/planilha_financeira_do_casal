
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
      <div className="bg-white p-6 rounded-[28px] shadow-sm border border-theme-light flex items-center transition hover:shadow-md">
        <div className="bg-emerald-50 p-3 rounded-2xl mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">{t.income}</span>
          <span className="text-2xl font-black text-emerald-600">{formatCurrency(summary.totalIncome)}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[28px] shadow-sm border border-theme-light flex items-center transition hover:shadow-md">
        <div className="bg-red-50 p-3 rounded-2xl mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">{t.expenses}</span>
          <span className="text-2xl font-black text-red-600">{formatCurrency(summary.totalExpense)}</span>
        </div>
      </div>

      <div className={`p-6 rounded-[28px] shadow-2xl border flex items-center transition hover:scale-[1.02] duration-500 ${
        summary.balance >= 0 
          ? 'bg-white border-theme-light ring-4 ring-theme-light shadow-theme' 
          : 'bg-theme-light border-theme ring-4 ring-theme-light shadow-theme'
      }`}>
        <div className={`p-3 rounded-2xl mr-4 ${summary.balance >= 0 ? 'bg-theme text-white' : 'bg-white text-theme'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">{t.coupleBalance}</span>
          <span className={`text-3xl font-black ${summary.balance >= 0 ? 'text-gray-900' : 'text-theme'}`}>
            {formatCurrency(summary.balance)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
