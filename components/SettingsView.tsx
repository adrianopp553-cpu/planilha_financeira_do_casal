
import React, { useRef } from 'react';
import { AppSettings, FinancialSummary, Transaction } from '../types';
import { translations } from '../translations';

const FCLogo = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 35 H 58 V 42 H 40 V 48 H 55 V 55 H 40 V 70 H 32 V 35 Z" fill="currentColor" />
    <path d="M62 38 C 72 38, 78 45, 78 55 C 78 65, 72 72, 62 72 M 62 48 C 68 48, 70 52, 70 55 C 70 58, 68 62, 62 62" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
  </svg>
);

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onBack: () => void;
  language: 'pt' | 'en' | 'es';
  summary?: FinancialSummary;
  transactions?: Transaction[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate, onBack, language, summary, transactions = [] }) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateSetting = (key: keyof AppSettings, value: any) => onUpdate({ ...settings, [key]: value });

  const themeOrWhite = !settings.lightMode ? 'text-white' : 'text-theme';
  const labelColor = !settings.lightMode ? 'text-slate-300' : 'text-slate-700';
  const secondaryLabelColor = !settings.lightMode ? 'text-slate-500' : 'text-slate-400';

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { 
      style: 'currency', 
      currency: language === 'pt' ? 'BRL' : 'USD' 
    }).format(val);

  const handleExportData = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem('fincontrol_data') || '[]'),
      settings: settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fincontrol_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const oldTitle = document.title;
    const dateStr = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US').replace(/\//g, '-');
    document.title = `FinControl_Report_${dateStr}`;
    window.print();
    document.title = oldTitle;
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.transactions) {
          localStorage.setItem('fincontrol_data', JSON.stringify(content.transactions));
          if (content.settings) onUpdate(content.settings);
          alert(language === 'pt' ? '✅ Backup Restaurado!' : '✅ Backup Restored!');
          window.location.reload();
        }
      } catch (err) {
        alert(language === 'pt' ? '❌ Erro ao ler arquivo.' : '❌ File error.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (confirm(language === 'pt' ? '⚠️ DELETAR TUDO?' : '⚠️ DELETE ALL?')) {
      localStorage.removeItem('fincontrol_data');
      localStorage.removeItem('fincontrol_draft');
      window.location.reload();
    }
  };

  return (
    <main className="pt-32 pb-48 px-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* SEÇÃO DE IMPRESSÃO - DOCUMENTO DE ALTO CONTRASTE */}
      <div className="hidden print:block w-full text-black bg-white font-sans">
        <div className="flex justify-between items-end border-b-4 border-black pb-8 mb-10">
           <div className="flex items-center gap-6">
             <FCLogo className="w-16 h-16 text-black" />
             <div>
               <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Extrato Operacional</h1>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Relatório Consolidado de Transações • FinControl Pro</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Data do Documento</p>
             <p className="text-2xl font-black tabular-nums leading-none">{new Date().toLocaleDateString()}</p>
           </div>
        </div>
        
        {summary && (
          <div className="grid grid-cols-3 gap-0 mb-12 border-2 border-black divide-x-2 divide-black">
            <div className="p-8 text-center">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">Total Créditos</p>
              <p className="text-2xl font-black text-emerald-600 tabular-nums">{formatCurrency(summary.totalIncome)}</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">Total Débitos</p>
              <p className="text-2xl font-black text-rose-600 tabular-nums">{formatCurrency(summary.totalExpense)}</p>
            </div>
            <div className="p-8 text-center bg-slate-50">
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-3">Disponível</p>
              <p className="text-2xl font-black text-black tabular-nums">{formatCurrency(summary.balance)}</p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-6 text-black border-l-8 border-black pl-4 py-1">Histórico de Atividade</h2>
          <div className="border border-slate-200 rounded-none overflow-hidden">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-black">
                  <th className="py-4 px-4 font-black uppercase tracking-wider text-slate-500 w-24">Data</th>
                  <th className="py-4 px-4 font-black uppercase tracking-wider text-slate-500">Descrição do Lançamento</th>
                  <th className="py-4 px-4 font-black uppercase tracking-wider text-slate-500 text-right">Valor Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="page-break-inside-avoid">
                    <td className="py-4 px-4 tabular-nums text-slate-400 font-bold">{tx.date}</td>
                    <td className="py-4 px-4">
                      <span className="font-black text-black block text-xs">{tx.description}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{tx.category}</span>
                    </td>
                    <td className={`py-4 px-4 text-right font-black tabular-nums text-xs ${tx.type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'Entrada' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-100 text-center flex flex-col items-center">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">Autenticação: FinControl.Audit.2025.SECURE</p>
            <div className="w-24 h-0.5 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* DASHBOARD DE CONFIGURAÇÕES (NO-PRINT) */}
      <div className="mb-16 no-print">
        <button 
          onClick={onBack} 
          className="flex items-center gap-3 text-theme font-black text-xs uppercase tracking-[0.3em] mb-6 hover:gap-5 transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.saveAndBack}
        </button>
        <h1 className={`text-6xl md:text-8xl font-black tracking-tighter transition-colors duration-500 ${themeOrWhite}`}>
          {t.settings}
        </h1>
      </div>

      <div className="space-y-10 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-10 rounded-[48px] border border-slate-200 dark:border-white/10">
            <h2 className="text-xs font-black text-theme uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
              <span className="w-1.5 h-1.5 bg-theme rounded-full animate-ping"></span> {t.language}
            </h2>
            <div className="flex flex-col gap-3">
              {['pt', 'en', 'es'].map((id) => (
                <button 
                  key={id} 
                  onClick={() => updateSetting('language', id)} 
                  className={`p-5 rounded-3xl border-2 transition-all text-left group flex items-center justify-between ${settings.language === id ? 'border-theme bg-theme/5 shadow-inner' : 'border-transparent bg-slate-50/50 dark:bg-white/5 hover:border-theme/30'}`}
                >
                  <span className={`font-black text-sm uppercase tracking-widest ${settings.language === id ? 'text-theme' : `${labelColor}`}`}>
                    {id === 'pt' ? 'Português' : id === 'en' ? 'English' : 'Español'}
                  </span>
                  {settings.language === id && <span className="text-theme">●</span>}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-10 rounded-[48px] border border-slate-200 dark:border-white/10">
            <h2 className="text-xs font-black text-theme uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
               <span className="w-1.5 h-1.5 bg-theme rounded-full animate-ping"></span> {t.palette}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'ruby', label: 'Ruby Crimson', color: 'bg-red-500' },
                { id: 'classic', label: 'Hyper Indigo', color: 'bg-indigo-500' },
                { id: 'forest', label: 'Emerald Mint', color: 'bg-emerald-500' }
              ].map((theme) => (
                <button 
                  key={theme.id} 
                  onClick={() => updateSetting('theme', theme.id)} 
                  className={`p-5 rounded-3xl border-2 flex items-center justify-between transition-all group ${settings.theme === theme.id ? 'border-theme bg-theme/5' : 'border-transparent bg-slate-50/50 dark:bg-white/5 hover:border-theme/30'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-2xl ${theme.color} shadow-lg ring-4 ring-white/10`} />
                    <span className={`text-sm font-black uppercase tracking-widest ${settings.theme === theme.id ? 'text-theme' : `${labelColor}`}`}>
                      {theme.label}
                    </span>
                  </div>
                  {settings.theme === theme.id && <span className="text-theme">●</span>}
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-10 rounded-[48px] border border-slate-200 dark:border-white/10 flex items-center justify-between">
           <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-theme/10 flex items-center justify-center text-3xl shadow-inner border border-theme/20">
               {settings.lightMode ? '☀️' : '🌙'}
             </div>
             <div>
               <p className={`font-black text-xl leading-tight transition-colors duration-500 ${themeOrWhite}`}>
                 {language === 'pt' ? 'Alta Visibilidade' : 'High Visibility'}
               </p>
               <p className={`text-[10px] ${secondaryLabelColor} font-black uppercase tracking-[0.3em] mt-1.5`}>
                 {language === 'pt' ? 'Alternar entre claro e escuro' : 'Toggle between light and dark'}
               </p>
             </div>
           </div>
           <button 
             onClick={() => updateSetting('lightMode', !settings.lightMode)} 
             className={`w-20 h-10 rounded-full transition-all relative p-1.5 ${settings.lightMode ? 'bg-theme shadow-[0_0_20px_var(--primary-shadow)]' : 'bg-slate-300 dark:bg-white/10'}`}
           >
             <div className={`w-7 h-7 bg-white rounded-full transition-all shadow-2xl ${settings.lightMode ? 'translate-x-10' : 'translate-x-0'}`} />
           </button>
        </section>

        <section className="bg-slate-900 dark:bg-white/5 p-12 rounded-[56px] border border-white/10 shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <FCLogo className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xs font-black text-theme uppercase tracking-[0.5em] mb-12 flex items-center gap-4">
              <span className="w-2 h-2 bg-theme rounded-full"></span> {language === 'pt' ? 'Central de Arquivos' : 'Files Central'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <button onClick={handleExportData} className="flex flex-col items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-[40px] hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                <div className="text-4xl transition-transform group-hover:-translate-y-2">📦</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-emerald-400 text-center">Exportar JSON</span>
              </button>
              <button onClick={handleExportPDF} className="flex flex-col items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-[40px] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group">
                <div className="text-4xl transition-transform group-hover:-translate-y-2">📄</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-indigo-400 text-center">Exportar PDF</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-[40px] hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group">
                <div className="text-4xl transition-transform group-hover:-translate-y-2">📥</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-blue-400 text-center">Importar Backup</span>
                <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />
              </button>
              <button onClick={handleClearAll} className="flex flex-col items-center gap-6 p-8 bg-rose-500/5 border border-rose-500/10 rounded-[40px] hover:bg-rose-500/20 hover:border-rose-500/30 transition-all group">
                <div className="text-4xl transition-transform group-hover:rotate-12">💣</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/80 group-hover:text-rose-400 text-center">Reset Total</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SettingsView;
