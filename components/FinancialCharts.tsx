
import React, { useMemo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, TransactionType } from '../types';
import { translations } from '../translations';

interface FinancialChartsProps {
  transactions: Transaction[];
  language: 'pt' | 'en' | 'es';
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ transactions, language }) => {
  const tTr = translations[language];
  const [primaryColor, setPrimaryColor] = useState('#00ffa3');

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setPrimaryColor(style.getPropertyValue('--primary').trim() || '#00ffa3');
  }, [transactions]);

  const chartColors = useMemo(() => [
    primaryColor, 
    '#22c55e', 
    '#10b981', 
    '#34d399', 
    '#6ee7b7', 
    '#a7f3d0'
  ], [primaryColor]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { 
      style: 'currency', currency: language === 'pt' ? 'BRL' : 'USD' 
    }).format(val);

  const { pieData, totalExpense, expenseRatio } = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const income = transactions.filter(t => t.type === TransactionType.INCOME);
    const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
    const totalExp = expenses.reduce((acc, t) => acc + t.amount, 0);
    const categoryMap: Record<string, number> = {};
    expenses.forEach(t => categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount);
    const data = Object.entries(categoryMap).map(([catKey, value]) => ({ name: tTr.categories[catKey as any] || catKey, value }));
    const ratio = totalIncome > 0 ? Math.min(Math.round((totalExp / totalIncome) * 100), 999) : 0;
    return { pieData: data, totalExpense: totalExp, expenseRatio: ratio };
  }, [transactions, language, tTr]);

  if (transactions.length === 0) return (
    <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-theme rounded-full animate-spin"></div>
      <p className="text-[9px] font-black uppercase tracking-widest">Processando...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Gráfico Compacto para Web */}
      <div className="h-[200px] w-full relative mb-4 no-print">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none" animationDuration={1000}>
              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} className="outline-none" />)}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', background: '#fff' }} 
              itemStyle={{ fontWeight: '900', fontSize: '11px' }} 
              formatter={(value: number) => formatCurrency(value)} 
            />
            <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="font-black" style={{ fontSize: '28px', fill: primaryColor }}>{expenseRatio}%</text>
            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 font-black uppercase tracking-[0.3em]" style={{ fontSize: '8px' }}>{language === 'pt' ? 'Gasto' : 'Spent'}</text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda Web mais densa */}
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar no-print">
        {pieData.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between p-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent hover:border-theme/10 transition-all">
            <div className="flex items-center gap-2 truncate">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[index % chartColors.length] }}></div>
              <span className="text-[8px] font-black uppercase tracking-tight text-slate-400 truncate">{entry.name}</span>
            </div>
            <span className="text-[10px] font-black text-theme tabular-nums ml-2">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>

      {/* Exclusivo para Print (PDF) - Este sim deve ser bem legível e estruturado */}
      <div className="hidden print:block space-y-3 mt-6">
        {pieData.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }}></div>
              <span className="text-[11px] font-black uppercase text-slate-900">{entry.name}</span>
            </div>
            <div className="flex items-center gap-8">
               <span className="text-[10px] font-bold text-slate-400">{totalExpense > 0 ? Math.round((entry.value / totalExpense) * 100) : 0}%</span>
               <span className="text-[12px] font-black text-theme tabular-nums">{formatCurrency(entry.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialCharts;
