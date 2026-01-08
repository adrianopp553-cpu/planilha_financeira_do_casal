
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
    <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
      <div className="w-12 h-12 border-2 border-slate-200 border-t-theme rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest">{language === 'pt' ? 'Processando Dados...' : 'Processing Data...'}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      {/* Legenda Estruturada no Topo */}
      <div className="grid grid-cols-2 gap-3 mb-10 max-h-48 overflow-y-auto pr-2 custom-scrollbar no-print">
        {pieData.map((entry, index) => (
          <div key={entry.name} className="flex flex-col p-4 bg-black/5 dark:bg-white/[0.03] rounded-2xl border border-transparent hover:border-theme/20 transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }}></div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">{entry.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500">{totalExpense > 0 ? Math.round((entry.value / totalExpense) * 100) : 0}%</span>
              <span className="text-xs font-black text-theme tabular-nums">{formatCurrency(entry.value)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de Donut */}
      <div className="flex-1 min-h-[260px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} innerRadius={75} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none" animationDuration={1500} animationBegin={200}>
              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} className="outline-none" />)}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', background: '#fff' }} 
              itemStyle={{ fontWeight: '900', fontSize: '12px' }} 
              formatter={(value: number) => formatCurrency(value)} 
            />
            <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="font-black" style={{ fontSize: '36px', fill: primaryColor }}>{expenseRatio}%</text>
            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 font-black uppercase tracking-[0.4em]" style={{ fontSize: '9px' }}>{language === 'pt' ? 'Impacto' : 'Impact'}</text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialCharts;
