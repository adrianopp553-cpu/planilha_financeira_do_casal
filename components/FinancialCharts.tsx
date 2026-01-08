
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
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setPrimaryColor(style.getPropertyValue('--primary').trim() || '#4f46e5');
  }, [transactions]);

  const chartColors = useMemo(() => [
    primaryColor, 
    primaryColor + 'cc', 
    primaryColor + 'aa', 
    primaryColor + '88', 
    primaryColor + '66', 
    primaryColor + '44'
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

  if (transactions.length === 0) return <div className="h-48 flex items-center justify-center text-gray-300 text-sm italic">{language === 'pt' ? 'Aguardando registros...' : 'Awaiting records...'}</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Lista de Categorias no Topo */}
      <div className="grid grid-cols-1 gap-2 mb-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar no-print">
        {pieData.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm border border-transparent hover:border-theme-light p-3 rounded-2xl transition-all duration-300 group">
            <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: chartColors[index % chartColors.length] }}></div><span className="truncate max-w-[120px]">{entry.name}</span></div>
            <div className="flex items-center gap-2"><span className="text-slate-400 text-[10px] font-medium">{totalExpense > 0 ? Math.round((entry.value / totalExpense) * 100) : 0}%</span><span className="text-theme font-black">{formatCurrency(entry.value)}</span></div>
          </div>
        ))}
      </div>

      {/* Versão simplificada para Impressão no Topo */}
      <div className="hidden print:block mb-6 space-y-2">
        {pieData.slice(0, 6).map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between border-b border-slate-100 pb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }}></div>
              <span className="text-[10px] font-black uppercase text-slate-700">{entry.name}</span>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[9px] font-bold text-slate-400">{Math.round((entry.value / totalExpense) * 100)}%</span>
               <span className="text-[10px] font-black text-theme">{formatCurrency(entry.value)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico na Base */}
      <div className="flex-1 min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} innerRadius={65} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none" animationDuration={1000}>
              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} className="outline-none" />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 35px -12px rgba(0,0,0,0.1)', padding: '16px', background: '#fff' }} itemStyle={{ fontWeight: '800', fontSize: '13px', color: primaryColor }} formatter={(value: number) => formatCurrency(value)} />
            <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="font-black" style={{ fontSize: '28px', fill: primaryColor }}>{expenseRatio}%</text>
            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 font-bold uppercase tracking-[0.2em]" style={{ fontSize: '9px' }}>{language === 'pt' ? 'Fluxo' : 'Flow'}</text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialCharts;
