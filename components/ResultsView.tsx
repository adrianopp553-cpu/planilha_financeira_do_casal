
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Transaction, FinancialSummary, TransactionType, AIAnalysisResult } from '../types';
import { generateImprovementPlan } from '../services/geminiService';
import SummaryCards from './SummaryCards';

const FinancialCharts = lazy(() => import('./FinancialCharts'));

interface ResultsViewProps {
  transactions: Transaction[];
  summary: FinancialSummary;
  onBack: () => void;
  language: 'pt' | 'en' | 'es';
  lightMode: boolean; 
}

const FCLogo = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 35 H 58 V 42 H 40 V 48 H 55 V 55 H 40 V 70 H 32 V 35 Z" fill="currentColor" />
    <path d="M62 38 C 72 38, 78 45, 78 55 C 78 65, 72 72, 62 72 M 62 48 C 68 48, 70 52, 70 55 C 70 58, 68 62, 62 62" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
  </svg>
);

const ResultsView: React.FC<ResultsViewProps> = ({ transactions, summary, onBack, language, lightMode }) => {
  const [aiPlan, setAiPlan] = useState<AIAnalysisResult | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const themeOrWhite = !lightMode ? 'text-white' : 'text-theme';
  const textContrast = !lightMode ? 'text-slate-300' : 'text-slate-600';
  const cardBg = !lightMode ? 'bg-white/5' : 'bg-white/95';

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { 
      style: 'currency', 
      currency: language === 'pt' ? 'BRL' : 'USD' 
    }).format(val);

  const topExpenses = [...transactions]
    .filter(t => t.type === TransactionType.EXPENSE)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const fetchAIPlan = async () => {
    if (transactions.length === 0) return;
    setLoadingPlan(true);
    const plan = await generateImprovementPlan(transactions);
    setAiPlan(plan);
    setLoadingPlan(false);
  };

  useEffect(() => {
    if (transactions.length > 0 && !aiPlan) {
      fetchAIPlan();
    }
  }, [transactions]);

  const handleExportPDF = () => {
    const oldTitle = document.title;
    const dateStr = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US').replace(/\//g, '-');
    document.title = `Relatorio_Financeiro_FinControl_${dateStr}`;
    setTimeout(() => {
      window.print();
      document.title = oldTitle;
    }, 100);
  };

  return (
    <main className="pt-32 pb-40 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* SEÇÃO DE IMPRESSÃO - LAYOUT ORGANIZADO (PDF) */}
      <div className="hidden print:block w-full text-slate-900 bg-white font-sans leading-tight p-0">
        
        {/* CABEÇALHO - BLOCADO */}
        <div className="flex justify-between items-start border-b-[12px] border-theme pb-10 mb-10">
          <div className="flex items-center gap-8">
            <div className="text-theme">
              <FCLogo className="w-24 h-24" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-theme tracking-tighter leading-none uppercase">Relatório de Saúde Financeira</h1>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Análise Estratégica de Patrimônio • v2.5 Pro</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-slate-900 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg inline-block mb-3">Cópia de Auditoria</div>
            <p className="text-3xl font-black tabular-nums text-slate-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* CARDS DE RESUMO - GRID COMPACTO */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="p-8 rounded-[32px] border-2 border-emerald-200 bg-emerald-50/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Total Receitas</p>
            <p className="text-3xl font-black text-emerald-600 tabular-nums">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className="p-8 rounded-[32px] border-2 border-rose-200 bg-rose-50/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">Total Despesas</p>
            <p className="text-3xl font-black text-rose-500 tabular-nums">{formatCurrency(summary.totalExpense)}</p>
          </div>
          <div className="p-8 rounded-[32px] border-2 border-slate-900 bg-slate-900 text-white">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Saldo Líquido</p>
            <p className="text-3xl font-black tabular-nums">{formatCurrency(summary.balance)}</p>
          </div>
        </div>

        {/* SEÇÃO DE ANÁLISE VISUAL - 2 COLUNAS EQUILIBRADAS */}
        <div className="grid grid-cols-12 gap-10 mb-12">
          {/* Gráfico de Distribuição */}
          <div className="col-span-7 bg-slate-50 p-10 rounded-[40px] border border-slate-200 page-break-inside-avoid">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-900 mb-8 border-l-4 border-theme pl-4">Distribuição por Categoria</h2>
            <div className="h-[280px]">
              <Suspense fallback={null}>
                <FinancialCharts transactions={transactions} language={language} />
              </Suspense>
            </div>
          </div>

          {/* Maiores Gastos - Lista Técnica */}
          <div className="col-span-5 bg-white p-10 rounded-[40px] border border-slate-200 page-break-inside-avoid">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-900 mb-8 border-l-4 border-theme pl-4">Maiores Ofensores</h2>
            <div className="space-y-4">
              {topExpenses.map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-theme text-white rounded-lg font-black text-xs">0{idx+1}</span>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase">{t.description}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.category}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-rose-600 tabular-nums">-{formatCurrency(t.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INSIGHTS GEMINI AI - FORMATO DE DOCUMENTO */}
        <div className="mb-12 page-break-inside-avoid">
          <div className="bg-slate-50 p-12 rounded-[48px] border-2 border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-[0.6em] text-theme mb-8 flex items-center gap-4">
               ANÁLISE ESTRATÉGICA AI <span className="flex-1 h-[2px] bg-theme/10"></span>
            </h2>
            {aiPlan ? (
              <div 
                className="text-lg font-bold leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ 
                  __html: aiPlan.text
                    .replace(/<b>/g, '<b style="color:var(--primary); font-weight:900; text-transform:uppercase; display:block; margin-top:2rem; margin-bottom:1rem; border-bottom: 2px solid var(--primary); padding-bottom: 5px; width: fit-content;">')
                    .replace(/<li>/g, '<li style="margin-bottom: 0.8rem; list-style-type: none; background: white; padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02)">')
                }} 
              />
            ) : (
              <p className="italic text-slate-400 text-center py-10">Processando análise técnica de dados...</p>
            )}
          </div>
        </div>

        {/* DICA DE OURO - DESTAQUE FINAL */}
        <div className="p-12 bg-slate-900 rounded-[48px] text-white relative overflow-hidden page-break-inside-avoid">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-40 h-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-theme font-black uppercase tracking-[0.4em] text-[10px] mb-6">Nota Conclusiva do Consultor</h3>
          <p className="text-2xl font-black leading-snug italic max-w-4xl">
            {summary.balance >= 0 
              ? "Sua gestão está saudável. O segredo agora é transformar este excedente em ativos. Destine 15% deste saldo para sua reserva de oportunidade hoje mesmo."
              : "Atenção ao fluxo de caixa. O foco imediato deve ser a redução nos 'Maiores Ofensores'. Ajustar apenas a principal categoria em 20% trará o equilíbrio no próximo mês."}
          </p>
        </div>

        {/* RODAPÉ TÉCNICO */}
        <div className="mt-20 pt-10 border-t-2 border-slate-100 flex justify-between items-center opacity-60 page-break-inside-avoid">
           <div className="flex gap-16">
             <div>
               <p className="text-[9px] font-black uppercase text-slate-400 mb-1">ID do Relatório</p>
               <p className="text-[11px] font-mono text-slate-900 font-black uppercase">FC-{Math.random().toString(36).substr(2, 8)}</p>
             </div>
             <div>
               <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Status</p>
               <p className="text-[11px] font-black text-theme uppercase">Auditado & Validado</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">FinControl Pro Enterprise</p>
             <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Infrastructure by Stark Financial</p>
           </div>
        </div>
      </div>

      {/* TELA DE RESULTADOS (Interface Web - No Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 no-print">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-theme font-black text-xs uppercase tracking-widest mb-4 hover:gap-3 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {language === 'pt' ? 'Voltar ao Dashboard' : 'Back to Dashboard'}
          </button>
          <h1 className={`text-5xl md:text-6xl font-black tracking-tighter drop-shadow-sm transition-colors duration-300 ${themeOrWhite}`}>
            {language === 'pt' ? 'Resultados' : 'Results'}
          </h1>
          <p className={`font-bold mt-2 ${textContrast}`}>
            {language === 'pt' ? 'Análise detalhada do seu desempenho financeiro.' : 'Detailed analysis of your financial performance.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className={`px-6 py-4 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/20 transition flex items-center gap-2 shadow-sm`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {language === 'pt' ? 'Exportar PDF' : 'Export PDF'}
          </button>
          <button onClick={() => window.print()} className="px-6 py-4 bg-theme text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-theme/20 hover:brightness-110 transition flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {language === 'pt' ? 'Imprimir' : 'Print'}
          </button>
        </div>
      </div>

      <div className="no-print">
        <SummaryCards summary={summary} language={language} />

        {/* PLANO DE AÇÃO COM IA (Interface Web) */}
        <section className={`${cardBg} mt-12 p-8 md:p-12 rounded-[48px] border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-theme/10`}>
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 text-theme" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
             </svg>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-theme rounded-2xl flex items-center justify-center text-white shadow-lg shadow-theme/30 ring-4 ring-theme/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-3xl font-black tracking-tight ${themeOrWhite}`}>
                    {language === 'pt' ? 'Plano de Evolução Financeira' : 'Financial Evolution Plan'}
                  </h2>
                  <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${textContrast} mt-1`}>
                    Powered by Gemini 3.0 Pro AI
                  </p>
                </div>
              </div>
              <button 
                onClick={fetchAIPlan}
                disabled={loadingPlan}
                className="px-8 py-4 bg-theme/10 hover:bg-theme/20 border border-theme/20 rounded-2xl text-[11px] font-black text-theme uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {loadingPlan ? 'Gerando Plano...' : 'Recalcular Estratégia'}
              </button>
            </div>

            {loadingPlan ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-theme/5 rounded-full w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-full w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-full w-5/6"></div>
              </div>
            ) : aiPlan ? (
              <div className={`prose prose-invert max-w-none text-lg transition-all duration-700 ${!lightMode ? 'text-slate-300' : 'text-slate-700'}`}>
                 <div 
                   className="plan-content"
                   dangerouslySetInnerHTML={{ __html: aiPlan.text }} 
                 />
                 <style>{`
                   .plan-content b { color: var(--primary); font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 1.1em; display: block; margin-top: 1.5rem; }
                   .plan-content ul { list-style: none; padding-left: 0; margin-top: 1rem; display: grid; grid-template-cols: 1fr; gap: 0.5rem; }
                   @media (min-width: 768px) { .plan-content ul { grid-template-cols: 1fr 1fr; } }
                   .plan-content li { background: rgba(var(--primary-rgb), 0.05); padding: 1rem 1.5rem; border-radius: 1.5rem; border-left: 4px solid var(--primary); font-size: 0.9em; font-weight: 600; }
                   .dark-mode .plan-content li { background: rgba(255,255,255, 0.03); }
                 `}</style>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 font-black italic uppercase tracking-widest">
                Adicione transações para receber seu plano estratégico.
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
          <div className={`${cardBg} p-10 rounded-[40px] shadow-sm border border-slate-200 dark:border-white/10`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-2xl font-black transition-colors duration-300 ${themeOrWhite}`}>
                {language === 'pt' ? 'Distribuição de Gastos' : 'Expense Distribution'}
              </h2>
            </div>
            <Suspense fallback={<div className="h-64 flex items-center justify-center text-theme/40 text-xs font-black uppercase tracking-widest">Carregando...</div>}>
              <FinancialCharts transactions={transactions} language={language} />
            </Suspense>
          </div>

          <div className={`${cardBg} p-10 rounded-[40px] shadow-sm border border-slate-200 dark:border-white/10`}>
             <h2 className={`text-2xl font-black mb-8 transition-colors duration-300 ${themeOrWhite}`}>
               {language === 'pt' ? 'Maiores Saídas' : 'Top Expenses'}
             </h2>
             <div className="space-y-6">
               {topExpenses.length === 0 ? (
                 <div className="text-center py-20 text-slate-400 font-bold italic">{language === 'pt' ? 'Nenhuma despesa para listar.' : 'No expenses to list.'}</div>
               ) : (
                 topExpenses.map((t, idx) => (
                   <div key={t.id} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-theme/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center font-black text-theme border border-slate-200 dark:border-transparent">
                          {idx + 1}
                        </div>
                        <div>
                          <p className={`font-bold ${!lightMode ? 'text-white' : 'text-slate-900'}`}>{t.description}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{t.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-rose-500">{formatCurrency(t.amount)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{t.date}</p>
                      </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResultsView;
