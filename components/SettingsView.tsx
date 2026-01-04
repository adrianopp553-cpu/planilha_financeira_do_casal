
import React, { useRef } from 'react';
import { AppSettings } from '../types';
import { translations } from '../translations';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onBack: () => void;
  language: 'pt' | 'en' | 'es';
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate, onBack, language }) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateSetting = (key: keyof AppSettings, value: any) => onUpdate({ ...settings, [key]: value });

  const themeOrWhite = !settings.lightMode ? 'text-white' : 'text-theme';
  const labelColor = !settings.lightMode ? 'text-slate-300' : 'text-slate-700';
  const secondaryLabelColor = !settings.lightMode ? 'text-slate-500' : 'text-slate-400';

  const handleExportData = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem('fincasal_data') || '[]'),
      settings: settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fincasal_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.transactions) {
          localStorage.setItem('fincasal_data', JSON.stringify(content.transactions));
          if (content.settings) {
            onUpdate(content.settings);
          }
          alert(language === 'pt' ? '✅ Dados importados com sucesso! Recarregando...' : '✅ Data imported successfully! Reloading...');
          window.location.reload();
        }
      } catch (err) {
        alert(language === 'pt' ? '❌ Erro ao importar arquivo. Verifique o formato.' : '❌ Error importing file. Check format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    const message = language === 'pt' 
      ? '⚠️ ATENÇÃO: Isso apagará todas as transações permanentemente. Continuar?' 
      : '⚠️ WARNING: This will delete all transactions permanently. Continue?';
    if (confirm(message)) {
      localStorage.removeItem('fincasal_data');
      localStorage.removeItem('fincasal_draft');
      alert(language === 'pt' ? 'Dados limpos. Recarregando...' : 'Data cleared. Reloading...');
      window.location.reload();
    }
  };

  return (
    <main className="pt-32 pb-40 px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-theme font-black text-xs uppercase tracking-widest mb-4 hover:gap-3 transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.saveAndBack}
        </button>
        <h1 className={`text-5xl md:text-6xl font-black tracking-tighter drop-shadow-sm transition-colors duration-300 ${themeOrWhite}`}>
          {t.settings}
        </h1>
      </div>

      <div className="space-y-8">
        {/* Gerenciamento de Dados */}
        <section className="bg-white/95 dark:bg-white/10 backdrop-blur-3xl p-8 rounded-[32px] shadow-sm border border-slate-200 dark:border-white/20 transition-all hover:shadow-md">
          <h2 className="text-xl font-black text-theme mb-8 flex items-center gap-3">
            <span className="text-2xl filter drop-shadow-sm">💾</span> {language === 'pt' ? 'Gerenciamento de Dados' : 'Data Management'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <button 
              onClick={handleExportData}
              className="flex flex-col items-center gap-4 p-6 bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-emerald-500/20 rounded-3xl hover:bg-emerald-500/20 transition-all group"
            >
              <span className="text-3xl transition-transform group-hover:-translate-y-1">📤</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 text-center">Exportar Backup</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-4 p-6 bg-blue-500/10 dark:bg-blue-500/20 border-2 border-blue-500/20 rounded-3xl hover:bg-blue-500/20 transition-all group"
            >
              <span className="text-3xl transition-transform group-hover:-translate-y-1">📥</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 text-center">Importar Backup</span>
              <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />
            </button>
            <button 
              onClick={handleClearAll}
              className="flex flex-col items-center gap-4 p-6 bg-rose-500/10 dark:bg-rose-500/20 border-2 border-rose-500/20 rounded-3xl hover:bg-rose-500/20 transition-all group"
            >
              <span className="text-3xl transition-transform group-hover:scale-110">🗑️</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 text-center">Limpar Tudo</span>
            </button>
          </div>
        </section>

        {/* Modo Claro (Toggle Sol) */}
        <section className="bg-white/95 dark:bg-white/10 backdrop-blur-3xl p-8 rounded-[32px] shadow-sm border border-slate-200 dark:border-white/20 flex items-center justify-between transition-all hover:shadow-md">
           <div className="flex items-center gap-5">
             <div className="w-12 h-12 rounded-2xl bg-theme/15 flex items-center justify-center text-2xl shadow-inner border border-theme/10">☀️</div>
             <div>
               <p className={`font-black text-lg leading-tight transition-colors duration-300 ${themeOrWhite}`}>{language === 'pt' ? 'Modo Claro' : 'Light Mode'}</p>
               <p className={`text-[10px] ${secondaryLabelColor} font-black uppercase tracking-[0.2em] mt-1`}>
                 {language === 'pt' ? 'Alta Visibilidade' : 'High Visibility'}
               </p>
             </div>
           </div>
           <button 
             onClick={() => updateSetting('lightMode', !settings.lightMode)} 
             className={`w-16 h-9 rounded-full transition-all relative p-1 ${settings.lightMode ? 'bg-theme' : 'bg-slate-300 dark:bg-white/20'}`}
           >
             <div className={`w-7 h-7 bg-white rounded-full transition-all shadow-lg ${settings.lightMode ? 'translate-x-7' : 'translate-x-0'}`} />
           </button>
        </section>

        {/* Idioma */}
        <section className="bg-white/95 dark:bg-white/10 backdrop-blur-3xl p-8 rounded-[32px] shadow-sm border border-slate-200 dark:border-white/20 transition-all hover:shadow-md">
          <h2 className="text-xl font-black text-theme mb-8 flex items-center gap-3">
            <span className="text-2xl filter drop-shadow-sm">🌍</span> {t.language}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {['pt', 'en', 'es'].map((id) => (
              <button 
                key={id} 
                onClick={() => updateSetting('language', id)} 
                className={`p-6 rounded-2xl border-2 transition-all text-center group ${settings.language === id ? 'border-theme bg-theme/10 dark:bg-theme/30 shadow-theme/10' : 'border-transparent bg-slate-100/50 dark:bg-white/5 hover:border-theme/30'}`}
              >
                <p className={`font-black text-sm transition-colors ${settings.language === id ? 'text-theme' : `${labelColor} group-hover:text-theme`}`}>
                  {id === 'pt' ? 'Português' : id === 'en' ? 'English' : 'Español'}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Paleta de Cores */}
        <section className="bg-white/95 dark:bg-white/10 backdrop-blur-3xl p-8 rounded-[32px] shadow-sm border border-slate-200 dark:border-white/20 transition-all hover:shadow-md">
          <h2 className="text-xl font-black text-theme mb-8 flex items-center gap-3">
            <span className="text-2xl filter drop-shadow-sm">🎨</span> {t.palette}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { id: 'ruby', label: 'Rubi Real', color: 'bg-red-600' },
              { id: 'classic', label: 'Azul Marinho', color: 'bg-indigo-600' },
              { id: 'forest', label: 'Floresta Verde', color: 'bg-emerald-600' }
            ].map((theme) => (
              <button 
                key={theme.id} 
                onClick={() => updateSetting('theme', theme.id)} 
                className={`p-6 rounded-2xl border-2 flex items-center justify-center gap-4 transition-all group ${settings.theme === theme.id ? 'border-theme bg-theme/10 dark:bg-theme/30 shadow-theme/10' : 'border-transparent bg-slate-100/50 dark:bg-white/5 hover:border-theme/30'}`}
              >
                <div className={`w-8 h-8 rounded-full ${theme.color} shadow-lg shadow-black/20 ring-2 ring-white/10`} />
                <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${settings.theme === theme.id ? 'text-theme' : `${labelColor} group-hover: