
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Transaction, FinancialSummary, AppSettings } from './types';
import { translations } from './translations';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionTable from './components/TransactionTable';
import AIAssistant from './components/AIAssistant';

// Carregamento Preguiçoso (Code Splitting)
const FinancialCharts = lazy(() => import('./components/FinancialCharts'));
const ResultsView = lazy(() => import('./components/ResultsView'));
const SettingsView = lazy(() => import('./components/SettingsView'));

const FCLogo = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g style={{ filter: 'url(#logoGlow)' }}>
      <path d="M10 75C25 70 35 45 50 50C65 55 75 35 85 30L90 18L78 24L83 31C75 38 65 58 50 53C35 48 25 73 10 78V75Z" fill="currentColor" fillOpacity="0.4" />
      <path d="M10 75C25 70 35 45 50 50C65 55 75 35 85 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M85 30L78 35L90 18L93 30L85 30Z" fill="currentColor" />
    </g>
    <path d="M50 92L43.5 86C18 64.5 4 52.5 4 37C4 24.5 13.5 15 26 15C33.5 15 40.5 18.5 45 24C49.5 18.5 56.5 15 64 15C76.5 15 86 24.5 86 37C86 52.5 72 64.5 46.5 86L50 92Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
    <path d="M28 38H44V43H34V48H42V53H34V65H28V38Z" fill="currentColor" />
    <path d="M72 45C72 41 69 38 65 38H55C51 38 48 41 48 45V58C48 62 51 65 55 65H65C69 65 72 62 72 58V55H66V59H54V42H66V46H72V45Z" fill="currentColor" />
  </svg>
);

const ViewLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
    <div className="w-12 h-12 border-4 border-theme/20 border-t-theme rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme/60">Sincronizando Galáxia...</p>
  </div>
);

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [view, setView] = useState<'home' | 'results' | 'settings'>('home');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    language: 'pt',
    theme: 'classic',
    lightMode: false,
    fontSize: 'medium',
    fontFamily: 'sans'
  });

  const t = translations[settings.language];

  useEffect(() => {
    const savedData = localStorage.getItem('fincasal_data');
    const savedSettings = localStorage.getItem('fincasal_settings');
    if (savedData) try { setTransactions(JSON.parse(savedData)); } catch (e) { console.error(e); }
    if (savedSettings) try { setSettings(JSON.parse(savedSettings)); } catch (e) { console.error(e); }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fincasal_data', JSON.stringify(transactions));
      localStorage.setItem('fincasal_settings', JSON.stringify(settings));
      const root = document.documentElement;
      const fontMap = { sans: "'Plus Jakarta Sans', sans-serif", serif: "'Playfair Display', serif", inter: "'Inter', sans-serif" };
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

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-black text-theme font-black italic tracking-widest animate-pulse">FINCASAL PRO...</div>;

  return (
    <div className="min-h-screen flex flex-col relative z-10" style={{ fontFamily: 'var(--app-font)' }}>
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-3xl transition-all duration-500 no-print">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('home')}>
            <div className="w-12 h-12 bg-theme rounded-[16px] flex items-center justify-center shadow-lg shadow-theme/30 transition-all group-hover:scale-110 group-hover:rotate-3 active:scale-95">
              <FCLogo className="h-8 w-8 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tighter">Fin<span className="text-theme">Casal</span></span>
          </div>
          <div className="hidden md:flex items-center gap-1 p-1 bg-gray-200/50 dark:bg-white/5 rounded-[20px] border border-black/5 dark:border-white/10 backdrop-blur-md">
            <button onClick={() => navigateTo('home')} className={`px-6 py-2.5 rounded-[16px] text-[11px] font-black uppercase tracking-widest transition-all ${view === 'home' ? 'bg-white dark:bg-theme text-theme dark:text-white shadow-xl' : 'text-gray-500 dark:text-white/60 hover:text-theme dark:hover:text-white'}`}>{t.dashboard}</button>
            <button onClick={() => navigateTo('results')} className={`px-6 py-2.5 rounded-[16px] text-[11px] font-black uppercase tracking-widest transition-all ${view === 'results' ? 'bg-white dark:bg-theme text-theme dark:text-white shadow-xl' : 'text-gray-500 dark:text-white/60 hover:text-theme dark:hover:text-white'}`}>{t.results}</button>
            <button onClick={() => navigateTo('settings')} className={`p-2.5 rounded-[16px] transition-all ${view === 'settings' ? 'bg-white dark:bg-theme text-theme dark:text-white shadow-xl' : 'text-gray-500 dark:text-white/60 hover:text-theme dark:hover:text-white'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg></button>
          </div>
        </div>
      </nav>

      <div className="flex-1 pb-24 md:pb-0">
        <Suspense fallback={<ViewLoader />}>
          {view === 'home' ? (
            <>
              <section className="pt-48 pb-24 px-6 text-center relative">
                <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-[0.95] animate-in fade-in slide-in-from-top-10 duration-1000">
                  {t.harmony} <br />
                  <span className="text-theme" style={{ filter: 'drop-shadow(0 0 15px var(--primary-shadow))' }}>{t.relationship}</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-white/80 max-w-2xl mx-auto mb-14 font-medium leading-relaxed drop-shadow-sm">{t.subtitle}</p>
                <button onClick={() => document.getElementById('dash-content')?.scrollIntoView({ behavior: 'smooth' })} className="px-14 py-7 bg-theme text-white font-black uppercase tracking-widest text-xs rounded-full shadow-2xl shadow-theme/40 hover:scale-105 active:scale-95 transition-all duration-500">{t.startPlanning}</button>
              </section>

              <main id="dash-content" className="max-w-7xl mx-auto px-6 pb-32 scroll-mt-28 relative z-10">
                <SummaryCards summary={summary} language={settings.language} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-12">
                  <div className="lg:col-span-8 space-y-12">
                    <AIAssistant transactions={transactions} language={settings.language} />
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
                  <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-black/30 p-8 rounded-[40px] shadow-sm border border-black/5 dark:border-white/10 sticky top-28 backdrop-blur-3xl transition-all duration-500 hover:shadow-2xl hover:border-theme/30">
                      <FinancialCharts transactions={transactions} language={settings.language} />
                    </div>
                  </div>
                </div>
              </main>
            </>
          ) : view === 'results' ? (
            <ResultsView transactions={transactions} summary={summary} onBack={() => navigateTo('home')} language={settings.language} lightMode={settings.lightMode} />
          ) : (
            <SettingsView settings={settings} onUpdate={setSettings} onBack={() => navigateTo('home')} language={settings.language} />
          )}
        </Suspense>
      </div>

      <footer className="bg-gray-50/50 dark:bg-black/40 border-t border-black/5 dark:border-white/10 py-20 px-6 no-print backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 text-center md:text-left">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
              <div className="w-14 h-14 bg-theme/10 rounded-[18px] flex items-center justify-center text-theme shadow-inner border border-theme/10">
                <FCLogo className="h-9 w-9" />
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Fin<span className="text-theme">Casal</span></span>
            </div>
            <p className="text-gray-500 dark:text-white/60 text-base max-w-sm font-medium leading-relaxed mx-auto md:mx-0">O futuro financeiro do seu relacionamento elevado a uma nova dimensão. Gestão inteligente para quem planeja as estrelas.</p>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/30 mb-8">Navegação</h4>
            <ul className="space-y-5">
              <li><button onClick={() => navigateTo('home')} className="text-sm font-bold text-gray-600 dark:text-white/70 hover:text-theme transition-colors">{t.dashboard}</button></li>
              <li><button onClick={() => navigateTo('results')} className="text-sm font-bold text-gray-600 dark:text-white/70 hover:text-theme transition-colors">{t.results}</button></li>
              <li><button onClick={() => navigateTo('settings')} className="text-sm font-bold text-gray-600 dark:text-white/70 hover:text-theme transition-colors">{t.settings}</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/30 mb-8">Legais</h4>
            <ul className="space-y-5">
              <li className="text-sm font-bold text-gray-600 dark:text-white/70 hover:text-theme cursor-pointer transition-colors">Privacidade</li>
              <li className="text-sm font-bold text-gray-600 dark:text-white/70 hover:text-theme cursor-pointer transition-colors">Termos de Uso</li>
              <li className="text-sm font-bold text-gray-600 dark:text-white/70 hover:text-theme cursor-pointer transition-colors">Garantia</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-black/5 dark:border-white/10 mt-20 pt-10 text-center">
          <p className="text-[11px] text-gray-400 dark:text-white/20 font-black uppercase tracking-[0.5em]">© 2025 FINCASAL. STELLAR FINANCIAL MANAGEMENT.</p>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/80 dark:bg-black/60 backdrop-blur-3xl rounded-full border border-black/5 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-50 py-4 flex items-center justify-around no-print">
        <button onClick={() => navigateTo('home')} className={`flex flex-col items-center gap-1.5 ${view === 'home' ? 'text-theme' : 'text-gray-400'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg><span className="text-[9px] font-black uppercase tracking-widest">{t.dashboard}</span></button>
        <button onClick={() => navigateTo('results')} className={`flex flex-col items-center gap-1.5 ${view === 'results' ? 'text-theme' : 'text-gray-400'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg><span className="text-[9px] font-black uppercase tracking-widest">Análise</span></button>
        <button onClick={() => navigateTo('settings')} className={`flex flex-col items-center gap-1.5 ${view === 'settings' ? 'text-theme' : 'text-gray-400'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg><span className="text-[9px] font-black uppercase tracking-widest">Ajustes</span></button>
      </div>
    </div>
  );
};

export default App;
