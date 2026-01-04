
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { translations } from '../translations';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  language: 'pt' | 'en' | 'es';
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete, onEdit, language }) => {
  const tTr = translations[language];
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { 
      style: 'currency', currency: language === 'pt' ? 'BRL' : 'USD' 
    }).format(val);

  return (
    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-black/5 border border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto border-collapse">
          <thead className="bg-gray-100/50 dark:bg-white/5 border-b border-black/5 dark:border-white/5 backdrop-blur-md">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] w-24">Data</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{tTr.description}</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] hidden sm:table-cell text-center">{tTr.category}</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">{tTr.value}</th>
              <th className="px-6 py-5 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-gray-400 dark:text-gray-600 italic">
                      {language === 'pt' ? 'Nenhum registro encontrado' : 'No records found'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="group hover:bg-theme/5 dark:hover:bg-theme/10 transition-all duration-300">
                  <td className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 tabular-nums">
                    {t.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-theme transition-colors">
                        {t.description}
                      </span>
                      <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 sm:hidden uppercase tracking-widest mt-0.5">
                        {tTr.categories[t.category]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                      {tTr.categories[t.category]}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-right tabular-nums ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => onEdit(t)} 
                        className="text-gray-400 hover:text-theme dark:hover:text-white transition-all p-2 hover:bg-theme/10 dark:hover:bg-theme rounded-xl"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => confirm(language === 'pt' ? 'Remover este registro?' : 'Remove this record?') && onDelete(t.id)} 
                        className="text-gray-400 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl"
                        title="Excluir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
