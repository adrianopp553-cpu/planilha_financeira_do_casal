
import React, { useState, useEffect } from 'react';
import { Category, TransactionType, Transaction } from '../types';
import { translations } from '../translations';

interface TransactionFormProps {
  onAdd: (transaction: Transaction) => void;
  onUpdate?: (transaction: Transaction) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
  language: 'pt' | 'en' | 'es';
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onUpdate, editingTransaction, onCancelEdit, language }) => {
  const t = translations[language];
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [isSuccess, setIsSuccess] = useState(false);

  // Carregar rascunho do localStorage apenas na montagem inicial
  useEffect(() => {
    if (!editingTransaction) {
      const savedDraft = localStorage.getItem('fincasal_draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setDescription(draft.description || '');
          setAmount(draft.amount || '');
          setCategory(draft.category || '');
          setType(draft.type || TransactionType.EXPENSE);
        } catch (e) {
          console.error("Erro ao carregar rascunho", e);
        }
      }
    }
  }, []);

  // Salvar rascunho sempre que os campos mudarem (se não estiver editando)
  useEffect(() => {
    if (!editingTransaction) {
      const draft = { description, amount, category, type };
      localStorage.setItem('fincasal_draft', JSON.stringify(draft));
    }
  }, [description, amount, category, type, editingTransaction]);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setType(editingTransaction.type);
    } else {
      // Quando paramos de editar, voltamos para o que estava no rascunho ou resetamos
      // Mas o useEffect do mount já lida com o rascunho inicial.
    }
  }, [editingTransaction]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setType(TransactionType.EXPENSE);
    localStorage.removeItem('fincasal_draft');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0 || !category) {
      alert(language === 'pt' ? '⚠️ Preencha todos os campos!' : '⚠️ Fill all fields!');
      return;
    }

    const transactionData: Transaction = {
      id: editingTransaction ? editingTransaction.id : `tx-${Date.now()}`,
      description: description.trim(),
      amount: numericAmount,
      category: category as Category,
      type,
      date: editingTransaction ? editingTransaction.date : new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US'),
    };

    editingTransaction && onUpdate ? onUpdate(transactionData) : onAdd(transactionData);
    setIsSuccess(true);
    resetForm(); // Limpa rascunho após sucesso
    if (onCancelEdit) onCancelEdit();
    setTimeout(() => setIsSuccess(false), 2000);
  };

  return (
    <div className={`p-8 md:p-10 rounded-[40px] shadow-sm border transition-all duration-500 ${editingTransaction ? 'bg-theme-light dark:bg-theme/20 border-theme' : 'bg-white dark:bg-white/5 border-theme-light dark:border-white/10'} mb-8 overflow-hidden backdrop-blur-xl`}>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{editingTransaction ? t.adjustRecord : t.newRecord}</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">
            {editingTransaction 
              ? (language === 'pt' ? 'Alterando um registro existente.' : 'Changing an existing record.')
              : (language === 'pt' ? 'Seu rascunho é salvo automaticamente.' : 'Your draft is saved automatically.')}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${editingTransaction ? 'bg-theme text-white' : 'bg-theme-light dark:bg-theme/20 text-theme'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={editingTransaction ? "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
           </svg>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">{t.whatHappened}</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-2 border-theme-light/50 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:border-theme rounded-3xl outline-none transition-all duration-300 font-bold text-gray-700 dark:text-white shadow-sm" placeholder={language === 'pt' ? "Ex: Jantar romântico..." : "Ex: Romantic dinner..."} />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">{t.value}</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-theme font-black text-lg">{language === 'pt' ? 'R$' : '$'}</span>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-gray-50/50 dark:bg-white/5 border-2 border-theme-light/50 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:border-theme rounded-3xl outline-none transition-all duration-300 font-black text-gray-800 dark:text-white shadow-sm" placeholder="0,00" />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">{t.type}</label>
            <div className="relative flex bg-gray-100/80 dark:bg-white/5 p-1.5 rounded-[28px] h-[72px] cursor-pointer select-none border border-gray-100 dark:border-white/10 shadow-inner">
              <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[22px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${type === TransactionType.EXPENSE ? 'left-1.5 bg-red-700 shadow-red-900/40' : 'left-[calc(50%+1.5px)] bg-emerald-600 shadow-emerald-900/40'}`} />
              <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`relative z-10 flex-1 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${type === TransactionType.EXPENSE ? 'text-white' : 'text-gray-400'}`}>{t.expenses}</button>
              <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`relative z-10 flex-1 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${type === TransactionType.INCOME ? 'text-white' : 'text-gray-400'}`}>{t.income}</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{language === 'pt' ? 'Categoria' : 'Category'}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Object.values(Category).map((cat) => {
              const isSelected = category === cat;
              const translatedLabel = t.categories[cat];
              const emoji = translatedLabel.split(' ')[0];
              const text = translatedLabel.split(' ').slice(1).join(' ');
              return (
                <button key={cat} type="button" onClick={() => setCategory(cat)} className={`relative flex flex-col items-center justify-center p-4 rounded-[28px] border-2 transition-all duration-300 group ${isSelected ? 'bg-theme border-theme shadow-theme scale-105' : 'bg-gray-50/50 dark:bg-white/5 border-theme-light/30 dark:border-white/10 hover:border-theme hover:bg-theme-light/10 dark:hover:bg-white/10 hover:-translate-y-1'}`}>
                  <span className={`text-2xl mb-2 transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-125'}`}>{emoji}</span>
                  <span className={`text-[10px] font-black uppercase tracking-tight text-center leading-tight ${isSelected ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-theme dark:group-hover:text-white'}`}>{text}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-theme-light dark:border-white/10">
          <div className="flex flex-col">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.15em]">{language === 'pt' ? 'Seu progresso não será perdido.' : 'Your progress won\'t be lost.'}</p>
            {editingTransaction && (
              <button 
                type="button" 
                onClick={() => { resetForm(); onCancelEdit && onCancelEdit(); }} 
                className="text-xs text-theme font-black uppercase tracking-widest mt-2 hover:underline text-left"
              >
                {language === 'pt' ? 'Cancelar Edição' : 'Cancel Edit'}
              </button>
            )}
          </div>
          <button type="submit" className={`relative w-full md:w-auto px-20 py-6 font-black rounded-3xl shadow-2xl transition-all duration-500 flex items-center justify-center gap-4 group overflow-hidden ${isSuccess ? 'bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-theme text-white shadow-theme hover:brightness-110'}`}>
            {isSuccess ? <span>✅ {language === 'pt' ? 'Concluído!' : 'Done!'}</span> : <><span className="relative z-10 uppercase tracking-widest text-sm">{editingTransaction ? t.update : t.confirm}</span><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-2 transition-transform relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
