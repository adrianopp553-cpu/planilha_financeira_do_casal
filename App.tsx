
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Transaction, FinancialSummary, AppSettings } from './types.ts';
import { translations } from './translations.ts';
import SummaryCards from './components/SummaryCards.tsx';
import TransactionForm from './components/TransactionForm.tsx';
import TransactionTable from './components/TransactionTable.tsx';

const FinancialCharts = lazy(() => import('./components/FinancialCharts.tsx'));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx'));
const ResultsView = lazy(() => import('./components/ResultsView.tsx'));
const SettingsView = lazy(() => import('./components/SettingsView.tsx'));
const AboutSection = lazy(() => import('./components/AboutSection.tsx'));

const FCLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Borda externa do Squircle */}
    <rect x="5" y="5" width="90" height="90" rx="28" stroke="currentColor" strokeWidth="2.5" className="opacity-40" />
    {/* Borda interna Emerald */}
    <rect x="22" y="22" width="56" height="56" rx="14" stroke="#00ffa3" strokeWidth="4" />
    {/* Glifo F] */}
    <path d="M40 38 H 55 V 43 H 45 V 48 H 53 V 53 H 45 V 62 H 40 Z" fill="white" />
    <path d="M62 38 V 62 M 62 38 H 58 M 62 62 H 58" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ViewLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 animate-in fade-in duration-700">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-theme/10 border-t-theme rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-theme rounded-full animate-ping"></div>
      </div>
    </div>
    <div className="text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-theme mb-3">FinControl Pro</p>
      <div className="w-40 h-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-theme animate-[progress_1.5s_infinite_ease-in-out]"></div>
      </div>
    </div>
    <style>{`@keyframes progress { 0% { width: 0%; transform: translateX(-100%); } 50% { width: 60%; transform: translateX(50%); } 100% { width: 100%; transform: translateX(100%); } }`}</style>
  </div>
);

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [view, setView] = useState<'home' | 'results' | 'settings'>('home');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    language: 'pt',
    theme: 'forest',
    lightMode: false,
    fontSize: 'medium',
    fontFamily: 'sans'
  });

  const t = translations[settings.language];

  useEffect(() => {
    const loadSaved = () => {
      const savedData = localStorage.getItem('fincontrol_data');
      const savedSettings = localStorage.getItem('fincontrol_settings');
      if (savedData) try { setTransactions(JSON.parse(savedData)); } catch (e) { console.error(e); }
      if (savedSettings) try { setSettings(prev => ({...prev, ...JSON.parse(savedSettings)})); } catch (e) { console.error(e); }
      setIsLoaded(true);
    };
    loadSaved();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fincontrol_data', JSON.stringify(transactions));
      localStorage.setItem('fincontrol_settings', JSON.stringify(settings));
      
      const root = document.documentElement;
      const fontMap = { 
        sans: "'Plus Jakarta Sans', sans-serif", 
        serif: "'Playfair Display', serif", 
        inter: "'Inter', sans-serif" 
      };
      root.style.setProperty('--app-font', fontMap[settings.fontFamily]);
      
      const sizeMap = { small: '14px', medium: '16px', large: '18px' };
      root.style.fontSize = sizeMap[settings.fontSize];
      
      document.body.className = `theme-${settings.theme} ${!settings.lightMode ? 'dark-mode' : ''} transition-all duration-700 min-h-screen`;
    }
  }, [transactions, settings, isLoaded]);

  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'Entrada').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Saída').reduce((acc, t) => acc + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [transactions]);

  const navigateTo = (newView: 'home' | 'results' | 'settings') => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isLoaded) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-6">
      <FCLogo className="w-20 h-20 text-emerald-400 animate-pulse" />
      <p className="text-theme font-black tracking-[0.6em] text-[10px] uppercase opacity-50">Iniciando Core Engine...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative z-10 selection:bg-theme selection:text-white" style={{ fontFamily: 'var(--app-font)' }}>
      {/* Navbar com Novo Logo Estilizado */}
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-3xl transition-all duration-500 no-print">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => navigateTo('home')}>
            <div className="w-14 h-14 bg-black dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 transition-all group-hover:scale-105 group-hover:-rotate-2">
              <FCLogo className="h-10 w-10 text-white" />
            </div>
            <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
              Fin<span className="text-theme">Control</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/10">
            <button onClick={() => navigateTo('home')} className={`px-8 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${view === 'home' ? 'bg-white dark:bg-theme text-theme dark:text-white shadow-2xl' : 'text-gray-500 dark:text-white/40 hover:text-theme'}`}>{t.dashboard}</button>
            <button onClick={() => navigateTo('results')} className={`px-8 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${view === 'results' ? 'bg-white dark:bg-theme text-theme dark:text-white shadow-2xl' : 'text-gray-500 dark:text-white/40 hover:text-theme'}`}>{t.results}</button>
            <button onClick={() => navigateTo('settings')} className={`p-2.5 rounded-2xl transition-all ${view === 'settings' ? 'bg-white dark:bg-theme text-theme dark:text-white shadow-2xl' : 'text-gray-500 dark:text-white/40 hover:text-theme'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 min-h-screen">
        <Suspense fallback={<ViewLoader />}>
          {view === 'home' ? (
            <div className="animate-in fade-in duration-1000">
              {/* Hero Section */}
              <section className="pt-48 pb-32 px-6 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-theme/5 rounded-full blur-[160px] pointer-events-none opacity-50 animate-pulse"></div>
                <h1 className="text-6xl md:text-9xl font-black text-gray-900 dark:text-white mb-10 tracking-tighter leading-[0.9] perspective-1000 uppercase">
                  Relatório de <br />
                  <span className="text-theme inline-block hover:scale-105 transition-transform cursor-default" style={{ filter: 'drop-shadow(0 0 20px var(--primary-shadow))' }}>
                    Saúde Financeira
                  </span>
                </h1>
                <p className="text-xs tracking-[0.5em] text-gray-400 uppercase font-black mb-16">Análise Prospectiva & Inteligência de Dados • PRO EDITION</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <button onClick={() => document.getElementById('dash-content')?.scrollIntoView({ behavior: 'smooth' })} className="w-full md:w-auto px-16 py-7 bg-theme text-black font-black uppercase tracking-widest text-xs rounded-3xl shadow-2xl shadow-theme/40 hover:brightness-110 active:scale-95 transition-all duration-500">Acessar Painel</button>
                  <button onClick={() => navigateTo('results')} className="w-full md:w-auto px-16 py-7 bg-white dark:bg-white/5 text-gray-900 dark:text-white font-black uppercase tracking-widest text-xs rounded-3xl border border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all">{t.results}</button>
                </div>
              </section>

              <main id="dash-content" className="max-w-7xl mx-auto px-6 pb-24 scroll-mt-24 relative z-10">
                <SummaryCards summary={summary} language={settings.language} />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-16">
                  <div className="lg:col-span-8 space-y-16">
                    <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-white/5 rounded-[48px] animate-pulse"></div>}>
                      <AIAssistant transactions={transactions} language={settings.language} />
                    </Suspense>
                    
                    <div id="new-transaction-section">
                      <TransactionForm 
                        onAdd={(tx) => setTransactions(prev => [tx, ...prev])} 
                        onUpdate={(updated) => { setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t)); setEditingTransaction(null); }}
                        editingTransaction={editingTransaction}
                        onCancelEdit={() => setEditingTransaction(null)}
                        language={settings.language}
                      />
                    </div>
                    
                    <TransactionTable 
                      transactions={transactions} 
                      onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))}
                      onEdit={(tx) => { setEditingTransaction(tx); document.getElementById('new-transaction-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                      language={settings.language}
                    />
                  </div>
                  
                  <div className="lg:col-span-4 sticky top-24">
                    <div className="bg-white/80 dark:bg-black/30 p-10 rounded-[48px] shadow-2xl border border-black/5 dark:border-white/10 backdrop-blur-3xl">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-theme mb-8 border-b border-theme/10 pb-4">Visão de Fluxo</h3>
                      <Suspense fallback={<div className="h-64 flex flex-col items-center justify-center gap-4 text-[10px] text-theme/40 font-black uppercase tracking-widest"><div className="w-8 h-8 border-2 border-theme/20 border-t-theme rounded-full animate-spin"></div>Calculando...</div>}>
                        <FinancialCharts transactions={transactions} language={settings.language} />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </main>

              <AboutSection language={settings.language} lightMode={settings.lightMode} />
            </div>
          ) : view === 'results' ? (
            <ResultsView transactions={transactions} summary={summary} onBack={() => navigateTo('home')} language={settings.language} lightMode={settings.lightMode} />
          ) : (
            <SettingsView settings={settings} onUpdate={setSettings} onBack={() => navigateTo('home')} language={settings.language} summary={summary} transactions={transactions} />
          )}
        </Suspense>
      </div>

      <footer className="bg-gray-50/50 dark:bg-black/40 border-t border-black/5 dark:border-white/10 py-24 px-6 no-print">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-4">
            <FCLogo className="h-10 w-10 text-theme" />
            <span className="text-xl font-black tracking-tighter uppercase">FinControl <span className="text-theme">Pro</span></span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-white/20 font-black uppercase tracking-[0.6em] max-w-sm mx-auto leading-relaxed italic">Engineered for absolute financial sovereignty. v2.5.0 Premium</p>
          <div className="pt-8 border-t border-black/5 dark:border-white/5">
            <p className="text-[9px] text-gray-300 dark:text-white/10 font-bold uppercase tracking-widest">© 2025 ADRIANO P. SANTOS INDUSTRIES</p>
          </div>
        </div>
      </footer>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-white/90 dark:bg-black/80 backdrop-blur-3xl rounded-[32px] border border-black/5 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.3)] z-50 py-5 flex items-center justify-around no-print">
        <button onClick={() => navigateTo('home')} className={`flex flex-col items-center gap-2 transition-all ${view === 'home' ? 'text-theme scale-110' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[8px] font-black uppercase tracking-widest">{t.dashboard}</span>
        </button>
        <button onClick={() => navigateTo('results')} className={`flex flex-col items-center gap-2 transition-all ${view === 'results' ? 'text-theme scale-110' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[8px] font-black uppercase tracking-widest">{t.results}</span>
        </button>
        <button onClick={() => navigateTo('settings')} className={`flex flex-col items-center gap-2 transition-all ${view === 'settings' ? 'text-theme scale-110' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          <span className="text-[8px] font-black uppercase tracking-widest">Ajustes</span>
        </button>
      </div>
    </div>
  );
};

export default App;
